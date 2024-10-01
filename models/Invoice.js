import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host', // Reference to the Host model
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid'], // Status can either be 'unpaid' or 'paid'
    default: 'unpaid'
  },
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true }); // Automatically adds `createdAt` and `updatedAt`

const Invoice = mongoose.model('Invoice', InvoiceSchema);

export default Invoice;
