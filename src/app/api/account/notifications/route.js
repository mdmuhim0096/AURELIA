import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function GET() { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); await connectDB(); const items = await Notification.find({ user: session.user.id }).sort({ createdAt: -1 }).limit(100).lean(); return ok({ items, unread: items.filter((n) => !n.readAt).length }); } catch (error) { return fromError(error, "Unable to load notifications"); } }
export async function PATCH(request) { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); const { id, all = false } = await readJson(request); await connectDB(); if (all) await Notification.updateMany({ user: session.user.id, readAt: null }, { $set: { readAt: new Date() } }); else await Notification.updateOne({ _id: id, user: session.user.id }, { $set: { readAt: new Date() } }); return ok({ updated: true }); } catch (error) { return fromError(error, "Unable to update notifications"); } }
