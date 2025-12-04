import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema(
  {
    author: { type: String, default: "Marima Oficial" },
    content: { type: String, required: true, trim: true },
  },
  { _id: false, timestamps: true }
);

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, default: "" },
    content: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
    reply: { type: ReplySchema, default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
