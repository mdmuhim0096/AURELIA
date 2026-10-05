import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  provider: { type: String, required: true },
  providerMethodId: { type: String, required: true },
  type: { type: String, default: "card" },
  brand: { type: String, default: "" },
  last4: { type: String, default: "" },
  expiryMonth: { type: Number, default: null },
  expiryYear: { type: Number, default: null },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ user: 1, provider: 1, providerMethodId: 1 }, { unique: true });
export default mongoose.models.PaymentMethod || mongoose.model("PaymentMethod", schema);
