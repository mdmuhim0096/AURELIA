import crypto from "node:crypto";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import ProductVariant from "@/models/ProductVariant";
import { calculateTotals } from "@/lib/commerce/pricing";
import { activeFlashSales, discountedPrice, matchingFlashSale } from "@/lib/commerce/promotions";

export async function findCart({ userId = null, guestId = null, create = false }) {
  await connectDB();
  let cart = userId ? await Cart.findOne({ user: userId }) : guestId ? await Cart.findOne({ guestId, user: null }) : null;
  if (!cart && create) cart = await Cart.create({ user: userId, guestId: userId ? null : guestId || crypto.randomUUID(), items: [] });
  return cart;
}

export async function mergeGuestCart(userId, guestId) {
  if (!userId || !guestId) return null;
  await connectDB();
  const [userCart, guestCart] = await Promise.all([Cart.findOne({ user: userId }), Cart.findOne({ guestId, user: null })]);
  if (!guestCart) return userCart;
  const target = userCart || await Cart.create({ user: userId, items: [] });
  for (const guestItem of guestCart.items) {
    const match = target.items.find((item) => String(item.product) === String(guestItem.product) && String(item.variant || "") === String(guestItem.variant || "") && item.savedForLater === guestItem.savedForLater);
    if (match) match.quantity = Math.min(99, match.quantity + guestItem.quantity);
    else target.items.push({ product: guestItem.product, variant: guestItem.variant, quantity: guestItem.quantity, savedForLater: guestItem.savedForLater });
  }
  if (!target.couponCode && guestCart.couponCode) target.couponCode = guestCart.couponCode;
  await target.save();
  await guestCart.deleteOne();
  return target;
}

export async function mutateCart(cart, { productId, variantId = null, quantity = 1 }) {
  const product = await Product.findOne({ _id: productId, status: "published" });
  if (!product) throw Object.assign(new Error("Product not found"), { status: 404 });
  let variant = null;
  if (variantId) {
    variant = await ProductVariant.findOne({ _id: variantId, product: productId, active: true });
    if (!variant) throw Object.assign(new Error("Product variant not found"), { status: 404 });
  }
  const availableStock = variant ? variant.stock : product.stock;
  if (product.trackInventory && !product.allowBackorder && availableStock < quantity) throw Object.assign(new Error("Requested quantity is not available"), { status: 409 });
  const existing = cart.items.find((item) => String(item.product) === String(productId) && String(item.variant || "") === String(variantId || "") && !item.savedForLater);
  if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
  else cart.items.push({ product: productId, variant: variantId, quantity, savedForLater: false });
  await cart.save();
  return cart;
}

export async function hydrateCart(cart, shippingMethodId = "standard") {
  if (!cart) return { id: null, items: [], savedItems: [], couponCode: "", totals: await calculateTotals({ items: [], shippingMethodId }) };
  await cart.populate([{ path: "items.product", select: "name slug sku basePrice compareAtPrice stock trackInventory allowBackorder media status currency categories" }, { path: "items.variant", select: "name sku price compareAtPrice stock image options active" }]);
  const campaigns = await activeFlashSales();
  const toItem = (item) => {
    const p = item.product;
    const v = item.variant;
    if (!p || p.status !== "published") return null;
    const baseUnitPrice = Number(v?.price ?? p.basePrice);
    const campaign = matchingFlashSale(p, campaigns);
    const unitPrice = discountedPrice(baseUnitPrice, campaign);
    return {
      id: String(item._id), productId: String(p._id), variantId: v?._id ? String(v._id) : null,
      name: p.name, slug: p.slug, sku: v?.sku || p.sku, image: v?.image || p.media?.[0]?.url || "",
      options: v?.options ? Object.fromEntries(v.options) : {}, quantity: item.quantity, unitPrice,
      compareAtPrice: unitPrice < baseUnitPrice ? Math.max(baseUnitPrice, Number(v?.compareAtPrice ?? p.compareAtPrice ?? 0)) : Number(v?.compareAtPrice ?? p.compareAtPrice ?? 0) || null,
      promotion: campaign ? { id: String(campaign._id), label: campaign.metadata?.label || campaign.subject || "Flash sale" } : null,
      stock: Number(v?.stock ?? p.stock), available: !p.trackInventory || p.allowBackorder || Number(v?.stock ?? p.stock) >= item.quantity,
      savedForLater: item.savedForLater, currency: p.currency || "USD"
    };
  };
  const all = cart.items.map(toItem).filter(Boolean);
  const items = all.filter((item) => !item.savedForLater);
  const totals = await calculateTotals({ items, couponCode: cart.couponCode, shippingMethodId });
  return { id: String(cart._id), items, savedItems: all.filter((item) => item.savedForLater), couponCode: cart.couponCode || "", currency: cart.currency, totals };
}
