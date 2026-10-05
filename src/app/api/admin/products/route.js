import { auth } from "@/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { audit } from "@/lib/auth/audit";
import { fail, fromError, ok, readJson } from "@/lib/api";
function productPayload(body) { const allowed = ["name", "slug", "sku", "shortDescription", "description", "categories", "brand", "tags", "media", "specifications", "attributes", "basePrice", "compareAtPrice", "costPrice", "currency", "stock", "lowStockThreshold", "trackInventory", "allowBackorder", "status", "featured", "trending", "shipping", "shippingInfo", "returnInfo", "seo", "relatedProducts"]; return Object.fromEntries(allowed.filter((k) => body[k] !== undefined).map((k) => [k, body[k]])); }
export async function GET(request) { try { const session = await auth(); requirePermission(session, PERMISSIONS.PRODUCTS_READ); await connectDB(); const url = new URL(request.url); const q = url.searchParams.get("q"); const filter = q ? { $text: { $search: q } } : {}; const items = await Product.find(filter).populate("categories", "name slug").populate("brand", "name slug").sort({ createdAt: -1 }).limit(200).lean(); return ok({ items }); } catch (error) { return fromError(error, "Unable to load products"); }; };

export async function POST(request) {
    try {
        const session = await auth();
        requirePermission(session, PERMISSIONS.PRODUCTS_WRITE);
        const body = await readJson(request);
        
        if (!body.name || !body.slug || !body.sku || body.basePrice === undefined) return fail("Name, slug, SKU and price are required", 400);
        await connectDB();
  
        const product = await Product.create(productPayload(body));
        if (Array.isArray(body.variants)) await ProductVariant.insertMany(body.variants.map((v) => ({ ...v, product: product._id })), { ordered: true });
        await audit({ actor: session.user.id, action: "product.created", resourceType: "Product", resourceId: product._id, newValue: productPayload(body) });
        return ok({ product }, { status: 201 });
    } catch (error) {
        return fromError(error, "Unable to create product");
    }
};
