import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import DashboardClient from "@/components/admin/DashboardClient";

export const metadata = { title: "Admin analytics" };
export default function Page() {
  return <><Box sx={{ mb: 3 }}><Chip label="Executive overview" size="small" color="primary" variant="outlined" /><Typography variant="h3" sx={{ mt: 1 }}>Commerce analytics</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>A live operational view of revenue, customers, orders and product performance.</Typography></Box><DashboardClient /></>;
}
