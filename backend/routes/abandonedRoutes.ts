// backend/routes/abandonedRoutes.js
import { Router } from "express";
import { track } from "../controllers/abandonedController.js";

const router = Router();

// POST /api/abandoned/track
router.post("/track", track);

export default router;
