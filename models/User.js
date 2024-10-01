import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
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
  gender: { type: String, enum: ["male", "female", "other"], default: "other" }, // Added default value
}, { timestamps: true }); // Added timestamps

export default mongoose.model("User", UserSchema);
