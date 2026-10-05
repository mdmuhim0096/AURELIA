const baseUrl = () => process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
async function token() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw Object.assign(new Error("PayPal is not configured"), { status: 503 });
  const response = await fetch(`${baseUrl()}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials", cache: "no-store" });
  if (!response.ok) throw new Error(`PayPal authentication failed: ${response.status}`);
  return (await response.json()).access_token;
}
async function paypalFetch(path, options = {}) {
  const accessToken = await token();
  const response = await fetch(`${baseUrl()}${path}`, { ...options, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...(options.headers || {}) }, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.message || `PayPal request failed: ${response.status}`), { details: data });
  return data;
}
export const paypalProvider = {
  id: "paypal",
  configured: () => Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  async create({ order, payment }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const data = await paypalFetch("/v2/checkout/orders", { method: "POST", headers: { "PayPal-Request-Id": payment.idempotencyKey }, body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ reference_id: order.orderNumber, custom_id: String(order._id), amount: { currency_code: order.currency, value: order.total.toFixed(2) } }], payment_source: { paypal: { experience_context: { return_url: `${appUrl}/checkout/paypal-return?order=${order.orderNumber}`, cancel_url: `${appUrl}/checkout?cancelled=1&order=${order.orderNumber}`, user_action: "PAY_NOW" } } } }) });
    const approve = data.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")?.href;
    return { providerPaymentId: data.id, action: "redirect", url: approve };
  },
  async capture(providerPaymentId) {
    return paypalFetch(`/v2/checkout/orders/${providerPaymentId}/capture`, { method: "POST", body: "{}" });
  },
  async refund({ payment, amount }) {
    const captureId = payment.metadata?.captureId;
    if (!captureId) throw new Error("PayPal capture ID is unavailable");
    const body = amount ? { amount: { value: amount.toFixed(2), currency_code: payment.currency } } : {};
    return paypalFetch(`/v2/payments/captures/${captureId}/refund`, { method: "POST", body: JSON.stringify(body) });
  },
  async verifyWebhook({ headers, event }) {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) throw new Error("PAYPAL_WEBHOOK_ID is required");
    const result = await paypalFetch("/v1/notifications/verify-webhook-signature", { method: "POST", body: JSON.stringify({ auth_algo: headers.get("paypal-auth-algo"), cert_url: headers.get("paypal-cert-url"), transmission_id: headers.get("paypal-transmission-id"), transmission_sig: headers.get("paypal-transmission-sig"), transmission_time: headers.get("paypal-transmission-time"), webhook_id: webhookId, webhook_event: event }) });
    return result.verification_status === "SUCCESS";
  }
};
