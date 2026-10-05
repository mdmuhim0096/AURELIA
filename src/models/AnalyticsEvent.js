import mongoose from "mongoose";

const schema = new mongoose.Schema({
  event: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true, maxlength: 100 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  path: { type: String, default: "", maxlength: 500 },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null, index: true },
  value: { type: Number, default: 0 },
  currency: { type: String, default: "USD", maxlength: 10 },
  referrer: { type: String, default: "", maxlength: 1000 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

schema.index({ createdAt: -1, event: 1 });
schema.index({ sessionId: 1, createdAt: -1 });
export default mongoose.models.AnalyticsEvent || mongoose.model("AnalyticsEvent", schema);
