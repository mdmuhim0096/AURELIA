import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import { recalculateProductRating } from "@/lib/commerce/reviews";
import { audit } from "@/lib/auth/audit";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function GET(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.REVIEWS_MODERATE); await connectDB(); const status = new URL(request.url).searchParams.get("status"); const items = await Review.find(status ? { status } : {}).populate("user", "name email").populate("product", "name slug").sort({ createdAt: -1 }).limit(300).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load reviews"); } }
export async function PATCH(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.REVIEWS_MODERATE); const { id, status } = await readJson(request); if (!['pending','approved','rejected'].includes(status)) return fail("Invalid review status", 400); await connectDB(); const review = await Review.findByIdAndUpdate(id, { $set: { status } }, { new: true }); if (!review) return fail("Review not found", 404); await recalculateProductRating(review.product); await audit({ actor: session.user.id, action: "review.moderated", resourceType: "Review", resourceId: id, newValue: { status } }); return ok({ review }); } catch (error) { return fromError(error, "Unable to moderate review"); } }
