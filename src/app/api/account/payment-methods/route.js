import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import PaymentMethod from "@/models/PaymentMethod";
import { fail, fromError, ok } from "@/lib/api";
export async function GET() { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); await connectDB(); return ok({ items: await PaymentMethod.find({ user: session.user.id }).select("provider type brand last4 expiryMonth expiryYear isDefault createdAt").lean() }); } catch (error) { return fromError(error, "Unable to load payment methods"); } }
export async function DELETE(request) { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); const id = new URL(request.url).searchParams.get("id"); await connectDB(); await PaymentMethod.deleteOne({ _id: id, user: session.user.id }); return ok({ removed: true }); } catch (error) { return fromError(error, "Unable to remove payment method"); } }
