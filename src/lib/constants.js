export const ORDER_STATUSES = [
  "pending", "payment_processing", "paid", "processing", "packed", "shipped",
  "out_for_delivery", "delivered", "cancelled", "refund_requested", "refunded", "failed"
];

export const PAYMENT_STATUSES = ["pending", "processing", "paid", "failed", "cancelled", "refunded", "partially_refunded"];
export const TRANSACTION_STATUSES = ["pending", "succeeded", "failed", "cancelled", "reversed"];
export const RETURN_STATUSES = ["requested", "approved", "rejected", "received", "completed", "cancelled"];
export const REFUND_STATUSES = ["requested", "processing", "succeeded", "failed", "cancelled"];
export const SUPPORT_STATUSES = ["open", "pending", "resolved", "closed"];
export const CURRENCIES = ["USD", "EUR", "GBP", "BDT"];

export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Aurelia Commerce";
