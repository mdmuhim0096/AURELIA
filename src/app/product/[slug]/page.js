import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/storefront/ProductGallery";
import ProductPurchase from "@/components/storefront/ProductPurchase";
import ProductCard from "@/components/storefront/ProductCard";
import Reviews from "@/components/storefront/Reviews";
import ProductQuestions from "@/components/storefront/ProductQuestions";
import { RecentlyViewedGrid, RecentlyViewedTracker } from "@/components/storefront/RecentlyViewed";
import { getProductBySlug, searchProducts } from "@/lib/commerce/catalog";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const p = await getProductBySlug(slug); if (!p) return { title: "Product not found" };
    return { title: p.seo?.title || p.name, description: p.seo?.description || p.shortDescription || p.description?.slice(0, 155), alternates: { canonical: p.seo?.canonical || `/product/${p.slug}` }, openGraph: { title: p.name, description: p.shortDescription, images: p.media?.[0]?.url ? [p.media[0].url] : [] }, twitter: { card: "summary_large_image", title: p.name, description: p.shortDescription, images: p.media?.[0]?.url ? [p.media[0].url] : [] } };
  } catch { return { title: "Product" } }
}

export default async function ProductPage({ params }) {
  const { slug } = await params; let product; try { product = await getProductBySlug(slug) } catch { } if (!product) notFound();
  let related = []; try { const category = product.categories?.[0]?._id; related = (await searchProducts({ category: category ? String(category) : undefined, limit: 5, sort: "popular" })).items.filter(p => String(p._id) !== String(product._id)).slice(0, 4) } catch { }
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const productLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, sku: product.sku, description: product.shortDescription || product.description, image: product.media?.filter(m => m.type === "image").map(m => m.url), brand: product.brand?.name ? { "@type": "Brand", name: product.brand.name } : undefined, offers: { "@type": "Offer", priceCurrency: product.currency || "USD", price: product.basePrice, url: `${origin}/product/${product.slug}`, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }, aggregateRating: product.ratingCount ? { "@type": "AggregateRating", ratingValue: product.ratingAverage, reviewCount: product.ratingCount } : undefined };
  const category = product.categories?.[0];
  const breadcrumbLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: origin }, { "@type": "ListItem", position: 2, name: "Shop", item: `${origin}/shop` }, ...(category ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${origin}/category/${category.slug}` }] : []), { "@type": "ListItem", position: category ? 4 : 3, name: product.name, item: `${origin}/product/${product.slug}` }] };
  return <>
    <RecentlyViewedTracker productId={String(product._id)} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    <div className="container product-detail">
      <ProductGallery media={product.media} name={product.name} />
      <div className="product-buy">
        <div className="muted">
          <Link href="/shop">Shop</Link>
          / {category?.name || "Product"}
        </div>
        <span className="eyebrow" style={{ display: "block", marginTop: 25 }}>{product.brand?.name || "Aurelia"} · {product.sku}</span>
        
        <h1>{product.name}</h1>
        <p className="product-description">{product.shortDescription || product.description}</p>
        <ProductPurchase product={product} />
        <div className="accordion-list">
          <details className="accordion-row" open>
            <summary>Description</summary>
            <p>{product.description || "Product details will appear here."}</p>
          </details>
          <details className="accordion-row">
            <summary>Specifications</summary>
            {product.specifications?.length ?
              <dl>{product.specifications.map((s, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 15, padding: "7px 0" }}><dt className="muted">{s.key}</dt><dd>{s.value}</dd>
              </div>)}</dl> :
              <p>No additional specifications.</p>}
          </details>
          <details className="accordion-row">
            <summary>Shipping</summary>
            <p>{product.shippingInfo || "Shipping options and live costs are calculated securely during checkout."}</p>
          </details>
          <details className="accordion-row">
            <summary>Returns</summary>
            <p>{product.returnInfo || "Eligible delivered orders can create a return request from the account dashboard."}</p>
          </details>
        </div>
      </div>
    </div>
    {related.length > 0 && <section className="section-pad" style={{ background: "var(--card)" }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">You may also like</span>
            <h2 className="section-title">Related products.</h2>
          </div>
        </div>
        <div className="product-grid">{related.map(p => <ProductCard key={String(p._id)} product={p} />)}</div>
      </div>
    </section>}
    <Reviews productId={String(product._id)} productSlug={product.slug} ratingAverage={product.ratingAverage} ratingCount={product.ratingCount} />
    <ProductQuestions productId={String(product._id)} productSlug={product.slug} />
    <RecentlyViewedGrid exclude={String(product._id)} />
  </>;
}
