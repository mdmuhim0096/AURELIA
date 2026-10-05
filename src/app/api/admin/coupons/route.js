import mongoose from "mongoose";
import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { audit } from "@/lib/auth/audit";
import { fail, fromError, ok, readJson } from "@/lib/api";

const TYPES = new Set(["percent", "fixed", "free_shipping"]);
function numericOrNull(value) { return value === "" || value == null ? null : Number(value); }
function normalize(body, partial = false) {
  const result = {};
  if (!partial || body.code !== undefined) { if (!body.code) throw Object.assign(new Error("Coupon code is required"), { status: 400 }); result.code = String(body.code).trim().toUpperCase(); }
  if (!partial || body.type !== undefined) { if (!TYPES.has(body.type)) throw Object.assign(new Error("Invalid coupon type"), { status: 400 }); result.type = body.type; }
  const numberFields = ["value", "minSubtotal", "maxDiscount", "usageLimit", "perUserLimit"];
  for (const field of numberFields) if (body[field] !== undefined) result[field] = numericOrNull(body[field]);
  if (result.value != null && result.value < 0) throw Object.assign(new Error("Coupon value cannot be negative"), { status: 400 });
  if ((result.type || body.type) === "percent" && result.value > 100) throw Object.assign(new Error("Percentage cannot exceed 100"), { status: 400 });
  if (result.minSubtotal != null && result.minSubtotal < 0) throw Object.assign(new Error("Minimum subtotal cannot be negative"), { status: 400 });
  if (result.perUserLimit != null && result.perUserLimit < 1) throw Object.assign(new Error("Per-customer limit must be at least 1"), { status: 400 });
  if (body.startsAt !== undefined) result.startsAt = body.startsAt ? new Date(body.startsAt) : null;
  if (body.endsAt !== undefined) result.endsAt = body.endsAt ? new Date(body.endsAt) : null;
  if (result.startsAt && Number.isNaN(result.startsAt.getTime())) throw Object.assign(new Error("Invalid start date"), { status: 400 });
  if (result.endsAt && Number.isNaN(result.endsAt.getTime())) throw Object.assign(new Error("Invalid end date"), { status: 400 });
  if (body.active !== undefined) result.active = Boolean(body.active);
  if (body.productIds !== undefined) result.productIds = Array.isArray(body.productIds) ? body.productIds.filter(mongoose.isValidObjectId) : [];
  if (body.categoryIds !== undefined) result.categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds.filter(mongoose.isValidObjectId) : [];
  return result;
}

export async function GET() {
  try { const session = await auth(); requirePermission(session, PERMISSIONS.MARKETING_MANAGE); await connectDB(); return ok({ items: await Coupon.find({}).sort({ createdAt: -1 }).lean() }); }
  catch (error) { return fromError(error, "Unable to load coupons"); }
}

export async function POST(request) {
  try {
    const session = await auth(); requirePermission(session, PERMISSIONS.MARKETING_MANAGE);
    const body = await readJson(request); await connectDB();
    const payload = normalize(body);
    const coupon = await Coupon.create(payload);
    await audit({ actor: session.user.id, action: "coupon.created", resourceType: "Coupon", resourceId: coupon._id, newValue: payload });
    return ok({ coupon }, { status: 201 });
  } catch (error) { return fromError(error, "Unable to create coupon"); }
}

export async function PATCH(request) {
  try {
    const session = await auth(); requirePermission(session, PERMISSIONS.MARKETING_MANAGE);
    const body = await readJson(request); if (!mongoose.isValidObjectId(body.id)) return fail("Invalid coupon", 400);
    await connectDB(); const previous = await Coupon.findById(body.id).lean(); if (!previous) return fail("Coupon not found", 404);
    const updates = normalize(body, true); delete updates.usageCount;
    const coupon = await Coupon.findByIdAndUpdate(body.id, { $set: updates }, { new: true, runValidators: true });
    await audit({ actor: session.user.id, action: "coupon.updated", resourceType: "Coupon", resourceId: body.id, previousValue: previous, newValue: updates });
    return ok({ coupon });
  } catch (error) { return fromError(error, "Unable to update coupon"); }
}

export async function DELETE(request) {
  try {
    const session = await auth(); requirePermission(session, PERMISSIONS.MARKETING_MANAGE);
    const body = await readJson(request); if (!mongoose.isValidObjectId(body.id)) return fail("Invalid coupon", 400);
    await connectDB(); const coupon = await Coupon.findById(body.id); if (!coupon) return fail("Coupon not found", 404);
    const previous = coupon.toObject(); await coupon.deleteOne();
    await audit({ actor: session.user.id, action: "coupon.deleted", resourceType: "Coupon", resourceId: body.id, previousValue: previous });
    return ok({ deleted: true });
  } catch (error) { return fromError(error, "Unable to delete coupon"); }
}
