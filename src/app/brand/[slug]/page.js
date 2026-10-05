import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/storefront/ProductCard";
import { connectDB } from "@/lib/db";
import { searchProducts } from "@/lib/commerce/catalog";
import Brand from "@/models/Brand";

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    await connectDB();
    const brand = await Brand.findOne({ slug }).lean();
    if (!brand) return { title: "Brand" };
    const description = brand.seo?.description || brand.description || `Shop ${brand.name} products.`;
    return {
      title: brand.seo?.title || brand.name,
      description,
      alternates: { canonical: brand.seo?.canonical || `/brand/${brand.slug}` },
      openGraph: { title: brand.name, description, url: `/brand/${brand.slug}` }
    };
  } catch {
    return { title: "Brand" };
  }
}

export default async function BrandPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  let brand;
  let data = { items: [], total: 0, page: 1, pages: 0 };
  try {
    await connectDB();
    brand = await Brand.findOne({ slug }).lean();
    if (brand) data = await searchProducts({ ...query, brandSlug: slug, limit: 36 });
  } catch {}
  if (!brand) notFound();

  const hrefFor = (page) => {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(query || {})) {
      if (Array.isArray(value)) value.forEach((item) => q.append(key, item));
      else if (value != null && value !== "") q.set(key, value);
    }
    q.set("page", String(page));
    return `/brand/${slug}?${q.toString()}`;
  };

  return <div className="container"><header className="page-hero"><span className="eyebrow">Brand</span><h1 className="display">{brand.name}</h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>{brand.description}</p></header><section style={{paddingBottom:90}}>{data.items.length?<><div className="product-grid">{data.items.map((product)=><ProductCard key={String(product._id)} product={product}/>)}</div>{data.pages>1&&<div className="pagination">{Array.from({length:data.pages},(_,index)=>index+1).map((page)=>page===data.page?<span className="active" key={page}>{page}</span>:<Link href={hrefFor(page)} key={page}>{page}</Link>)}</div>}</>:<div className="empty-state"><div className="empty-orb"/><h2>No published products yet.</h2><p>Published products from this brand will appear automatically.</p></div>}</section></div>;
}
