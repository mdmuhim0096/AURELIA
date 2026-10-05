import mongoose from "mongoose";
import { RETURN_STATUSES } from "../lib/constants.js";
const schema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" }, quantity: Number, reason: String }],
  status: { type: String, enum: RETURN_STATUSES, default: "requested", index: true },
  resolution: { type: String, enum: ["refund", "wallet", "replacement", "none"], default: "none" },
  notes: { type: String, default: "" }
}, { timestamps: true });
export default mongoose.models.Return || mongoose.model("Return", schema);
