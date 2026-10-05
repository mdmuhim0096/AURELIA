import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { fromError, ok } from "@/lib/api";
export async function GET(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.USERS_READ); await connectDB(); const q = new URL(request.url).searchParams.get("q"); const filter = q ? { $or: [{ name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }] } : {}; const items = await User.find(filter).populate("role", "name slug").sort({ createdAt: -1 }).limit(300).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load customers"); } }
