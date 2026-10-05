import crypto from "node:crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";

export async function getWallet(userId, { create = true } = {}) {
  await connectDB();
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet && create) wallet = await Wallet.create({ user: userId });
  return wallet;
}

export async function walletEntry({ userId, direction, source, amount, promotionalAmount = 0, orderId = null, note = "", idempotencyKey }) {
  if (!idempotencyKey) throw new Error("Wallet idempotency key is required");
  await connectDB();
  const existing = await WalletTransaction.findOne({ idempotencyKey });
  if (existing) return existing;
  const wallet = await getWallet(userId);
  const numeric = Number(amount);
  if (numeric <= 0) throw Object.assign(new Error("Wallet amount must be positive"), { status: 400 });
  if (direction === "debit") {
    const usable = wallet.availableBalance + wallet.promotionalBalance;
    if (usable < numeric) throw Object.assign(new Error("Insufficient wallet balance"), { status: 409 });
    const promoUsed = Math.min(wallet.promotionalBalance, numeric);
    wallet.promotionalBalance -= promoUsed;
    wallet.availableBalance -= numeric - promoUsed;
  } else {
    wallet.availableBalance += numeric;
    wallet.promotionalBalance += Number(promotionalAmount || 0);
  }
  wallet.version += 1;
  await wallet.save();
  return WalletTransaction.create({ wallet: wallet._id, user: userId, transactionId: `WTX-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`, direction, source, amount: numeric, promotionalAmount, balanceAfter: wallet.availableBalance + wallet.promotionalBalance, order: orderId, note, idempotencyKey });
}
