"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function sessionId() {
  try {
    let value = sessionStorage.getItem("commerce.analytics.session");
    if (!value) {
      value = crypto.randomUUID();
      sessionStorage.setItem("commerce.analytics.session", value);
    }
    return value;
  } catch { return "anonymous"; }
}

export function trackCommerceEvent(event, payload = {}) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;
  const body = {
    event,
    sessionId: sessionId(),
    path: window.location.pathname + window.location.search,
    referrer: document.referrer || "",
    ...payload
  };
  fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
    credentials: "same-origin"
  }).catch(() => {});
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useRef("");
  useEffect(() => {
    const query = searchParams?.toString();
    const path = `${pathname}${query ? `?${query}` : ""}`;
    if (!pathname || path === last.current) return;
    last.current = path;
    trackCommerceEvent(pathname.startsWith("/product/") ? "product_view" : "page_view", {
      path,
      metadata: pathname.startsWith("/search") ? { query: searchParams?.get("q") || "" } : {}
    });
  }, [pathname, searchParams]);
  return null;
}
