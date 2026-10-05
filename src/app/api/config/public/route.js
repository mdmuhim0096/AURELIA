import { connectDB } from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";
import { fromError, ok } from "@/lib/api";

const PUBLIC_KEYS = [
  "homepage_announcement",
  "homepage_sections",
  "featured_category_ids",
  "featured_product_ids",
  "recommendation_rules",
  "related_product_rules"
];

export async function GET() {
  try {
    await connectDB();
    const records = await SiteSetting.find({
      group: "marketing",
      key: { $in: PUBLIC_KEYS }
    }).select("key value -_id").lean();
    const settings = Object.fromEntries(records.map((record) => [record.key, record.value]));
    return ok({ settings });
  } catch (error) {
    return fromError(error, "Unable to load public store configuration");
  }
}
