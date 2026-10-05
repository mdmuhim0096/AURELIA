import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import RecentlyViewed from "@/models/RecentlyViewed";
import ProductCard from "@/components/storefront/ProductCard";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Product history" };

export default async function ProductHistoryPage() {
  const session = await auth();
  await connectDB();
  const records = await RecentlyViewed.find({ user: session.user.id })
    .populate("product", "name slug basePrice compareAtPrice media ratingAverage ratingCount stock status currency")
    .sort({ viewedAt: -1 })
    .limit(60)
    .lean();
  const products = records.map((record) => record.product).filter((product) => product?.status === "published");

  return <>
    <div className="dashboard-head">
      <div><span className="eyebrow">Browsing activity</span><h1>Product history.</h1></div>
    </div>
    {products.length
      ? <div className="product-grid">{products.map((product) => <ProductCard key={String(product._id)} product={product} />)}</div>
      : <EmptyState title="No product history yet." description="Products you view will appear here for quick access." />}
  </>;
}
