import { auth } from "@/auth";
import { getGuestId } from "@/lib/commerce/guest";
import { findCart, hydrateCart, mergeGuestCart } from "@/lib/commerce/cart";
import { fromError, ok, readJson } from "@/lib/api";
export async function POST(request) { try { const { shippingMethodId = "standard" } = await readJson(request); const session = await auth(); const guestId = await getGuestId(); if (session?.user?.id && guestId) await mergeGuestCart(session.user.id, guestId); const cart = await findCart({ userId: session?.user?.id || null, guestId, create: false }); return ok({ cart: await hydrateCart(cart, shippingMethodId) }); } catch (error) { return fromError(error, "Unable to calculate checkout"); } }
