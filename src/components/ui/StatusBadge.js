import Chip from "@mui/material/Chip";
export default function StatusBadge({ value }) {
  const raw = String(value || "unknown");
  const text = raw.replaceAll("_", " ");
  const success = ["paid", "delivered", "active", "approved", "succeeded", "published", "resolved"].includes(raw);
  const error = ["failed", "cancelled", "rejected", "disabled", "suspended"].includes(raw);
  const warning = ["pending", "processing", "payment_processing", "draft", "open"].includes(raw);
  return <Chip size="small" label={text} color={success ? "success" : error ? "error" : warning ? "warning" : "default"} variant={success || error || warning ? "filled" : "outlined"} />;
}
