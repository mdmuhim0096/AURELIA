import mongoose from "mongoose";
const schema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true },
  options: { type: Map, of: String, default: {} },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, default: null, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  image: { type: String, default: "" },
  active: { type: Boolean, default: true }
}, { timestamps: true });
schema.index({ product: 1, active: 1 });
export default mongoose.models.ProductVariant || mongoose.model("ProductVariant", schema);
