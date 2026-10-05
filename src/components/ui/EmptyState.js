import Link from "next/link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";

export default function EmptyState({
  title = "Nothing here yet",
  description = "There is no data to show.",
  actionHref = "/shop",
  actionLabel = "Browse products",
}) {
  return (
    <Paper
      sx={{
        minHeight: 360,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        p: 5,
        borderStyle: "dashed",
      }}
    >
      <Box>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <Inventory2Outlined fontSize="large" />
        </Box>
        <Typography variant="h4">{title}</Typography>
        <Typography
          color="text.secondary"
          sx={{ maxWidth: 520, mx: "auto", mt: 1.5, mb: 3 }}
        >
          {description}
        </Typography>
        {actionHref && (
          <Link href={actionHref} style={{ textDecoration: "none" }}>
            <Button variant="contained">{actionLabel}</Button>
          </Link>
        )}
      </Box>
    </Paper>
  );
}
