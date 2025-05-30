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
  searchAccommodationsByCategory,
  deleteAccommodationImages,
  generateICS,
  getDeletedAccommodations,
  restoreAccommodation,
  deletePermanently,
  getAccommodationBySlug,
  approveListing
} from '../Controllers/AccommodationController.js';

const router = express.Router();

// Static routes should be placed before dynamic ones
router.get("/accommodation/approve-listing", approveListing); // ✅ This must be before :id

// Search accommodations by category (this should be first)
router.get("/accommodations/searching", searchAccommodationsByCategory);
router.get("/accommodation/search", searchAccommodationsByCategorys);
router.get("/accommodation/:id/calendar.ics", generateICS);
router.post("/accommodation", createAccommodation);
router.get("/accommodation/deleted", getDeletedAccommodations);  // Get deleted accommodations
router.get("/accommodation", getAccommodations);
router.put("/accommodation/restore/:id", restoreAccommodation);  // Restore deleted accommodation
router.get("/accommodation/:id", getAccommodationById);
router.put("/accommodation/:id", updateAccommodation);
router.get("/accommodation/slug/:slug", getAccommodationBySlug);
router.delete("/accommodation/deleted/:id", deletePermanently);
router.delete("/:accommodationId/occupancy/:entryId", deleteOccupancyEntry);
router.get("/accommodation/user/:userId", getUserAccommodations);
router.put("/accommodation/:id/occupancyCalendar", addToOccupancyCalendar);
router.put("/accommodation/updateOccupancyCalendar/:userId", updateAccommodationByAccommodationId);
router.delete("/accommodation/:id", deleteAccommodation);
router.delete("/accommodation/:id/images", deleteAccommodationImages);
// Routes for incrementing view and click counts
router.put('/accommodation/:id/view', incrementViewCount);
router.put('/accommodation/:id/click', incrementClickCount);
router.put('/accommodation/:id/interest', customerInterest);

export default router;
