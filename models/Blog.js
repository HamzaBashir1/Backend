import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Admin' },
  categories: { type: String, required: true }, 
  tags: { type: [String], default: [] },
  image: { type: String },
  summary: { type: String, required: true }, // New summary field
  blogType: {
    type: String,
    enum: ['customer', 'provider'], // Enum for blog type selection
    required: true,
  },
  createdAt: { type: Date, default: Date.now }
});

// Virtual field to format created date
blogSchema.virtual('formattedDate').get(function () {
  return new Date(this.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
});

export default mongoose.model('Blog', blogSchema);
