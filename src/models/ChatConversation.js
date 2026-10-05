import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: "SupportTicket", default: null },
  status: { type: String, enum: ["open", "pending", "resolved", "closed"], default: "open", index: true },
  userLastReadAt: { type: Date, default: null },
  agentLastReadAt: { type: Date, default: null },
  userTypingUntil: { type: Date, default: null },
  agentTypingUntil: { type: Date, default: null },
  lastMessageAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
export default mongoose.models.ChatConversation || mongoose.model("ChatConversation", schema);
