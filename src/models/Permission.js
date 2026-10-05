import mongoose from "mongoose";
const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: "" }
}, { timestamps: true });
export default mongoose.models.Permission || mongoose.model("Permission", schema);
