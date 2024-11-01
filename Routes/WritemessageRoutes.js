import express from "express";
import {
  createMessage,
  getAllMessages,
  getMessageById,
  deleteMessageById,
} from "../Controllers/WritemessagesController.js";

const router = express.Router();

// Route to create a new message
router.post("/create", createMessage);

// Route to get all messages
router.get("/", getAllMessages);

// Route to get a specific message by ID
router.get("/:id", getMessageById);

// Route to delete a message by ID
router.delete("/:id", deleteMessageById);

export default router;
