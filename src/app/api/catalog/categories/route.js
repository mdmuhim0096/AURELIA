import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { fromError, ok } from "@/lib/api";
export const revalidate = 300;
export async function GET() { try { await connectDB(); return ok({ items: await Category.find({}).sort({ sortOrder: 1, name: 1 }).lean() }); } catch (error) { return fromError(error, "Unable to load categories"); } }
