"use client";
import { MuiButton } from "@/components/ui/MuiFormControls";
import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";
import { useToast } from "@/components/providers/ToastProvider";
export default function WishlistButton({ productId, compact = false }) { const { toast } = useToast(); async function add() { const r = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) }); if (r.status === 401) { window.location.href = "/login?callbackUrl=/wishlist"; return; } const d = await r.json(); toast(r.ok ? "Saved to wishlist" : d.error || "Unable to save", r.ok ? "success" : "error"); } return <MuiButton onClick={add} className={compact ? "option-button" : "button ghost"}><FavoriteBorderRounded fontSize="small" />{compact ? "" : "Wishlist"}</MuiButton>; }
