import mongoose from "mongoose";
const schema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: "" },
  body: { type: String, required: true, maxlength: 4000 },
  media: [{ type: { type: String, enum: ["image", "video"] }, url: String }],
  verifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  helpfulCount: { type: Number, default: 0 },
  unhelpfulCount: { type: Number, default: 0 },
  votes: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, value: { type: String, enum: ["helpful", "unhelpful"] } }],
  reports: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, reason: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true });
schema.index({ product: 1, user: 1 }, { unique: true });
export default mongoose.models.Review || mongoose.model("Review", schema);
