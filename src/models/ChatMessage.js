import mongoose from "mongoose";
const schema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "ChatConversation", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["customer", "agent", "admin"], default: "customer" },
  body: { type: String, default: "", maxlength: 5000 },
  attachments: [{ name: String, url: String, type: String, size: Number }],
  readAt: { type: Date, default: null }
}, { timestamps: true });
schema.index({ conversation: 1, createdAt: 1 });
export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", schema);
