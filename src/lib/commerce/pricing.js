import Coupon from "@/models/Coupon";
import { roundMoney } from "@/lib/commerce/money";

export const SHIPPING_METHODS = [
  { id: "standard", name: "Standard delivery", amount: Number(process.env.SHIPPING_STANDARD || 7.95), estimatedDays: "4–7 business days" },
  { id: "express", name: "Express delivery", amount: Number(process.env.SHIPPING_EXPRESS || 16.95), estimatedDays: "1–3 business days" }
];

export async function resolveCoupon(code, subtotal) {
  if (!code) return { discount: 0, freeShipping: false, coupon: null };
  const now = new Date();
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), active: true }).lean();
  if (!coupon || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now) || subtotal < coupon.minSubtotal || (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit)) return { discount: 0, freeShipping: false, coupon: null };
  if (coupon.type === "free_shipping") return { discount: 0, freeShipping: true, coupon };
  let discount = coupon.type === "percent" ? subtotal * (coupon.value / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  return { discount: roundMoney(Math.min(subtotal, discount)), freeShipping: false, coupon };
}

export async function calculateTotals({ items, couponCode = "", shippingMethodId = "standard" }) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.quantity), 0));
  const coupon = await resolveCoupon(couponCode, subtotal);
  const shippingMethod = SHIPPING_METHODS.find((method) => method.id === shippingMethodId) || SHIPPING_METHODS[0];
  const shipping = coupon.freeShipping || subtotal >= Number(process.env.FREE_SHIPPING_THRESHOLD || 100) ? 0 : shippingMethod.amount;
  const taxable = Math.max(0, subtotal - coupon.discount + shipping);
  const tax = roundMoney(taxable * (Number(process.env.DEFAULT_TAX_RATE || 0) / 100));
  const total = roundMoney(subtotal - coupon.discount + shipping + tax);
  return { subtotal, discount: coupon.discount, shipping: roundMoney(shipping), tax, total, coupon: coupon.coupon, shippingMethod: { ...shippingMethod, amount: roundMoney(shipping) } };
}
