import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import { alipayProvider } from "@/lib/payments/alipay";
import { claimWebhook, finishWebhook } from "@/lib/payments/webhooks";
import { markOrderPaid, markOrderPaymentCancelled } from "@/lib/commerce/orders";
import { notifyUser } from "@/lib/notifications";
import { emailTemplates } from "@/lib/email";
export async function POST(request){
  const form=await request.formData();const payload=Object.fromEntries(form.entries());if(!alipayProvider.verifyNotification(payload))return new Response("failure",{status:400});
  await connectDB();const eventId=payload.notify_id||payload.trade_no||`${payload.out_trade_no}:${payload.trade_status}`;const claim=await claimWebhook("alipay",eventId,payload.trade_status||"notification");if(!claim.claimed)return new Response("success");
  try{
    const order=await Order.findOne({orderNumber:payload.out_trade_no});
    if(order&&["TRADE_SUCCESS","TRADE_FINISHED"].includes(payload.trade_status)){const payment=await Payment.findOne({order:order._id,provider:"alipay"});if(payment){payment.status="paid";payment.providerPaymentId=payload.trade_no||payment.providerPaymentId;await payment.save();await Transaction.updateOne({payment:payment._id},{$set:{status:"succeeded",providerReference:payload.trade_no||""}});const paidOrder=await markOrderPaid(order._id);if(paidOrder?.user)await notifyUser(paidOrder.user,{type:"payment_successful",title:`Payment confirmed for ${paidOrder.orderNumber}`,message:"Your Alipay payment was verified.",href:`/account/orders/${paidOrder._id}`,email:emailTemplates.payment(paidOrder.orderNumber,"successful")})}}
    if(order&&payload.trade_status==="TRADE_CLOSED"){const payment=await Payment.findOneAndUpdate({order:order._id,provider:"alipay",status:{$ne:"paid"}},{$set:{status:"cancelled"}},{new:true});if(payment)await markOrderPaymentCancelled(order._id,null,"Alipay trade closed")}
    await finishWebhook(claim.event._id);return new Response("success");
  }catch(error){await finishWebhook(claim.event._id,"failed",error.message);return new Response("failure",{status:500})}
}
