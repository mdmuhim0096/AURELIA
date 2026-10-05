import { auth } from "@/auth";
import { findCart, hydrateCart, mergeGuestCart, mutateCart } from "@/lib/commerce/cart";
import { getGuestId, guestCookie, GUEST_COOKIE } from "@/lib/commerce/guest";
import { cartItemSchema, cartUpdateSchema, couponSchema } from "@/lib/validation/commerce";
import { fail, fromError, ok, readJson } from "@/lib/api";

async function context(create = true) {
  const session = await auth();
  const userId = session?.user?.id || null;
  const guestId = await getGuestId({ create: !userId && create });
  if (userId && guestId) await mergeGuestCart(userId, guestId);
  const cart = await findCart({ userId, guestId, create });
  return { session, userId, guestId, cart };
}
function withGuestCookie(response, userId, guestId) { if (!userId && guestId) response.cookies.set(guestCookie(guestId)); if (userId) response.cookies.delete(GUEST_COOKIE); return response; }
export async function GET() {
  try { const { userId, guestId, cart } = await context(true); return withGuestCookie(ok({ cart: await hydrateCart(cart) }), userId, guestId); }
  catch (error) { return fromError(error, "Unable to load cart"); }
}
export async function POST(request) {
  try {
    const body = await readJson(request); const { userId, guestId, cart } = await context(true);
    if (body.action === "coupon") { const parsed = couponSchema.safeParse(body); if (!parsed.success) return fail("Invalid coupon", 400); cart.couponCode = parsed.data.code; await cart.save(); }
    else { const parsed = cartItemSchema.safeParse(body); if (!parsed.success) return fail("Invalid cart item", 400, parsed.error.flatten().fieldErrors); await mutateCart(cart, parsed.data); }
    return withGuestCookie(ok({ cart: await hydrateCart(cart) }), userId, guestId);
  } catch (error) { return fromError(error, "Unable to update cart"); }
}
export async function PATCH(request) {
  try {
    const parsed = cartUpdateSchema.safeParse(await readJson(request)); if (!parsed.success) return fail("Invalid cart update", 400, parsed.error.flatten().fieldErrors);
    const { userId, guestId, cart } = await context(true); const item = cart.items.id(parsed.data.itemId); if (!item) return fail("Cart item not found", 404);
    if (parsed.data.quantity === 0) item.deleteOne(); else item.quantity = parsed.data.quantity; if (parsed.data.savedForLater !== undefined) item.savedForLater = parsed.data.savedForLater; await cart.save();
    return withGuestCookie(ok({ cart: await hydrateCart(cart) }), userId, guestId);
  } catch (error) { return fromError(error, "Unable to update cart"); }
}
export async function DELETE(request) {
  try {
    const { userId, guestId, cart } = await context(false); if (!cart) return ok({ cart: await hydrateCart(null) });
    const itemId = new URL(request.url).searchParams.get("itemId"); if (itemId) cart.items.id(itemId)?.deleteOne(); else { cart.items = []; cart.couponCode = ""; } await cart.save();
    return withGuestCookie(ok({ cart: await hydrateCart(cart) }), userId, guestId);
  } catch (error) { return fromError(error, "Unable to update cart"); }
}
