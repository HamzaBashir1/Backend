import mongoose from 'mongoose';
import Accommodation from './Accommodation.js';

const reviewSchema = new mongoose.Schema({
  accommodation: {
    type: mongoose.Types.ObjectId,
    ref: 'Accommodation',
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  reviewText: {
    type: String,
    required: true,
  },
  pluses: String,
  cons: String,
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 0,
  },
  categoryRatings: {
    Location: { type: Number, min: 0, max: 5, default: 0 },
    Communication: { type: Number, min: 0, max: 5, default: 0 },
    Equipment: { type: Number, min: 0, max: 5, default: 0 },
    Cleanliness: { type: Number, min: 0, max: 5, default: 0 },
    ClientCare: { type: Number, min: 0, max: 5, default: 0 },
    WiFi: { type: Number, min: 0, max: 5, default: 0 },
    Activities: { type: Number, min: 0, max: 5, default: 0 },
    PriceQuality: { type: Number, min: 0, max: 5, default: 0 },
  },
}, { timestamps: true });

// Pre-hook to populate user data when fetching reviews
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Static method to calculate average ratings for an accommodation
reviewSchema.statics.calAverageRatings = async function(accommodationId) {
  const stats = await this.aggregate([
    { $match: { accommodation: accommodationId } },
    { $group: {
        _id: '$accommodation',
        numOfRatings: { $sum: 1 },
        avgRating: { $avg: '$overallRating' },
      }
    }
  ]);

  if (stats.length > 0) {
    await Accommodation.findByIdAndUpdate(accommodationId, {
      totalRating: stats[0].numOfRatings,
      averageRating: stats[0].avgRating,
    });
  } else {
    await Accommodation.findByIdAndUpdate(accommodationId, {
      totalRating: 0,
      averageRating: 0,
    });
  }
};

// Post-hook to recalculate average ratings after saving a review
reviewSchema.post('save', function() {
  this.constructor.calAverageRatings(this.accommodation);
});

export default mongoose.model('Review', reviewSchema);
