import Accommodation from "../models/Accommodation.js";
import mongoose from "mongoose";
import { createEvents } from 'ics';
import DeletedAccommodation from "../models/DeletedAccommodation.js";
import nodemailer from "nodemailer";
import Host from "../models/Host.js";
import { eachDayOfInterval, format } from 'date-fns';

// Create a new accommodation
export const createAccommodation = async (req, res) => {
  try {
    const accommodationData = req.body;

    // Generate a URL-friendly slug from the name (which is the title)
    function generateSlug(name) {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')   // Remove special characters
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .replace(/--+/g, '-');      // Remove duplicate hyphens
    }

    let slug = generateSlug(accommodationData.name);  // Use `name` for slug generation

    // Ensure the `slug` is unique
    let existing = await Accommodation.findOne({ slug });
    let counter = 1;
    while (existing) {
      slug = `${generateSlug(accommodationData.name)}-${counter}`;
      existing = await Accommodation.findOne({ slug });
      counter++;
    }

    // Add the generated `slug` to the accommodation data
    accommodationData.slug = slug;

    // Save the accommodation
    const accommodation = new Accommodation(accommodationData);
    await accommodation.save();

    res.status(200).json({ message: "Accommodation Data Stored Successfully", accommodation });
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
    const { name } = req.body; // Destructure the name from the request body
    let updatedAccommodationData = { ...req.body };

    // Check if the name was updated (only regenerate the slug if it changed)
    if (name) {
      // Generate a new slug based on the new name
      function generateSlug(name) {
        return name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')   // Remove special characters
          .replace(/\s+/g, '-')       // Replace spaces with hyphens
          .replace(/--+/g, '-');      // Remove duplicate hyphens
      }

      const newSlug = generateSlug(name);

      // Ensure the slug is unique (check for existing slugs in the database)
      let existingAccommodation = await Accommodation.findOne({ slug: newSlug });
      let counter = 1;
      while (existingAccommodation) {
        // Append a counter to the slug if it already exists
        updatedAccommodationData.slug = `${newSlug}-${counter}`;
        existingAccommodation = await Accommodation.findOne({ slug: updatedAccommodationData.slug });
        counter++;
      }

      // Update the accommodation data with the new slug
      updatedAccommodationData.slug = newSlug;
    }

    // Find and update the accommodation by its ID
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      req.params.id,
      updatedAccommodationData,
      { new: true }
    ).populate('userId', 'name email'); // Populate user info in response

    if (!updatedAccommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    res.status(200).json({ message: "Accommodation updated successfully", updatedAccommodation });
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
  const { id } = req.params;
  const { startDate, endDate, guestName, status } = req.body;

  try {
    if (!status || status === 'cancelled') {
      return res.status(400).json({ message: "Cancelled or empty status. Not adding to calendar." });
    }

    const accommodation = await Accommodation.findById(id);
    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found" });
    }

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    const requestedDates = eachDayOfInterval({ start: newStart, end: newEnd }).map(date =>
      format(date, 'yyyy-MM-dd')
    );

    // Get all booked dates
    const existingBookedDates = new Set();
    accommodation.occupancyCalendar.forEach(entry => {
      const existingStart = new Date(entry.startDate);
      const existingEnd = new Date(entry.endDate);
      const range = eachDayOfInterval({ start: existingStart, end: existingEnd }).map(date =>
        format(date, 'yyyy-MM-dd')
      );
      range.forEach(d => existingBookedDates.add(d));
    });

    // Filter out conflicting dates
    const nonConflictingDates = requestedDates.filter(date => !existingBookedDates.has(date));

    if (nonConflictingDates.length === 0) {
      return res.status(409).json({ message: "All requested dates conflict with existing bookings. Nothing stored." });
    }

    // Group contiguous non-conflicting dates into ranges
    const groupedRanges = [];
    let tempRange = [];

    for (let i = 0; i < nonConflictingDates.length; i++) {
      const current = new Date(nonConflictingDates[i]);
      const next = i + 1 < nonConflictingDates.length ? new Date(nonConflictingDates[i + 1]) : null;

      tempRange.push(current);

      if (!next || (next - current) !== 86400000) {
        groupedRanges.push([...tempRange]);
        tempRange = [];
      }
    }

    // Add the non-conflicting ranges
    groupedRanges.forEach(range => {
      accommodation.occupancyCalendar.push({
        startDate: range[0],
        endDate: range[range.length - 1],
        guestName: guestName || '',
        status: status || 'booked',
      });
    });

    await accommodation.save();

    res.status(200).json({
      message: `Added ${groupedRanges.length} non-conflicting date range(s) to the calendar.`,
      addedRanges: groupedRanges.map(r => ({
        startDate: format(r[0], 'yyyy-MM-dd'),
        endDate: format(r[r.length - 1], 'yyyy-MM-dd'),
      })),
      accommodation,
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

// Fetch accommodation by slug
export const getAccommodationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Optional: Normalize the slug (convert to lowercase and replace spaces with dashes)
    const sanitizedSlug = slug.replace(/\s+/g, '-').toLowerCase();

    // Correct query to match the 'slug' field, not '_id'
    const accommodation = await Accommodation.findOne({ slug: sanitizedSlug }).populate('userId', 'name email');

    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    res.status(200).json(accommodation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveListing = async (req, res) => {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ message: "Slug is required." });
  }

  try {
    // Find the accommodation by slug and approve it by setting isVerified to true
    const accommodation = await Accommodation.findOneAndUpdate(
      { slug: slug },
      { isVerified: true },
      { new: true }
    );

    if (!accommodation) {
      return res.status(404).json({ message: "Accommodation not found." });
    }
    
    // Fetch host information using UserID from the User model
    const host = await Host.findById(accommodation.userId);

    if (!host) {
      return res.status(404).json({ message: "Host not found." });
    }

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.websupport.sk",
      port: 465,
      secure: true,
      auth: {
        user: "support@putko.sk",
        pass: "Putko@786",  // You should replace this with an environment variable for security
      },
    });

    const mailOptions = {
      from: "support@putko.sk",
      to: "support@putko.sk",  // Change this if you want to send it to the host's email
      subject: `✅ Host schválil svoju ponuku`,
      html: `
      <p><strong>Hostiteľ ${host.name || "Neznámy"}</strong> schválil svoju ponuku na platforme Putko.</p>
      <ul>
        <li><strong>Email:</strong> ${host.email || "Email nie je dostupný"}</li>
        <li><strong>Ponuka:</strong> <a href="${process.env.CLIENT_SITE_URL}/listing-stay-detail/${accommodation.slug}">Zobraziť ponuku</a></li>
      </ul>
    `,
    };

    // Send the email to support
    await transporter.sendMail(mailOptions);

    // Redirect to frontend listing detail page after approval
    return res.redirect(`${process.env.CLIENT_SITE_URL}/listing-stay-detail/${slug}`);

  } catch (err) {
    console.error("❌ Error approving listing:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};