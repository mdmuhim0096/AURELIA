"use client";
import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import SaveRounded from "@mui/icons-material/SaveRounded";
import { useToast } from "@/components/providers/ToastProvider";
import Loading from "@/components/ui/Loading";
import { MuiInput } from "../ui/MuiFormControls";

export default function SettingsClient() {
  const { toast } = useToast(); const [form, setForm] = useState(null);
  useEffect(() => { let cancelled = false; fetch("/api/account/profile").then((r) => r.json()).then((d) => { if (!cancelled) setForm(d.user); }); return () => { cancelled = true; }; }, []);
  if (!form) return <Loading />;
  async function save(e) { e.preventDefault(); const r = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, phone: form.phone, avatar: form.avatar, marketingOptIn: form.marketingOptIn, preferences: form.preferences }) }); const d = await r.json(); toast(r.ok ? "Settings saved" : d.error || "Unable to save", r.ok ? "success" : "error"); }
  const notifications = form.preferences?.notifications || { email: true, inApp: true };

  return <Paper component="form" onSubmit={save} sx={{ maxWidth: 820, p: 3, borderRadius: 3.5 }}>
    <Typography variant="h5">Profile & preferences</Typography>
    <Typography color="text.secondary" sx={{ mt: .5, mb: 3 }}>Manage your identity, localization and communication preferences.</Typography>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiInput  type="text" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiInput  type="email" value={form.email || ""} disabled />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiInput type="number" value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiInput type="text" value={form.avatar || ""} onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField select fullWidth label="Currency" value={form.preferences?.currency || "USD"} onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, currency: e.target.value } }))}>
          {["USD", "EUR", "GBP", "BDT"].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField select fullWidth label="Language" value={form.preferences?.language || "en"} onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, language: e.target.value } }))}>
          <MenuItem value="en">English</MenuItem>
        </TextField>
      </Grid>
    </Grid>
    <Stack sx={{ mt: 3 }}>
      <Typography fontWeight={800}>Notifications</Typography>
      <FormControlLabel control={<Switch checked={notifications.email !== false} onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, notifications: { ...notifications, email: e.target.checked } } }))} />} label="Transactional email notifications" />
      <FormControlLabel control={<Switch checked={notifications.inApp !== false} onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, notifications: { ...notifications, inApp: e.target.checked } } }))} />} label="In-app notifications" />
      <FormControlLabel control={<Switch checked={form.marketingOptIn || false} onChange={(e) => setForm((f) => ({ ...f, marketingOptIn: e.target.checked }))} />} label="Marketing emails" />

    </Stack>
    <Button type="submit" variant="contained" startIcon={<SaveRounded />} sx={{ mt: 2 }}>Save settings</Button>
  </Paper>;
}
