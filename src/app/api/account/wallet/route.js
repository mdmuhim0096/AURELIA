import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getWallet } from "@/lib/commerce/wallet";
import WalletTransaction from "@/models/WalletTransaction";
import { fail, fromError, ok } from "@/lib/api";
export async function GET() { try { const session = await auth(); if (!session?.user?.id) return fail("Authentication required", 401); await connectDB(); const wallet = await getWallet(session.user.id); const transactions = await WalletTransaction.find({ user: session.user.id }).sort({ createdAt: -1 }).limit(100).lean(); return ok({ wallet, transactions }); } catch (error) { return fromError(error, "Unable to load wallet"); } }
