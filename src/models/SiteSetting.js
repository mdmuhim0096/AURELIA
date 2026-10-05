import mongoose from "mongoose";
const schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
  group: { type: String, default: "general", index: true }
}, { timestamps: true });
export default mongoose.models.SiteSetting || mongoose.model("SiteSetting", schema);
