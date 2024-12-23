import mongoose from "mongoose";

const supportSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Support = mongoose.model("Support", supportSchema);

export default Support;
