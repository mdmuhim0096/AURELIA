"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import { useAppColorMode } from "@/components/providers/AppProviders";

export default function ColorModeToggle({ size = "medium" }) {
  const { mode, toggleColorMode } = useAppColorMode();
  return (
    <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton size={size} onClick={toggleColorMode} aria-label="Toggle color mode">
        {mode === "dark" ? <LightModeRounded /> : <DarkModeRounded />}
      </IconButton>
    </Tooltip>
  );
}
