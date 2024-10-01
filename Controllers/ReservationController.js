import Reservation from '../models/Reservation.js';
import mongoose from 'mongoose';

// Create a new reservation
export const createReservation = async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    const savedReservation = await reservation.save();
    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all reservations
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('userId accommodationId');
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single reservation by ID
export const getReservationById = async (req, res) => {
    try {
      let { id } = req.params;
      
      // Log the received id for debugging
    //   console.log("Received ID:", id);
  
      // Remove any leading/trailing characters like curly braces
      id = id.replace(/[^a-fA-F0-9]/g, ''); // This strips out anything that isn't a valid hex character
      
      // Validate if the cleaned id is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid reservation ID' });
      }
  
      const reservation = await Reservation.findById(id).populate('userId accommodationId');
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
  
      res.status(200).json(reservation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Update a reservation
export const updateReservationByName = async (req, res) => {
  try {
    const { name } = req.params;  // Extract reservation name from the URL parameters
    const updates = req.body;     // Reservation updates from the request body

    // Find the reservation by name (case-insensitive search) and update it
    const updatedReservation = await Reservation.findOneAndUpdate(
      { name: { $regex: name, $options: 'i' } },  // Case-insensitive search by name
      { $set: updates },   // Apply updates to the fields
      { new: true, runValidators: true } // Return the updated document and run validators
    ).populate('userId accommodationId');

    // If reservation not found
    if (!updatedReservation) {
      return res.status(404).json({ message: `No reservation found for the name "${name}"` });
    }

    // Return the updated reservation
    res.status(200).json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete a reservation
export const deleteReservation = async (req, res) => {
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!deletedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reservations by name
export const getReservationByName = async (req, res) => {
  try {
    const { name } = req.params;

    // Find reservations where the name matches (case-insensitive search)
    const reservations = await Reservation.find({
      name: { $regex: name, $options: 'i' } // Case-insensitive search
    }).populate('userId accommodationId');

    if (!reservations.length) {
      return res.status(404).json({ message: 'No reservations found for the given name' });
    }

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get reservations by accommodation provider ID
export const getReservationByAccommodationProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    // Validate if the provided providerId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ message: 'Invalid accommodation provider ID' });
    }

    // Find reservations that match the accommodation provider ID
    const reservations = await Reservation.find({
      accommodationProvider: providerId
    }).populate('userId accommodationId');

    if (!reservations.length) {
      return res.status(404).json({ message: 'No reservations found for the given accommodation provider' });
    }

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
