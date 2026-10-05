import { auth } from "@/auth";
import { requirePermission, PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Refund from "@/models/Refund";
import Shipment from "@/models/Shipment";
import ReturnRequest from "@/models/Return";
import { getPaymentProvider } from "@/lib/payments";
import { walletEntry } from "@/lib/commerce/wallet";
import { audit } from "@/lib/auth/audit";
import { notifyUser } from "@/lib/notifications";
import { emailTemplates, sendEmail } from "@/lib/email";
import { ORDER_STATUSES } from "@/lib/constants";
import { fail, fromError, ok, readJson } from "@/lib/api";

async function deliverOrderNotice(order, { type = "order_update", title, message, email }) {
  if (order.user) return notifyUser(order.user, { type, title, message, href: `/account/orders/${order._id}`, email });
  if (order.guestEmail && email) return sendEmail({ to: order.guestEmail, ...email });
  return null;
}

async function processRefund({ order, session, amount, reason, destination, existingRefund = null }) {
  if (!hasPermission(session, PERMISSIONS.REFUNDS_MANAGE)) throw Object.assign(new Error("Refund permission required"), { status: 403 });
  const payment = await Payment.findOne({ order: order._id, status: { $in: ["paid", "partially_refunded"] } });
  const remaining = payment ? Math.max(0, payment.amount - payment.refundedAmount) : order.total;
  const numeric = Number(amount || remaining);
  if (!Number.isFinite(numeric) || numeric <= 0 || numeric > remaining) throw Object.assign(new Error("Invalid refund amount"), { status: 400 });
  let refund = existingRefund;
  if (!refund) refund = await Refund.create({ order: order._id, payment: payment?._id || null, user: order.user || null, amount: numeric, reason: reason || "Admin refund", destination: destination === "wallet" ? "wallet" : "original", status: "processing" });
  else { refund.amount = numeric; refund.reason = reason || refund.reason; refund.destination = destination === "wallet" ? "wallet" : "original"; refund.status = "processing"; if (payment) refund.payment = payment._id; await refund.save(); }
  try {
    if (refund.destination === "wallet") {
      if (!order.user) throw Object.assign(new Error("Guest orders cannot be refunded to wallet"), { status: 409 });
      await walletEntry({ userId: order.user, direction: "credit", source: "refund", amount: numeric, orderId: order._id, note: refund.reason, idempotencyKey: `refund-wallet:${refund._id}` });
      refund.status = "succeeded";
    } else {
      if (!payment) throw Object.assign(new Error("A refundable payment was not found"), { status: 409 });
      const provider = getPaymentProvider(payment.provider);
      if (!provider.refund) throw Object.assign(new Error(`${payment.provider} does not have an enabled refund adapter`), { status: 501 });
      const result = await provider.refund({ payment, amount: numeric });
      refund.providerRefundId = result.id || result.refund_id || "";
      refund.status = "succeeded";
      payment.refundedAmount += numeric;
      payment.status = payment.refundedAmount >= payment.amount ? "refunded" : "partially_refunded";
      await payment.save();
    }
    await refund.save();
    const fullyRefunded = payment ? payment.refundedAmount >= payment.amount : numeric >= order.total;
    order.status = fullyRefunded ? "refunded" : "refund_requested";
    order.timeline.push({ status: order.status, note: `Refund succeeded: ${order.currency} ${numeric.toFixed(2)}`, actor: session.user.id });
    await order.save();
    await deliverOrderNotice(order, { type: "refund_processed", title: `Refund processed for ${order.orderNumber}`, message: `${order.currency} ${numeric.toFixed(2)} refund processed.`, email: emailTemplates.refund(order.orderNumber, "processed", numeric, order.currency) });
    return refund;
  } catch (error) {
    refund.status = "failed";
    await refund.save().catch(() => {});
    throw error;
  }
}


export async function GET(_request,{params}){try{const session=await auth();requirePermission(session,PERMISSIONS.ORDERS_READ);const{id}=await params;await connectDB();const order=await Order.findById(id).populate("user","name email phone").lean();if(!order)return fail("Order not found",404);const[payment,refunds,shipment,returns]=await Promise.all([Payment.findOne({order:id}).lean(),Refund.find({order:id}).sort({createdAt:-1}).lean(),Shipment.findOne({order:id}).lean(),ReturnRequest.find({order:id}).sort({createdAt:-1}).lean()]);return ok({order,payment,refunds,shipment,returns})}catch(error){return fromError(error,"Unable to load order")}}

export async function PATCH(request,{params}){
  try{
    const session=await auth();requirePermission(session,PERMISSIONS.ORDERS_WRITE);const{id}=await params;const body=await readJson(request);await connectDB();const order=await Order.findById(id);if(!order)return fail("Order not found",404);const previous=order.toObject();
    if(body.action==="status"){
      if(!ORDER_STATUSES.includes(body.status))return fail("Invalid order status",400);
      order.status=body.status;order.timeline.push({status:body.status,note:body.note||"Admin status update",actor:session.user.id});if(body.status==="delivered")order.deliveredAt=new Date();if(body.status==="cancelled")order.cancelledAt=new Date();await order.save();
    }else if(body.action==="shipment"){
      const shipment=await Shipment.findOneAndUpdate({order:order._id},{$set:{provider:body.provider,trackingNumber:body.trackingNumber,trackingUrl:body.trackingUrl||"",status:body.status||"shipped",estimatedDelivery:body.estimatedDelivery||null},$push:{events:{status:body.status||"shipped",location:body.location||"",message:body.note||"Shipment updated",at:new Date()}}},{new:true,upsert:true,runValidators:true});order.status=body.orderStatus||"shipped";order.estimatedDelivery=shipment.estimatedDelivery;order.timeline.push({status:order.status,note:`Tracking: ${shipment.trackingNumber}`,actor:session.user.id});await order.save();
    }else if(body.action==="refund"){
      const requested=body.refundId?await Refund.findOne({_id:body.refundId,order:order._id}):await Refund.findOne({order:order._id,status:"requested"}).sort({createdAt:1});
      await processRefund({order,session,amount:body.amount||requested?.amount,reason:body.reason||requested?.reason,destination:body.destination||requested?.destination,existingRefund:requested});
    }else if(body.action==="return"){
      if(!hasPermission(session,PERMISSIONS.RETURNS_MANAGE))return fail("Return permission required",403);const rr=await ReturnRequest.findOne({_id:body.returnId,order:order._id});if(!rr)return fail("Return request not found",404);rr.status=body.status;if(body.resolution)rr.resolution=body.resolution;if(body.note)rr.notes=body.note;await rr.save();order.timeline.push({status:order.status,note:`Return ${rr.status}${rr.resolution!=="none"?` · ${rr.resolution}`:""}`,actor:session.user.id});await order.save();
      if(rr.status==="approved"&&["refund","wallet"].includes(rr.resolution)&&body.processRefund===true){await processRefund({order,session,amount:body.amount||order.total,reason:`Approved return ${rr._id}`,destination:rr.resolution==="wallet"?"wallet":"original"})}
      await deliverOrderNotice(order,{type:"return_update",title:`Return ${rr.status}: ${order.orderNumber}`,message:`Your return request is ${rr.status}.`,email:emailTemplates.returnStatus(order.orderNumber,rr.status)});
    }else return fail("Unknown order action",400);
    await audit({actor:session.user.id,action:`order.${body.action}`,resourceType:"Order",resourceId:order._id,previousValue:{status:previous.status,paymentStatus:previous.paymentStatus},newValue:{status:order.status,paymentStatus:order.paymentStatus,action:body.action}});
    if(body.action!=="refund"&&body.action!=="return")await deliverOrderNotice(order,{title:`Order ${order.orderNumber} updated`,message:`Status: ${order.status.replaceAll("_"," ")}`,email:emailTemplates.orderStatus(order.orderNumber,order.status)});
    return ok({order});
  }catch(error){return fromError(error,"Unable to update order")}
}
