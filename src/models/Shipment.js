import mongoose from "mongoose";
const schema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
  provider: { type: String, required: true },
  trackingNumber: { type: String, required: true, index: true },
  trackingUrl: { type: String, default: "" },
  status: { type: String, default: "pending", index: true },
  estimatedDelivery: { type: Date, default: null },
  events: [{ status: String, location: String, message: String, at: Date }]
}, { timestamps: true });
export default mongoose.models.Shipment || mongoose.model("Shipment", schema);
