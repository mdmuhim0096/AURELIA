import crypto from "node:crypto";
export function cloudinarySignature(params = {}) {
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) throw Object.assign(new Error("Cloudinary is not configured"), { status: 503 });
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "").sort(([a], [b]) => a.localeCompare(b));
  const stringToSign = filtered.map(([k, v]) => `${k}=${v}`).join("&");
  return crypto.createHash("sha1").update(`${stringToSign}${secret}`).digest("hex");
}
