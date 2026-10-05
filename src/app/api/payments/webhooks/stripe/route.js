import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import WalletTopup from "@/models/WalletTopup";
import { stripeProvider } from "@/lib/payments/stripe";
import { finalizeStripeCheckoutSession } from "@/lib/payments/stripe-reconcile";
import { finalizeStripeWalletTopupSession } from "@/lib/payments/stripe-wallet-reconcile";
import { claimWebhook, finishWebhook } from "@/lib/payments/webhooks";
import {
  markOrderPaymentCancelled,
  markOrderPaymentFailed,
} from "@/lib/commerce/orders";
import { fail, ok } from "@/lib/api";

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripeProvider.constructWebhook(body, signature);
  } catch (error) {
    console.error("[stripe:webhook:signature:error]", {
      message: error?.message,
    });
    return fail("Invalid Stripe signature", 400);
  }

  await connectDB();

  const claim = await claimWebhook("stripe", event.id, event.type);

  if (!claim.claimed) {
    return ok({ duplicate: true, status: claim.event?.status || "unknown" });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;

      if (
        session.metadata?.kind === "wallet_topup" &&
        session.metadata?.topupId
      ) {
        if (session.payment_status === "paid") {
          await finalizeStripeWalletTopupSession(session);
        }
      } else if (session.payment_status === "paid") {
        await finalizeStripeCheckoutSession(session);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object;

      if (session.metadata?.kind === "wallet_topup" && session.metadata?.topupId) {
        await WalletTopup.updateOne(
          { _id: session.metadata.topupId, status: { $ne: "succeeded" } },
          { $set: { status: "cancelled" } }
        );
      } else {
        const payment = await Payment.findOneAndUpdate(
          {
            provider: "stripe",
            providerPaymentId: session.id,
            status: { $ne: "paid" },
          },
          { $set: { status: "cancelled" } },
          { new: true }
        );

        if (payment) {
          await markOrderPaymentCancelled(
            payment.order,
            null,
            "Stripe Checkout session expired"
          );
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;

      if (intent.metadata?.kind === "wallet_topup" && intent.metadata?.topupId) {
        await WalletTopup.updateOne(
          { _id: intent.metadata.topupId, status: { $ne: "succeeded" } },
          {
            $set: {
              status: "failed",
              metadata: {
                failure:
                  intent.last_payment_error?.message || "Payment failed",
              },
            },
          }
        );
      } else {
        const payment = await Payment.findOneAndUpdate(
          {
            $or: [
              { "metadata.paymentIntentId": intent.id },
              { _id: intent.metadata?.paymentId || null },
            ],
            status: { $ne: "paid" },
          },
          { $set: { status: "failed" } },
          { new: true }
        );

        if (payment) {
          const order = await markOrderPaymentFailed(
            payment.order,
            null,
            intent.last_payment_error?.message || "Stripe payment failed"
          );

          if (order?.user) {
            try {
              await notifyUser(order.user, {
                type: "payment_failed",
                title: `Payment failed for ${order.orderNumber}`,
                message: "The payment provider reported a failed payment.",
                href: `/account/orders/${order._id}`,
                email: emailTemplates.payment(order.orderNumber, "failed"),
              });
            } catch (notificationError) {
              console.error("[stripe:payment-failed-notification:error]", {
                message: notificationError?.message,
              });
            }
          }
        }
      }
    }

    await finishWebhook(claim.event._id);
    return ok({ received: true });
  } catch (error) {
    await finishWebhook(claim.event._id, "failed", error?.message || "Unknown error");

    console.error("[stripe:webhook:processing:error]", {
      eventId: event?.id,
      eventType: event?.type,
      message: error?.message,
      stack: error?.stack,
    });

    return fail("Webhook processing failed", 500);
  }
}
