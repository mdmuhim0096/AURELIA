import Link from "next/link";
import { reconcileStripeCheckoutSession } from "@/lib/payments/stripe-reconcile";

export const metadata = { title: "Order confirmation" };
export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }) {
  const q = await searchParams;
  const sessionId = String(q?.session_id || "");
  const orderNumber = String(q?.order || "");

  let verified = false;
  let verificationMessage = "Your payment is being verified server-side.";

  if (sessionId.startsWith("cs_")) {
    try {
      const result = await reconcileStripeCheckoutSession(sessionId);
      verified = Boolean(result?.paid);
      verificationMessage = verified
        ? "Your payment has been verified successfully and the order database was updated."
        : "Stripe has not marked this payment as paid yet. The webhook will continue checking it.";
    } catch (error) {
      console.error("[checkout:success:stripe-reconcile:error]", {
        sessionId,
        orderNumber,
        message: error?.message,
        stack: error?.stack,
      });
      verificationMessage =
        "Your payment was returned from Stripe, but server verification is still pending. The webhook will retry automatically.";
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="empty-orb" style={{ margin: "auto" }} />
        <span className="eyebrow" style={{ display: "block", marginTop: 22 }}>
          Order confirmation
        </span>
        <h1>{verified ? "Payment confirmed." : "Thank you."}</h1>
        <p className="muted">
          {verificationMessage} Order <strong>{orderNumber}</strong>.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          <Link className="button dark" href="/account/orders">View orders</Link>
          <Link className="button" href="/shop">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
