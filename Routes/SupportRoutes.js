import express from "express";
import { saveSupportQuery } from "../Controllers/SupportController.js";

const router = express.Router();

// Route for submitting a support query
router.post("/support", saveSupportQuery);

export default router;
