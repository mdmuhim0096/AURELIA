import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import ChatConversation from "@/models/ChatConversation";
import { fail, fromError, ok } from "@/lib/api";
export async function GET() { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); await connectDB(); const items = await ChatConversation.find({ user: session.user.id }).populate("assignedAgent", "name avatar").populate("ticket", "ticketNumber subject status priority").sort({ lastMessageAt: -1 }).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load conversations"); } }
