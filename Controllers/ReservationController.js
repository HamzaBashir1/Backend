import DeletedReservation from '../models/DeletedReservation.js';
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
    const reservations = await Reservation.find();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all deleted reservations
export const getDeletedReservations = async (req, res) => {
  try {
    const reservations = await DeletedReservation.find();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Permanently delete a reservation
export const deleteReservationPermanently = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRes = await DeletedReservation.findByIdAndDelete(id);

    if (!deletedRes) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.status(200).json({ message: "Reservation permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const restoreReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the deleted reservation
    const deletedReservation = await DeletedReservation.findById(id);
    if (!deletedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Move back to Reservations collection
    const restoredReservation = new Reservation({
      ...deletedReservation.toObject(),
      createdAt: deletedReservation.createdAt, // Keep original creation date
    });

    await restoredReservation.save(); // Save the restored reservation
    await DeletedReservation.findByIdAndDelete(id); // Remove from deleted collection

    res.status(200).json({ message: "Reservation restored successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
    const { name } = req.params; // Extract reservation name from URL parameters
    const updates = req.body; // Reservation updates from the request body

    // Find the reservation by name (case-insensitive search) and update it
    const updatedReservation = await Reservation.findOneAndUpdate(
      { name: { $regex: name, $options: 'i' } }, // Case-insensitive search by name
      { $set: updates }, // Apply updates to the fields
      { new: true, runValidators: true } // Return the updated document and run validators
    )
    .populate('accommodationId') // Populate accommodationId if needed
    .select('-userId'); // Exclude userId from results

    // If reservation not found
    if (!updatedReservation) {
      return res.status(404).json({ message: `No reservation found for the name "${name}"` });
    }

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
    })
    .populate('accommodationId') // Populate accommodationId as needed
    .select('-userId'); // Exclude userId field from results

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
    }).populate('accommodationId');

    if (!reservations.length) {
      return res.status(404).json({ message: 'No reservations found for the given accommodation provider' });
    }

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reservations by user ID
export const getReservationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate if the provided userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find reservations that match the user ID
    const reservations = await Reservation.find({ userId: userId }).populate('userId accommodationId');

    if (!reservations.length) {
      return res.status(404).json({ message: 'No reservations found for the given user' });
    }

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete reservations by user ID
export const deleteReservationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate if the provided userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Delete all reservations that match the user ID
    const deletedReservations = await Reservation.deleteMany({ userId: userId });

    if (deletedReservations.deletedCount === 0) {
      return res.status(404).json({ message: 'No reservations found for the given user' });
    }

    res.status(200).json({ message: 'Reservations deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Reservation Controller
export const updateReservation = async (req, res) => {
  const { id } = req.params; // Reservation ID from the URL
  const updateData = req.body; // Data to update from the request body

  try {
    // Validate reservation ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid reservation ID" });
    }

    // Find the reservation by ID and update
    const updatedReservation = await Reservation.findByIdAndUpdate(
      id,
      updateData, // Fields to update
      { new: true, runValidators: true } // Return the updated document and validate data
    );

    // Check if the reservation exists
    if (!updatedReservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Respond with the updated reservation
    res.status(200).json({
      message: "Reservation updated successfully",
      reservation: updatedReservation,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};
