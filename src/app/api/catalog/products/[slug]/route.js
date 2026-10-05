import { getProductBySlug } from "@/lib/commerce/catalog";
import { fail, fromError, ok } from "@/lib/api";
export async function GET(_request, { params }) {
  try { const { slug } = await params; const product = await getProductBySlug(slug); return product ? ok({ product }) : fail("Product not found", 404); }
  catch (error) { return fromError(error, "Unable to load product"); }
}
