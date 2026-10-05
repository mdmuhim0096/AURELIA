import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Refund from "@/models/Refund";
import Payment from "@/models/Payment";
import { notifyUser } from "@/lib/notifications";
import { fail, fromError, ok, readJson } from "@/lib/api";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return fail("Authentication required", 401);
    const { id } = await params;
    const { reason = "Customer requested refund", amount, destination = "original" } = await readJson(request);
    await connectDB();
    const order = await Order.findOne({ _id: id, user: session.user.id });
    if (!order) return fail("Order not found", 404);
    if (!["paid", "processing", "packed", "shipped", "out_for_delivery", "delivered", "refund_requested"].includes(order.status)) return fail("This order is not eligible for a refund request", 409);
    const existing = await Refund.findOne({ order: order._id, status: { $in: ["requested", "processing"] } });
    if (existing) return fail("A refund request is already open", 409);
    const requestedAmount = amount == null ? order.total : Number(amount);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0 || requestedAmount > order.total) return fail("Invalid refund amount", 400);
    const payment = await Payment.findOne({ order: order._id, status: { $in: ["paid", "partially_refunded"] } });
    const refund = await Refund.create({ order: order._id, payment: payment?._id || null, user: session.user.id, amount: requestedAmount, reason: String(reason).slice(0, 1000), destination: destination === "wallet" ? "wallet" : "original", status: "requested" });
    order.status = "refund_requested";
    order.timeline.push({ status: "refund_requested", note: `Refund requested: ${refund.reason}`, actor: session.user.id });
    await order.save();
    await notifyUser(session.user.id, { type: "refund_requested", title: `Refund requested for ${order.orderNumber}`, message: `Your refund request for ${order.currency} ${requestedAmount.toFixed(2)} was received.`, href: `/account/orders/${order._id}` });
    return ok({ refund }, { status: 201 });
  } catch (error) { return fromError(error, "Unable to request refund"); }
}
