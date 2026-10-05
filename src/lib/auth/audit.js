import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function audit({ actor = null, action, resourceType, resourceId = "", previousValue = null, newValue = null, metadata = {} }) {
  await connectDB();
  let ip = "";
  let userAgent = "";
  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
    userAgent = h.get("user-agent") || "";
  } catch {}
  return AuditLog.create({ actor, action, resourceType, resourceId: String(resourceId || ""), previousValue, newValue, ip, userAgent, metadata });
}
