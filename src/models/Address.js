import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  label: { type: String, default: "Home" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String, default: "" },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, default: "" },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefaultShipping: { type: Boolean, default: false },
  isDefaultBilling: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.models.Address || mongoose.model("Address", schema);
