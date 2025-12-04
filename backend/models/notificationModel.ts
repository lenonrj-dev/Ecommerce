import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: String, default: "Marima Oficial" },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    type: { type: String, enum: ["tip", "promo", "system"], default: "tip", index: true },
    icon: { type: String, default: "lightbulb" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    link: { type: String, default: "" },
    readAt: { type: Date, default: null, index: true },
    // backend/models/notificationModel.js (apenas acrescente os campos)
openCount: { type: Number, default: 0 },
clickCount: { type: Number, default: 0 },
campaignId: { type: mongoose.Schema.Types.ObjectId, index: true }, // para agrupar a campanha
audience: { type: String, enum: ["global", "list", "single"], default: "list", index: true },

  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
