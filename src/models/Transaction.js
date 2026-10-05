import mongoose from "mongoose";
import { TRANSACTION_STATUSES } from "@/lib/constants";
const schema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ["payment", "refund", "wallet_credit", "wallet_debit", "adjustment"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null, index: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  provider: { type: String, default: "" },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: TRANSACTION_STATUSES, default: "pending" },
  providerReference: { type: String, default: "" },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
export default mongoose.models.Transaction || mongoose.model("Transaction", schema);
