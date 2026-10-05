"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
const ToastContext = createContext({ toast: () => {} });
export function ToastProvider({ children }) {
  const [state, setState] = useState({ open: false, message: "", severity: "success" });
  const toast = useCallback((message, severity = "success") => setState({ open: true, message, severity }), []);
  const value = useMemo(() => ({ toast }), [toast]);
  return <ToastContext.Provider value={value}>{children}<Snackbar open={state.open} autoHideDuration={3200} onClose={() => setState((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}><Alert variant="filled" severity={state.severity} onClose={() => setState((s) => ({ ...s, open: false }))}>{state.message}</Alert></Snackbar></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
