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
  incrementViewCount,
  incrementClickCount,
  customerInterest,
  searchAccommodationsByCategorys,
  addToOccupancyCalendar,
  deleteOccupancyEntry,
  searchAccommodationsByCategory
} from '../Controllers/AccommodationController.js';

const router = express.Router();

// Search accommodations by category (this should be first)
router.get("/accommodations/searching", searchAccommodationsByCategory);
router.get("/accommodation/search", searchAccommodationsByCategorys);
router.post("/accommodation", createAccommodation);
router.get("/accommodation", getAccommodations);
router.get("/accommodation/:id", getAccommodationById);
router.put("/accommodation/:id", updateAccommodation);
router.delete("/:accommodationId/occupancy/:entryId", deleteOccupancyEntry);
router.get("/accommodation/user/:userId", getUserAccommodations);
router.put("/accommodation/:id/occupancyCalendar", addToOccupancyCalendar);
router.put("/accommodation/updateOccupancyCalendar/:userId", updateAccommodationByAccommodationId);
router.delete("/accommodation/:id", deleteAccommodation);
// Routes for incrementing view and click counts
router.put('/accommodation/:id/view', incrementViewCount);
router.put('/accommodation/:id/click', incrementClickCount);
router.put('/accommodation/:id/interest', customerInterest);

export default router;
