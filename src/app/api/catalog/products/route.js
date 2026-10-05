import { searchProducts } from "@/lib/commerce/catalog";
import { fromError, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const params = Object.fromEntries(searchParams.entries());

    const products = await searchProducts(params);

    return ok(products);
  } catch (error) {
    return fromError(error, "Unable to load products");
  }
}