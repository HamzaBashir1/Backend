import mongoose from "mongoose";

const WriteMessage = new mongoose.Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    phone: { type: String }, // Changed from Number to String
    // Address information
    message: { type: String },
   
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

export default mongoose.model("WriteMessage", WriteMessage);
