import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import WalletTopup from "@/models/WalletTopup";
import { stripeProvider } from "@/lib/payments/stripe";
import { claimWebhook, finishWebhook } from "@/lib/payments/webhooks";
import { markOrderPaid, markOrderPaymentCancelled, markOrderPaymentFailed } from "@/lib/commerce/orders";
import { walletEntry } from "@/lib/commerce/wallet";
import { notifyUser } from "@/lib/notifications";
import { emailTemplates } from "@/lib/email";
import { fail, ok } from "@/lib/api";

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  let event;
  try { event = stripeProvider.constructWebhook(body, signature); }
  catch { return fail("Invalid Stripe signature", 400); }
  await connectDB();
  const claim = await claimWebhook("stripe", event.id, event.type);
  if (!claim.claimed) return ok({ duplicate: true });
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.metadata?.kind === "wallet_topup" && session.metadata?.topupId) {
        const topup = await WalletTopup.findById(session.metadata.topupId);
        if (topup && topup.status !== "succeeded") {
          await walletEntry({ userId: topup.user, direction: "credit", source: "topup", amount: topup.amount, idempotencyKey: `stripe-topup:${topup._id}`, note: `Stripe wallet top-up ${session.id}` });
          topup.status = "succeeded";
          topup.providerReference = session.id;
          topup.metadata = { ...(topup.metadata || {}), paymentIntentId: session.payment_intent };
          await topup.save();
          await Transaction.updateOne({ reference: `TOPUP-${topup._id}` }, { $setOnInsert: { reference: `TOPUP-${topup._id}`, type: "wallet_credit", user: topup.user, provider: "stripe", amount: topup.amount, currency: topup.currency, status: "succeeded", providerReference: String(session.payment_intent || session.id), metadata: { topupId: String(topup._id) } } }, { upsert: true });
          await notifyUser(topup.user, { type: "wallet_transaction", title: "Wallet top-up completed", message: `${topup.currency} ${topup.amount.toFixed(2)} was added to your wallet.`, href: "/account/wallet", email: emailTemplates.wallet("Wallet top-up completed", `${topup.currency} ${topup.amount.toFixed(2)} was added to your wallet.`) });
        }
      } else {
        const payment = session.metadata?.paymentId ? await Payment.findById(session.metadata.paymentId) : await Payment.findOne({ provider: "stripe", providerPaymentId: session.id });
        if (payment && session.payment_status === "paid") {
          payment.status = "paid";
          payment.metadata = { ...(payment.metadata || {}), paymentIntentId: session.payment_intent };
          await payment.save();
          await Transaction.updateOne({ payment: payment._id }, { $set: { status: "succeeded", providerReference: String(session.payment_intent || session.id) } });
          const order = await markOrderPaid(payment.order);
          if (order?.user) await notifyUser(order.user, { type: "payment_successful", title: `Payment confirmed for ${order.orderNumber}`, message: "Your payment was verified successfully.", href: `/account/orders/${order._id}`, email: emailTemplates.payment(order.orderNumber, "successful") });
        }
      }
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object;
      if (session.metadata?.kind === "wallet_topup" && session.metadata?.topupId) await WalletTopup.updateOne({ _id: session.metadata.topupId, status: { $ne: "succeeded" } }, { $set: { status: "cancelled" } });
      else {
        const payment = await Payment.findOneAndUpdate({ provider: "stripe", providerPaymentId: session.id, status: { $ne: "paid" } }, { $set: { status: "cancelled" } }, { new: true });
        if (payment) await markOrderPaymentCancelled(payment.order, null, "Stripe Checkout session expired");
      }
    }
    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;
      if (intent.metadata?.kind === "wallet_topup" && intent.metadata?.topupId) await WalletTopup.updateOne({ _id: intent.metadata.topupId, status: { $ne: "succeeded" } }, { $set: { status: "failed", metadata: { failure: intent.last_payment_error?.message || "Payment failed" } } });
      else {
        const payment = await Payment.findOneAndUpdate({ $or: [{ "metadata.paymentIntentId": intent.id }, { _id: intent.metadata?.paymentId || null }], status: { $ne: "paid" } }, { $set: { status: "failed" } }, { new: true });
        if (payment) {
          const order = await markOrderPaymentFailed(payment.order, null, intent.last_payment_error?.message || "Stripe payment failed");
          if (order?.user) await notifyUser(order.user, { type: "payment_failed", title: `Payment failed for ${order.orderNumber}`, message: "The payment provider reported a failed payment.", href: `/account/orders/${order._id}`, email: emailTemplates.payment(order.orderNumber, "failed") });
        }
      }
    }
    await finishWebhook(claim.event._id);
    return ok({ received: true });
  } catch (error) {
    await finishWebhook(claim.event._id, "failed", error.message);
    console.error(error);
    return fail("Webhook processing failed", 500);
  }
}
