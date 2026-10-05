"use client";
import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import ProductCard from "@/components/storefront/ProductCard";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
export default function WishlistClient() {
  const [items, setItems] = useState(null);
  useEffect(() => { let cancelled = false; fetch("/api/wishlist").then(async (r) => { if (r.status === 401) { location.href = "/login?callbackUrl=/wishlist"; return null; } return r.json(); }).then((d) => { if (!cancelled && d) setItems(d.items || []); }); return () => { cancelled = true; }; }, []);
  if (!items) return <Loading label="Loading wishlist" />;
  if (!items.length) return <EmptyState title="Your wishlist is empty." description="Save products from any product page and they will stay here." />;
  return <Grid container spacing={2}>{items.map((p) => <Grid key={String(p._id)} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}><ProductCard product={p} /></Grid>)}</Grid>;
}
