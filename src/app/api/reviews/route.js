import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { reviewSchema } from "@/lib/validation/commerce";
import { fail, fromError, ok, readJson } from "@/lib/api";
import { rateLimit, requestKey } from "@/lib/security/rate-limit";
export async function GET(request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    if (!productId) return fail("Product ID is required", 400);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit") || 10)));
    const filter = { product: productId, status: "approved" };
    const [items, total, aggregate] = await Promise.all([
      Review.find(filter).populate("user", "name avatar").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Review.countDocuments(filter),
      Review.aggregate([{ $match: { product: new mongoose.Types.ObjectId(productId), status: "approved" } }, { $group: { _id: "$rating", count: { $sum: 1 } } }])
    ]);
    const distribution = Object.fromEntries([1,2,3,4,5].map((n)=>[n, aggregate.find((r)=>r._id===n)?.count || 0]));
    return ok({ items, total, page, pages: Math.ceil(total / limit), distribution });
  } catch (error) { return fromError(error, "Unable to load reviews"); }
}
export async function POST(request) {
  try {
    if (!(await rateLimit(requestKey(request, "review"), { limit: 10, windowSeconds: 3600 }))) return fail("Too many review attempts", 429);
    const session = await auth();
    if (!session?.user?.id) return fail("Authentication required", 401);
    const parsed = reviewSchema.safeParse(await readJson(request));
    if (!parsed.success) return fail("Invalid review", 400, parsed.error.flatten().fieldErrors);
    await connectDB();
    const existing = await Review.findOne({ product: parsed.data.productId, user: session.user.id });
    if (existing) return fail("You already reviewed this product", 409);
    const purchased = await Order.exists({ user: session.user.id, status: "delivered", "items.product": new mongoose.Types.ObjectId(parsed.data.productId) });
    const review = await Review.create({ ...parsed.data, product: parsed.data.productId, user: session.user.id, order: parsed.data.orderId || null, verifiedPurchase: Boolean(purchased), status: "pending" });
    return ok({ review }, { status: 201 });
  } catch (error) { return fromError(error, "Unable to submit review"); }
}
