import Accommodation from "../models/Accommodation.js";
import mongoose from "mongoose";
import { createEvents } from 'ics';
import DeletedAccommodation from "../models/DeletedAccommodation.js";

// Create a new accommodation
export const createAccommodation = async (req, res) => {
  try {
    // Since authentication is removed, we don't get userId from req.user
    const accommodationData = req.body;

    const accommodation = new Accommodation(accommodationData);
    await accommodation.save();
    res.status(200).json({ message:"Accommodation Data Store Successfully", accommodation});
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
    res.status(200).json({message: "Accommodation update Successfully",updatedAccommodation});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete accommodation by ID
export const deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);

    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    // Create a new deleted accommodation record
    const deletedAccommodation = new DeletedAccommodation({
      ...accommodation.toObject(), // Copy all fields
      deletedAt: new Date(),
    });

    await deletedAccommodation.save();  // Save to DeletedAccommodation collection
    await Accommodation.findByIdAndDelete(req.params.id); // Remove from Accommodation

    res.status(200).json({ message: "Accommodation moved to deleted list" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Deleted Accommodation
export const getDeletedAccommodations = async (req, res) => {
  try {
    const deletedAccommodations = await DeletedAccommodation.find().populate('userId', 'name email')
    
    res.status(200).json(deletedAccommodations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restore Accommodation
export const restoreAccommodation = async (req, res) => {
  try {
    const deletedAccommodation = await DeletedAccommodation.findById(req.params.id);

    if (!deletedAccommodation) {
      return res.status(404).json({ message: "Deleted accommodation not found" });
    }

    // Move back to Accommodation collection
    const restoredAccommodation = new Accommodation({
      ...deletedAccommodation.toObject(),
      createdAt: deletedAccommodation.createdAt,  // Keep original creation date
    });

    await restoredAccommodation.save();  // Save to Accommodation collection
    await DeletedAccommodation.findByIdAndDelete(req.params.id); // Remove from DeletedAccommodation

    res.status(200).json({ message: "Accommodation restored successfully", restoredAccommodation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Permanently delete accommodation
export const deletePermanently = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete from DeletedAccommodation
    const deletedAcc = await DeletedAccommodation.findByIdAndDelete(id);

    if (!deletedAcc) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    res.status(200).json({ message: "Accommodation permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search accommodations by property type
export const searchAccommodationsByCategorys = async (req, res) => {
  try {
    const { category, city, country, location } = req.query; // Get query parameters
    let filters = []; // Initialize an empty array for filters

    // Create filters based on provided query parameters
    if (category) {
      filters.push({ propertyType: category }); // Add category filter
    }

    if (city) {
      filters.push({ 'locationDetails.city': city }); // Add city filter
    }

    if (country) {
      filters.push({ 'locationDetails.country': country }); // Add country filter
    }

    if (location) {
      filters.push({ 'location.address': location }); // Add location filter
    }

    // If no filters are provided, return all accommodations
    if (filters.length === 0) {
      const allAccommodations = await Accommodation.find().populate('userId', 'name email');
      return res.status(200).json(allAccommodations);
    }

    // Fetch accommodations based on the provided filters using $or
    const accommodations = await Accommodation.find({ $or: filters }).populate('userId', 'name email'); // Populate user details

    // Return the accommodations, whether found or empty
    if (accommodations.length === 0) {
      return res.status(404).json({ message: "No accommodations found for the selected criteria." });
    }

    res.status(200).json(accommodations); 
  } catch (error) {
    console.error(error);
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

export const addToOccupancyCalendar = async (req, res) => {
  const { id } = req.params; // Get accommodationId from the request parameters
  const { startDate, endDate, guestName, status } = req.body; // Expecting occupancyCalendar entry data in request body

  try {
    // ❗ Don't proceed if cancelled or status is empty
    if (!status || status === 'cancelled') {
      return res.status(400).json({ message: "Cancelled or empty status. Not adding to calendar." });
    }
    // Use $push to add a new entry to the occupancyCalendar array without overwriting existing entries
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      id, // Match the accommodation by its ID
      {
        $push: {
          occupancyCalendar: {
            startDate,
            endDate,
            guestName: guestName || '',
            status: status || 'booked',
          }
        }
      },
      { new: true, useFindAndModify: false } // Return the updated document
    );

    // If the accommodation isn't found
    if (!updatedAccommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    res.status(200).json({
      message: "Occupancy Calendar updated successfully",
      accommodation: updatedAccommodation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOccupancyEntry = async (req, res) => {
  const { accommodationId, entryId } = req.params; // Get accommodationId and entryId from request parameters

  try {
    // Find the accommodation by ID
    const accommodation = await Accommodation.findById(accommodationId);
    
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found." });
    }

    // Remove the specific occupancyCalendar entry by entryId
    accommodation.occupancyCalendar = accommodation.occupancyCalendar
  .filter((entry) => entry._id.toString() !== entryId)
  .filter((entry) => ['booked', 'blocked', 'available'].includes(entry.status));
 

    // Save the updated accommodation document
    await accommodation.save();

    res.status(200).json({
      message: "Occupancy entry deleted successfully.",
      occupancyCalendar: accommodation.occupancyCalendar, // Return the updated calendar
    });
  } catch (error) {
    console.error("Error deleting occupancy entry:", error);
    res.status(500).json({ error: error.message });
  }
};

//  Get search  accommodation by ID
export const searchAccommodationsByCategory = async (req, res) => {
  try {
    const {
      category,
      city,
      country,
      propertyType,
      location,
      minPrice,
      maxPrice,
      pet,
      smoking,
      rentalform,
      parkingFacilities,
      services,
      bathroomAmenities,
      kitchenDiningAmenities,
      heatingCoolingAmenities,
      safetyAmenities,
      wellnessAmenities,
      outdoorAmenities,
      checkIn,
      meals,
      person,
      beds,
      bedroomCount,
      bathroomCount,
      startDate,
      endDate,
      partyOrganizing,
    } = req.query;

    let filters = {};

    // Property Type filter (using 'en' subfield)
    if (propertyType) {
      let servicesArray;
      try {
        servicesArray = JSON.parse(propertyType);
      } catch (error) {
        servicesArray = propertyType.replace(/\[|\]/g, '').split(',').map(s => s.trim());
      }
      filters['propertyType.en'] = { $in: servicesArray };
    }

    // Location filters
    if (city) filters['locationDetails.city'] = city.toLowerCase();
    if (country) filters['locationDetails.country'] = country;
    if (location) filters['location.address'] = location;

    // Price range
    if (minPrice || maxPrice) {
      filters.priceMonThus = {};
      if (minPrice) filters.priceMonThus.$gte = parseFloat(minPrice);
      if (maxPrice) filters.priceMonThus.$lte = parseFloat(maxPrice);
    }

    // Single-value filters using 'en' subfield
    if (pet) filters['pet.en'] = pet;
    if (smoking) filters['smoking.en'] = smoking;
    if (rentalform) filters['rentalform.en'] = rentalform;
    if (partyOrganizing) filters['partyOrganizing.en'] = partyOrganizing;

    // Person capacity
    if (person) {
      const personValue = parseInt(person);
      
      filters.$or = [
        { person: { $lte: personValue } },
        { person: { $gte: personValue } }
      ];
    }
    if (beds) filters.beds = { $lte: parseInt(beds) };

    // Bedroom and Bathroom counts
    
    if (bedroomCount) filters.bedroom = { $gte: parseInt(bedroomCount) };

    if (bathroomCount) filters.bathroom = { $gte: parseInt(bathroomCount) };

    // Array-based amenities filters (using 'en' subfield)
    const handleArrayFilter = (param, field) => {
      if (param) {
        let arr;
        try {
          arr = JSON.parse(param);
        } catch (error) {
          arr = param.replace(/\[|\]/g, '').split(',').map(s => s.trim());
        }
        filters[`${field}.en`] = { $in: arr };
      }
    };

    handleArrayFilter(services, 'services');
    handleArrayFilter(bathroomAmenities, 'bathroomAmenities');
    handleArrayFilter(kitchenDiningAmenities, 'kitchenDiningAmenities');
    handleArrayFilter(heatingCoolingAmenities, 'heatingCoolingAmenities');
    handleArrayFilter(safetyAmenities, 'safetyAmenities');
    handleArrayFilter(wellnessAmenities, 'wellnessAmenities');
    handleArrayFilter(outdoorAmenities, 'outdoorAmenities');
    handleArrayFilter(parkingFacilities, 'parkingFacilities');
    handleArrayFilter(checkIn, 'checkIn');
    handleArrayFilter(meals, 'meals');

    // Date range availability check
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filters.occupancyCalendar = {
        $not: {
          $elemMatch: {
            $or: [
              { startDate: { $lt: end, $gte: start } },
              { endDate: { $gt: start, $lte: end } },
              { startDate: { $lte: start }, endDate: { $gte: end } }
            ],
            status: "booked"
          }
        }
      };
    }

    // Execute query
    const accommodations = await Accommodation.find(filters).populate('userId', 'name email');
    if (accommodations.length === 0) {
      return res.status(200).json({ message: 'No accommodations found.' });
    }
    res.status(200).json(accommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
};
 
export const deleteAccommodationImages = async (req, res) => {
  const { imageToDelete } = req.body;

  // Validate `imageToDelete` from request body
  if (!imageToDelete || typeof imageToDelete !== "string") {
    return res.status(400).json({
      message: "Please provide a valid image URL to delete",
    });
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid accommodation ID format",
    });
  }

  try {
    const accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      return res.status(404).json({
        message: "Accommodation not found",
      });
    }

    if (!accommodation.images.includes(imageToDelete)) {
      return res.status(400).json({
        message: "The provided image URL was not found in the accommodation's images",
      });
    }

    accommodation.images = accommodation.images.filter(
      (image) => image !== imageToDelete
    );
    await accommodation.save();

    return res.status(200).json({
      message: "Image deleted successfully",
      deletedImage: imageToDelete,
      remainingImages: accommodation.images,
    });
  } catch (error) {
    console.error("Error deleting image:", error.message);
    return res.status(500).json({
      message: "An error occurred while deleting the image",
      error: error.message,
    });
  }
};

export const generateICS = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch accommodation by ID
    const accommodation = await Accommodation.findById(id);

    if (!accommodation) {
      return res.status(404).json({ error: "Accommodation not found" });
    }

    // Map occupancyCalendar to ICS events
    const events = accommodation.occupancyCalendar.map((entry) => {
      const startDate = new Date(entry.startDate); // Convert to Date object
      const endDate = new Date(entry.endDate); // Convert to Date object

      // Validate the dates
      if (isNaN(startDate) || isNaN(endDate)) {
        throw new Error("Invalid date format in occupancyCalendar");
      }

      return {
        start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()], // Format as [YYYY, MM, DD]
        end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()], // Format as [YYYY, MM, DD]
        title: `Booking: ${entry.guestName || "Guest"}`,
        description: `Status: ${entry.status || "Unknown"}`,
        location: accommodation.location?.address || "Accommodation Location",
      };
    });

    // Generate ICS content
    createEvents(events, (error, value) => {
      if (error) {
        console.error("Error creating .ics file:", error);
        return res.status(500).json({ error: "Error generating calendar" });
      }

      // Set headers for file download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${accommodation.name || "calendar"}.ics"`
      );
      res.setHeader("Content-Type", "text/calendar;charset=utf-8");
      res.send(value);
    });
  } catch (error) {
    console.error("Error fetching accommodation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};