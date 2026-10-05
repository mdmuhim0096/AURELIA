import mongoose from "mongoose";
import { ORDER_STATUSES } from "../lib/constants.js";
const addressSchema = new mongoose.Schema({ firstName: String, lastName: String, company: String, phone: String, line1: String, line2: String, city: String, state: String, postalCode: String, country: String }, { _id: false });
const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant", default: null },
  name: String, sku: String, options: { type: Map, of: String, default: {} }, image: String,
  unitPrice: Number, quantity: Number, subtotal: Number
}, { _id: false });
const timelineSchema = new mongoose.Schema({ status: String, note: String, at: { type: Date, default: Date.now }, actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null } }, { _id: false });
const schema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  guestEmail: { type: String, default: "", index: true },
  items: [itemSchema],
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  shippingMethod: { id: String, name: String, amount: Number },
  currency: { type: String, default: "USD" },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String, default: "" },
  status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
  paymentStatus: { type: String, default: "pending", index: true },
  paymentProvider: { type: String, default: "" },
  notes: { type: String, default: "" },
  timeline: [timelineSchema],
  estimatedDelivery: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  idempotencyKey: { type: String, default: null, unique: true, sparse: true }
}, { timestamps: true });
schema.index({ user: 1, createdAt: -1 });
schema.index({ status: 1, createdAt: -1 });
export default mongoose.models.Order || mongoose.model("Order", schema);
