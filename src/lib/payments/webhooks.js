import WebhookEvent from "@/models/WebhookEvent";
import { connectDB } from "@/lib/db";
export async function claimWebhook(provider, eventId, type = "") {
  await connectDB();
  try { return { claimed: true, event: await WebhookEvent.create({ provider, eventId, type }) }; }
  catch (error) { if (error?.code === 11000) return { claimed: false, event: await WebhookEvent.findOne({ provider, eventId }) }; throw error; }
}
export async function finishWebhook(id, status = "processed", error = "") { await WebhookEvent.updateOne({ _id: id }, { $set: { status, error } }); }
