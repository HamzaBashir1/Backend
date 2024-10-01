import Message from "../models/messageModel.js";
import mongoose from "mongoose";

// Add a new message
export const addMessage = async (req, res) => {
  const { message, users, sender } = req.body;

  try {
    // Validate that users and sender are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(sender)) {
      return res.status(400).json({ message: "Invalid sender ID" });
    }

    users.forEach((userId) => {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: `Invalid user ID: ${userId}` });
      }
    });

    // Create the message document
    const newMessage = new Message({
      message,
      users,
      sender,
    });

    // Save to the database
    await newMessage.save();

    res.status(201).json({ message: "Message added successfully", data: newMessage });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Get messages between two users
// Backend route (GET with query params)
export const getMessages = async (req, res) => {
  const { userId1, userId2 } = req.query; // Get from query parameters

  try {
    // Validate that userId1 and userId2 are valid ObjectIds
    // if (!mongoose.Types.ObjectId.isValid(userId1) && !mongoose.Types.ObjectId.isValid(userId2)) {
    //   return res.status(400).json({ message: "Invalid user IDs" });
    // }

    // Find all messages where both users are part of the conversation
    const messages = await Message.find({
      users: { $all: [userId1, userId2] },
    }).sort({ createdAt: 1 }); // Sort by creation date (ascending)

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

