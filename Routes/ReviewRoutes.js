import express from "express";
import { getAllReviews, createReview } from "../Controllers/ReviewController.js";

const router = express.Router({ mergeParams: true });

// Get all reviews
router.route("/").get(getAllReviews);

// Create a review for a specific accommodation
router.route("/:accommodationId")
  .post(createReview); // Removed authentication middleware

export default router;
