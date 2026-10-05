import mongoose from "mongoose";
const answerSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, body: String, isStaff: Boolean, at: { type: Date, default: Date.now } }, { _id: true });
const schema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  question: { type: String, required: true, maxlength: 1000 },
  answers: [answerSchema],
  status: { type: String, enum: ["pending", "published", "hidden"], default: "pending" }
}, { timestamps: true });
export default mongoose.models.ProductQuestion || mongoose.model("ProductQuestion", schema);
