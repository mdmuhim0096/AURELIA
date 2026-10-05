"use client";
import { usePathname } from "next/navigation";
import Link from "@/components/navigation/ClientLink";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import RateReviewRounded from "@mui/icons-material/RateReviewRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import AccountBalanceWalletRounded from "@mui/icons-material/AccountBalanceWalletRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import LocalOfferRounded from "@mui/icons-material/LocalOfferRounded";
import NotificationsRounded from "@mui/icons-material/NotificationsRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import CreditCardRounded from "@mui/icons-material/CreditCardRounded";
import SecurityRounded from "@mui/icons-material/SecurityRounded";
import ManageAccountsRounded from "@mui/icons-material/ManageAccountsRounded";

const links = [
  ["/account", "Overview", DashboardRounded], ["/account/orders", "Orders & tracking", ReceiptLongRounded], ["/wishlist", "Wishlist", FavoriteRounded], ["/account/reviews", "Reviews", RateReviewRounded], ["/account/history", "Product history", HistoryRounded], ["/account/wallet", "Wallet & transactions", AccountBalanceWalletRounded], ["/account/addresses", "Addresses", LocationOnRounded], ["/account/coupons", "Coupons", LocalOfferRounded], ["/account/notifications", "Notifications", NotificationsRounded], ["/support", "Support & live chat", SupportAgentRounded], ["/account/payment-methods", "Payment methods", CreditCardRounded], ["/account/security", "Password & security", SecurityRounded], ["/account/settings", "Account settings", ManageAccountsRounded],
];

export default function AccountShell({ user, children }) {
  const pathname = usePathname();
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "270px minmax(0,1fr)" }, gap: 3, maxWidth: 1500, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
    <Paper sx={{ p: 2, borderRadius: 3.5, alignSelf: "start", position: { lg: "sticky" }, top: { lg: 110 }, overflowX: { xs: "auto", lg: "visible" } }}>
      <Stack direction="row" sx={{ px: 1, pb: 2, gap: 1.3, alignItems: "center" }}><Avatar sx={{ bgcolor: "primary.main" }}>{user?.name?.[0] || "U"}</Avatar><Box><Typography fontWeight={850}>{user?.name}</Typography><Typography variant="caption" color="text.secondary">My account</Typography></Box></Stack>
      <List sx={{ display: { xs: "flex", lg: "grid" }, gap: .4, minWidth: { xs: "max-content", lg: 0 } }}>{links.map(([href, label, Icon]) => { const active = href === "/account" ? pathname === href : pathname.startsWith(href); return <ListItemButton key={href} component={Link} href={href} selected={active} sx={{ borderRadius: 2.5, minHeight: 44, "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText", "& .MuiListItemIcon-root": { color: "inherit" } } }}><ListItemIcon sx={{ minWidth: 36 }}><Icon fontSize="small" /></ListItemIcon><ListItemText primary={label} sx={{ fontSize: 13.5, fontWeight: active ? 800 : 650 }} /></ListItemButton>; })}</List>
    </Paper>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>;
}
