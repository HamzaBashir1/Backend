import express from 'express';
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationByName,
  deleteReservation,
  getReservationByName,
  getReservationByAccommodationProvider,
  getReservationsByUserId,
  deleteReservationsByUserId,
  getReservationByEmail
} from '../Controllers/ReservationController.js';

const router = express.Router();

// POST: Create a new reservation
router.post('/', createReservation);

// GET: Get all reservations
router.get('/', getAllReservations);

// GET: Get a specific reservation by ID
router.get('/:id', getReservationById);

// PUT: Update a reservation
router.put('/name/:name', updateReservationByName);

// DELETE: Delete a reservation
router.delete('/:id', deleteReservation);

// GET: Get reservations by name (new route)
router.get('/name/:name', getReservationByName);  // This is the new route

router.get('/email/:email', getReservationByEmail);

// Route to get reservations by accommodation provider
router.get('/provider/:providerId', getReservationByAccommodationProvider);

// New route for getting reservations by user ID
router.get('/user/:userId', getReservationsByUserId);

// Route to delete reservations by user ID
router.delete('/user/:userId', deleteReservationsByUserId); 

export default router;
