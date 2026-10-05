import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { activeFlashSales, applyPromotionsToProducts, discountedPrice, matchingFlashSale } from "@/lib/commerce/promotions";
export function productFilter(searchParams = {}) { const filter = { status: "published" }; const q = String(searchParams.q || "").trim(); if (q) filter.$text = { $search: q }; if (searchParams.category) filter.categories = searchParams.category; if (searchParams.categoryIds) filter.categories = { $in: String(searchParams.categoryIds).split(",").filter(Boolean) }; if (searchParams.brand) filter.brand = searchParams.brand; if (searchParams.featured === "true") filter.featured = true; if (searchParams.trending === "true") filter.trending = true; if (searchParams.tag) filter.tags = String(searchParams.tag).toLowerCase(); for (const [key, value] of Object.entries(searchParams)) { if (key.startsWith("attr_") && value) filter[`attributes.${key.slice(5)}`] = value } if (searchParams.inStock === "true") filter.$or = [{ trackInventory: false }, { allowBackorder: true }, { stock: { $gt: 0 } }]; if (searchParams.rating) filter.ratingAverage = { $gte: Number(searchParams.rating) }; if (searchParams.minPrice || searchParams.maxPrice) { filter.basePrice = {}; if (searchParams.minPrice) filter.basePrice.$gte = Number(searchParams.minPrice); if (searchParams.maxPrice) filter.basePrice.$lte = Number(searchParams.maxPrice) } return filter }

export function productSort(sort = "featured") { return ({ featured: { featured: -1, createdAt: -1 }, newest: { createdAt: -1 }, price_asc: { basePrice: 1 }, price_desc: { basePrice: -1 }, rating: { ratingAverage: -1, ratingCount: -1 }, popular: { salesCount: -1, ratingAverage: -1 } })[sort] || { featured: -1, createdAt: -1 } }

export async function searchProducts(params = {}) {

    await connectDB();

    const page = Math.max(
        1,
        Number(params.page || 1)
    );

    const limit = Math.min(
        48,
        Math.max(1, Number(params.limit || 24))
    );

    const filter = productFilter(params);

    /*
     * CATEGORY SLUG FILTER
     */
    if (params.categorySlug) {
        const Category = (
            await import("@/models/Category")
        ).default;

        const category = await Category.findOne({
            slug: params.categorySlug,
        })
            .select("_id")
            .lean();


        if (!category) {
            console.log(
                "Category not found:",
                params.categorySlug
            );

            return {
                items: [],
                total: 0,
                page,
                pages: 0,
            };
        }

        filter.categories = category._id;
    }

    /*
     * BRAND SLUG FILTER
     */
    if (params.brandSlug) {
        const Brand = (
            await import("@/models/Brand")
        ).default;

        const brand = await Brand.findOne({
            slug: params.brandSlug,
        })
            .select("_id")
            .lean();

        if (!brand) {
            console.log(
                "Brand not found:",
                params.brandSlug
            );

            return {
                items: [],
                total: 0,
                page,
                pages: 0,
            };
        }

        filter.brand = brand._id;
    }

    /*
     * DEBUG:
     * Check how many products exist WITHOUT filters.
     */
    const allProductsCount =
        await Product.countDocuments({});

    /*
     * Check how many products match the generated filter.
     */
    const matchedProductsCount =
        await Product.countDocuments(filter);

    const [rows, total] =
        await Promise.all([
            Product.find(filter)
                .populate(
                    "brand",
                    "name slug logo"
                )
                .populate(
                    "categories",
                    "name slug"
                )
                .sort(
                    productSort(params.sort)
                )
                .skip(
                    (page - 1) * limit
                )
                .limit(limit)
                .lean(),

            Product.countDocuments(filter),
        ]);


    /*
     * Apply promotions
     */
    const items =
        await applyPromotionsToProducts(
            rows
        );

    /*
     * Promotion-adjusted price sorting
     */
    if (
        params.sort === "price_asc"
    ) {
        items.sort(
            (a, b) =>
                Number(a.basePrice || 0) -
                Number(b.basePrice || 0)
        );
    }

    if (
        params.sort === "price_desc"
    ) {
        items.sort(
            (a, b) =>
                Number(b.basePrice || 0) -
                Number(a.basePrice || 0)
        );
    }

    const result = {
        items: JSON.parse(
            JSON.stringify(items)
        ),

        total,

        page,

        pages:
            total > 0
                ? Math.ceil(
                    total / limit
                )
                : 0,
    };

    return result;
}

export async function getProductBySlug(slug) {
    
    await connectDB();
    let product = await Product.findOne({ slug, status: "published" }).populate("brand", "name slug logo description").populate("categories", "name slug").lean();

    if (!product) return null;
    let variants = await ProductVariant.find({ product: product._id, active: true }).lean();

    const campaigns = await activeFlashSales();
    const campaign = matchingFlashSale(product, campaigns);

    if (campaign) {
        const original = Number(product.basePrice);
        const sale = discountedPrice(original, campaign);
        if (sale < original) {
            product = { ...product, basePrice: sale, compareAtPrice: Math.max(original, Number(product.compareAtPrice || 0)), promotion: { id: String(campaign._id), name: campaign.name, label: campaign.metadata?.label || campaign.subject || "Flash sale", endsAt: campaign.endsAt } };
            variants = variants.map(v => {
                const old = Number(v.price);
                const price = discountedPrice(old, campaign);
                return price < old ? { ...v, price, compareAtPrice: Math.max(old, Number(v.compareAtPrice || 0)) } : v
            })
        }
    } return JSON.parse(JSON.stringify({ ...product, variants }))
}
