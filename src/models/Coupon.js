import mongoose from "mongoose";
const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ["percent", "fixed", "free_shipping"], required: true },
  value: { type: Number, default: 0, min: 0 },
  minSubtotal: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: null },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  usageLimit: { type: Number, default: null },
  perUserLimit: { type: Number, default: 1 },
  usageCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true, index: true },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }]
}, { timestamps: true });
export default mongoose.models.Coupon || mongoose.model("Coupon", schema);
