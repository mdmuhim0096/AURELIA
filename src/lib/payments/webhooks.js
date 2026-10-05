import WebhookEvent from "@/models/WebhookEvent";
import { connectDB } from "@/lib/db";

const STALE_PROCESSING_MS = 5 * 60 * 1000;

export async function claimWebhook(provider, eventId, type = "") {
  await connectDB();

  try {
    return {
      claimed: true,
      event: await WebhookEvent.create({ provider, eventId, type }),
    };
  } catch (error) {
    if (error?.code !== 11000) throw error;

    const staleBefore = new Date(Date.now() - STALE_PROCESSING_MS);

    const reclaimed = await WebhookEvent.findOneAndUpdate(
      {
        provider,
        eventId,
        $or: [
          { status: "failed" },
          { status: "processing", updatedAt: { $lt: staleBefore } },
        ],
      },
      {
        $set: {
          status: "processing",
          error: "",
          type,
        },
      },
      { new: true }
    );

    if (reclaimed) {
      return { claimed: true, event: reclaimed, retried: true };
    }

    return {
      claimed: false,
      event: await WebhookEvent.findOne({ provider, eventId }),
    };
  }
}

export async function finishWebhook(id, status = "processed", error = "") {
  await WebhookEvent.updateOne(
    { _id: id },
    { $set: { status, error } }
  );
}
