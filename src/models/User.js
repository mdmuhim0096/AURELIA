import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, default: "", trim: true },
  avatar: { type: String, default: "" },
  passwordHash: { type: String, required: true, select: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true, index: true },
  emailVerifiedAt: { type: Date, default: null },
  emailVerificationTokenHash: { type: String, default: null, select: false },
  emailVerificationExpiresAt: { type: Date, default: null, select: false },
  passwordResetTokenHash: { type: String, default: null, select: false },
  passwordResetExpiresAt: { type: Date, default: null, select: false },
  status: { type: String, enum: ["active", "suspended", "disabled"], default: "active", index: true },
  lastLoginAt: { type: Date, default: null },
  lastSeenAt: { type: Date, default: null },
  failedLoginCount: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
  marketingOptIn: { type: Boolean, default: false },
  preferences: {
    currency: { type: String, default: "USD" },
    language: { type: String, default: "en" },
    notifications: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } }
  }
}, { timestamps: true, optimisticConcurrency: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: "text", email: "text" });
export default mongoose.models.User || mongoose.model("User", userSchema);
