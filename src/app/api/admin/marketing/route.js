import mongoose from "mongoose";
import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import MarketingCampaign from "@/models/MarketingCampaign";
import SiteSetting from "@/models/SiteSetting";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { audit } from "@/lib/auth/audit";
import { fail, fromError, ok, readJson } from "@/lib/api";

const TYPES = new Set(["newsletter", "notification", "flash_sale", "banner"]);
const STATUSES = new Set(["draft", "scheduled", "running", "completed", "cancelled"]);
const SETTING_KEYS = new Set(["homepage_announcement", "homepage_banner", "homepage_sections", "recommendation_rules", "related_product_rules"]);

function normalizeCampaign(body) {
  if (!body.name || !TYPES.has(body.type)) throw Object.assign(new Error("Valid campaign name and type are required"), { status: 400 });
  const status = STATUSES.has(body.status) ? body.status : "draft";
  const startsAt = body.startsAt ? new Date(body.startsAt) : null;
  const endsAt = body.endsAt ? new Date(body.endsAt) : null;
  if (startsAt && Number.isNaN(startsAt.getTime())) throw Object.assign(new Error("Invalid start date"), { status: 400 });
  if (endsAt && Number.isNaN(endsAt.getTime())) throw Object.assign(new Error("Invalid end date"), { status: 400 });
  if (startsAt && endsAt && endsAt <= startsAt) throw Object.assign(new Error("Campaign end must be after start"), { status: 400 });
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  if (body.type === "flash_sale") {
    const value = Number(metadata.value || 0);
    if (!(value > 0)) throw Object.assign(new Error("Flash sale discount must be greater than zero"), { status: 400 });
    if (metadata.discountType !== "fixed" && value > 100) throw Object.assign(new Error("Percentage discount cannot exceed 100"), { status: 400 });
    if (!metadata.allProducts && !(metadata.productIds?.length || metadata.categoryIds?.length)) throw Object.assign(new Error("Choose products, categories, or all products for the flash sale"), { status: 400 });
  }
  return {
    name: String(body.name).trim(), type: body.type, subject: String(body.subject || "").trim(), content: String(body.content || ""),
    audience: body.audience && typeof body.audience === "object" ? body.audience : { type: "all" }, startsAt, endsAt, status, metadata
  };
}

function pickUpdates(updates = {}) {
  const allowed = {};
  if (updates.name !== undefined) allowed.name = String(updates.name).trim();
  if (updates.subject !== undefined) allowed.subject = String(updates.subject || "");
  if (updates.content !== undefined) allowed.content = String(updates.content || "");
  if (updates.status !== undefined && STATUSES.has(updates.status)) allowed.status = updates.status;
  if (updates.startsAt !== undefined) allowed.startsAt = updates.startsAt ? new Date(updates.startsAt) : null;
  if (updates.endsAt !== undefined) allowed.endsAt = updates.endsAt ? new Date(updates.endsAt) : null;
  if (updates.metadata !== undefined && typeof updates.metadata === "object") allowed.metadata = updates.metadata;
  if (updates.audience !== undefined && typeof updates.audience === "object") allowed.audience = updates.audience;
  return allowed;
}

export async function GET() {
  try {
    const session = await auth();
    requirePermission(session, PERMISSIONS.MARKETING_MANAGE);
    await connectDB();
    const [campaigns, settings] = await Promise.all([
      MarketingCampaign.find({}).sort({ createdAt: -1 }).limit(200).lean(),
      SiteSetting.find({ group: "marketing" }).sort({ key: 1 }).lean()
    ]);
    return ok({ campaigns, settings });
  } catch (error) { return fromError(error, "Unable to load marketing tools"); }
}

export async function POST(request) {
  try {
    const session = await auth();
    requirePermission(session, PERMISSIONS.MARKETING_MANAGE);
    const body = await readJson(request);
    await connectDB();
    if (body.action === "setting") {
      if (!SETTING_KEYS.has(body.key)) return fail("Unsupported public marketing setting", 400);
      const previous = await SiteSetting.findOne({ key: body.key }).lean();
      const setting = await SiteSetting.findOneAndUpdate({ key: body.key }, { $set: { value: body.value, group: "marketing" } }, { new: true, upsert: true, runValidators: true });
      await audit({ actor: session.user.id, action: "marketing.setting_updated", resourceType: "SiteSetting", resourceId: setting._id, previousValue: previous, newValue: { key: body.key, value: body.value } });
      return ok({ setting });
    }
    const payload = normalizeCampaign(body);
    const campaign = await MarketingCampaign.create({ ...payload, createdBy: session.user.id });
    await audit({ actor: session.user.id, action: "campaign.created", resourceType: "MarketingCampaign", resourceId: campaign._id, newValue: payload });
    return ok({ campaign }, { status: 201 });
  } catch (error) { return fromError(error, "Unable to save campaign"); }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    requirePermission(session, PERMISSIONS.MARKETING_MANAGE);
    const body = await readJson(request);
    if (!mongoose.isValidObjectId(body.id)) return fail("Invalid campaign", 400);
    await connectDB();
    const campaign = await MarketingCampaign.findById(body.id);
    if (!campaign) return fail("Campaign not found", 404);
    const previous = campaign.toObject();

    if (body.action === "send") {
      if (!["newsletter", "notification"].includes(campaign.type)) return fail("This campaign type is not sent in batches", 400);
      if (campaign.status === "cancelled" || campaign.status === "completed") return fail("Campaign is not sendable", 409);
      const cursor = body.cursor || campaign.metadata?.cursor || null;
      const filter = { status: "active", marketingOptIn: true, ...(cursor ? { _id: { $gt: cursor } } : {}) };
      const users = await User.find(filter).select("email name").sort({ _id: 1 }).limit(25).lean();
      let sent = 0; let failed = 0;
      if (campaign.type === "notification" && users.length) {
        await Notification.insertMany(users.map((user) => ({ user: user._id, type: "promotion", title: campaign.subject || campaign.name, message: campaign.content, href: campaign.metadata?.href || "" })));
        sent = users.length;
      } else if (users.length) {
        const results = await Promise.allSettled(users.map((user) => sendEmail({ to: user.email, subject: campaign.subject || campaign.name, body: campaign.content })));
        sent = results.filter((result) => result.status === "fulfilled").length;
        failed = results.length - sent;
      }
      const nextCursor = users.length === 25 ? String(users[users.length - 1]._id) : null;
      campaign.metadata = { ...(campaign.metadata || {}), cursor: nextCursor, sent: Number(campaign.metadata?.sent || 0) + sent, failed: Number(campaign.metadata?.failed || 0) + failed };
      campaign.status = nextCursor ? "running" : "completed";
      await campaign.save();
      await audit({ actor: session.user.id, action: "campaign.batch_sent", resourceType: "MarketingCampaign", resourceId: campaign._id, previousValue: previous, newValue: { sent, failed, nextCursor, status: campaign.status } });
      return ok({ campaign, batch: { sent, failed, nextCursor, complete: !nextCursor } });
    }

    const updates = pickUpdates(body.updates);
    Object.assign(campaign, updates);
    await campaign.save();
    await audit({ actor: session.user.id, action: "campaign.updated", resourceType: "MarketingCampaign", resourceId: campaign._id, previousValue: previous, newValue: updates });
    return ok({ campaign });
  } catch (error) { return fromError(error, "Unable to update campaign"); }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    requirePermission(session, PERMISSIONS.MARKETING_MANAGE);
    const body = await readJson(request);
    if (!mongoose.isValidObjectId(body.id)) return fail("Invalid campaign", 400);
    await connectDB();
    const campaign = await MarketingCampaign.findById(body.id);
    if (!campaign) return fail("Campaign not found", 404);
    const previous = campaign.toObject();
    await campaign.deleteOne();
    await audit({ actor: session.user.id, action: "campaign.deleted", resourceType: "MarketingCampaign", resourceId: body.id, previousValue: previous });
    return ok({ deleted: true });
  } catch (error) { return fromError(error, "Unable to delete campaign"); }
}
