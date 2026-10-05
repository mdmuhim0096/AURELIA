import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  provider: { type: String, enum: ["stripe"], required: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: "USD" },
  status: { type: String, enum: ["pending", "processing", "succeeded", "failed", "cancelled"], default: "pending", index: true },
  providerReference: { type: String, default: "", index: true },
  idempotencyKey: { type: String, required: true, unique: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
export default mongoose.models.WalletTopup || mongoose.model("WalletTopup", schema);
