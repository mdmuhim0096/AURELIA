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


import {
    Autocomplete,
    Box,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Divider,
    FormControlLabel,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material";

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

export function ProductEditor({ id }) {
    function normalizeId(value) {
        if (!value) return "";

        if (typeof value === "object") {
            return String(
                value._id ||
                value.id ||
                ""
            );
        }

        return String(value);
    }

    function safeArray(value) {
        return Array.isArray(value)
            ? value
            : [];
    }

    function safeObject(value) {
        return value &&
            typeof value === "object" &&
            !Array.isArray(value)
            ? value
            : {};
    }

    function safeJson(value, fallback) {
        try {
            return JSON.stringify(
                value ?? fallback,
                null,
                2
            );
        } catch {
            return JSON.stringify(
                fallback,
                null,
                2
            );
        }
    }

    function optionalNumber(value) {
        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return null;
        }

        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : null;
    }

    const [form, setForm] = useState(() => ({
        ...base,

        brand: normalizeId(base.brand),

        categories: safeArray(
            base.categories
        )
            .map(normalizeId)
            .filter(Boolean),

        tags: Array.isArray(base.tags)
            ? base.tags.join(", ")
            : base.tags || "",

        media: safeArray(base.media),

        specifications: safeArray(
            base.specifications
        ),

        attributes: safeObject(
            base.attributes
        ),

        relatedProducts: safeArray(
            base.relatedProducts
        )
            .map(normalizeId)
            .filter(Boolean),

        variants: safeArray(
            base.variants
        ),

        shipping: safeObject(
            base.shipping
        ),

        seo: safeObject(
            base.seo
        ),
    }));

    const [meta, setMeta] = useState({
        categories: [],
        brands: [],
    });

    const [loading, setLoading] =
        useState(Boolean(id));

    const [saving, setSaving] =
        useState(false);

    const [uploading, setUploading] =
        useState(false);

    const [jsonDrafts, setJsonDrafts] =
        useState(() => ({
            specifications: safeJson(
                base.specifications,
                []
            ),

            attributes: safeJson(
                base.attributes,
                {}
            ),

            relatedProducts: safeJson(
                base.relatedProducts,
                []
            ),

            variants: safeJson(
                base.variants,
                []
            ),
        }));

    const [jsonErrors, setJsonErrors] =
        useState({
            specifications: "",
            attributes: "",
            relatedProducts: "",
            variants: "",
        });

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
                        "/api/admin/categories",
                        {
                            cache: "no-store",
                        }
                    ),

                    fetch(
                        "/api/admin/brands",
                        {
                            cache: "no-store",
                        }
                    ),
                ]);

                const [
                    categoriesData,
                    brandsData,
                ] = await Promise.all([
                    categoriesResponse.json(),
                    brandsResponse.json(),
                ]);

                if (
                    !categoriesResponse.ok
                ) {
                    throw new Error(
                        categoriesData?.error ||
                        categoriesData?.message ||
                        "Unable to load categories"
                    );
                }

                if (!brandsResponse.ok) {
                    throw new Error(
                        brandsData?.error ||
                        brandsData?.message ||
                        "Unable to load brands"
                    );
                }

                if (cancelled) {
                    return;
                }

                const nextMeta = {
                    categories: safeArray(
                        categoriesData.items
                    ),

                    brands: safeArray(
                        brandsData.items
                    ),
                };

                setMeta(nextMeta);

                if (!id) {
                    setLoading(false);
                    return;
                }

                const productResponse =
                    await fetch(
                        `/api/admin/products/${id}`,
                        {
                            cache: "no-store",
                        }
                    );

                const productData =
                    await productResponse.json();

                if (cancelled) {
                    return;
                }

                if (!productResponse.ok) {
                    throw new Error(
                        productData?.error ||
                        productData?.message ||
                        "Unable to load product"
                    );
                }

                if (
                    productData.product
                ) {
                    const product =
                        productData.product;

                    const nextForm = {
                        ...base,
                        ...product,

                        brand:
                            normalizeId(
                                product.brand
                            ),

                        categories:
                            safeArray(
                                product.categories
                            )
                                .map(
                                    normalizeId
                                )
                                .filter(Boolean),

                        tags:
                            Array.isArray(
                                product.tags
                            )
                                ? product.tags.join(
                                    ", "
                                )
                                : product.tags ||
                                "",

                        media:
                            safeArray(
                                product.media
                            ),

                        specifications:
                            safeArray(
                                product.specifications
                            ),

                        attributes:
                            safeObject(
                                product.attributes
                            ),

                        relatedProducts:
                            safeArray(
                                product.relatedProducts
                            )
                                .map(
                                    normalizeId
                                )
                                .filter(Boolean),

                        variants:
                            safeArray(
                                productData.variants ||
                                product.variants
                            ),

                        shipping:
                            safeObject(
                                product.shipping
                            ),

                        seo:
                            safeObject(
                                product.seo
                            ),
                    };

                    setForm(nextForm);

                    setJsonDrafts({
                        specifications:
                            safeJson(
                                nextForm.specifications,
                                []
                            ),

                        attributes:
                            safeJson(
                                nextForm.attributes,
                                {}
                            ),

                        relatedProducts:
                            safeJson(
                                nextForm.relatedProducts,
                                []
                            ),

                        variants:
                            safeJson(
                                nextForm.variants,
                                []
                            ),
                    });

                    setJsonErrors({
                        specifications: "",
                        attributes: "",
                        relatedProducts: "",
                        variants: "",
                    });
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Product editor load error:",
                    error
                );

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

    function setShipping(
        key,
        value
    ) {
        setForm((current) => ({
            ...current,

            shipping: {
                ...safeObject(
                    current.shipping
                ),

                [key]: value,
            },
        }));
    }

    function setSeo(key, value) {
        setForm((current) => ({
            ...current,

            seo: {
                ...safeObject(
                    current.seo
                ),

                [key]: value,
            },
        }));
    }

    function updateJsonField(
        key,
        text
    ) {
        setJsonDrafts(
            (current) => ({
                ...current,
                [key]: text,
            })
        );

        try {
            const parsed =
                JSON.parse(text);

            if (
                [
                    "specifications",
                    "relatedProducts",
                    "variants",
                ].includes(key) &&
                !Array.isArray(parsed)
            ) {
                throw new Error(
                    "This field must contain a JSON array."
                );
            }

            if (
                key === "attributes" &&
                (
                    !parsed ||
                    typeof parsed !==
                    "object" ||
                    Array.isArray(parsed)
                )
            ) {
                throw new Error(
                    "Attributes must contain a JSON object."
                );
            }

            set(key, parsed);

            setJsonErrors(
                (current) => ({
                    ...current,
                    [key]: "",
                })
            );
        } catch (error) {
            setJsonErrors(
                (current) => ({
                    ...current,

                    [key]:
                        error?.message ||
                        "Invalid JSON",
                })
            );
        }
    }

    async function upload(event) {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setUploading(true);

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

                        body: JSON.stringify(
                            {
                                folder:
                                    "commerce/products",
                            }
                        ),
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

            const newMedia = {
                type:
                    uploadData.resource_type ===
                        "video"
                        ? "video"
                        : "image",

                url:
                    uploadData.secure_url,

                alt:
                    form.name || "",

                publicId:
                    uploadData.public_id,
            };

            setForm((current) => ({
                ...current,

                media: [
                    ...safeArray(
                        current.media
                    ),

                    newMedia,
                ],
            }));

            toast(
                "Media uploaded",
                "success"
            );

            event.target.value = "";
        } catch (error) {
            console.error(
                "Media upload error:",
                error
            );

            toast(
                error?.message ||
                "Upload failed",
                "error"
            );
        } finally {
            setUploading(false);
        }
    }

    async function save(event) {
        event.preventDefault();

        const invalidJson =
            Object.entries(
                jsonErrors
            ).find(
                ([, message]) =>
                    Boolean(message)
            );

        if (invalidJson) {
            toast(
                `Fix invalid JSON in ${invalidJson[0]} before saving.`,
                "error"
            );

            return;
        }

        setSaving(true);

        try {
            const payload = {
                ...form,

                name:
                    String(
                        form.name || ""
                    ).trim(),

                slug:
                    String(
                        form.slug || ""
                    ).trim(),

                sku:
                    String(
                        form.sku || ""
                    )
                        .trim()
                        .toUpperCase(),

                status:
                    form.status ||
                    "draft",

                basePrice:
                    Number(
                        form.basePrice ||
                        0
                    ),

                compareAtPrice:
                    form.compareAtPrice ===
                        "" ||
                        form.compareAtPrice ===
                        null ||
                        form.compareAtPrice ===
                        undefined
                        ? null
                        : Number(
                            form.compareAtPrice
                        ),

                costPrice:
                    form.costPrice ===
                        "" ||
                        form.costPrice ===
                        null ||
                        form.costPrice ===
                        undefined
                        ? null
                        : Number(
                            form.costPrice
                        ),

                stock:
                    Number(
                        form.stock || 0
                    ),

                lowStockThreshold:
                    Number(
                        form.lowStockThreshold ||
                        0
                    ),

                brand:
                    normalizeId(
                        form.brand
                    ) || null,

                categories:
                    safeArray(
                        form.categories
                    )
                        .map(
                            normalizeId
                        )
                        .filter(Boolean),

                tags:
                    String(
                        form.tags || ""
                    )
                        .split(",")
                        .map(
                            (item) =>
                                item.trim()
                        )
                        .filter(Boolean),

                media:
                    safeArray(
                        form.media
                    ),

                specifications:
                    safeArray(
                        form.specifications
                    ),

                attributes:
                    safeObject(
                        form.attributes
                    ),

                relatedProducts:
                    safeArray(
                        form.relatedProducts
                    )
                        .map(
                            normalizeId
                        )
                        .filter(Boolean),

                variants:
                    safeArray(
                        form.variants
                    ),

                featured:
                    Boolean(
                        form.featured
                    ),

                trending:
                    Boolean(
                        form.trending
                    ),

                trackInventory:
                    Boolean(
                        form.trackInventory
                    ),

                allowBackorder:
                    Boolean(
                        form.allowBackorder
                    ),

                shipping: {
                    ...safeObject(
                        form.shipping
                    ),

                    weight:
                        optionalNumber(
                            form.shipping
                                ?.weight
                        ),

                    width:
                        optionalNumber(
                            form.shipping
                                ?.width
                        ),

                    height:
                        optionalNumber(
                            form.shipping
                                ?.height
                        ),

                    length:
                        optionalNumber(
                            form.shipping
                                ?.length
                        ),

                    class:
                        form.shipping
                            ?.class ||
                        "",
                },

                seo: {
                    ...safeObject(
                        form.seo
                    ),

                    title:
                        form.seo?.title ||
                        "",

                    description:
                        form.seo
                            ?.description ||
                        "",

                    canonical:
                        form.seo
                            ?.canonical ||
                        "",
                },
            };

            const response =
                await fetch(
                    id
                        ? `/api/admin/products/${id}`
                        : "/api/admin/products",
                    {
                        method: id
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

            if (
                !id &&
                data?.product?._id
            ) {
                window.location.href =
                    `/admin/products/${data.product._id}`;
            }
        } catch (error) {
            console.error(
                "Product save error:",
                error
            );

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
        return (
            <Box
                sx={{
                    minHeight: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "center",
                }}
            >
                <Stack
                    spacing={2}
                    alignItems="center"
                >
                    <CircularProgress />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Loading product...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    const categoryOptions =
        safeArray(
            meta.categories
        ).map((category) =>
            String(category._id)
        );

    const categoryNames =
        new Map(
            safeArray(
                meta.categories
            ).map((category) => [
                String(
                    category._id
                ),

                category.name ||
                String(
                    category._id
                ),
            ])
        );

    const selectedCategories =
        safeArray(
            form.categories
        )
            .map(String)
            .filter((categoryId) =>
                categoryOptions.includes(
                    categoryId
                )
            );

    const formGrid = {
        display: "grid",

        gridTemplateColumns: {
            xs: "1fr",
            md:
                "repeat(2, minmax(0, 1fr))",
        },

        gap: 2,
    };

    const fullWidthField = {
        gridColumn: {
            xs: "auto",
            md: "1 / -1",
        },
    };

    return (
        <Box
            component="form"
            onSubmit={save}
            sx={{
                display: "grid",
                gap: 3,
                width: "100%",
            }}
        >
            {/* Core Product */}

            <Card
                variant="outlined"
                sx={{
                    borderRadius: 1,
                }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Core product
                        </Typography>

                        <Divider />

                        <Box sx={formGrid}>
                            <MuiInput
                                label="Name"
                                value={
                                    form.name ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "name",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                                fullWidth
                            />

                            <MuiInput
                                label="Slug"
                                value={
                                    form.slug ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "slug",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                                fullWidth
                            />

                            <MuiInput
                                label="SKU"
                                value={
                                    form.sku ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "sku",
                                        event.target.value.toUpperCase()
                                    )
                                }
                                required
                                fullWidth
                            />

                            <MuiInput
                                select
                                label="Status"
                                value={
                                    form.status ||
                                    "draft"
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "status",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                            >
                                <MenuItem value="draft">
                                    Draft
                                </MenuItem>

                                <MenuItem value="published">
                                    Published
                                </MenuItem>

                                <MenuItem value="archived">
                                    Archived
                                </MenuItem>
                            </MuiInput>

                            <MuiInput
                                label="Short description"
                                value={
                                    form.shortDescription ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "shortDescription",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                multiline
                                minRows={3}
                                fullWidth
                                sx={
                                    fullWidthField
                                }
                            />

                            <MuiInput
                                label="Description"
                                value={
                                    form.description ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "description",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                multiline
                                minRows={7}
                                fullWidth
                                sx={
                                    fullWidthField
                                }
                            />
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Merchandising */}

            <Card
                variant="outlined"
                sx={{
                    borderRadius: 1,
                }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Merchandising
                        </Typography>

                        <Divider />

                        <Box sx={formGrid}>
                            <MuiInput
                                select
                                label="Brand"
                                value={
                                    form.brand ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "brand",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                            >
                                <MenuItem value="">
                                    No brand
                                </MenuItem>

                                {safeArray(
                                    meta.brands
                                ).map(
                                    (
                                        brand
                                    ) => (
                                        <MenuItem
                                            key={String(
                                                brand._id
                                            )}
                                            value={String(
                                                brand._id
                                            )}
                                        >
                                            {
                                                brand.name
                                            }
                                        </MenuItem>
                                    )
                                )}
                            </MuiInput>

                            <Autocomplete
                                multiple
                                filterSelectedOptions
                                disableCloseOnSelect
                                options={
                                    categoryOptions
                                }
                                value={
                                    selectedCategories
                                }
                                getOptionLabel={(
                                    option
                                ) =>
                                    categoryNames.get(
                                        String(
                                            option
                                        )
                                    ) ||
                                    String(
                                        option
                                    )
                                }
                                isOptionEqualToValue={(
                                    option,
                                    value
                                ) =>
                                    String(
                                        option
                                    ) ===
                                    String(
                                        value
                                    )
                                }
                                onChange={(
                                    _event,
                                    values
                                ) => {
                                    set(
                                        "categories",
                                        safeArray(
                                            values
                                        ).map(
                                            String
                                        )
                                    );
                                }}
                                renderInput={(
                                    params
                                ) => (
                                    <MuiInput
                                        {...params}
                                        label="Categories"
                                        placeholder="Select categories"
                                        fullWidth
                                    />
                                )}
                                fullWidth
                            />

                            <MuiInput
                                label="Tags (comma separated)"
                                value={
                                    form.tags ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "tags",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                                sx={
                                    fullWidthField
                                }
                            />

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={2}
                                sx={
                                    fullWidthField
                                }
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={Boolean(
                                                form.featured
                                            )}
                                            onChange={(
                                                event
                                            ) =>
                                                set(
                                                    "featured",
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Featured"
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={Boolean(
                                                form.trending
                                            )}
                                            onChange={(
                                                event
                                            ) =>
                                                set(
                                                    "trending",
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Trending"
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Pricing */}

            <Card
                variant="outlined"
                sx={{
                    borderRadius: 1,
                }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Pricing & inventory
                        </Typography>

                        <Divider />

                        <Box sx={formGrid}>
                            <MuiInput
                                select
                                label="Currency"
                                value={
                                    form.currency ||
                                    "USD"
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "currency",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                            >
                                {[
                                    "USD",
                                    "EUR",
                                    "GBP",
                                    "BDT",
                                ].map(
                                    (
                                        currency
                                    ) => (
                                        <MenuItem
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
                                        </MenuItem>
                                    )
                                )}
                            </MuiInput>

                            <MuiInput
                                label="Price"
                                type="number"
                                value={
                                    form.basePrice ??
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "basePrice",
                                        event
                                            .target
                                            .value
                                    )
                                }

                                required
                                fullWidth
                            />

                            <MuiInput
                                label="Compare-at price"
                                type="number"
                                value={
                                    form.compareAtPrice ??
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "compareAtPrice",
                                        event
                                            .target
                                            .value
                                    )
                                }

                                fullWidth
                            />

                            <MuiInput
                                label="Cost"
                                type="number"
                                value={
                                    form.costPrice ??
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "costPrice",
                                        event
                                            .target
                                            .value
                                    )
                                }


                            />

                            <MuiInput
                                label="Stock"
                                type="number"
                                value={
                                    form.stock ??
                                    0
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "stock",
                                        event
                                            .target
                                            .value
                                    )
                                }

                            />

                            <MuiInput
                                label="Low-stock threshold"
                                type="number"
                                value={
                                    form.lowStockThreshold ??
                                    5
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "lowStockThreshold",
                                        event
                                            .target
                                            .value
                                    )
                                }

                            />

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={2}
                                sx={
                                    fullWidthField
                                }
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={Boolean(
                                                form.trackInventory
                                            )}
                                            onChange={(
                                                event
                                            ) =>
                                                set(
                                                    "trackInventory",
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Track inventory"
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={Boolean(
                                                form.allowBackorder
                                            )}
                                            onChange={(
                                                event
                                            ) =>
                                                set(
                                                    "allowBackorder",
                                                    event
                                                        .target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Allow backorder"
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Media */}

            <Card
                variant="outlined"
                sx={{
                    borderRadius: 1,
                }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Media
                        </Typography>

                        <Divider />

                        <MuiInput
                            type="file"
                            fullWidth
                            onChange={upload}

                            disabled={
                                uploading
                            }

                        />

                        {uploading && (
                            <CircularProgress
                                size={24}
                            />
                        )}

                        {safeArray(
                            form.media
                        ).length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                No media uploaded.
                            </Typography>
                        ) : (
                            <Stack spacing={1.5}>
                                {safeArray(
                                    form.media
                                ).map(
                                    (
                                        media,
                                        index
                                    ) => (
                                        <Card
                                            key={`${media.url}-${index}`}
                                            variant="outlined"
                                        >
                                            <CardContent
                                                sx={{
                                                    "&:last-child":
                                                    {
                                                        pb: 2,
                                                    },
                                                }}
                                            >
                                                <Stack
                                                    direction={{
                                                        xs: "column",
                                                        md: "row",
                                                    }}
                                                    spacing={
                                                        2
                                                    }
                                                    alignItems={{
                                                        xs: "stretch",
                                                        md: "center",
                                                    }}
                                                    justifyContent="space-between"
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth:
                                                                0,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={
                                                                700
                                                            }
                                                        >
                                                            {media.type ||
                                                                "media"}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                overflowWrap:
                                                                    "anywhere",
                                                            }}
                                                        >
                                                            {media.url}
                                                        </Typography>
                                                    </Box>

                                                    <Button
                                                        type="button"
                                                        color="error"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            setForm(
                                                                (
                                                                    current
                                                                ) => ({
                                                                    ...current,

                                                                    media:
                                                                        safeArray(
                                                                            current.media
                                                                        ).filter(
                                                                            (
                                                                                _,
                                                                                itemIndex
                                                                            ) =>
                                                                                itemIndex !==
                                                                                index
                                                                        ),
                                                                })
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    )
                                )}
                            </Stack>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Structured Data */}

            <Card
                variant="outlined"
                sx={{
                    borderRadius: 1,
                }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Structured product data
                        </Typography>

                        <Divider />

                        <MuiInput
                            label="Specifications"
                            value={
                                jsonDrafts.specifications
                            }
                            onChange={(
                                event
                            ) =>
                                updateJsonField(
                                    "specifications",
                                    event
                                        .target
                                        .value
                                )
                            }
                            error={Boolean(
                                jsonErrors.specifications
                            )}

                            multiline
                            minRows={6}

                        />

                        <MuiInput
                            label="Attributes / filter values"
                            value={
                                jsonDrafts.attributes
                            }
                            onChange={(
                                event
                            ) =>
                                updateJsonField(
                                    "attributes",
                                    event
                                        .target
                                        .value
                                )
                            }
                            error={Boolean(
                                jsonErrors.attributes
                            )}

                            multiline
                            minRows={6}

                        />

                        <MuiInput
                            label="Related product IDs"
                            value={
                                jsonDrafts.relatedProducts
                            }
                            onChange={(
                                event
                            ) =>
                                updateJsonField(
                                    "relatedProducts",
                                    event
                                        .target
                                        .value
                                )
                            }
                            error={Boolean(
                                jsonErrors.relatedProducts
                            )}

                            multiline
                            minRows={5}

                        />

                        <MuiInput
                            label="Variants"
                            value={
                                jsonDrafts.variants
                            }
                            onChange={(
                                event
                            ) =>
                                updateJsonField(
                                    "variants",
                                    event
                                        .target
                                        .value
                                )
                            }
                            error={Boolean(
                                jsonErrors.variants
                            )}

                            multiline
                            minRows={7}

                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* Fulfilment & SEO */}

            <Card
                variant="outlined"
                sx={{
                    borderRadius: 1,
                }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Fulfilment & SEO
                        </Typography>

                        <Divider />

                        <Box sx={formGrid}>
                            <MuiInput
                                label="Weight"
                                type="number"
                                value={
                                    form.shipping
                                        ?.weight ??
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    setShipping(
                                        "weight",
                                        event
                                            .target
                                            .value
                                    )
                                }

                            />

                            <MuiInput
                                label="Shipping class"
                                value={
                                    form.shipping
                                        ?.class ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    setShipping(
                                        "class",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                            />

                            <MuiInput
                                label="Width"
                                type="number"
                                value={
                                    form.shipping
                                        ?.width ??
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    setShipping(
                                        "width",
                                        event
                                            .target
                                            .value
                                    )
                                }

                            />

                            <MuiInput
                                label="Height"
                                type="number"
                                value={
                                    form.shipping
                                        ?.height ??
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    setShipping(
                                        "height",
                                        event
                                            .target
                                            .value
                                    )
                                }

                            />

                            <MuiInput
                                label="Length"
                                type="number"
                                value={
                                    form.shipping
                                        ?.length ??
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    setShipping(
                                        "length",
                                        event
                                            .target
                                            .value
                                    )
                                }

                            />

                            <MuiInput
                                label="Shipping information"
                                value={
                                    form.shippingInfo ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "shippingInfo",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                multiline
                                minRows={4}
                                fullWidth
                                sx={
                                    fullWidthField
                                }
                            />

                            <MuiInput
                                label="Return information"
                                value={
                                    form.returnInfo ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    set(
                                        "returnInfo",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                multiline
                                minRows={4}
                                fullWidth
                                sx={
                                    fullWidthField
                                }
                            />

                            <MuiInput
                                label="SEO title"
                                value={
                                    form.seo
                                        ?.title ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSeo(
                                        "title",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                            />

                            <MuiInput
                                label="SEO description"
                                value={
                                    form.seo
                                        ?.description ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSeo(
                                        "description",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                            />

                            <MuiInput
                                label="Canonical URL (optional)"
                                value={
                                    form.seo
                                        ?.canonical ||
                                    ""
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSeo(
                                        "canonical",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                fullWidth
                                sx={
                                    fullWidthField
                                }
                            />
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Box>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={
                        saving ||
                        uploading
                    }
                    startIcon={
                        saving ? (
                            <CircularProgress
                                size={18}
                                color="inherit"
                            />
                        ) : null
                    }
                >
                    {saving
                        ? "Saving..."
                        : "Save product"}
                </Button>
            </Box>
        </Box>
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