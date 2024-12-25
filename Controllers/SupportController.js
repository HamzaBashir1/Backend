import Support from "../models/Support.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Save Support Query and Send Email
export const saveSupportQuery = async (req, res) => {
  const { fullName, email, message } = req.body;

  try {
    // Generate a unique ticket number
    const ticketNumber = `TICKET-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Save to database
    const newSupport = new Support({ fullName, email, message, ticketNumber });
    await newSupport.save();

    // Create transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sharjeelsohail279@gmail.com", // Replace with your email
        pass: "iyip nosn bwem gwer", // Replace with your email password or app password
      },
    });

    // Email to admin/support
    const mailOptionsToAdmin = {
      from: email,
      to: "hamzabashir02001@gmail.com", // Replace with the admin's email
      subject: `Help Support Query from ${fullName}`,
      text: `Name: ${fullName}\nEmail: ${email}\nMessage: ${message}\nTicket #: ${ticketNumber}`,
    };

    // Email to sender (user)
    const mailOptionsToSender = {
      from: "sharjeelsohail279@gmail.com", // Replace with your support email
      to: email, // Send email to the user
      subject: "Support Query Received",
      text: `Dear ${fullName},\n\nThank you for contacting us. We have received your support query.\nYour Ticket #: ${ticketNumber}\n\nOur team will get back to you shortly.\n\nYour message:\n${message}`,
    };

    // Send both emails
    await transporter.sendMail(mailOptionsToAdmin);
    await transporter.sendMail(mailOptionsToSender);

    res.status(200).json({ message: "Query submitted successfully!", ticketNumber });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: `Something went wrong. ${error.message}` });
  }
};

// Get All Support Queries
export const getAllSupportQueries = async (req, res) => {
  try {
    // Fetch all support queries
    const supportQueries = await Support.find();

    // Check if there are any support queries
    if (!supportQueries || supportQueries.length === 0) {
      return res.status(404).json({ error: "No support queries found." });
    }

    res.status(200).json(supportQueries);
  } catch (error) {
    console.error("Error fetching all support queries:", error);
    res.status(500).json({ error: "An error occurred while fetching all support queries." });
  }
};

// Get Support Query by Ticket Number
export const getSupportQueryByTicketNumber = async (req, res) => {
  const { ticketNumber } = req.query;

  try {
    // Check if ticketNumber is provided
    if (!ticketNumber) {
      return res.status(400).json({ error: "Ticket number is required." });
    }

    // Search for the support query by ticketNumber
    const supportQuery = await Support.findOne({ ticketNumber });

    // Check if the support query is found
    if (!supportQuery) {
      return res.status(404).json({ error: "No support query found for this ticket number." });
    }

    res.status(200).json(supportQuery);
  } catch (error) {
    console.error("Error fetching support query:", error);
    res.status(500).json({ error: "An error occurred while fetching the support query." });
  }
};

// Get Support Query by Email
export const getSupportQueryByEmail = async (req, res) => {
  const { email } = req.query;

  try {
    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Use a case-insensitive regular expression to search for the email
    const supportQueries = await Support.find({
      email: { $regex: new RegExp(`^${email}$`, "i") }, // Case-insensitive search
    });

    // Check if support queries are found
    if (supportQueries.length === 0) {
      return res.status(404).json({ error: "No support queries found for this email." });
    }

    res.status(200).json(supportQueries);
  } catch (error) {
    console.error("Error fetching support queries:", error);
    res.status(500).json({ error: "An error occurred while fetching the support queries." });
  }
};

// Update Support Query (e.g., update message or other details)
// Update Support Query Status (e.g., resolved)
export const updateSupportQueryStatus = async (req, res) => {
  const { ticketNumber } = req.params;
  const { status } = req.body;

  try {
    // Validate status
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    // Find and update the support query by ticketNumber
    const updatedSupport = await Support.findOneAndUpdate(
      { ticketNumber },
      { status },
      { new: true }
    );

    // If no support query is found
    if (!updatedSupport) {
      return res.status(404).json({ error: "No support query found with this ticket number." });
    }

    res.status(200).json({ message: "Support query status updated successfully.", updatedSupport });
  } catch (error) {
    console.error("Error updating support query status:", error);
    res.status(500).json({ error: "An error occurred while updating the support query status." });
  }
};

// Delete Support Query by Ticket Number
export const deleteSupportQuery = async (req, res) => {
  const { ticketNumber } = req.params;

  try {
    // Find and delete the support query by ticketNumber
    const deletedSupport = await Support.findOneAndDelete({ ticketNumber });

    // If no support query is found
    if (!deletedSupport) {
      return res.status(404).json({ error: "No support query found with this ticket number." });
    }

    res.status(200).json({ message: "Support query deleted successfully." });
  } catch (error) {
    console.error("Error deleting support query:", error);
    res.status(500).json({ error: "An error occurred while deleting the support query." });
  }
};

// Update Support Query Message
export const updateSupportQueryMessage = async (req, res) => {
  const { ticketNumber } = req.params;
  const { message } = req.body;

  try {
    // Validate message
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Find and update the support query by ticketNumber
    const updatedSupport = await Support.findOneAndUpdate(
      { ticketNumber },
      { message },
      { new: true }
    );

    // If no support query is found
    if (!updatedSupport) {
      return res.status(404).json({ error: "No support query found with this ticket number." });
    }

    res.status(200).json({ message: "Support query message updated successfully.", updatedSupport });
  } catch (error) {
    console.error("Error updating support query message:", error);
    res.status(500).json({ error: "An error occurred while updating the support query message." });
  }
};
