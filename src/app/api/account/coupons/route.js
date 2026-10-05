import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { fail, fromError, ok } from "@/lib/api";
export async function GET() { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); await connectDB(); const now = new Date(); const items = await Coupon.find({ active: true, $or: [{ startsAt: null }, { startsAt: { $lte: now } }], $and: [{ $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }] }).sort({ endsAt: 1 }).limit(50).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load coupons"); } }
