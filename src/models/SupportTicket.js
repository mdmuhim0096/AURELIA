import mongoose from "mongoose";
import { SUPPORT_STATUSES } from "@/lib/constants";
const schema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subject: { type: String, required: true },
  category: { type: String, default: "general" },
  priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
  status: { type: String, enum: SUPPORT_STATUSES, default: "open", index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "ChatConversation", default: null }
}, { timestamps: true });
export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", schema);
