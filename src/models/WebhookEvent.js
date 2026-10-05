import mongoose from "mongoose";
const schema = new mongoose.Schema({
  provider: { type: String, required: true },
  eventId: { type: String, required: true },
  type: { type: String, default: "" },
  status: { type: String, enum: ["processing", "processed", "failed"], default: "processing" },
  error: { type: String, default: "" }
}, { timestamps: true });
schema.index({ provider: 1, eventId: 1 }, { unique: true });
export default mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", schema);
