"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { buildTheme } from "@/theme/theme";
import { ToastProvider } from "@/components/providers/ToastProvider";

const ColorModeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
});

export function useAppColorMode() {
  return useContext(ColorModeContext);
}

export default function AppProviders({
  children,
}) {
  const [mode, setMode] =
    useState("light");

  /*
   * Load saved theme only after client mount.
   *
   * Keeping the initial value as "light"
   * prevents the server/client from rendering
   * different themes during hydration.
   */
  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          "aurelia-color-mode"
        );

      if (
        saved === "light" ||
        saved === "dark"
      ) {
        setMode(saved);
        return;
      }

      const prefersDark =
        window.matchMedia?.(
          "(prefers-color-scheme: dark)"
        ).matches;

      if (prefersDark) {
        setMode("dark");
      }
    } catch (error) {
      console.warn(
        "[theme] Unable to read theme preference:",
        error
      );
    }
  }, []);

  /*
   * Keep theme information on <html>.
   */
  useEffect(() => {
    document.documentElement.dataset.theme =
      mode;

    document.documentElement.style.colorScheme =
      mode;
  }, [mode]);

  const toggleColorMode =
    useCallback(() => {
      setMode((current) => {
        const next =
          current === "light"
            ? "dark"
            : "light";

        try {
          window.localStorage.setItem(
            "aurelia-color-mode",
            next
          );
        } catch (error) {
          console.warn(
            "[theme] Unable to save theme preference:",
            error
          );
        }

        return next;
      });
    }, []);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode, toggleColorMode]
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <SessionProvider>
      <ColorModeContext.Provider
        value={colorMode}
      >
        <ThemeProvider
          theme={theme}
        >
          <CssBaseline />
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </SessionProvider>
  );
}