import mongoose from "mongoose";

// Define the Reservation Schema
const reservationSchema = new mongoose.Schema({
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  numberOfPersons: {
    type: Number,
    required: true,
    default: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: false,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phone: {
    type: String,
    required: true,
  },
  agreeToTerms: {
    type: Boolean,
    required: true,
  },
  diet: {
    type: String,
    default: "", // Default value if not provided
  },
  withChildren: {
    type: Boolean,
    default: false,
  },
  withPet: {
    type: Boolean,
    default: false,
  },
  useVoucher: {
    type: Boolean,
    default: false,
  },
  issueInvoice: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true // Ensure that every accommodation has a user associated with it
  },
  accommodationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Accommodation', // Assuming you have an Accommodation model
  },
  accommodationProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Assuming you have an Accommodation model
  },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending",
  },
  message: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Reservation model
const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
