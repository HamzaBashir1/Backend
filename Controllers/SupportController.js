import Support from "../models/Support.js";
import nodemailer from "nodemailer";


// Save Support Query and Send Email
export const saveSupportQuery = async (req, res) => {
    const { fullName, email, message } = req.body;
  
    try {
      // Save to database
      const newSupport = new Support({ fullName, email, message });
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
        text: `Name: ${fullName}\nEmail: ${email}\nMessage: ${message}`,
      };
  
      // Email to sender (user)
      const mailOptionsToSender = {
        from: "sharjeelsohail279@gmail.com", // Replace with your support email
        to: email, // Send email to the user
        subject: "Support Query Received",
        text: `Dear ${fullName},\n\nThank you for contacting us. We have received your support query. Our team will get back to you shortly.\n\nYour message:\n${message}`,
      };
  
      // Send both emails
      await transporter.sendMail(mailOptionsToAdmin);
      await transporter.sendMail(mailOptionsToSender);
  
      res.status(200).json({ message: "Query submitted successfully!" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: `Something went wrong. ${error.message}` });
    }
};
  