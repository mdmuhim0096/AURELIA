import mongoose from "mongoose";
import { PAYMENT_STATUSES } from "@/lib/constants";
const schema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  provider: { type: String, required: true, index: true },
  providerPaymentId: { type: String, default: "", index: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: PAYMENT_STATUSES, default: "pending", index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  idempotencyKey: { type: String, required: true, unique: true },
  refundedAmount: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.models.Payment || mongoose.model("Payment", schema);
