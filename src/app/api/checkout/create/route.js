import { auth } from "@/auth";
import { checkoutSchema } from "@/lib/validation/commerce";
import { getGuestId } from "@/lib/commerce/guest";
import { findCart, mergeGuestCart } from "@/lib/commerce/cart";
import {
  createOrderFromCart,
  markOrderPaymentFailed,
} from "@/lib/commerce/orders";
import { beginPayment } from "@/lib/payments";
import { emailTemplates, sendEmail } from "@/lib/email";
import User from "@/models/User";
import { fail, ok, readJson } from "@/lib/api";
import { rateLimit, requestKey } from "@/lib/security/rate-limit";

export async function POST(request) {
  let stage = "start";
  let order = null;
  let data = null;
  let userId = null;

  try {
    stage = "rate-limit";
    const allowed = await rateLimit(
      requestKey(request, "checkout"),
      { limit: 12, windowSeconds: 300 }
    );

    if (!allowed) {
      return fail("Too many checkout attempts", 429);
    }

    stage = "validate";
    const parsed = checkoutSchema.safeParse(await readJson(request));

    if (!parsed.success) {
      return fail(
        "Invalid checkout details",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    data = parsed.data;

    stage = "session";
    const session = await auth();
    userId = session?.user?.id || null;
    const guestId = await getGuestId();

    stage = "merge-cart";
    if (userId && guestId) {
      await mergeGuestCart(userId, guestId);
    }

    stage = "load-cart";
    const cart = await findCart({
      userId,
      guestId,
      create: false,
    });

    if (!cart) {
      return fail("Cart is empty", 400);
    }

    stage = "create-order";
    order = await createOrderFromCart({
      cart,
      userId,
      email: data.email,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingSameAsShipping
        ? data.shippingAddress
        : data.billingAddress,
      shippingMethodId: data.shippingMethodId,
      paymentProvider: data.paymentProvider,
      notes: data.notes,
      idempotencyKey: data.idempotencyKey,
    });

    stage = "begin-payment";
    let payment;

    try {
      payment = await beginPayment({
        order,
        userId,
        providerId: data.paymentProvider,
        idempotencyKey: `pay:${data.idempotencyKey}`,
      });
    } catch (paymentError) {
      console.error("[checkout:payment:error]", {
        provider: data.paymentProvider,
        orderId: order?._id ? String(order._id) : null,
        orderNumber: order?.orderNumber || null,
        name: paymentError?.name,
        type: paymentError?.type,
        code: paymentError?.code,
        status: paymentError?.status,
        message: paymentError?.message,
        stack: paymentError?.stack,
      });

      try {
        if (order?._id) {
          await markOrderPaymentFailed(
            order._id,
            userId,
            `Payment initialization failed: ${paymentError?.message || "unknown error"}`
          );
        }
      } catch (markError) {
        console.error("[checkout:mark-payment-failed:error]", {
          message: markError?.message,
          stack: markError?.stack,
        });
      }

      return fail(
        `Unable to start ${data.paymentProvider} payment. Check the production payment credentials in Vercel.`,
        502
      );
    }

    // Email is a side effect. It must never turn a successfully-created
    // payment session into a failed checkout response.
    stage = "order-email";
    try {
      const user = userId
        ? await User.findById(userId).select("name email").lean()
        : null;

      await sendEmail({
        to: user?.email || data.email,
        ...emailTemplates.orderPlaced(
          user?.name || data.shippingAddress.firstName,
          order.orderNumber,
          order.total,
          order.currency
        ),
      });
    } catch (emailError) {
      console.error("[checkout:email:error]", {
        orderId: order?._id ? String(order._id) : null,
        orderNumber: order?.orderNumber || null,
        name: emailError?.name,
        message: emailError?.message,
        stack: emailError?.stack,
      });
    }

    stage = "complete";
    return ok({
      order: {
        id: String(order._id),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
      payment,
    });
  } catch (error) {
    console.error("[checkout:create:error]", {
      stage,
      provider: data?.paymentProvider || null,
      orderId: order?._id ? String(order._id) : null,
      orderNumber: order?.orderNumber || null,
      name: error?.name,
      type: error?.type,
      code: error?.code,
      status: error?.status,
      message: error?.message,
      stack: error?.stack,
    });

    const status = Number(error?.status || 500);

    if (status < 500) {
      return fail(error?.message || "Unable to create order", status);
    }

    return fail(
      `Unable to create order during ${stage}. Check Vercel Runtime Logs for [checkout:create:error].`,
      500
    );
  }
}
