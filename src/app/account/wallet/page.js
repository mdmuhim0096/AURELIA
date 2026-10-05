import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Wallet from "@/models/Wallet";
import WalletTransaction from "@/models/WalletTransaction";
import StatusBadge from "@/components/ui/StatusBadge";
import WalletTopupClient from "@/components/account/WalletTopupClient";
import { stripeProvider } from "@/lib/payments/stripe";
import { finalizeStripeWalletTopupSession } from "@/lib/payments/stripe-wallet-reconcile";

export const metadata = { title: "Wallet" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const session = await auth();
  await connectDB();

  const params = await searchParams;
  const topupState = String(params?.topup || "");
  const checkoutSessionId = String(params?.session_id || "");
  let topupMessage = "";
  let topupMessageType = "";

  if (
    topupState === "success" &&
    checkoutSessionId &&
    process.env.STRIPE_SECRET_KEY
  ) {
    try {
      const stripeSession = await stripeProvider.retrieveCheckoutSession(checkoutSessionId);
      const result = await finalizeStripeWalletTopupSession(stripeSession, {
        expectedUserId: session.user.id,
      });

      if (result.applied || result.alreadySucceeded) {
        topupMessage = "Wallet top-up confirmed. Your balance has been updated.";
        topupMessageType = "success";
      } else if (result.processing) {
        topupMessage = "Your payment is confirmed and the wallet update is being finalized.";
        topupMessageType = "info";
      } else {
        topupMessage = "Stripe has not marked this payment as paid yet.";
        topupMessageType = "info";
      }
    } catch (error) {
      console.error("[wallet:return-reconcile:error]", {
        sessionId: checkoutSessionId,
        userId: session?.user?.id,
        message: error?.message,
        stack: error?.stack,
      });
      topupMessage = "Payment returned successfully, but the wallet could not be reconciled yet. Please refresh shortly.";
      topupMessageType = "error";
    }
  } else if (topupState === "cancelled") {
    topupMessage = "Wallet top-up was cancelled.";
    topupMessageType = "info";
  }

  let wallet = await Wallet.findOne({ user: session.user.id }).lean();
  if (!wallet) {
    wallet = {
      currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD",
      availableBalance: 0,
      promotionalBalance: 0,
    };
  }

  const tx = await WalletTransaction.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return <>
    <div className="dashboard-head"><div><span className="eyebrow">Personal ledger</span><h1>Wallet.</h1></div></div>

    {topupMessage ? <div className={`notice ${topupMessageType}`}>{topupMessage}</div> : null}

    <div className="stat-grid">
      <div className="stat-card"><span>Available</span><strong>{wallet.currency} {Number(wallet.availableBalance || 0).toFixed(2)}</strong></div>
      <div className="stat-card"><span>Promotional</span><strong>{wallet.currency} {Number(wallet.promotionalBalance || 0).toFixed(2)}</strong></div>
      <div className="stat-card"><span>Total balance</span><strong>{wallet.currency} {Number((wallet.availableBalance || 0) + (wallet.promotionalBalance || 0)).toFixed(2)}</strong></div>
      <div className="stat-card"><span>Ledger entries</span><strong>{tx.length}</strong></div>
    </div>

    <WalletTopupClient enabled={Boolean(process.env.STRIPE_SECRET_KEY)} currency={wallet.currency} />

    <div className="data-card">
      <div className="data-card-head"><strong>Transaction history</strong></div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Date</th><th>Source</th><th>Direction</th><th>Amount</th><th>Status</th><th>Balance after</th></tr></thead>
          <tbody>
            {tx.map((t) => <tr key={String(t._id)}>
              <td>{t.transactionId}</td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
              <td>{t.source}</td>
              <td>{t.direction}</td>
              <td>{wallet.currency} {Number(t.amount || 0).toFixed(2)}</td>
              <td><StatusBadge value={t.status} /></td>
              <td>{wallet.currency} {Number(t.balanceAfter || 0).toFixed(2)}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  </>;
}
