import crypto from "node:crypto";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import { connectDB } from "@/lib/db";
import { stripeProvider } from "@/lib/payments/stripe";
import { paypalProvider } from "@/lib/payments/paypal";
import { alipayProvider } from "@/lib/payments/alipay";
import { payoneerProvider } from "@/lib/payments/payoneer";
import { walletEntry } from "@/lib/commerce/wallet";
import { markOrderPaid, markOrderPaymentProcessing } from "@/lib/commerce/orders";

const providers = { stripe: stripeProvider, paypal: paypalProvider, alipay: alipayProvider, payoneer: payoneerProvider };
export function paymentCapabilities() {
  return Object.fromEntries(Object.entries(providers).map(([key, provider]) => [key, provider.configured()]));
}
export function getPaymentProvider(id) {
  const provider = providers[id];
  if (!provider) throw Object.assign(new Error("Unsupported payment provider"), { status: 400 });
  return provider;
}
export async function beginPayment({ order, userId = null, providerId, idempotencyKey }) {
  await connectDB();
  if (providerId === "wallet") {
    if (!userId) throw Object.assign(new Error("Wallet payment requires an account"), { status: 401 });
    await walletEntry({ userId, direction: "debit", source: "checkout", amount: order.total, orderId: order._id, idempotencyKey: `wallet:${idempotencyKey}` });
    await markOrderPaid(order._id, userId);
    return { action: "complete", orderNumber: order.orderNumber };
  }
  let payment = await Payment.findOne({ idempotencyKey });
  if (!payment) payment = await Payment.create({ order: order._id, user: userId, provider: providerId, amount: order.total, currency: order.currency, status: "pending", idempotencyKey });
  if (payment.status === "paid") return { action: "complete", orderNumber: order.orderNumber };
  const provider = getPaymentProvider(providerId);
  if (!provider.configured()) throw Object.assign(new Error(`${providerId} is not configured`), { status: 503 });
  await markOrderPaymentProcessing(order._id, userId);
  const result = await provider.create({ order, payment });
  payment.providerPaymentId = result.providerPaymentId || payment.providerPaymentId;
  payment.status = "processing";
  payment.metadata = { ...(payment.metadata || {}), createResult: result.action };
  await payment.save();
  await Transaction.updateOne({ reference: `TX-${payment._id}` }, { $setOnInsert: { reference: `TX-${payment._id}`, type: "payment", user: userId, order: order._id, payment: payment._id, provider: providerId, amount: order.total, currency: order.currency, status: "pending" } }, { upsert: true });
  return result;
}
export function transactionReference(prefix = "TX") { return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`; }
