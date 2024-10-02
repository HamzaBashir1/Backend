import Accommodation from "../models/Accommodation.js";

// Create a new accommodation
export const createAccommodation = async (req, res) => {
  try {
    // Since authentication is removed, we don't get userId from req.user
    const accommodationData = req.body;

    const accommodation = new Accommodation(accommodationData);
    await accommodation.save();
    res.status(201).json(accommodation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all accommodations for a specific user
export const getUserAccommodations = async (req, res) => {
  const { userId } = req.params; // Assuming the userId is passed as a URL parameter

  try {
    // Validate that the userId is a valid ObjectId
    // Find all accommodations where the userId matches
    const accommodations = await Accommodation.find({ userId }).populate('userId', 'name email'); // Optionally populate user info

    if (accommodations.length === 0) {
      return res.status(404).json({ message: "No accommodations found for this user" });
    }

    res.status(200).json(accommodations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all accommodations
export const getAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find().populate('userId', 'name email'); // Optionally populate user info
    res.status(200).json(accommodations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get accommodation by ID
export const getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id).populate('userId', 'name email');
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    res.status(200).json(accommodation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update the occupancyCalendar for a specific user by userId
export const updateAccommodationByAccommodationId = async (req, res) => {
  const { accommodationId } = req.params; // Get accommodationId from the request parameters
  const { occupancyCalendar } = req.body; // Expecting occupancyCalendar data in request body

  try {
    // Find the accommodation associated with the accommodationId
    const accommodation = await Accommodation.findByIdAndUpdate(
      accommodationId, // Match the document by accommodationId
      { $push: { occupancyCalendar } }, // Add new occupancyCalendar entries
      { new: true } // Return the updated document
    );

    // If accommodation not found
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    res.status(200).json({ message: "Occupancy Calendar updated successfully", accommodation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an accommodation by ID
export const updateAccommodation = async (req, res) => {
  try {
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('userId', 'name email'); // Populate user info in response

    if (!updatedAccommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    res.status(200).json(updatedAccommodation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete accommodation by ID
export const deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndDelete(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }
    res.status(200).json({ message: "Accommodation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search accommodations by property type
export const searchAccommodationsByCategory = async (req, res) => {
  try {
    const { category } = req.query; // Get the category from the query parameters
    let filters = {};

    // Check if category is provided and create filters accordingly
    if (category) {
      filters.propertyType = category; // Set the property type filter
    }

    // Fetch accommodations that match the filters
    const accommodations = await Accommodation.find(filters).populate('userId', 'name email'); // Optionally populate user info

    // Check if any accommodations were found
    if (accommodations.length === 0) {
      return res.status(404).json({ message: "No accommodations found for the selected category." });
    }

    res.status(200).json(accommodations); // Return the filtered accommodations
  } catch (error) {
    console.error(error); // Log the error for more detail
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
};

// Increment accommodation view count
export const incrementViewCount = async (req, res) => {
  const { id } = req.params; // accommodation ID

  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, // Increment the views by 1
      { new: true } // Return the updated document
    );

    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    res.status(200).json({ message: "View count incremented", accommodation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Increment accommodation click count
export const incrementClickCount = async (req, res) => {
  const { id } = req.params; // accommodation ID

  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } }, // Increment the clicks by 1
      { new: true } // Return the updated document
    );

    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    res.status(200).json({ message: "Click count incremented", accommodation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Increment customer interest
export const customerInterest = async (req, res) => {
  try {
    const accommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      { $inc: { customerInterest: 1 } }, // Increment the customer interest count by 1
      { new: true }
    );
    res.status(200).json(accommodation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
