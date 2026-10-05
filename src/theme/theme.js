"use client";

import { alpha, createTheme } from "@mui/material/styles";

export function buildTheme(mode = "light") {
  const isDark = mode === "dark";
  const primary = "#5B7CFA";
  const secondary = "#21C7A8";
  const backgroundDefault = isDark ? "#0B1020" : "#F4F7FC";
  const backgroundPaper = isDark ? "#111827" : "#FFFFFF";
  const textPrimary = isDark ? "#F8FAFC" : "#172033";
  const textSecondary = isDark ? "#94A3B8" : "#64748B";
  const divider = isDark ? "rgba(255,255,255,0.09)" : "#E7ECF4";

  return createTheme({
    modularCssLayers: true,
    cssVariables: true,
    palette: {
      mode,
      primary: { main: primary, light: "#829BFF", dark: "#3F5FE0", contrastText: "#FFFFFF" },
      secondary: { main: secondary, contrastText: "#FFFFFF" },
      success: { main: "#22C55E" },
      warning: { main: "#F59E0B" },
      error: { main: "#EF4444" },
      info: { main: "#3B82F6" },
      background: { default: backgroundDefault, paper: backgroundPaper },
      text: { primary: textPrimary, secondary: textSecondary },
      divider,
    },
    typography: {
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 800, letterSpacing: "-0.045em" },
      h2: { fontWeight: 800, letterSpacing: "-0.035em" },
      h3: { fontWeight: 700, letterSpacing: "-0.025em" },
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 700, letterSpacing: 0 },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollBehavior: "smooth", colorScheme: mode },
          body: {
            margin: 0,
            minHeight: "100vh",
            backgroundColor: backgroundDefault,
            color: textPrimary,
            backgroundImage: isDark
              ? "radial-gradient(circle at 10% 0%, rgba(91,124,250,0.12), transparent 30%)"
              : "radial-gradient(circle at 10% 0%, rgba(91,124,250,0.08), transparent 30%)",
          },
          a: { color: "inherit", textDecoration: "none" },
          "*, *::before, *::after": { boxSizing: "border-box" },
        },
      },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: "none", boxShadow: "none" } } },
      MuiToolbar: { styleOverrides: { root: { minHeight: 72 } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none", borderColor: divider } } },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${divider}`,
            boxShadow: isDark ? "0 18px 50px rgba(0,0,0,0.24)" : "0 18px 50px rgba(23,32,51,0.07)",
            transition: "transform 180ms ease, box-shadow 180ms ease",
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, minHeight: 42, paddingInline: 18 },
          containedPrimary: {
            boxShadow: `0 10px 26px ${alpha(primary, 0.26)}`,
            "&:hover": { boxShadow: `0 14px 32px ${alpha(primary, 0.32)}` },
          },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiTextField: { defaultProps: { size: "small", variant: "outlined" } },
      MuiFormControl: { defaultProps: { size: "small" } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiSelect: { defaultProps: { size: "small" } },
      MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 700 } } },
      MuiTableContainer: { styleOverrides: { root: { borderRadius: 16 } } },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: divider },
          head: { fontWeight: 800, color: textSecondary, backgroundColor: isDark ? "rgba(255,255,255,0.025)" : "#F8FAFD" },
        },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontSize: "0.75rem" } } },
    },
  });
}
