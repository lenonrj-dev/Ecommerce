import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/chat/flow
router.get("/flow", (req, res) => {
  try {
    const flowPath = path.join(__dirname, "..", "config", "chatFlow.json");
    const raw = fs.readFileSync(flowPath, "utf-8");
    const json = JSON.parse(raw);
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: "Não foi possível carregar o fluxo." });
  }
});

export default router;
