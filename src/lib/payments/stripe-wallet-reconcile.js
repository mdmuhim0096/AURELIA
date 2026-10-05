import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import WalletTopup from "@/models/WalletTopup";
import { walletEntry } from "@/lib/commerce/wallet";
import { notifyUser } from "@/lib/notifications";
import { emailTemplates } from "@/lib/email";

function sameMoney(expectedAmount, stripeAmountTotal) {
  const expectedCents = Math.round(Number(expectedAmount || 0) * 100);
  return Number(stripeAmountTotal) === expectedCents;
}

export async function finalizeStripeWalletTopupSession(
  session,
  { expectedUserId = null } = {}
) {
  await connectDB();

  if (!session?.id || !String(session.id).startsWith("cs_")) {
    throw Object.assign(new Error("Invalid Stripe Checkout session"), { status: 400 });
  }

  if (session.payment_status !== "paid") {
    return { applied: false, reason: "payment_not_paid" };
  }

  if (session.metadata?.kind !== "wallet_topup" || !session.metadata?.topupId) {
    throw Object.assign(new Error("Stripe session is not a wallet top-up"), { status: 400 });
  }

  const topup = await WalletTopup.findById(session.metadata.topupId);
  if (!topup) {
    throw Object.assign(new Error("Wallet top-up record not found"), { status: 404 });
  }

  if (
    expectedUserId &&
    String(topup.user) !== String(expectedUserId)
  ) {
    throw Object.assign(new Error("Wallet top-up does not belong to this account"), { status: 403 });
  }

  if (
    session.metadata?.userId &&
    String(session.metadata.userId) !== String(topup.user)
  ) {
    throw Object.assign(new Error("Stripe wallet user verification failed"), { status: 409 });
  }

  const stripeCurrency = String(session.currency || "").toUpperCase();
  const topupCurrency = String(topup.currency || "").toUpperCase();

  if (stripeCurrency && topupCurrency && stripeCurrency !== topupCurrency) {
    throw Object.assign(new Error("Stripe wallet currency verification failed"), { status: 409 });
  }

  if (!sameMoney(topup.amount, session.amount_total)) {
    throw Object.assign(new Error("Stripe wallet amount verification failed"), { status: 409 });
  }

  if (topup.status === "succeeded") {
    return { applied: false, alreadySucceeded: true, topup };
  }

  // Claim this top-up so webhook + success-page reconciliation cannot credit it together.
  const claimedTopup = await WalletTopup.findOneAndUpdate(
    {
      _id: topup._id,
      status: { $ne: "succeeded" },
      "metadata.crediting": { $ne: true },
    },
    {
      $set: {
        "metadata.crediting": true,
        "metadata.checkoutSessionId": session.id,
        "metadata.paymentIntentId": String(session.payment_intent || ""),
        "metadata.lastReconcileAt": new Date(),
      },
      $unset: {
        "metadata.lastReconcileError": "",
      },
    },
    { new: true }
  );

  if (!claimedTopup) {
    const latest = await WalletTopup.findById(topup._id);
    return {
      applied: false,
      alreadySucceeded: latest?.status === "succeeded",
      processing: latest?.status !== "succeeded",
      topup: latest,
    };
  }

  try {
    await walletEntry({
      userId: claimedTopup.user,
      direction: "credit",
      source: "topup",
      amount: claimedTopup.amount,
      idempotencyKey: `stripe-topup:${claimedTopup._id}`,
      note: `Stripe wallet top-up ${session.id}`,
    });

    claimedTopup.status = "succeeded";
    claimedTopup.providerReference = session.id;
    claimedTopup.metadata = {
      ...(claimedTopup.metadata || {}),
      crediting: false,
      creditedAt: new Date(),
      checkoutSessionId: session.id,
      paymentIntentId: String(session.payment_intent || ""),
    };
    await claimedTopup.save();

    await Transaction.updateOne(
      { reference: `TOPUP-${claimedTopup._id}` },
      {
        $setOnInsert: {
          reference: `TOPUP-${claimedTopup._id}`,
          type: "wallet_credit",
          user: claimedTopup.user,
          provider: "stripe",
          amount: claimedTopup.amount,
          currency: claimedTopup.currency,
          status: "succeeded",
          providerReference: String(session.payment_intent || session.id),
          metadata: { topupId: String(claimedTopup._id) },
        },
      },
      { upsert: true }
    );

    try {
      await notifyUser(claimedTopup.user, {
        type: "wallet_transaction",
        title: "Wallet top-up completed",
        message: `${claimedTopup.currency} ${Number(claimedTopup.amount).toFixed(2)} was added to your wallet.`,
        href: "/account/wallet",
        email: emailTemplates.wallet(
          "Wallet top-up completed",
          `${claimedTopup.currency} ${Number(claimedTopup.amount).toFixed(2)} was added to your wallet.`
        ),
      });
    } catch (notificationError) {
      console.error("[stripe:wallet-notification:error]", {
        topupId: String(claimedTopup._id),
        message: notificationError?.message,
      });
    }

    console.log("[stripe:wallet:credited]", {
      topupId: String(claimedTopup._id),
      userId: String(claimedTopup.user),
      sessionId: session.id,
      amount: claimedTopup.amount,
      currency: claimedTopup.currency,
    });

    return { applied: true, topup: claimedTopup };
  } catch (error) {
    await WalletTopup.updateOne(
      { _id: claimedTopup._id, status: { $ne: "succeeded" } },
      {
        $set: {
          "metadata.crediting": false,
          "metadata.lastReconcileError": error?.message || "Wallet credit failed",
          "metadata.lastReconcileAt": new Date(),
        },
      }
    );

    console.error("[stripe:wallet:reconcile:error]", {
      topupId: String(claimedTopup._id),
      sessionId: session.id,
      message: error?.message,
      stack: error?.stack,
    });

    throw error;
  }
}
