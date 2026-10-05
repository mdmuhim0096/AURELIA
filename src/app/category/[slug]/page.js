import { MuiButton, MuiSelect } from "@/components/ui/MuiFormControls";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/storefront/ProductCard";
import { connectDB } from "@/lib/db";
import { searchProducts } from "@/lib/commerce/catalog";
import Category from "@/models/Category";
export const revalidate = 120;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        await connectDB();
        const c = await Category.findOne({ slug }).lean();
        if (!c) return { title: 'Category' };

        return {
            title: c.seo?.title || c.name, description: c.seo?.description || c.description, alternates: { canonical: c.seo?.canonical || `/category/${c.slug}` }, openGraph: { title: c.name, description: c.description, url: `/category/${c.slug}`, images: c.banner ? [c.banner] : [] }
        }
    } catch { return { title: 'Category' } }
};

export default async function CategoryPage({ params, searchParams }) {
    const { slug } = await params;
    const query = await searchParams;
    let category, data, children = [];
    try {
        await connectDB();
        category = await Category.findOne({ slug }).lean();
        if (category) [data, children] = await Promise.all([searchProducts({ ...query, categorySlug: slug, limit: 36 }), Category.find({ parent: category._id }).sort({ sortOrder: 1, name: 1 }).lean()])
    } catch(error) { 
        console.log(error);
    }

    if (!category) notFound();
    const hrefFor = (page) => {
        const q = new URLSearchParams();
        for (const [k, v] of Object.entries(query || {})) {
            if (Array.isArray(v)) v.forEach(x => q.append(k, x));
            else if (v != null && v !== "") q.set(k, v);
        }
        q.set('page', String(page));
        return `/category/${slug}?${q}`;
    };

    return <div className="container">
        <header className="page-hero">
            {category.banner && <div style={{ height: 260, borderRadius: 28, background: `linear-gradient(180deg,transparent,rgba(0,0,0,.35)),url(${category.banner}) center/cover`, marginBottom: 30 }} />}

            <span className="eyebrow">Category</span>
            <h1 className="display">{category.name}</h1>
            <p className="muted" style={{ maxWidth: 700, lineHeight: 1.7 }}>{category.description}</p>
        </header>

        {children.length > 0 && <div className="collection-strip" style={{ marginBottom: 30 }}>
            {children.map(c => <Link href={`/category/${c.slug}`} className="collection-card" key={String(c._id)}>
                <span className="eyebrow">Subcategory</span>
                <h3 className="section-title" style={{ fontSize: '2rem' }}>{c.name}</h3>
                <span>Explore →</span>
            </Link>)}
        </div>}

        {category.filters?.length > 0 && <form method="get" className="filter-panel" style={{ position: "static", display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 30 }}>

            {category.filters.map((f) => <label key={f.key} style={{ minWidth: 180 }}>
                <strong>{f.label}</strong>
                <MuiSelect name={`attr_${f.key}`} defaultValue={query[`attr_${f.key}`] || ""}>
                    <option value="">Any</option>
                    {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </MuiSelect>
            </label>)}

            <label style={{ minWidth: 160 }}>
                <strong>Sort</strong>
                <MuiSelect name="sort" defaultValue={query.sort || 'featured'}>
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="popular">Popular</option>
                    <option value="rating">Rating</option>
                    <option value="price_asc">Price low-high</option>
                    <option value="price_desc">Price high-low</option>
                </MuiSelect>
            </label>
            <MuiButton className="button dark small">Apply filters</MuiButton>
        </form>}
        <section style={{ paddingBottom: 90 }}>
            {data?.items?.length > 0 ? (
                <>
                    <div className="product-grid">
                        {data.items.map(p => (
                            <ProductCard key={String(p._id)} product={p} />
                        ))}
                    </div>
                    {data.pages > 1 && (
                        <div className="pagination">
                            {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                                p === data.page ? (
                                    <span className="active" key={p}>
                                        {p}
                                    </span>
                                ) : (
                                    <Link href={hrefFor(p)} key={p}>
                                        {p}
                                    </Link>
                                )
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-orb" />
                    <h2>Nothing published here yet.</h2>
                    <p>Products assigned to this category will appear automatically.</p>
                </div>
            )}
        </section>
    </div>
}
