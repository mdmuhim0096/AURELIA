import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import { paypalProvider } from "@/lib/payments/paypal";
import { claimWebhook, finishWebhook } from "@/lib/payments/webhooks";
import { markOrderPaid, markOrderPaymentFailed, markOrderPaymentCancelled } from "@/lib/commerce/orders";
import { notifyUser } from "@/lib/notifications";
import { emailTemplates } from "@/lib/email";
import { fail, ok } from "@/lib/api";
export async function POST(request){
  const event=await request.json().catch(()=>null); if(!event?.id)return fail("Invalid PayPal webhook",400);
  let verified=false; try{verified=await paypalProvider.verifyWebhook({headers:request.headers,event})}catch{verified=false} if(!verified)return fail("Invalid PayPal signature",400);
  await connectDB();const claim=await claimWebhook("paypal",event.id,event.event_type);if(!claim.claimed)return ok({duplicate:true});
  try{
    if(event.event_type==="PAYMENT.CAPTURE.COMPLETED"){
      const capture=event.resource;const orderRef=capture.supplementary_data?.related_ids?.order_id;const payment=orderRef?await Payment.findOne({provider:"paypal",providerPaymentId:orderRef}):null;
      if(payment){payment.status="paid";payment.metadata={...(payment.metadata||{}),captureId:capture.id};await payment.save();await Transaction.updateOne({payment:payment._id},{$set:{status:"succeeded",providerReference:capture.id}});const order=await markOrderPaid(payment.order);if(order?.user)await notifyUser(order.user,{type:"payment_successful",title:`Payment confirmed for ${order.orderNumber}`,message:"Your PayPal payment was verified.",href:`/account/orders/${order._id}`,email:emailTemplates.payment(order.orderNumber,"successful")})}
    }
    if(event.event_type==="PAYMENT.CAPTURE.DENIED"){
      const orderRef=event.resource?.supplementary_data?.related_ids?.order_id;const payment=orderRef?await Payment.findOneAndUpdate({provider:"paypal",providerPaymentId:orderRef,status:{$ne:"paid"}},{$set:{status:"failed"}},{new:true}):null;if(payment){await Transaction.updateOne({payment:payment._id},{$set:{status:"failed"}});const order=await markOrderPaymentFailed(payment.order,null,"PayPal capture denied");if(order?.user)await notifyUser(order.user,{type:"payment_failed",title:`Payment failed for ${order.orderNumber}`,message:"PayPal denied the payment capture.",href:`/account/orders/${order._id}`,email:emailTemplates.payment(order.orderNumber,"failed")})}
    }
    if(["CHECKOUT.PAYMENT-APPROVAL.REVERSED","CHECKOUT.ORDER.CANCELLED"].includes(event.event_type)){
      const orderRef=event.resource?.supplementary_data?.related_ids?.order_id||event.resource?.id;const payment=await Payment.findOneAndUpdate({provider:"paypal",providerPaymentId:orderRef,status:{$ne:"paid"}},{$set:{status:"cancelled"}},{new:true});if(payment)await markOrderPaymentCancelled(payment.order,null,"PayPal checkout cancelled")
    }
    await finishWebhook(claim.event._id);return ok({received:true});
  }catch(error){await finishWebhook(claim.event._id,"failed",error.message);return fail("Webhook processing failed",500)}
}
