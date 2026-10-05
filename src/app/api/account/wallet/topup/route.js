import crypto from "node:crypto";
import Stripe from "stripe";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import WalletTopup from "@/models/WalletTopup";
import { fail, fromError, ok, readJson } from "@/lib/api";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return fail("Authentication required", 401);
    if (!process.env.STRIPE_SECRET_KEY) return fail("Wallet top-up is unavailable until Stripe is configured", 503);
    const body = await readJson(request);
    const amount = Number(body.amount);
    const currency = String(body.currency || process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD").toUpperCase();
    if (!Number.isFinite(amount) || amount < 1 || amount > 5000) return fail("Top-up amount must be between 1 and 5000", 400);
    const idempotencyKey = String(body.idempotencyKey || `topup:${session.user.id}:${crypto.randomUUID()}`);
    await connectDB();
    let topup = await WalletTopup.findOne({ idempotencyKey });
    if (topup?.providerReference) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const existing = await stripe.checkout.sessions.retrieve(topup.providerReference);
      return ok({ action: "redirect", url: existing.url, topupId: String(topup._id) });
    }
    if (!topup) topup = await WalletTopup.create({ user: session.user.id, provider: "stripe", amount, currency, status: "pending", idempotencyKey });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email || undefined,
      line_items: [{ price_data: { currency: currency.toLowerCase(), product_data: { name: "Wallet top-up" }, unit_amount: Math.round(amount * 100) }, quantity: 1 }],
      success_url: `${appUrl()}/account/wallet?topup=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/account/wallet?topup=cancelled`,
      metadata: { kind: "wallet_topup", topupId: String(topup._id), userId: String(session.user.id) },
      payment_intent_data: { metadata: { kind: "wallet_topup", topupId: String(topup._id), userId: String(session.user.id) } }
    }, { idempotencyKey });
    topup.providerReference = checkout.id;
    topup.status = "processing";
    await topup.save();
    return ok({ action: "redirect", url: checkout.url, topupId: String(topup._id) });
  } catch (error) { return fromError(error, "Unable to start wallet top-up"); }
}
