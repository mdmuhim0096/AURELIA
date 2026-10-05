"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/navigation/ClientLink";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import Inventory2Rounded from "@mui/icons-material/Inventory2Rounded";
import CategoryRounded from "@mui/icons-material/CategoryRounded";
import BrandingWatermarkRounded from "@mui/icons-material/BrandingWatermarkRounded";
import ReceiptLongRounded from "@mui/icons-material/ReceiptLongRounded";
import PeopleAltRounded from "@mui/icons-material/PeopleAltRounded";
import CampaignRounded from "@mui/icons-material/CampaignRounded";
import RateReviewRounded from "@mui/icons-material/RateReviewRounded";
import SupportAgentRounded from "@mui/icons-material/SupportAgentRounded";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import ColorModeToggle from "@/components/layout/ColorModeToggle";

const links = [
  ["/admin", "Analytics", DashboardRounded],
  ["/admin/products", "Products", Inventory2Rounded],
  ["/admin/categories", "Categories", CategoryRounded],
  ["/admin/brands", "Brands", BrandingWatermarkRounded],
  ["/admin/orders", "Orders", ReceiptLongRounded],
  ["/admin/customers", "Customers", PeopleAltRounded],
  ["/admin/marketing", "Marketing", CampaignRounded],
  ["/admin/reviews", "Reviews & Q&A", RateReviewRounded],
  ["/admin/support", "Support", SupportAgentRounded],
  ["/admin/roles", "Roles & permissions", AdminPanelSettingsRounded],
  ["/admin/audit", "Audit logs", HistoryRounded],
  ["/admin/settings", "Settings", SettingsRounded],
];

export default function AdminShell({ children, user }) {
  const pathname = usePathname();
  const drawerWidth = 270;
  return (
    <Box sx={{ minHeight: "calc(100vh - 110px)", display: "flex", bgcolor: "background.default" }}>
      <Drawer variant="permanent" sx={{ display: { xs: "none", lg: "block" }, width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, top: 0, position: "sticky", height: "100vh", boxSizing: "border-box", borderRight: 1, borderColor: "divider", bgcolor: "background.paper", p: 2 } }}>
        <Stack direction="row" sx={{ px: 1, py: 1.5, alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 42, height: 42 }}>A</Avatar>
          <Box><Typography fontWeight={900}>Aurelia Admin</Typography><Typography variant="caption" color="text.secondary">Commerce control center</Typography></Box>
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <List sx={{ display: "grid", gap: .4 }}>
          {links.map(([href, label, Icon]) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <ListItemButton key={href} component={Link} href={href} selected={active} sx={{ borderRadius: 2.5, minHeight: 44, "&.Mui-selected": { bgcolor: "primary.main", color: "primary.contrastText", "& .MuiListItemIcon-root": { color: "inherit" } } }}>
              <ListItemIcon sx={{ minWidth: 38 }}><Icon fontSize="small" /></ListItemIcon><ListItemText primary={label} sx={{ fontSize: 14, fontWeight: active ? 800 : 650 }} />
            </ListItemButton>;
          })}
        </List>
        <Box sx={{ mt: "auto", pt: 2 }}>
          <Paper sx={{ p: 1.5, borderRadius: 3 }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1}}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main" }}>{user?.name?.[0] || "A"}</Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="body2" fontWeight={800} noWrap>{user?.name || "Administrator"}</Typography><Typography variant="caption" color="text.secondary" noWrap>{user?.email || "Admin account"}</Typography></Box>
              <ColorModeToggle size="small" />
            </Stack>
            <Chip label="Administrator" color="primary" size="small" sx={{ mt: 1.25 }} />
          </Paper>
        </Box>
      </Drawer>

      <Box component="section" sx={{ flex: 1, minWidth: 0, p: { xs: 2, sm: 3, lg: 4 } }}>
        <Box sx={{ maxWidth: 1500, mx: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}
