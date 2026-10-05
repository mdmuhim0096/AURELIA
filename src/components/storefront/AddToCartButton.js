"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
import { useToast } from "@/components/providers/ToastProvider";
import { useUiStore } from "@/store/ui";

export default function AddToCartButton({ productId, variantId = null, quantity = 1, className, buyNow = false, fullWidth = false, size = "medium" }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const setCartCount = useUiStore((s) => s.setCartCount);
  async function add() {
    setLoading(true);
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, variantId, quantity }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to add product");
      setCartCount((data.cart?.items || []).reduce((n, item) => n + item.quantity, 0));
      toast("Added to cart", "success");
      if (buyNow) window.location.href = "/checkout";
    } catch (error) { toast(error.message, "error"); }
    finally { setLoading(false); }
  }
  return <Button fullWidth={fullWidth} size={size} variant="contained" disabled={loading} onClick={add} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ShoppingBagOutlined fontSize="small" />}>{loading ? "Adding…" : buyNow ? "Buy now" : "Add to cart"}</Button>;
}
