"use client";
import { useMemo, useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AccountBalanceWalletRounded from "@mui/icons-material/AccountBalanceWalletRounded";
import { useToast } from "@/components/providers/ToastProvider";
import { MuiInput } from "../ui/MuiFormControls";

export default function WalletTopupClient({ enabled, currency = "USD" }) {
  const { toast } = useToast(); const [amount, setAmount] = useState(25); const [busy, setBusy] = useState(false); const key = useMemo(() => `wallet-topup:${Date.now()}:${Math.random().toString(36).slice(2)}`, []);
  async function submit(e) { e.preventDefault(); if (!enabled) return; setBusy(true); const r = await fetch("/api/account/wallet/topup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: Number(amount), currency, idempotencyKey: key }) }); const d = await r.json(); if (r.ok && d.url) location.href = d.url; else { toast(d.error || "Unable to start wallet top-up", "error"); setBusy(false); } }
  return <Paper sx={{ p: 3, mb: 2.5, borderRadius: 3.5 }}><Typography variant="h5">Add money</Typography><Typography color="text.secondary" sx={{ mt: .5, mb: 2.5 }}>Secure Stripe Checkout; balance is credited only after a verified webhook.</Typography>{enabled ? <Stack component="form" onSubmit={submit} direction={{ xs: "column", sm: "row", alignItems: { sm: "center" } }} spacing={1.5} >
    <MuiInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required sx={{ width: { sm: 220 } }} />
    <Button type="submit" variant="contained" disabled={busy} startIcon={<AccountBalanceWalletRounded />}>{busy ? "Opening checkout…" : "Add money"}</Button></Stack> : <Typography color="text.secondary">Configure Stripe to enable provider-backed wallet top-ups.</Typography>}</Paper>;
}
