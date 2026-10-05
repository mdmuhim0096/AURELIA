import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const staticRoutes = ["", "/shop", "/shipping", "/returns", "/privacy", "/terms"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7
  }));

  try {
    await connectDB();
    const [products, categories, brands] = await Promise.all([
      Product.find({ status: "published" }).select("slug updatedAt").lean(),
      Category.find({}).select("slug updatedAt").lean(),
      Brand.find({}).select("slug updatedAt").lean()
    ]);

    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${base}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8
      })),
      ...categories.map((category) => ({
        url: `${base}/category/${category.slug}`,
        lastModified: category.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7
      })),
      ...brands.map((brand) => ({
        url: `${base}/brand/${brand.slug}`,
        lastModified: brand.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7
      }))
    ];
  } catch {
    return staticRoutes;
  }
}
