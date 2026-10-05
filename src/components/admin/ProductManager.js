"use client";
import { MuiButton, MuiInput, MuiSelect, MuiTextarea } from "@/components/ui/MuiFormControls";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import Loading from "@/components/ui/Loading";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/providers/ToastProvider";

export function ProductList() {
    const [items, setItems] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const { toast } = useToast();

    const loadProducts = useCallback(async () => {
        try {
            const response = await fetch(
                "/api/admin/products",
                {
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to load products"
                );
            }

            setItems(
                Array.isArray(data?.items)
                    ? data.items
                    : []
            );
        } catch (error) {
            console.error(
                "Unable to load products:",
                error
            );

            setItems([]);

            toast(
                error?.message ||
                "Unable to load products",
                "error"
            );
        }
    }, [toast]);

    useEffect(() => {
        let cancelled = false;

        async function fetchProducts() {
            try {
                const response = await fetch(
                    "/api/admin/products",
                    {
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (cancelled) {
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        data?.message ||
                        "Unable to load products"
                    );
                }

                setItems(
                    Array.isArray(data?.items)
                        ? data.items
                        : []
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load products:",
                    error
                );

                setItems([]);

                toast(
                    error?.message ||
                    "Unable to load products",
                    "error"
                );
            }
        }

        fetchProducts();

        return () => {
            cancelled = true;
        };
    }, [toast]);

    async function remove() {
        if (!deleteId) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/products/${deleteId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to delete product"
                );
            }

            toast(
                "Product deleted",
                "success"
            );

            setDeleteId(null);

            await loadProducts();
        } catch (error) {
            toast(
                error?.message ||
                "Unable to delete product",
                "error"
            );
        }
    }

    if (items === null) {
        return <Loading />;
    }

    return (
        <>
            <div className="data-card">
                <div className="data-card-head">
                    <strong>
                        {items.length} products
                    </strong>

                    <Link
                        className="button dark small"
                        href="/admin/products/new"
                    >
                        Create product
                    </Link>
                </div>

                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <strong>
                                            {product.name}
                                        </strong>

                                        <br />

                                        <span className="muted">
                                            {product.brand?.name ||
                                                "No brand"}
                                        </span>
                                    </td>

                                    <td>
                                        {product.sku}
                                    </td>

                                    <td>
                                        {product.currency}{" "}
                                        {Number(
                                            product.basePrice
                                        ).toFixed(2)}
                                    </td>

                                    <td>
                                        {product.stock}
                                    </td>

                                    <td>
                                        <StatusBadge
                                            value={
                                                product.status
                                            }
                                        />
                                    </td>

                                    <td>
                                        <Link
                                            href={`/admin/products/${product._id}`}
                                        >
                                            Edit
                                        </Link>

                                        {" · "}

                                        <MuiButton
                                            type="button"
                                            className="link-button"
                                            onClick={() =>
                                                setDeleteId(
                                                    product._id
                                                )
                                            }
                                        >
                                            Delete
                                        </MuiButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog
                open={Boolean(deleteId)}
                onClose={() =>
                    setDeleteId(null)
                }
            >
                <DialogTitle>
                    Delete product?
                </DialogTitle>

                <DialogContent>
                    This permanently removes the
                    product and its variants.
                    Existing order snapshots remain
                    intact.
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setDeleteId(null)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        onClick={remove}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

const base = {
    name: "",
    slug: "",
    sku: "",
    shortDescription: "",
    description: "",
    categories: [],
    brand: "",
    tags: "",
    basePrice: "",
    compareAtPrice: "",
    costPrice: "",
    currency: "USD",
    stock: 0,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: false,
    status: "draft",
    featured: false,
    trending: false,

    shipping: {
        weight: "",
        width: "",
        height: "",
        length: "",
        class: "",
    },

    shippingInfo: "",
    returnInfo: "",
    media: [],
    specifications: [],
    attributes: {},
    relatedProducts: [],
    variants: [],

    seo: {
        title: "",
        description: "",
        canonical: "",
    },
};

export function ProductEditor({
    id,
}) {
    const [form, setForm] =
        useState(base);



    const [meta, setMeta] =
        useState({
            categories: [],
            brands: [],
        });

    const [loading, setLoading] =
        useState(Boolean(id));

    const [saving, setSaving] =
        useState(false);

    const { toast } = useToast();

    useEffect(() => {
        let cancelled = false;

        async function loadEditorData() {
            try {
                const [
                    categoriesResponse,
                    brandsResponse,
                ] = await Promise.all([
                    fetch(
                        "/api/admin/categories"
                    ),
                    fetch(
                        "/api/admin/brands"
                    ),
                ]);

                const [
                    categoriesData,
                    brandsData,
                ] = await Promise.all([
                    categoriesResponse.json(),
                    brandsResponse.json(),
                ]);

                if (cancelled) {
                    return;
                }

                setMeta({
                    categories:
                        categoriesData.items || [],
                    brands:
                        brandsData.items || [],
                });

                if (!id) {
                    setLoading(false);
                    return;
                }

                const productResponse =
                    await fetch(
                        `/api/admin/products/${id}`
                    );

                const productData =
                    await productResponse.json();

                if (cancelled) {
                    return;
                }

                if (
                    !productResponse.ok
                ) {
                    throw new Error(
                        productData?.error ||
                        productData?.message ||
                        "Unable to load product"
                    );
                }

                if (productData.product) {
                    setForm({
                        ...base,
                        ...productData.product,

                        brand:
                            productData.product.brand
                                ? String(
                                    productData.product
                                        .brand
                                )
                                : "",

                        categories: (
                            productData.product
                                .categories || []
                        ).map(String),

                        tags: (
                            productData.product
                                .tags || []
                        ).join(", "),

                        variants:
                            productData.variants ||
                            [],
                    });
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }

                toast(
                    error?.message ||
                    "Unable to load product",
                    "error"
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadEditorData();

        return () => {
            cancelled = true;
        };
    }, [id, toast]);

    function set(key, value) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }

    async function upload(event) {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const signatureResponse =
                await fetch(
                    "/api/media/signature",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            folder:
                                "commerce/products",
                        }),
                    }
                );

            const signatureData =
                await signatureResponse.json();

            if (
                !signatureResponse.ok
            ) {
                throw new Error(
                    signatureData?.error ||
                    "Upload unavailable"
                );
            }

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "api_key",
                signatureData.apiKey
            );

            formData.append(
                "timestamp",
                String(
                    signatureData.timestamp
                )
            );

            formData.append(
                "folder",
                signatureData.folder
            );

            formData.append(
                "signature",
                signatureData.signature
            );

            const uploadResponse =
                await fetch(
                    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

            const uploadData =
                await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(
                    uploadData?.error
                        ?.message ||
                    "Upload failed"
                );
            }

            set("media", [
                ...form.media,
                {
                    type:
                        uploadData.resource_type ===
                            "video"
                            ? "video"
                            : "image",

                    url:
                        uploadData.secure_url,

                    alt:
                        form.name,

                    publicId:
                        uploadData.public_id,
                },
            ]);

            toast(
                "Media uploaded",
                "success"
            );
        } catch (error) {
            toast(
                error?.message ||
                "Upload failed",
                "error"
            );
        }
    }

    async function save(event) {
        event.preventDefault();

        setSaving(true);

        try {
            const payload = {
                ...form,

                basePrice:
                    Number(
                        form.basePrice
                    ),

                compareAtPrice:
                    form.compareAtPrice
                        ? Number(
                            form.compareAtPrice
                        )
                        : null,

                costPrice:
                    form.costPrice
                        ? Number(
                            form.costPrice
                        )
                        : null,

                stock:
                    Number(
                        form.stock
                    ),

                lowStockThreshold:
                    Number(
                        form.lowStockThreshold
                    ),

                brand:
                    form.brand || null,

                tags:
                    String(form.tags)
                        .split(",")
                        .map(
                            (item) =>
                                item.trim()
                        )
                        .filter(Boolean),
            };

            const response =
                await fetch(
                    id
                        ? `/api/admin/products/${id}`
                        : "/api/admin/products",
                    {
                        method:
                            id
                                ? "PATCH"
                                : "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                payload
                            ),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Unable to save product"
                );
            }

            toast(
                "Product saved",
                "success"
            );

            if (!id) {
                window.location.href =
                    `/admin/products/${data.product._id}`;
            }
        } catch (error) {
            toast(
                error?.message ||
                "Unable to save product",
                "error"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <form onSubmit={save}>
            <div className="form-card">
                <h2>
                    Core product
                </h2>

                <div className="form-grid">
                    <div className="field">
                        <label>
                            Name
                        </label>

                        <MuiInput
                            value={form.name}
                            onChange={event => set("name", event.target.value)}
                            required
                        />
                    </div>

                    <div className="field">
                        <label>
                            Slug
                        </label>

                        <MuiInput
                            value={form.slug}
                            onChange={event => set("slug", event.target.value)}
                            required
                        />
                    </div>

                    <div className="field">
                        <label>
                            SKU
                        </label>

                        <MuiInput
                            value={form.sku}
                            onChange={event => set("sku", event.target.value.toUpperCase())}
                            required
                        />
                    </div>

                    <div className="field">
                        <label>
                            Status
                        </label>

                        <MuiSelect
                            value={form.status}
                            onChange={(event) =>
                                set(
                                    "status",
                                    event.target.value
                                )
                            }
                        >
                            <option value="draft">
                                draft
                            </option>

                            <option value="published">
                                published
                            </option>

                            <option value="archived">
                                archived
                            </option>
                        </MuiSelect>
                    </div>

                    <div className="field full">
                        <label>
                            Short description
                        </label>

                        <MuiTextarea
                            value={
                                form.shortDescription ||
                                ""
                            }
                            onChange={(event) =>
                                set(
                                    "shortDescription",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="field full">
                        <label>
                            Description
                        </label>

                        <MuiTextarea
                            value={
                                form.description ||
                                ""
                            }
                            onChange={(event) =>
                                set(
                                    "description",
                                    event.target.value
                                )
                            }
                            style={{
                                minHeight: 180,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="form-card">
                <h2>
                    Merchandising
                </h2>

                <div className="form-grid">
                    <div className="field">
                        <label>
                            Brand
                        </label>

                        <MuiSelect
                            value={
                                form.brand || ""
                            }
                            onChange={(event) =>
                                set(
                                    "brand",
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                No brand
                            </option>

                            {meta.brands.map(
                                (brand) => (
                                    <option
                                        value={
                                            brand._id
                                        }
                                        key={
                                            brand._id
                                        }
                                    >
                                        {
                                            brand.name
                                        }
                                    </option>
                                )
                            )}
                        </MuiSelect>
                    </div>

                    <div className="field">
                        <label>
                            Categories
                        </label>

                        <MuiSelect
                            multiple
                            value={
                                form.categories ||
                                []
                            }
                            onChange={(event) =>
                                set(
                                    "categories",
                                    Array.from(
                                        event.target
                                            .selectedOptions
                                    ).map(
                                        (option) =>
                                            option.value
                                    )
                                )
                            }
                            style={{
                                minHeight: 130,
                            }}
                        >
                            {meta.categories.map(
                                (category) => (
                                    <option
                                        value={
                                            category._id
                                        }
                                        key={
                                            category._id
                                        }
                                    >
                                        {
                                            category.name
                                        }
                                    </option>
                                )
                            )}
                        </MuiSelect>
                    </div>

                    <div className="field full">
                        <label>
                            Tags (comma separated)
                        </label>

                        <MuiInput
                            value={
                                form.tags || ""
                            }
                            onChange={(event) =>
                                set(
                                    "tags",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <label>
                        <MuiInput
                            type="checkbox"
                            checked={
                                form.featured
                            }
                            onChange={(event) =>
                                set(
                                    "featured",
                                    event.target.checked
                                )
                            }
                        />

                        {" "}
                        Featured
                    </label>

                    <label>
                        <MuiInput
                            type="checkbox"
                            checked={
                                form.trending
                            }
                            onChange={(event) =>
                                set(
                                    "trending",
                                    event.target.checked
                                )
                            }
                        />

                        {" "}
                        Trending
                    </label>
                </div>
            </div>

            <div className="form-card">
                <h2>
                    Pricing & inventory
                </h2>

                <div className="form-grid">
                    <div className="field">
                        <label>
                            Currency
                        </label>

                        <MuiSelect
                            value={
                                form.currency ||
                                "USD"
                            }
                            onChange={(event) =>
                                set(
                                    "currency",
                                    event.target.value
                                )
                            }
                        >
                            {[
                                "USD",
                                "EUR",
                                "GBP",
                                "BDT",
                            ].map(
                                (currency) => (
                                    <option
                                        key={
                                            currency
                                        }
                                        value={
                                            currency
                                        }
                                    >
                                        {
                                            currency
                                        }
                                    </option>
                                )
                            )}
                        </MuiSelect>
                    </div>

                    {[
                        [
                            "basePrice",
                            "Price",
                        ],
                        [
                            "compareAtPrice",
                            "Compare-at price",
                        ],
                        [
                            "costPrice",
                            "Cost",
                        ],
                        [
                            "stock",
                            "Stock",
                        ],
                        [
                            "lowStockThreshold",
                            "Low-stock threshold",
                        ],
                    ].map(
                        ([key, label]) => (
                            <div
                                className="field"
                                key={key}
                            >
                                <label>
                                    {label}
                                </label>

                                <MuiInput
                                    type="number"
                                    step="0.01"
                                    value={
                                        form[key] ??
                                        ""
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        set(
                                            key,
                                            event.target
                                                .value
                                        )
                                    }
                                />
                            </div>
                        )
                    )}

                    <label>
                        <MuiInput
                            type="checkbox"
                            checked={
                                form.trackInventory
                            }
                            onChange={(event) =>
                                set(
                                    "trackInventory",
                                    event.target.checked
                                )
                            }
                        />

                        {" "}
                        Track inventory
                    </label>

                    <label>
                        <MuiInput
                            type="checkbox"
                            checked={
                                form.allowBackorder
                            }
                            onChange={(event) =>
                                set(
                                    "allowBackorder",
                                    event.target.checked
                                )
                            }
                        />

                        {" "}
                        Allow backorder
                    </label>
                </div>
            </div>

            <div className="form-card">
                <h2>Media</h2>

                <MuiInput
                    type="file"
                    accept="image/*,video/*"
                    onChange={upload}
                />

                <div
                    className="data-card"
                    style={{
                        marginTop: 15,
                    }}
                >
                    {form.media.map(
                        (media, index) => (
                            <div
                                className="summary-line"
                                key={`${media.url}-${index}`}
                            >
                                <span>
                                    {media.type}
                                    {" · "}
                                    {media.url}
                                </span>

                                <MuiButton
                                    type="button"
                                    className="link-button"
                                    onClick={() =>
                                        set(
                                            "media",
                                            form.media.filter(
                                                (
                                                    _,
                                                    itemIndex
                                                ) =>
                                                    itemIndex !==
                                                    index
                                            )
                                        )
                                    }
                                >
                                    Remove
                                </MuiButton>
                            </div>
                        )
                    )}
                </div>
            </div>

            <JsonField
                label="Specifications"
                value={
                    form.specifications
                }
                onChange={(value) =>
                    set(
                        "specifications",
                        value
                    )
                }
                example='[{"key":"Material","value":"Aluminium"}]'
            />

            <JsonField
                label="Attributes / filter values"
                value={
                    form.attributes ||
                    {}
                }
                onChange={(value) =>
                    set(
                        "attributes",
                        value
                    )
                }
                example='{"Color":["Black","White"],"Size":["M","L"]}'
            />

            <JsonField
                label="Related product IDs"
                value={
                    form.relatedProducts ||
                    []
                }
                onChange={(value) =>
                    set(
                        "relatedProducts",
                        value
                    )
                }
                example='["PRODUCT_OBJECT_ID"]'
            />

            <JsonField
                label="Variants"
                value={
                    form.variants
                }
                onChange={(value) =>
                    set(
                        "variants",
                        value
                    )
                }
                example='[{"name":"Black / M","sku":"SKU-BLK-M","price":99,"stock":10,"options":{"Color":"Black","Size":"M"}}]'
            />

            <div className="form-card">
                <h2>
                    Fulfilment & SEO
                </h2>

                <div className="form-grid">
                    <div className="field">
                        <label>
                            Weight
                        </label>

                        <MuiInput
                            type="number"
                            step="0.01"
                            value={
                                form.shipping
                                    ?.weight || ""
                            }
                            onChange={(event) =>
                                set(
                                    "shipping",
                                    {
                                        ...form.shipping,

                                        weight:
                                            event.target
                                                .value
                                                ? Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                                : null,
                                    }
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label>
                            Shipping class
                        </label>

                        <MuiInput
                            value={
                                form.shipping
                                    ?.class || ""
                            }
                            onChange={(event) =>
                                set(
                                    "shipping",
                                    {
                                        ...form.shipping,
                                        class:
                                            event.target
                                                .value,
                                    }
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label>
                            Width
                        </label>

                        <MuiInput
                            type="number"
                            step="0.01"
                            value={
                                form.shipping
                                    ?.width || ""
                            }
                            onChange={(event) =>
                                set(
                                    "shipping",
                                    {
                                        ...form.shipping,

                                        width:
                                            event.target
                                                .value
                                                ? Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                                : null,
                                    }
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label>
                            Height
                        </label>

                        <MuiInput
                            type="number"
                            step="0.01"
                            value={
                                form.shipping
                                    ?.height || ""
                            }
                            onChange={(event) =>
                                set(
                                    "shipping",
                                    {
                                        ...form.shipping,

                                        height:
                                            event.target
                                                .value
                                                ? Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                                : null,
                                    }
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label>
                            Length
                        </label>

                        <MuiInput
                            type="number"
                            step="0.01"
                            value={
                                form.shipping
                                    ?.length || ""
                            }
                            onChange={(event) =>
                                set(
                                    "shipping",
                                    {
                                        ...form.shipping,

                                        length:
                                            event.target
                                                .value
                                                ? Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                                : null,
                                    }
                                )
                            }
                        />
                    </div>

                    <div className="field full">
                        <label>
                            Shipping information
                        </label>

                        <MuiTextarea
                            value={
                                form.shippingInfo ||
                                ""
                            }
                            onChange={(event) =>
                                set(
                                    "shippingInfo",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="field full">
                        <label>
                            Return information
                        </label>

                        <MuiTextarea
                            value={
                                form.returnInfo ||
                                ""
                            }
                            onChange={(event) =>
                                set(
                                    "returnInfo",
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label>
                            SEO title
                        </label>

                        <MuiInput
                            value={
                                form.seo?.title ||
                                ""
                            }
                            onChange={(event) =>
                                set(
                                    "seo",
                                    {
                                        ...form.seo,
                                        title:
                                            event.target
                                                .value,
                                    }
                                )
                            }
                        />
                    </div>

                    <div className="field">
                        <label>
                            SEO description
                        </label>

                        <MuiInput
                            value={
                                form.seo
                                    ?.description ||
                                ""
                            }
                            onChange={(event) =>
                                set(
                                    "seo",
                                    {
                                        ...form.seo,
                                        description:
                                            event.target
                                                .value,
                                    }
                                )
                            }
                        />
                    </div>

                    <div className="field full">
                        <label>
                            Canonical URL
                            (optional)
                        </label>

                        <MuiInput
                            value={
                                form.seo
                                    ?.canonical ||
                                ""
                            }
                            onChange={(event) =>
                                set(
                                    "seo",
                                    {
                                        ...form.seo,
                                        canonical:
                                            event.target
                                                .value,
                                    }
                                )
                            }
                        />
                    </div>
                </div>
            </div>

            <MuiButton
                type="submit"
                className="button dark"
                disabled={saving}
            >
                {saving
                    ? "Saving…"
                    : "Save product"}
            </MuiButton>
        </form>
    );
}

function JsonField({
    label,
    value,
    onChange,
    example,
}) {
    const [text, setText] =
        useState(
            JSON.stringify(
                value || [],
                null,
                2
            )
        );

    useEffect(() => {
        setText(
            JSON.stringify(
                value || [],
                null,
                2
            )
        );
    }, [value]);

    return (
        <div className="form-card">
            <h2>{label}</h2>

            <div className="field">
                <label>
                    JSON editor · example{" "}
                    {example}
                </label>

                <MuiTextarea
                    value={text}
                    onChange={(event) =>
                        setText(
                            event.target.value
                        )
                    }
                    onBlur={() => {
                        try {
                            onChange(
                                JSON.parse(
                                    text
                                )
                            );
                        } catch { }
                    }}
                    style={{
                        minHeight: 180,
                        fontFamily:
                            "monospace",
                    }}
                />
            </div>
        </div>
    );
}