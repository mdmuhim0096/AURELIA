import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  currency: { type: String, default: "USD" },
  availableBalance: { type: Number, default: 0 },
  promotionalBalance: { type: Number, default: 0 },
  version: { type: Number, default: 0 }
}, { timestamps: true, optimisticConcurrency: true });
export default mongoose.models.Wallet || mongoose.model("Wallet", schema);
