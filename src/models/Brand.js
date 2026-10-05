import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  logo: { type: String, default: "" },
  description: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  seo: { title: String, description: String, canonical: String }
}, { timestamps: true });
export default mongoose.models.Brand || mongoose.model("Brand", schema);
