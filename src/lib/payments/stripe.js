import Stripe from "stripe";
const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
function client() {
  if (!process.env.STRIPE_SECRET_KEY) throw Object.assign(new Error("Stripe is not configured"), { status: 503 });
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export const stripeProvider = {
  id: "stripe",
  configured: () => Boolean(process.env.STRIPE_SECRET_KEY),
  async create({ order, payment }) {
    const stripe = client();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.orderNumber,
      customer_email: order.user ? undefined : order.guestEmail || undefined,
      line_items: [{ price_data: { currency: order.currency.toLowerCase(), product_data: { name: `Order ${order.orderNumber}` }, unit_amount: Math.round(order.total * 100) }, quantity: 1 }],
      success_url: `${appUrl()}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/checkout?cancelled=1&order=${order.orderNumber}`,
      metadata: { orderId: String(order._id), paymentId: String(payment._id) },
      payment_intent_data: { metadata: { orderId: String(order._id), paymentId: String(payment._id) } }
    }, { idempotencyKey: payment.idempotencyKey });
    return { providerPaymentId: session.id, action: "redirect", url: session.url };
  },
  async refund({ payment, amount }) {
    const stripe = client();
    const sessions = await stripe.checkout.sessions.list({ limit: 1, payment_intent: payment.metadata?.paymentIntentId || undefined });
    let paymentIntent = payment.metadata?.paymentIntentId;
    if (!paymentIntent && payment.providerPaymentId) {
      const session = await stripe.checkout.sessions.retrieve(payment.providerPaymentId);
      paymentIntent = session.payment_intent;
    }
    if (!paymentIntent) throw new Error("Stripe payment intent is unavailable");
    const refund = await stripe.refunds.create({ payment_intent: paymentIntent, amount: amount ? Math.round(amount * 100) : undefined }, { idempotencyKey: `refund:${payment._id}:${amount || "full"}:${payment.refundedAmount}` });
    return { id: refund.id, status: refund.status };
  },
  constructWebhook(body, signature) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET is required");
    return client().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  }
};
