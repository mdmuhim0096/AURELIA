import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import SearchHistory from "@/models/SearchHistory";
import { getGuestId } from "@/lib/commerce/guest";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function GET() { try { const session = await auth(); const guestId = await getGuestId(); await connectDB(); const filter = session?.user?.id ? { user: session.user.id } : guestId ? { guestId } : null; if (!filter) return ok({ items: [] }); const items = await SearchHistory.find(filter).sort({ createdAt: -1 }).limit(10).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load search history"); } }
export async function POST(request) { try { const { query, resultCount = 0 } = await readJson(request); if (!String(query || "").trim()) return fail("Query is required", 400); const session = await auth(); const guestId = await getGuestId({ create: true }); await connectDB(); await SearchHistory.create({ user: session?.user?.id || null, guestId: session?.user?.id ? null : guestId, query: String(query).trim().slice(0, 200), resultCount: Number(resultCount) }); return ok({ saved: true }, { status: 201 }); } catch (error) { return fromError(error, "Unable to save search history"); } }
