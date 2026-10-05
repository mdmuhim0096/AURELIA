import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { fail, fromError, ok } from "@/lib/api";
export async function GET(request) { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); await connectDB(); const page = Math.max(1, Number(new URL(request.url).searchParams.get("page") || 1)); const limit = 20; const [items, total] = await Promise.all([Order.find({ user: session.user.id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Order.countDocuments({ user: session.user.id })]); return ok({ items, total, page, pages: Math.ceil(total / limit) }); } catch (error) { return fromError(error, "Unable to load orders"); } }
