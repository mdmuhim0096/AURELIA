import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { fromError, ok } from "@/lib/api";
export async function GET(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.ORDERS_READ); await connectDB(); const url = new URL(request.url); const status = url.searchParams.get("status"); const q = url.searchParams.get("q"); const filter = {}; if (status) filter.status = status; if (q) filter.$or = [{ orderNumber: { $regex: q, $options: "i" } }, { guestEmail: { $regex: q, $options: "i" } }]; const items = await Order.find(filter).populate("user", "name email phone").sort({ createdAt: -1 }).limit(300).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load orders"); } }
