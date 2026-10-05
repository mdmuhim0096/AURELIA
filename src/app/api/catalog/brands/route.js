import { connectDB } from "@/lib/db";
import Brand from "@/models/Brand";
import { fromError, ok } from "@/lib/api";
export const revalidate = 300;
export async function GET() { try { await connectDB(); return ok({ items: await Brand.find({}).sort({ featured: -1, name: 1 }).lean() }); } catch (error) { return fromError(error, "Unable to load brands"); } }
