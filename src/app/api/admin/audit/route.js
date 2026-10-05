import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { fromError, ok } from "@/lib/api";
export async function GET(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.AUDIT_READ); await connectDB(); const url = new URL(request.url); const filter = {}; if (url.searchParams.get("action")) filter.action = { $regex: url.searchParams.get("action"), $options: "i" }; if (url.searchParams.get("resourceType")) filter.resourceType = url.searchParams.get("resourceType"); const items = await AuditLog.find(filter).populate("actor", "name email").sort({ createdAt: -1 }).limit(500).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load audit logs"); } }
