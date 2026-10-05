import crypto from "node:crypto";
function configured() { return Boolean(process.env.ALIPAY_APP_ID && process.env.ALIPAY_PRIVATE_KEY && process.env.ALIPAY_GATEWAY_URL); }
function sign(params) {
  const content = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "").sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  const key = process.env.ALIPAY_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const signature = crypto.sign("RSA-SHA256", Buffer.from(content, "utf8"), key).toString("base64");
  return signature;
}
export const alipayProvider = {
  id: "alipay",
  configured,
  async create({ order }) {
    if (!configured()) throw Object.assign(new Error("Alipay merchant checkout is not configured"), { status: 503 });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const params = {
      app_id: process.env.ALIPAY_APP_ID,
      method: process.env.ALIPAY_METHOD || "alipay.trade.page.pay",
      charset: "utf-8",
      sign_type: "RSA2",
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      version: "1.0",
      notify_url: `${appUrl}/api/payments/webhooks/alipay`,
      return_url: `${appUrl}/checkout/success?order=${order.orderNumber}`,
      biz_content: JSON.stringify({ out_trade_no: order.orderNumber, total_amount: order.total.toFixed(2), subject: `Order ${order.orderNumber}`, product_code: "FAST_INSTANT_TRADE_PAY" })
    };
    params.sign = sign(params);
    const query = new URLSearchParams(params).toString();
    return { providerPaymentId: order.orderNumber, action: "redirect", url: `${process.env.ALIPAY_GATEWAY_URL}?${query}` };
  },
  verifyNotification(payload) {
    const publicKey = process.env.ALIPAY_PUBLIC_KEY?.replace(/\\n/g, "\n");
    if (!publicKey || !payload.sign) return false;
    const { sign: signature, sign_type: _ignored, ...rest } = payload;
    const content = Object.entries(rest).filter(([, value]) => value !== undefined && value !== null && value !== "").sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
    return crypto.verify("RSA-SHA256", Buffer.from(content, "utf8"), publicKey, Buffer.from(signature, "base64"));
  }
};
