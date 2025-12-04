// backend/models/notificationEventModel.js
import mongoose from "mongoose";

const NotificationEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    notification: { type: mongoose.Schema.Types.ObjectId, ref: "Notification", index: true },
    sessionId: { type: String, index: true }, // gerado no front e guardado em sessionStorage/localStorage
    type: {
      type: String,
      enum: ["email_open", "email_click", "view", "click", "panel_open"],
      required: true,
      index: true,
    },
    path: { type: String },      // /categoria/leggings
    url: { type: String },       // URL completa quando útil
    ref: { type: String },       // referer/nid/utm quando aplicável
    meta: { type: Object },      // qualquer extra
    ua: { type: String },        // user-agent para debug
    ip: { type: String },        // opcional
    ts: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("NotificationEvent", NotificationEventSchema);
