import express from "express";
import {
  getComments,
  upsertComment,
  requireAuth,
  requireAdmin,
  getCommentsOverview,
  getCommentsByUser,
  adminUpdateComment,
  adminDeleteComment,
  adminReplyComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/:productId", getComments);
router.post("/:productId", requireAuth, upsertComment);

router.get("/admin/overview/all", getCommentsOverview);
router.get("/by-user/:userId", getCommentsByUser);

router.patch("/admin/:commentId", requireAdmin, adminUpdateComment);
router.delete("/admin/:commentId", requireAdmin, adminDeleteComment);
router.post("/admin/:commentId/reply", requireAdmin, adminReplyComment);

export default router;
