import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
  description: { type: String, default: "" },
  banner: { type: String, default: "" },
  featured: { type: Boolean, default: false, index: true },
  trending: { type: Boolean, default: false, index: true },
  sortOrder: { type: Number, default: 0 },
  filters: [{ key: String, label: String, type: { type: String, default: "select" }, options: [String] }],
  seo: { title: String, description: String, canonical: String }
}, { timestamps: true });
schema.index({ parent: 1, sortOrder: 1 });
export default mongoose.models.Category || mongoose.model("Category", schema);
