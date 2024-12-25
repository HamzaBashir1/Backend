import express from "express";
import { deleteSupportQuery, getAllSupportQueries, getSupportQueryByEmail, getSupportQueryByTicketNumber, saveSupportQuery, updateSupportQueryMessage, updateSupportQueryStatus } from "../Controllers/SupportController.js";

const router = express.Router();

// Route for submitting a support query
router.post("/support", saveSupportQuery);

// Route to get all support queries
router.get("/support", getAllSupportQueries);

// Route to get support queries by email
router.get("/support/ticket", getSupportQueryByTicketNumber);

// Route to get support queries by email
router.get("/support/issues", getSupportQueryByEmail);

// Update support query status (e.g., resolved)
router.put("/support/status/:ticketNumber", updateSupportQueryStatus);

// Delete a support query by ticket number
router.delete("/support/:ticketNumber", deleteSupportQuery);

// Update support query message
router.put("/support/message/:ticketNumber", updateSupportQueryMessage);

export default router;
