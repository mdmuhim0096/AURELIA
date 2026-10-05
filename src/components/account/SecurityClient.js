"use client";
import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import VerifiedRounded from "@mui/icons-material/VerifiedRounded";
import MarkEmailUnreadRounded from "@mui/icons-material/MarkEmailUnreadRounded";
import LockResetRounded from "@mui/icons-material/LockResetRounded";
import { useToast } from "@/components/providers/ToastProvider";
import { MuiInput } from "../ui/MuiFormControls";

export default function SecurityClient() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState({
    currentPassword: null,
    newPassword: null,
    confirm: null
  });

  useEffect(() => { let cancelled = false; fetch("/api/account/profile").then((r) => r.json()).then((d) => { if (!cancelled) setProfile(d.user || null); }).catch(() => { }); return () => { cancelled = true; }; }, []);

  async function submit() {
    setBusy(true);
    if (data.confirm !== data.newPassword) {
      toast("New passwords do not match", "error");
      setBusy(false);
      return;
    };

    delete data.confirm;

    const r = await fetch("/api/account/security/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data }) });
    const d = await r.json();

    data["confirm"] = null;
    for (const item in data) {
      data[item] = null;
      setBusy(false);
    }
    toast(r.ok ? "Password changed" : d.error || "Unable to change password", r.ok ? "success" : "error");
    if (r.ok) setBusy(false);
  }

  async function resend() { setBusy(true); const r = await fetch("/api/account/security/resend-verification", { method: "POST" }); const d = await r.json(); toast(r.ok ? (d.verified ? "Email is already verified" : d.sent ? "Verification email sent" : "Verification token refreshed; configure an email provider to deliver it") : d.error || "Unable to resend", r.ok ? "success" : "error"); setBusy(false); }

  return <Stack spacing={2.5} sx={{ maxWidth: 700 }}><Paper sx={{ p: 3, borderRadius: 3.5 }}><Stack direction="row" sx={{ gap: 2, justifyContent: "space-between", alignItems: "center" }}><Stack><Typography variant="h5">Email verification</Typography><Typography color="text.secondary" sx={{ mt: .6 }}>{profile?.emailVerifiedAt ? "Your email address is verified." : "Verify your email to keep recovery and transactional messaging dependable."}</Typography></Stack><Chip icon={profile?.emailVerifiedAt ? <VerifiedRounded /> : <MarkEmailUnreadRounded />} label={profile?.emailVerifiedAt ? "Verified" : "Not verified"} color={profile?.emailVerifiedAt ? "success" : "warning"} /></Stack>{profile && !profile.emailVerifiedAt && <Button sx={{ mt: 2 }} variant="outlined" disabled={busy} onClick={resend}>Resend verification email</Button>}</Paper><Paper component="div" sx={{ p: 3, borderRadius: 3.5 }}><Typography variant="h5" sx={{ mb: 2 }}>Change password</Typography><Stack spacing={2}>
    <Typography>Current Password</Typography>
    <MuiInput type="password" onChange={e => setData(prev => ({ ...prev, currentPassword: e.target.value }))} required />
    <Typography>New Password</Typography>
    <MuiInput type="password" onChange={e => setData(prev => ({ ...prev, newPassword: e.target.value }))} required />

    <Typography>Confirm Password</Typography>
    <MuiInput type="password" onChange={e => setData(prev => ({ ...prev, confirm: e.target.value }))} required />
    <Button variant="contained" disabled={busy} onClick={submit} startIcon={<LockResetRounded />}>{busy ? "Saving…" : "Update password"}</Button></Stack></Paper></Stack>;
}
