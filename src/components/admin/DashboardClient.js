"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";
import AttachMoneyRounded from "@mui/icons-material/AttachMoneyRounded";
import ShoppingCartCheckoutRounded from "@mui/icons-material/ShoppingCartCheckoutRounded";
import PeopleAltRounded from "@mui/icons-material/PeopleAltRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded";
import ReplayRounded from "@mui/icons-material/ReplayRounded";
import AccountBalanceWalletRounded from "@mui/icons-material/AccountBalanceWalletRounded";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

function money(v) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v || 0); }

function MetricCard({ title, value, icon: Icon, color, note }) {
  return <Card sx={{ height: "100%", borderRadius: 1 }}><CardContent><Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}><Box><Typography variant="body2" color="text.secondary" fontWeight={700}>{title}</Typography><Typography variant="h4" sx={{ mt: .7 }}>{value}</Typography>{note && <Typography variant="caption" color="text.secondary">{note}</Typography>}</Box><Avatar sx={{ bgcolor: `${color}.main`, color: `${color}.contrastText`, width: 46, height: 46 }}><Icon /></Avatar></Stack></CardContent></Card>;
}

function DataTable({ title, columns, rows }) {
  return <Paper sx={{ borderRadius: 1, overflow: "hidden" }}><Box sx={{ px: 2.5, py: 2 }}><Typography fontWeight={850}>{title}</Typography></Box><Divider /><TableContainer><Table size="small"><TableHead><TableRow>{columns.map((c) => <TableCell key={c.key}>{c.label}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map((row, i) => <TableRow key={row._id || i} hover>{columns.map((c) => <TableCell key={c.key}>{c.render ? c.render(row) : row[c.key]}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer></Paper>;
}

export default function DashboardClient() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/admin/dashboard", { cache: "no-store" });
        const d = await r.json();
        if (!cancelled) setData(d.ok ? d : { error: d.error || "Unable to load analytics" });
      } catch { if (!cancelled) setData({ error: "Unable to load analytics" }); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (!data) return <Loading label="Loading analytics" />;
  if (data.error) return <EmptyState title="Analytics unavailable" description={data.error} actionHref={null} />;

  const trend = data.salesTrend || [];
  const max = Math.max(1, ...trend.map((x) => Number(x.revenue || 0)));
  const refundCount = data.refunds?.reduce((n, x) => n + x.count, 0) || 0;
  const walletCount = data.walletStats?.reduce((n, x) => n + x.count, 0) || 0;

  return <Stack spacing={3}>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard title="Revenue" value={money(data.metrics.revenue)} icon={AttachMoneyRounded} color="primary" note="Total captured revenue" /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard title="Orders" value={data.metrics.orders} icon={ShoppingCartCheckoutRounded} color="warning" note="Orders in current dataset" /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard title="Customers" value={data.metrics.customers} icon={PeopleAltRounded} color="success" note="Registered customer accounts" /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard title="Average order" value={money(data.metrics.averageOrderValue)} icon={TrendingUpRounded} color="info" note="Average order value" /></Grid>
    </Grid>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper sx={{ p: 2.5, borderRadius: 1, height: "100%" }}>
          <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}><Box><Typography fontWeight={850}>30-day sales overview</Typography><Typography variant="caption" color="text.secondary">Revenue trend across the last 30 reporting points</Typography></Box><Typography variant="h5" color="primary.main">{money(data.metrics.revenue)}</Typography></Stack>
          <Box sx={{ height: 260, display: "flex", alignItems: "flex-end", gap: { xs: .5, sm: 1 }, borderBottom: 1, borderColor: "divider", pb: 1 }}>
            {trend.map((x) => <Box key={x._id} title={`${x._id} · ${money(x.revenue)}`} sx={{ flex: 1, minWidth: 4, height: `${Math.max(4, (Number(x.revenue || 0) / max) * 100)}%`, borderRadius: 1, background: "linear-gradient(180deg,#4F7CFF,#79A0FF)", transition: ".2s", "&:hover": { opacity: .78, transform: "translateY(-3px)" } }} />)}
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ p: 2.5, borderRadius: 1, height: "100%", background: (t) => t.palette.mode === "dark" ? "linear-gradient(145deg,#17223B,#0F172A)" : "linear-gradient(145deg,#4F7CFF,#6997FF)", color: "#fff" }}>
          <Typography variant="overline" sx={{ opacity: .75 }}>Commercial health</Typography><Typography variant="h4" sx={{ mt: .5, mb: 3 }}>Performance</Typography>
          <Stack spacing={2.2}>
            <Box><Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography variant="body2">Conversion proxy</Typography><Typography fontWeight={800}>{Number(data.metrics.conversionRate || 0).toFixed(1)}%</Typography></Stack><LinearProgress variant="determinate" value={Math.min(100, Number(data.metrics.conversionRate || 0))} sx={{ mt: 1, height: 8, borderRadius: 1, bgcolor: "rgba(255,255,255,.2)", "& .MuiLinearProgress-bar": { bgcolor: "#fff" } }} /></Box>
            <Stack direction="row" gap={1}><Avatar sx={{ bgcolor: "rgba(255,255,255,.18)" }}><Inventory2Rounded /></Avatar><Box><Typography variant="caption" sx={{ opacity: .75 }}>Products</Typography><Typography variant="h6">{data.metrics.products}</Typography></Box></Stack>
            <Stack direction="row" gap={1}><Avatar sx={{ bgcolor: "rgba(255,255,255,.18)" }}><ReplayRounded /></Avatar><Box><Typography variant="caption" sx={{ opacity: .75 }}>Refund states</Typography><Typography variant="h6">{refundCount}</Typography></Box></Stack>
            <Stack direction="row" gap={1}><Avatar sx={{ bgcolor: "rgba(255,255,255,.18)" }}><AccountBalanceWalletRounded /></Avatar><Box><Typography variant="caption" sx={{ opacity: .75 }}>Wallet entries</Typography><Typography variant="h6">{walletCount}</Typography></Box></Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>

    <DataTable title="Top products" columns={[{ key: "name", label: "Product" }, { key: "units", label: "Units" }, { key: "revenue", label: "Revenue", render: (r) => money(r.revenue) }]} rows={data.topProducts || []} />
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 6 }}><DataTable title="Sales by category" columns={[{ key: "name", label: "Category" }, { key: "units", label: "Units" }, { key: "revenue", label: "Revenue", render: (r) => money(r.revenue) }]} rows={data.categorySales || []} /></Grid>
      <Grid size={{ xs: 12, lg: 6 }}><DataTable title="Sales by country / region" columns={[{ key: "_id", label: "Country", render: (r) => r._id || "Unknown" }, { key: "orders", label: "Orders" }, { key: "revenue", label: "Revenue", render: (r) => money(r.revenue) }]} rows={data.countrySales || []} /></Grid>
    </Grid>
  </Stack>;
}
