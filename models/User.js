import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    name: { type: String, required: true },
    phone: { type: String }, // Changed from Number to String
    photo: { type: String },
    role: {
      type: String,
      enum: ["guest", "admin"],
      default: "guest",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    // Address information
    streetNumber: { type: String },
    city: { type: String },
    zipcode: { type: String },
    country: { type: String },
    // Identification information
    idNumber: { type: String },  // National ID or similar
    tin: { type: String },  // Tax Identification Number
    vatNumber: { type: String },  
    companyName: { type: String },  // VAT number for companies
    phonenumber: { type: String },  // Alternative phone number
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

export default mongoose.model("User", UserSchema);
