"use client";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import AssignmentReturnOutlined from "@mui/icons-material/AssignmentReturnOutlined";
import CurrencyExchangeRounded from "@mui/icons-material/CurrencyExchangeRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import { useToast } from "@/components/providers/ToastProvider";

export default function OrderActions({ order }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function run(url, body, success) {
    setBusy(true);
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      toast(r.ok ? success : d.error || "Request failed", r.ok ? "success" : "error");
      if (r.ok) location.reload();
    } finally { setBusy(false); }
  }
  async function cancel() { if (!confirm("Cancel this order?")) return; await run(`/api/orders/${order._id}/cancel`, { reason: "Customer requested cancellation" }, "Order cancelled"); }
  async function requestReturn() { const reason = prompt("Reason for return?"); if (!reason) return; await run(`/api/orders/${order._id}/return`, { items: order.items.map((i) => ({ product: i.product, variant: i.variant, quantity: i.quantity, reason })) }, "Return request submitted"); }
  async function requestRefund() { const reason = prompt("Reason for refund request?"); if (!reason) return; const destination = confirm("Credit the refund to your wallet when approved? Click Cancel for the original payment method.") ? "wallet" : "original"; await run(`/api/orders/${order._id}/refund`, { reason, destination }, "Refund request submitted"); }
  return <Stack direction="row" gap={1} flexWrap="wrap">{["pending","payment_processing","paid","processing"].includes(order.status) && <Button variant="outlined" color="error" disabled={busy} onClick={cancel} startIcon={busy ? <CircularProgress size={15} /> : <CancelOutlined />}>Cancel order</Button>}{order.status === "delivered" && <Button variant="outlined" disabled={busy} onClick={requestReturn} startIcon={<AssignmentReturnOutlined />}>Request return</Button>}{["paid","processing","packed","shipped","out_for_delivery","delivered"].includes(order.status) && <Button variant="outlined" disabled={busy} onClick={requestRefund} startIcon={<CurrencyExchangeRounded />}>Request refund</Button>}<Button component="a" href={`/api/orders/${order._id}/invoice`} target="_blank" rel="noreferrer" variant="text" startIcon={<ReceiptLongRounded />}>Download invoice</Button></Stack>;
}
