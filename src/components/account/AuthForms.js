"use client";

import { useEffect, useState } from "react";
import Link from "@/components/navigation/ClientLink";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import LockOutlined from "@mui/icons-material/LockOutlined";
import PersonAddAltRounded from "@mui/icons-material/PersonAddAltRounded";
import MarkEmailReadRounded from "@mui/icons-material/MarkEmailReadRounded";
import { useToast } from "@/components/providers/ToastProvider";
import { MuiInput } from "../ui/MuiFormControls";


function Shell({ eyebrow, title, description, children, center = false }) {
  return <Paper sx={{ maxWidth: 560, mx: "auto", p: { xs: 3, sm: 4 }, borderRadius: 4, textAlign: center ? "center" : "left" }}><Chip label={eyebrow} color="primary" variant="outlined" size="small" /><Typography variant="h3" sx={{ mt: 1.5 }}>{title}</Typography>{description && <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>{description}</Typography>}{children}</Paper>;
}

export function LoginForm() {
  const params = useSearchParams();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", { email: fd.get("email"), password: fd.get("password"), redirect: false });
    if (result?.error) { toast("Email or password is incorrect", "error"); setBusy(false); return; }
    await fetch("/api/cart/merge", { method: "POST" }).catch(() => {});
    window.location.href = params.get("callbackUrl") || "/account";
  }
  return <Shell eyebrow="Welcome back" title="Sign in" description="Access orders, wallet, wishlist, reviews and support."><Stack component="form" spacing={2} onSubmit={submit} sx={{ mt: 2 }}><MuiInput name="email" type="email" label="Email" autoComplete="email" required fullWidth /><MuiInput name="password" type="password" label="Password" autoComplete="current-password" required fullWidth /><Button type="submit" variant="contained" size="large" disabled={busy} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <LockOutlined />}>{busy ? "Signing in…" : "Sign in"}</Button></Stack><Stack direction="row" sx={{ mt: 2, justifyContent: "space-between" }}><Button component={Link} href="/forgot-password" size="small">Forgot password?</Button><Button component={Link} href="/register" size="small">Create account</Button></Stack></Shell>;
}

export function RegisterForm() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) { toast("Passwords do not match", "error"); setBusy(false); return; }
    const r = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password"), marketingOptIn: fd.get("marketing") === "on" }) });
    const d = await r.json();
    if (!r.ok) { toast(d.error || "Unable to register", "error"); setBusy(false); return; }
    toast("Account created. Check your email for verification.", "success");
    const result = await signIn("credentials", { email: fd.get("email"), password: fd.get("password"), redirect: false });
    window.location.href = result?.error ? "/login" : "/account";
  }
  return <Shell eyebrow="Join Aurelia" title="Create account" description="Build your profile, save favourites and manage every order in one place."><Stack component="form" spacing={2} onSubmit={submit} sx={{ mt: 2 }}><MuiInput name="name" label="Name" autoComplete="name" required /><MuiInput name="email" type="email" label="Email" autoComplete="email" required /><MuiInput name="password" type="password" label="Password" autoComplete="new-password" required inputProps={{ minLength: 8 }} /><MuiInput name="confirm" type="password" label="Confirm password" autoComplete="new-password" required inputProps={{ minLength: 8 }} /><FormControlLabel control={<Checkbox name="marketing" />} label="Send me product news and offers" /><Button type="submit" variant="contained" size="large" disabled={busy} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <PersonAddAltRounded />}>{busy ? "Creating…" : "Create account"}</Button></Stack><Stack direction="row" justifyContent="center" alignItems="center" gap={1} sx={{ mt: 2 }}><Typography variant="body2" color="text.secondary">Already a customer?</Typography><Button component={Link} href="/login" size="small">Sign in</Button></Stack></Shell>;
}

export function ForgotForm() {
  const { toast } = useToast(); const [done, setDone] = useState(false);
  async function submit(e) { e.preventDefault(); const email = new FormData(e.currentTarget).get("email"); const r = await fetch("/api/auth/password/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); const d = await r.json(); setDone(r.ok); toast(d.message || d.error, r.ok ? "success" : "error"); }
  return <Shell eyebrow="Account recovery" title="Reset password" description="We’ll send a short-lived reset link if the address belongs to an account.">{!done ? <Stack component="form" spacing={2} onSubmit={submit} sx={{ mt: 2 }}><MuiInput name="email" type="email" label="Email" required /><Button type="submit" variant="contained">Send reset link</Button></Stack> : <Box sx={{ mt: 3 }}><MarkEmailReadRounded color="success" sx={{ fontSize: 48 }} /><Typography sx={{ mt: 1 }}>Check your inbox and follow the reset link.</Typography></Box>}</Shell>;
}

export function ResetForm() {
  const params = useSearchParams(); const { toast } = useToast(); const [done, setDone] = useState(false);
  async function submit(e) { e.preventDefault(); const password = new FormData(e.currentTarget).get("password"); const r = await fetch("/api/auth/password/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token"), password }) }); const d = await r.json(); if (r.ok) { setDone(true); toast("Password changed", "success"); } else toast(d.error || "Unable to reset password", "error"); }
  return <Shell eyebrow="Security" title="New password">{done ? <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}><Typography>Your password has been reset.</Typography><Button component={Link} href="/login" variant="contained">Sign in</Button></Stack> : <Stack component="form" spacing={2} onSubmit={submit} sx={{ mt: 2 }}><MuiInput name="password" type="password" label="New password" required inputProps={{ minLength: 8 }} /><Button type="submit" variant="contained">Save password</Button></Stack>}</Shell>;
}

export function VerifyEmail() {
  const params = useSearchParams(); const [status, setStatus] = useState("working");
  useEffect(() => { const token = params.get("token"); if (!token) { setStatus("invalid"); return; } let cancelled = false; fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then((r) => { if (!cancelled) setStatus(r.ok ? "done" : "invalid"); }).catch(() => { if (!cancelled) setStatus("invalid"); }); return () => { cancelled = true; }; }, [params]);
  const title = status === "working" ? "Verifying…" : status === "done" ? "Email verified" : "Link expired";
  const body = status === "done" ? "Your email address is now confirmed." : status === "invalid" ? "Request a fresh verification link from account settings." : "Checking your verification token securely.";
  return <Shell eyebrow="Email verification" title={title} description={body} center>{status === "working" ? <CircularProgress /> : <Button component={Link} href={status === "done" ? "/account" : "/login"} variant="contained">{status === "done" ? "Go to account" : "Sign in"}</Button>}</Shell>;
}
