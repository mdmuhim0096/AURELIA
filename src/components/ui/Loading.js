"use client";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
export default function Loading({ label = "Loading" }) {
  return <Box sx={{ minHeight: 220, display: "grid", placeItems: "center", alignContent: "center", gap: 1.5 }}><CircularProgress size={30} /><Typography color="text.secondary" variant="body2">{label}</Typography></Box>;
}
