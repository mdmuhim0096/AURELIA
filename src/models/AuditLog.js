import mongoose from "mongoose";
const schema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  action: { type: String, required: true, index: true },
  resourceType: { type: String, required: true, index: true },
  resourceId: { type: String, default: "", index: true },
  previousValue: { type: mongoose.Schema.Types.Mixed, default: null },
  newValue: { type: mongoose.Schema.Types.Mixed, default: null },
  ip: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
schema.index({ createdAt: -1 });
schema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
export default mongoose.models.AuditLog || mongoose.model("AuditLog", schema);
