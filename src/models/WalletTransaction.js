import mongoose from "mongoose";
const schema = new mongoose.Schema({
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  transactionId: { type: String, required: true, unique: true, index: true },
  direction: { type: String, enum: ["credit", "debit"], required: true },
  source: { type: String, enum: ["topup", "checkout", "refund", "promotion", "admin_adjustment"], required: true },
  amount: { type: Number, required: true, min: 0 },
  promotionalAmount: { type: Number, default: 0, min: 0 },
  balanceAfter: { type: Number, required: true },
  status: { type: String, enum: ["pending", "succeeded", "failed", "reversed"], default: "succeeded" },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  note: { type: String, default: "" },
  idempotencyKey: { type: String, required: true, unique: true }
}, { timestamps: true });
export default mongoose.models.WalletTransaction || mongoose.model("WalletTransaction", schema);
