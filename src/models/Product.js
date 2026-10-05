import mongoose from "mongoose";
const specificationSchema = new mongoose.Schema({ key: String, value: String }, { _id: false });
const mediaSchema = new mongoose.Schema({ type: { type: String, enum: ["image", "video"], default: "image" }, url: String, alt: String, publicId: String }, { _id: false });
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  shortDescription: { type: String, default: "" },
  description: { type: String, default: "" },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true }],
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null, index: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  media: [mediaSchema],
  specifications: [specificationSchema],
  attributes: { type: Map, of: [String], default: {} },
  basePrice: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, default: null, min: 0 },
  costPrice: { type: Number, default: null, min: 0 },
  currency: { type: String, default: "USD" },
  stock: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  trackInventory: { type: Boolean, default: true },
  allowBackorder: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
  featured: { type: Boolean, default: false, index: true },
  trending: { type: Boolean, default: false, index: true },
  ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  salesCount: { type: Number, default: 0, min: 0 },
  shipping: { weight: Number, width: Number, height: Number, length: Number, class: String },
  shippingInfo: { type: String, default: "" },
  returnInfo: { type: String, default: "" },
  seo: { title: String, description: String, canonical: String },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }]
}, { timestamps: true });
schema.index({ name: "text", sku: "text", tags: "text", description: "text" }, { weights: { name: 10, sku: 8, tags: 5, description: 1 } });
schema.index({ status: 1, featured: -1, createdAt: -1 });
schema.index({ categories: 1, status: 1, basePrice: 1 });
export default mongoose.models.Product || mongoose.model("Product", schema);
