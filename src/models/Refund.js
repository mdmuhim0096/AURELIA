import mongoose from "mongoose";
import { REFUND_STATUSES } from "../lib/constants.js";
const schema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  amount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true },
  destination: { type: String, enum: ["original", "wallet"], default: "original" },
  status: { type: String, enum: REFUND_STATUSES, default: "requested", index: true },
  providerRefundId: { type: String, default: "" }
}, { timestamps: true });
export default mongoose.models.Refund || mongoose.model("Refund", schema);
