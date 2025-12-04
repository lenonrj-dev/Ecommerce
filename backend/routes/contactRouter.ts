import express from "express";
import { contactForm } from "../controllers/contactController.js";

const router = express.Router();

// Envia somente JSON; sem upload/anexo
router.post("/", contactForm);

export default router;
