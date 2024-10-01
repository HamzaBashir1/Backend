import Review from "../models/Review.js";
import Accommodation from "../models/Accommodation.js"; // Updated import to Accommodation

// Get all reviews
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('user', 'name photo'); // Populate user data

        res.status(200).json({ success: true, message: 'Successful', data: reviews });
    } catch (err) {
        res.status(404).json({ success: false, message: 'Not found', error: err.message });
    }
};

// Create a review
export const createReview = async (req, res) => {
    const { overallRating, categoryRatings, reviewText, pluses, cons } = req.body;

    if (!req.body.accommodation) req.body.accommodation = req.params.accommodationId; // Update reference
    if (!req.body.user) req.body.user = req.userId;

    // Validate required fields
    if (!overallRating || overallRating < 1 || overallRating > 5) {
        return res.status(400).json({ success: false, message: "Overall rating must be between 1 and 5." });
    }

    if (!reviewText) {
        return res.status(400).json({ success: false, message: "Review text is required." });
    }

    // Create new review object with additional fields
    const newReview = new Review({
        accommodation: req.body.accommodation,
        user: req.body.user,
        overallRating,
        categoryRatings: {
            Location: categoryRatings?.Location || 0,
            Communication: categoryRatings?.Communication || 0,
            Equipment: categoryRatings?.Equipment || 0,
            Cleanliness: categoryRatings?.Cleanliness || 0,
            ClientCare: categoryRatings?.ClientCare || 0,
            WiFi: categoryRatings?.WiFi || 0,
            Activities: categoryRatings?.Activities || 0,
            PriceQuality: categoryRatings?.PriceQuality || 0
        },
        reviewText,
        pluses,
        cons
    });

    try {
        const savedReview = await newReview.save();

        // Add review to the accommodation
        await Accommodation.findByIdAndUpdate(req.body.accommodation, {
            $push: { reviews: savedReview._id }
        });

        // Calculate average ratings for the accommodation
        await Review.calAverageRatings(req.body.accommodation);

        res.status(200).json({ success: true, message: 'Review submitted successfully', data: savedReview });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
