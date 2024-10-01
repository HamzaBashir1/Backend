import express from 'express';
import { authenticate, restrict } from '../auth/verifyToken.js';
import {
  createAccommodation,
  getAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
  updateAccommodationByAccommodationId,
  getUserAccommodations,
  searchAccommodationsByCategory
} from '../Controllers/AccommodationController.js';

const router = express.Router();

// Search accommodations by category (this should be first)
router.get("/accommodation/search", searchAccommodationsByCategory);

// Protected routes (require authentication)
router.post("/accommodation", createAccommodation);
router.get("/accommodation", getAccommodations);
router.get("/accommodation/:id", getAccommodationById);
router.put("/accommodation/:id", updateAccommodation);

router.get("/accommodation/user/:userId", getUserAccommodations);
router.put("/accommodation/updateOccupancyCalendar/:userId", updateAccommodationByAccommodationId);
router.delete("/accommodation/:id", deleteAccommodation);

export default router;
