import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Refund from "@/models/Refund";
import { audit } from "@/lib/auth/audit";
import { notifyUser } from "@/lib/notifications";
import { emailTemplates } from "@/lib/email";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function POST(request,{params}){
  try{
    const session=await auth(); if(!session?.user?.id)return fail("Authentication required",401);
    const{id}=await params; const{reason="Customer request"}=await readJson(request); await connectDB();
    const order=await Order.findOne({_id:id,user:session.user.id}); if(!order)return fail("Order not found",404);
    if(!["pending","payment_processing","paid","processing"].includes(order.status))return fail("This order can no longer be cancelled online",409);
    const wasPaid=order.paymentStatus==="paid";
    order.status="cancelled"; order.cancelledAt=new Date(); order.timeline.push({status:"cancelled",note:reason,actor:session.user.id}); await order.save();
    let refundRequest=null;
    if(wasPaid){const payment=await Payment.findOne({order:order._id,status:{$in:["paid","partially_refunded"]}}); if(payment&&!await Refund.exists({order:order._id,status:{$in:["requested","processing"]}}))refundRequest=await Refund.create({order:order._id,payment:payment._id,user:session.user.id,amount:Math.max(0,payment.amount-payment.refundedAmount),reason:`Cancellation: ${String(reason).slice(0,900)}`,destination:"original",status:"requested"})}
    await audit({actor:session.user.id,action:"order.cancelled",resourceType:"Order",resourceId:order._id,newValue:{reason,refundRequested:Boolean(refundRequest)}});
    await notifyUser(session.user.id,{type:"order_cancelled",title:`Order ${order.orderNumber} cancelled`,message:refundRequest?"Cancellation received. A refund request was opened for the captured payment.":"Your order was cancelled.",href:`/account/orders/${order._id}`,email:emailTemplates.orderStatus(order.orderNumber,"cancelled")});
    return ok({order,refundRequest});
  }catch(error){return fromError(error,"Unable to cancel order")}
}
