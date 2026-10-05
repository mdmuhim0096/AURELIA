import mongoose from "mongoose";
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  guestId: { type: String, default: null, index: true },
  query: { type: String, required: true },
  resultCount: { type: Number, default: 0 }
}, { timestamps: true });
schema.index({ user: 1, createdAt: -1 });
schema.index({ guestId: 1, createdAt: -1 });
export default mongoose.models.SearchHistory || mongoose.model("SearchHistory", schema);
