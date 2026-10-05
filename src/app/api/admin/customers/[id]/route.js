import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import Order from "@/models/Order";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import SupportTicket from "@/models/SupportTicket";
import AuditLog from "@/models/AuditLog";
import { audit } from "@/lib/auth/audit";
import { fail, fromError, ok, readJson } from "@/lib/api";
export async function GET(_request, { params }) { try { const session = await auth(); requirePermission(session, PERMISSIONS.USERS_READ); const { id } = await params; await connectDB(); const user = await User.findById(id).populate("role", "name slug permissions").lean(); if (!user) return fail("Customer not found", 404); const [orders, wallet, walletTransactions, supportHistory, activity] = await Promise.all([Order.find({ user: id }).sort({ createdAt: -1 }).limit(50).lean(), Wallet.findOne({ user: id }).lean(), WalletTransaction.find({ user: id }).sort({ createdAt: -1 }).limit(50).lean(), SupportTicket.find({ user: id }).sort({ createdAt: -1 }).limit(50).lean(), AuditLog.find({ actor: id }).sort({ createdAt: -1 }).limit(50).lean()]); return ok({ user, orders, wallet, walletTransactions, supportHistory, activity }); } catch (error) { return fromError(error, "Unable to load customer"); } }
export async function PATCH(request, { params }) { try { const session = await auth(); requirePermission(session, PERMISSIONS.USERS_WRITE); const { id } = await params; const body = await readJson(request); await connectDB(); const user = await User.findById(id).populate("role"); if (!user) return fail("Customer not found", 404); const previous = { name: user.name, phone: user.phone, status: user.status, role: user.role?.slug }; if (body.name !== undefined) user.name = body.name; if (body.phone !== undefined) user.phone = body.phone; if (body.status !== undefined) user.status = body.status; if (body.roleSlug !== undefined) { const role = await Role.findOne({ slug: body.roleSlug }); if (!role) return fail("Role not found", 404); user.role = role._id; } await user.save(); await audit({ actor: session.user.id, action: "user.updated", resourceType: "User", resourceId: id, previousValue: previous, newValue: body }); return ok({ updated: true }); } catch (error) { return fromError(error, "Unable to update customer"); } }
