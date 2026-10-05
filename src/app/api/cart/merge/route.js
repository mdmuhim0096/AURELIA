import { auth } from "@/auth";
import { mergeGuestCart, hydrateCart } from "@/lib/commerce/cart";
import { getGuestId, GUEST_COOKIE } from "@/lib/commerce/guest";
import { fail, fromError, ok } from "@/lib/api";
export async function POST() {
  try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); const guestId = await getGuestId(); const cart = await mergeGuestCart(session.user.id, guestId); const response = ok({ cart: await hydrateCart(cart) }); response.cookies.delete(GUEST_COOKIE); return response; }
  catch (error) { return fromError(error, "Unable to merge cart"); }
}
