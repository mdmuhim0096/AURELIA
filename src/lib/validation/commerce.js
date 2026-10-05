import { z } from "zod";
export const cartItemSchema = z.object({ productId: z.string().min(12), variantId: z.string().min(12).nullable().optional(), quantity: z.number().int().min(1).max(99).default(1) });
export const cartUpdateSchema = z.object({ itemId: z.string().min(12), quantity: z.number().int().min(0).max(99), savedForLater: z.boolean().optional() });
export const couponSchema = z.object({ code: z.string().trim().min(2).max(50).transform((v) => v.toUpperCase()) });
export const addressSchema = z.object({ firstName: z.string().min(1), lastName: z.string().min(1), company: z.string().optional().default(""), phone: z.string().min(5), line1: z.string().min(3), line2: z.string().optional().default(""), city: z.string().min(1), state: z.string().optional().default(""), postalCode: z.string().min(1), country: z.string().min(2) });
export const checkoutSchema = z.object({
  email: z.string().email(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  billingSameAsShipping: z.boolean().optional().default(true),
  shippingMethodId: z.string().default("standard"),
  paymentProvider: z.enum(["stripe", "paypal", "alipay", "payoneer", "wallet"]),
  notes: z.string().max(1000).optional().default(""),
  idempotencyKey: z.string().min(8).max(200)
});
export const reviewSchema = z.object({ productId: z.string().min(12), orderId: z.string().min(12).optional(), rating: z.number().int().min(1).max(5), title: z.string().max(120).optional().default(""), body: z.string().min(3).max(4000), media: z.array(z.object({ type: z.enum(["image", "video"]), url: z.string().url() })).max(6).optional().default([]) });
export const ticketSchema = z.object({ subject: z.string().min(3).max(200), category: z.string().max(60).default("general"), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"), message: z.string().min(2).max(5000) });
export const messageSchema = z.object({ body: z.string().max(5000).optional().default(""), attachments: z.array(z.object({ name: z.string(), url: z.string().url(), type: z.string(), size: z.number().nonnegative() })).max(5).optional().default([]) }).refine((v) => v.body.trim() || v.attachments.length, "Message cannot be empty");
