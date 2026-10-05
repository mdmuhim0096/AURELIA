import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
export async function recalculateProductRating(productId) {
  await connectDB();
  const result = await Review.aggregate([{ $match: { product: productId, status: "approved" } }, { $group: { _id: "$product", average: { $avg: "$rating" }, count: { $sum: 1 } } }]);
  const rating = result[0] || { average: 0, count: 0 };
  await Product.updateOne({ _id: productId }, { $set: { ratingAverage: Math.round(rating.average * 10) / 10, ratingCount: rating.count } });
}
