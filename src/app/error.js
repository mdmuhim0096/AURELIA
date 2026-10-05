"use client";

import { MuiButton } from "@/components/ui/MuiFormControls";

export default function GlobalError({ error, reset }) {
  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <span className="eyebrow">Something went wrong</span>
        <h1>We hit a snag.</h1>
        <p className="muted">
          {process.env.NODE_ENV === "development"
            ? error?.message
            : "Please retry. Sensitive server errors are not exposed."}
        </p>
        <MuiButton className="button dark" type="button" onClick={reset}>
          Try again
        </MuiButton>
      </div>
    </div>
  );
}
