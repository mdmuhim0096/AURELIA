import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { fail, fromError, ok, readJson } from "@/lib/api";
import { rateLimit, requestKey } from "@/lib/security/rate-limit";
import AnalyticsEvent from "@/models/AnalyticsEvent";

const EVENTS = new Set(["page_view", "product_view", "search", "add_to_cart", "begin_checkout"]);
function cleanMeta(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [key, item] of Object.entries(value).slice(0, 12)) {
    if (typeof item === "string") result[key.slice(0, 60)] = item.slice(0, 300);
    else if (typeof item === "number" || typeof item === "boolean") result[key.slice(0, 60)] = item;
  }
  return result;
}

export async function POST(request) {
  try {
    if (!(await rateLimit(requestKey(request, "analytics"), { limit: 180, windowSeconds: 3600 }))) return ok({ accepted: false });
    const body = await readJson(request);
    if (!EVENTS.has(body.event)) return fail("Unsupported analytics event", 400);
    const sessionId = String(body.sessionId || "").trim().slice(0, 100);
    if (!sessionId) return fail("Analytics session is required", 400);
    const session = await auth();
    await connectDB();
    await AnalyticsEvent.create({
      event: body.event,
      sessionId,
      user: session?.user?.id || null,
      path: String(body.path || "").slice(0, 500),
      product: mongoose.isValidObjectId(body.productId) ? body.productId : null,
      value: Number.isFinite(Number(body.value)) ? Number(body.value) : 0,
      currency: String(body.currency || "USD").slice(0, 10),
      referrer: String(body.referrer || "").slice(0, 1000),
      metadata: cleanMeta(body.metadata)
    });
    return ok({ accepted: true }, { status: 202 });
  } catch (error) { return fromError(error, "Unable to record analytics event"); }
}
