import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import { stripeProvider } from "@/lib/payments/stripe";
import { markOrderPaid } from "@/lib/commerce/orders";
import { notifyUser } from "@/lib/notifications";
import { emailTemplates, sendEmail } from "@/lib/email";

function normalizedCurrency(value) {
  return String(value || "").trim().toUpperCase();
}

async function sendPaymentConfirmation(order) {
  try {
    if (order?.user) {
      await notifyUser(order.user, {
        type: "payment_successful",
        title: `Payment confirmed for ${order.orderNumber}`,
        message: "Your payment was verified successfully.",
        href: `/account/orders/${order._id}`,
        email: emailTemplates.payment(order.orderNumber, "successful"),
      });
      return;
    }

    if (order?.guestEmail) {
      await sendEmail({
        to: order.guestEmail,
        ...emailTemplates.payment(order.orderNumber, "successful"),
      });
    }
  } catch (error) {
    // Payment persistence must never depend on notification delivery.
    console.error("[stripe:confirmation-email:error]", {
      orderId: order?._id ? String(order._id) : null,
      orderNumber: order?.orderNumber || null,
      message: error?.message,
      stack: error?.stack,
    });
  }
}

export async function finalizeStripeCheckoutSession(session) {
  if (!session?.id) {
    throw Object.assign(new Error("Stripe Checkout session is missing"), { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return { paid: false, reason: `stripe-status:${session.payment_status || "unknown"}` };
  }

  await connectDB();

  let payment = null;

  if (session.metadata?.paymentId) {
    payment = await Payment.findById(session.metadata.paymentId);
  }

  if (!payment) {
    payment = await Payment.findOne({
      provider: "stripe",
      providerPaymentId: session.id,
    });
  }

  if (!payment) {
    throw Object.assign(new Error("Stripe payment record was not found"), { status: 404 });
  }

  if (payment.provider !== "stripe") {
    throw Object.assign(new Error("Payment provider mismatch"), { status: 409 });
  }

  // Verify Stripe's amount/currency against our persisted payment before updating DB.
  if (
    Number.isFinite(Number(session.amount_total)) &&
    Math.round(Number(payment.amount) * 100) !== Number(session.amount_total)
  ) {
    throw Object.assign(new Error("Stripe payment amount mismatch"), { status: 409 });
  }

  if (
    session.currency &&
    normalizedCurrency(session.currency) !== normalizedCurrency(payment.currency)
  ) {
    throw Object.assign(new Error("Stripe payment currency mismatch"), { status: 409 });
  }

  payment.providerPaymentId = session.id;
  payment.status = "paid";
  payment.metadata = {
    ...(payment.metadata || {}),
    paymentIntentId: session.payment_intent || payment.metadata?.paymentIntentId || null,
    stripePaymentStatus: session.payment_status,
    stripeSessionId: session.id,
    paidAt: new Date().toISOString(),
  };
  await payment.save();

  await Transaction.updateOne(
    { payment: payment._id },
    {
      $set: {
        status: "succeeded",
        providerReference: String(session.payment_intent || session.id),
      },
    }
  );

  const order = await markOrderPaid(payment.order);

  if (!order) {
    throw Object.assign(new Error("Order for Stripe payment was not found"), { status: 404 });
  }

  await sendPaymentConfirmation(order);

  return {
    paid: true,
    order,
    payment,
  };
}

export async function reconcileStripeCheckoutSession(sessionId) {
  const session = await stripeProvider.retrieveCheckoutSession(sessionId);
  return finalizeStripeCheckoutSession(session);
}
