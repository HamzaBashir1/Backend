import express from "express";
import { translateAccommodation } from "../Controllers/TranslationController.js";

const router = express.Router();

// Route: GET /api/translate
router.get("/translate", translateAccommodation);

export default router;
