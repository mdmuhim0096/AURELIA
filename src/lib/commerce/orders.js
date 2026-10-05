import crypto from "node:crypto";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import Coupon from "@/models/Coupon";
import { hydrateCart } from "@/lib/commerce/cart";
import { audit } from "@/lib/auth/audit";

export function orderNumber() { return `ORD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`; }

export async function createOrderFromCart({ cart, userId = null, email, shippingAddress, billingAddress, shippingMethodId, paymentProvider, notes, idempotencyKey }) {
  await connectDB();
  const existing = await Order.findOne({ idempotencyKey });
  if (existing) return existing;
  const hydrated = await hydrateCart(cart, shippingMethodId);
  if (!hydrated.items.length) throw Object.assign(new Error("Cart is empty"), { status: 400 });
  if (hydrated.items.some((item) => !item.available)) throw Object.assign(new Error("One or more cart items are no longer available"), { status: 409 });
  const items = hydrated.items.map((item) => ({ product: item.productId, variant: item.variantId, name: item.name, sku: item.sku, options: item.options, image: item.image, unitPrice: item.unitPrice, quantity: item.quantity, subtotal: item.unitPrice * item.quantity }));
  const order = await Order.create({ orderNumber: orderNumber(), user: userId, guestEmail: userId ? "" : email, items, shippingAddress, billingAddress, shippingMethod: hydrated.totals.shippingMethod, currency: hydrated.currency || "USD", subtotal: hydrated.totals.subtotal, discount: hydrated.totals.discount, tax: hydrated.totals.tax, shipping: hydrated.totals.shipping, total: hydrated.totals.total, couponCode: cart.couponCode || "", status: "pending", paymentStatus: "pending", paymentProvider, notes, idempotencyKey, timeline: [{ status: "pending", note: "Order created", actor: userId }] });
  if (hydrated.totals.coupon?._id) await Coupon.updateOne({ _id: hydrated.totals.coupon._id }, { $inc: { usageCount: 1 } });
  await audit({ actor: userId, action: "order.created", resourceType: "Order", resourceId: order._id, newValue: { orderNumber: order.orderNumber, total: order.total, provider: paymentProvider } });
  return order;
}

export async function markOrderPaymentProcessing(orderId, actor = null) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || ["paid", "refunded", "cancelled"].includes(order.status)) return order;
  if (order.status !== "payment_processing" || order.paymentStatus !== "processing") {
    order.status = "payment_processing";
    order.paymentStatus = "processing";
    order.timeline.push({ status: "payment_processing", note: "Payment initiated", actor });
    await order.save();
  }
  return order;
}

export async function markOrderPaymentFailed(orderId, actor = null, note = "Payment failed") {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === "paid") return order;
  order.paymentStatus = "failed";
  order.status = "failed";
  order.timeline.push({ status: "failed", note, actor });
  await order.save();
  return order;
}

export async function markOrderPaymentCancelled(orderId, actor = null, note = "Payment cancelled") {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === "paid") return order;
  order.paymentStatus = "cancelled";
  if (["pending", "payment_processing", "failed"].includes(order.status)) order.status = "cancelled";
  order.cancelledAt = new Date();
  order.timeline.push({ status: order.status, note, actor });
  await order.save();
  return order;
}

export async function markOrderPaid(orderId, actor = null) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) return null;

  // Stripe/PayPal are the source of truth for captured money. Persist that
  // fact first so a stock-side effect can never leave a genuinely paid order
  // stuck at payment_processing in MongoDB.
  if (order.paymentStatus !== "paid") {
    order.paymentStatus = "paid";
    order.status = "paid";
    order.timeline.push({ status: "paid", note: "Payment verified", actor });
    await order.save();
  }

  if (order.user) {
    await Cart.updateOne(
      { user: order.user },
      { $set: { items: [], couponCode: "" } }
    );
  }

  // Inventory adjustment is secondary to payment persistence. Keep the
  // existing stock guards, but record any inventory problem instead of
  // rolling the paid order back to a misleading processing state.
  if (!order.inventoryAdjustedAt && !order.inventoryAdjustmentError) {
    try {
      for (const item of order.items) {
        if (item.variant) {
          const variant = await ProductVariant.findOneAndUpdate(
            {
              _id: item.variant,
              $or: [
                { stock: { $gte: item.quantity } },
                { stock: { $exists: false } },
              ],
            },
            { $inc: { stock: -item.quantity } }
          );

          if (!variant) {
            throw Object.assign(
              new Error(`Insufficient stock for ${item.sku}`),
              { status: 409 }
            );
          }

          await Product.updateOne(
            { _id: item.product },
            { $inc: { salesCount: item.quantity } }
          );
        } else {
          const product = await Product.findOneAndUpdate(
            {
              _id: item.product,
              $or: [
                { trackInventory: false },
                { allowBackorder: true },
                { stock: { $gte: item.quantity } },
              ],
            },
            {
              $inc: {
                stock: -item.quantity,
                salesCount: item.quantity,
              },
            }
          );

          if (!product) {
            throw Object.assign(
              new Error(`Insufficient stock for ${item.sku}`),
              { status: 409 }
            );
          }
        }
      }

      order.inventoryAdjustedAt = new Date();
      order.inventoryAdjustmentError = "";
      await order.save();
    } catch (error) {
      order.inventoryAdjustmentError = error?.message || "Inventory adjustment failed";
      order.timeline.push({
        status: "paid",
        note: `Payment verified; inventory attention required: ${order.inventoryAdjustmentError}`,
        actor,
      });
      await order.save();

      console.error("[order:paid:inventory:error]", {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        message: error?.message,
      });
    }
  }

  return order;
}
