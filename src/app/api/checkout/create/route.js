import { auth } from "@/auth";
import { checkoutSchema } from "@/lib/validation/commerce";
import { getGuestId } from "@/lib/commerce/guest";
import { findCart, mergeGuestCart } from "@/lib/commerce/cart";
import { createOrderFromCart } from "@/lib/commerce/orders";
import { beginPayment } from "@/lib/payments";
import { emailTemplates, sendEmail } from "@/lib/email";
import User from "@/models/User";
import { fail, fromError, ok, readJson } from "@/lib/api";
import { rateLimit, requestKey } from "@/lib/security/rate-limit";
export async function POST(request) {
  try {
    if (!(await rateLimit(requestKey(request, "checkout"), { limit: 12, windowSeconds: 300 }))) return fail("Too many checkout attempts", 429);

    const parsed = checkoutSchema.safeParse(await readJson(request)); if (!parsed.success) return fail("Invalid checkout details", 400, parsed.error.flatten().fieldErrors);
    const session = await auth(); const userId = session?.user?.id || null; const guestId = await getGuestId(); if (userId && guestId) await mergeGuestCart(userId, guestId);
    const cart = await findCart({ userId, guestId, create: false }); if (!cart) return fail("Cart is empty", 400);
    const data = parsed.data; const order = await createOrderFromCart({ cart, userId, email: data.email, shippingAddress: data.shippingAddress, billingAddress: data.billingSameAsShipping ? data.shippingAddress : data.billingAddress, shippingMethodId: data.shippingMethodId, paymentProvider: data.paymentProvider, notes: data.notes, idempotencyKey: data.idempotencyKey });
    const payment = await beginPayment({ order, userId, providerId: data.paymentProvider, idempotencyKey: `pay:${data.idempotencyKey}` });
    const user = userId ? await User.findById(userId).select("name email").lean() : null; await sendEmail({ to: user?.email || data.email, ...emailTemplates.orderPlaced(user?.name || data.shippingAddress.firstName, order.orderNumber, order.total, order.currency) });
    return ok({ order: { id: String(order._id), orderNumber: order.orderNumber, total: order.total, status: order.status }, payment });
  } catch (error) { return fromError(error, "Unable to create order"); }
}
