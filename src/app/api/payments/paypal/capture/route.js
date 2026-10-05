import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import { paypalProvider } from "@/lib/payments/paypal";
import { markOrderPaid } from "@/lib/commerce/orders";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function POST(request) {
  try {
    const { orderNumber } = await readJson(request); if (!orderNumber) return fail("Order number is required", 400);
    await connectDB(); const order = await Order.findOne({ orderNumber }); if (!order) return fail("Order not found", 404);
    const session = await auth(); if (order.user && String(order.user) !== session?.user?.id) return fail("Forbidden", 403);
    const payment = await Payment.findOne({ order: order._id, provider: "paypal" }); if (!payment) return fail("PayPal payment not found", 404);
    if (payment.status === "paid") return ok({ orderNumber: order.orderNumber, status: order.status });
    const capture = await paypalProvider.capture(payment.providerPaymentId); const captureRecord = capture.purchase_units?.[0]?.payments?.captures?.[0];
    if (capture.status !== "COMPLETED" || !captureRecord?.id) return fail("PayPal payment was not completed", 409);
    payment.status = "paid"; payment.metadata = { ...(payment.metadata || {}), captureId: captureRecord.id }; await payment.save();
    await Transaction.updateOne({ payment: payment._id }, { $set: { status: "succeeded", providerReference: captureRecord.id } }); await markOrderPaid(order._id, session?.user?.id || null);
    return ok({ orderNumber: order.orderNumber, status: "paid" });
  } catch (error) { return fromError(error, "Unable to capture PayPal payment"); }
}
