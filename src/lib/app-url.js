function cleanUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

export function getAppUrl() {
  const explicit = cleanUrl(process.env.APP_URL);
  if (explicit) return explicit;

  const publicUrl = cleanUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (publicUrl && !publicUrl.includes("localhost")) return publicUrl;

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (publicUrl) return publicUrl;

  return "http://localhost:3000";
}
