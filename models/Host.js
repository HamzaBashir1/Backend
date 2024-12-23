import mongoose from 'mongoose';

const HostSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  name: { type: String, required: true },
  phone: { type: String }, // Changed from Number to String
  photo: { type: String },
  role: {
    type: String,
    enum: ["host", "admin"],
    default: "host",
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "other",
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  username: {
    type: String,
    required: false,
  },
  propertyType: {
    type: String,
    enum: [
      'Apartment', 'Flat', 'Glamping', 'Cottages', 'Motels/Hostel', 'Wooden Houses', 
      'Guest Houses', 'Secluded Accommodation', 'Hotels', 'Dormitories', 'Caves', 
      'Campsites', 'Treehouses', 'Houseboats', 'Rooms', 'Entire Homes', 'Luxury Accommodation'
    ]
  },
  propertyName: {
    type: String,
    required: false,
  },
  propertyAddress: {
    type: String,
    required: false,
  },
  propertyPrice: {
    type: Number,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  aboutYou: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false
  },
  overallrating: {
    type: String,
    required: false
  },
  planName: {
    type: String,
    required: false
  },
  websiteInformation: {
    type: String,
    required: false
  },
  noteOnFilling: {
    type: String,
    required: false
  },
  companyName: {
    type: String,
    required: false
  },
  streetNumber: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  zipcode: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false
  },
  idNumber: {
    type: String,
    required: false
  },
  tin: {
    type: String,
    required: false
  },
  vatNumber: {
    type: String,
    required: false
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accommodation',
}],
// Reset Password Fields
resetPasswordToken: { type: String },
resetPasswordExpires: { type: Date },
isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const Host = mongoose.model('Host', HostSchema);

export default Host;
