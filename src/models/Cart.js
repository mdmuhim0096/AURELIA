import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", default: null },
  quantity: { type: Number, required: true, min: 1, max: 99 },
  savedForLater: { type: Boolean, default: false }
}, { timestamps: true });
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  guestId: { type: String, default: null, index: true },
  items: [itemSchema],
  couponCode: { type: String, default: "" },
  currency: { type: String, default: "USD" },
  expiresAt: { type: Date, default: null }
}, { timestamps: true });
schema.index({ guestId: 1, updatedAt: -1 });
export default mongoose.models.Cart || mongoose.model("Cart", schema);
