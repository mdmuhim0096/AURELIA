import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  guestId: { type: String, default: null, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  viewedAt: { type: Date, default: Date.now }
}, { timestamps: true });
schema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
export default mongoose.models.RecentlyViewed || mongoose.model("RecentlyViewed", schema);
