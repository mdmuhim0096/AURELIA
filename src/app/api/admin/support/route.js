import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import ChatConversation from "@/models/ChatConversation";
import SupportTicket from "@/models/SupportTicket";
import { fromError, ok, readJson } from "@/lib/api";
export async function GET() { try { const session = await auth(); requirePermission(session, PERMISSIONS.SUPPORT_MANAGE); await connectDB(); const items = await ChatConversation.find({ status: { $ne: "closed" } }).populate("user", "name email avatar").populate("assignedAgent", "name avatar").populate("ticket", "ticketNumber subject priority status").sort({ lastMessageAt: -1 }).limit(300).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load support conversations"); } }
export async function PATCH(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.SUPPORT_MANAGE); const body = await readJson(request); await connectDB(); const conversation = await ChatConversation.findByIdAndUpdate(body.id, { $set: { assignedAgent: body.assignToMe ? session.user.id : body.assignedAgent || null, status: body.status || "open" } }, { new: true }); if (conversation?.ticket) await SupportTicket.updateOne({ _id: conversation.ticket }, { $set: { assignedTo: conversation.assignedAgent, status: conversation.status } }); return ok({ conversation }); } catch (error) { return fromError(error, "Unable to update support conversation"); } }
