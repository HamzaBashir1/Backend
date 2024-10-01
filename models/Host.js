import mongoose from 'mongoose';

const HostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  phoneNumber: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
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
    required: true
  },
  streetNumber: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  zipcode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true
  },
  tin: {
    type: String,
    required: true
  },
  vatNumber: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Host = mongoose.model('Host', HostSchema);

export default Host;
