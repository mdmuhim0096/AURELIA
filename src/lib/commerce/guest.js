import crypto from "node:crypto";
import { cookies } from "next/headers";
export const GUEST_COOKIE = "commerce_guest";
export async function getGuestId({ create = false } = {}) {
  const jar = await cookies();
  let id = jar.get(GUEST_COOKIE)?.value || null;
  if (!id && create) id = crypto.randomUUID();
  return id;
}
export function guestCookie(id) {
  return { name: GUEST_COOKIE, value: id, options: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 } };
}
