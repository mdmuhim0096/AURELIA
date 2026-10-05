import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["newsletter", "notification", "flash_sale", "banner"], required: true },
  status: { type: String, enum: ["draft", "scheduled", "running", "completed", "cancelled"], default: "draft", index: true },
  subject: { type: String, default: "" },
  content: { type: String, default: "" },
  audience: { type: mongoose.Schema.Types.Mixed, default: { type: "all" } },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
export default mongoose.models.MarketingCampaign || mongoose.model("MarketingCampaign", schema);
