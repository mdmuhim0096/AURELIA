import { MuiButton, MuiInput, MuiSelect } from "@/components/ui/MuiFormControls";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
import { searchProducts } from "@/lib/commerce/catalog";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Brand from "@/models/Brand";

export const metadata = { title: "Shop", description: "Browse the full product collection.", alternates: { canonical: "/shop" }, openGraph: { title: "Shop", description: "Browse the full product collection.", url: "/shop" } };

export const revalidate = 60;
export default async function ShopPage({ searchParams }) {
  const params = await searchParams;

  let data = {
    items: [],
    total: 0,
    page: 1,
    pages: 0,
  };

  let categories = [];
  let brands = [];

  try {
    await connectDB();

    [data, categories, brands] = await Promise.all([
      searchProducts(params),

      Category.find({})
        .sort({ name: 1 })
        .lean(),

      Brand.find({})
        .sort({ name: 1 })
        .lean(),
    ]);
  } catch {}

  const selectedCategoryIds = Array.isArray(params.categoryIds)
    ? params.categoryIds.map(String)
    : String(params.categoryIds || "")
        .split(",")
        .filter(Boolean);

  const queryFor = (changes) => {
    const q = new URLSearchParams(
      Object.entries({
        ...params,
        ...changes,
      }).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      )
    );

    return `/shop?${q.toString()}`;
  };

  return (
    <div className="container">
      <header className="page-hero">
        <span className="eyebrow">
          The collection
        </span>

        <h1 className="display">
          Shop all.
        </h1>

        <p className="muted">
          {data.total} products · filters, sorting and pagination are
          server-backed.
        </p>
      </header>

      <div className="shop-layout">
        <aside className="filter-panel">
          <form action="/shop">
            {/* Search */}
            <div className="filter-group">
              <h4>Search</h4>

              <MuiInput
                name="q"
                defaultValue={params.q || ""}
                placeholder="Product, SKU, tag…"
              />
            </div>

            {/* Categories */}
            <div className="filter-group">
              <h4>Categories</h4>

              <div
                style={{
                  display: "grid",
                  gap: 7,
                  maxHeight: 220,
                  overflow: "auto",
                }}
              >
                {categories.map((category) => (
                  <label
                    key={String(category._id)}
                    style={{
                      display: "flex",
                      gap: 7,
                      alignItems: "center",
                    }}
                  >
                    <MuiInput
                      type="checkbox"
                      name="categoryIds"
                      value={String(category._id)}
                      defaultChecked={selectedCategoryIds.includes(
                        String(category._id)
                      )}
                    />

                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="filter-group">
              <h4>Brand</h4>

              <MuiSelect
                name="brandSlug"
                defaultValue={params.brandSlug || ""}
              >
                <option value="">
                  All brands
                </option>

                {brands.map((brand) => (
                  <option
                    key={String(brand._id)}
                    value={brand.slug}
                  >
                    {brand.name}
                  </option>
                ))}
              </MuiSelect>
            </div>

            {/* Price */}
            <div className="filter-group">
              <h4>Price</h4>

              <MuiInput
                type="number"
                name="minPrice"
                defaultValue={params.minPrice || ""}
                placeholder="Min"
                style={{
                  marginBottom: 8,
                }}
              />

              <MuiInput
                type="number"
                name="maxPrice"
                defaultValue={params.maxPrice || ""}
                placeholder="Max"
              />
            </div>

            {/* Stock + Rating */}
            <div className="filter-group">
              <label>
                <MuiInput
                  type="checkbox"
                  name="inStock"
                  value="true"
                  defaultChecked={params.inStock === "true"}
                />

                {" "}In stock only
              </label>

              <label>
                Minimum rating

                <MuiSelect
                  name="rating"
                  defaultValue={params.rating || ""}
                >
                  <option value="">
                    Any
                  </option>

                  <option value="4">
                    4★ & up
                  </option>

                  <option value="3">
                    3★ & up
                  </option>
                </MuiSelect>
              </label>
            </div>

            <MuiButton
              className="button dark"
              style={{
                width: "100%",
              }}
            >
              Apply filters
            </MuiButton>
          </form>
        </aside>

        <section>
          {/* Toolbar */}
          <div className="shop-toolbar">
            <span className="muted">
              Showing {data.items.length} of {data.total}
            </span>

            <form>
              <MuiSelect
                name="sort"
                defaultValue={params.sort || "featured"}
                onChange={undefined}
              >
                <option value="featured">
                  Featured
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="popular">
                  Popular
                </option>

                <option value="rating">
                  Rating
                </option>

                <option value="price_asc">
                  Price: low to high
                </option>

                <option value="price_desc">
                  Price: high to low
                </option>
              </MuiSelect>

              {Object.entries(params)
                .filter(([key]) => key !== "sort")
                .map(([key, value]) => (
                  <MuiInput
                    key={key}
                    type="hidden"
                    name={key}
                    value={value}
                  />
                ))}

              <MuiButton className="button small">
                Sort
              </MuiButton>
            </form>
          </div>

          {/* Products */}
          {data.items.length ? (
            <div className="product-grid">
              {data.items.map((product) => (
                <ProductCard
                  key={String(product._id)}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-orb" />

              <h2>
                No products matched.
              </h2>

              <p>
                Try clearing a filter or searching for something else.
              </p>

              <Link
                href="/shop"
                className="button dark"
              >
                Clear filters
              </Link>
            </div>
          )}

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="pagination">
              {Array.from(
                { length: data.pages },
                (_, index) => index + 1
              )
                .slice(
                  Math.max(0, data.page - 3),
                  Math.min(data.pages, data.page + 2)
                )
                .map((page) =>
                  page === data.page ? (
                    <span
                      key={page}
                      className="active"
                    >
                      {page}
                    </span>
                  ) : (
                    <Link
                      key={page}
                      href={queryFor({
                        page,
                      })}
                    >
                      {page}
                    </Link>
                  )
                )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}