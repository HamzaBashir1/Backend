import cron from "node-cron";
import nodemailer from "nodemailer";
import Accommodation from "../models/Accommodation.js";
import Host from "../models/Host.js";
import Reservation from "../models/Reservation.js";
import DeletedAccommodation from "../models/DeletedAccommodation.js";
import DeletedReservation from "../models/DeletedReservation.js";

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail", // Change if using another provider
  auth: {
    user: "sharjeelsohail279@gmail.com",
    pass: "iyip nosn bwem gwer", // Use environment variables for security
  },
});

// Function to send email
const sendEmail = async (email, reservation) => {
  const mailOptions = {
    from: "sharjeelsohail279@gmail.com",
    to: reservation.email,
    subject: "Reservation Cancellation Notice",
    html: `
      <p>Dear <strong>${reservation.name}</strong>,</p>
  
      <p>We regret to inform you that your reservation has been canceled due to the accommodation no longer being available.</p>
  
      <h3>Reservation Details:</h3>
      <ul>
        <li><strong>Check-in Date:</strong> ${new Date(reservation.checkInDate).toDateString()}</li>
        <li><strong>Check-out Date:</strong> ${new Date(reservation.checkOutDate).toDateString()}</li>
        <li><strong>Total Price:</strong> €${reservation.totalPrice}</li>
        <li><strong>Number of Guests:</strong> ${reservation.numberOfPersons}</li>
        <li><strong>Contact Number:</strong> +${reservation.phone}</li>
      </ul>
  
      <p>We apologize for any inconvenience this may have caused. If you have any questions, feel free to reach out to us.</p>
  
      <p>Best Regards,</p>
      <p><strong>Putko Team</strong></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Schedule cleanup task to run every 5 seconds
cron.schedule("*/5 * * * * *", async () => {
  console.log("Running cleanup task for accommodations and reservations...");

  try {
    // Get all valid host IDs
    const hostIds = await Host.distinct("_id");

    // Find accommodations where userId is not in the host collection
    const accommodationsToDelete = await Accommodation.find({ userId: { $nin: hostIds } });

    // Store deleted accommodations before removing them
    if (accommodationsToDelete.length > 0) {
      const deletedAccommodations = accommodationsToDelete.map(acc => ({
        ...acc.toObject(),
        deletedAt: new Date(),
      }));
      await DeletedAccommodation.insertMany(deletedAccommodations);
    }

    // Delete accommodations from main collection
    const resultAccommodations = await Accommodation.deleteMany({ userId: { $nin: hostIds } });
    console.log(`Deleted ${resultAccommodations.deletedCount} accommodations with invalid userId.`);

    // Get all valid accommodation IDs
    const validAccommodationIds = await Accommodation.distinct("_id");

    // Find reservations where accommodationId does not exist
    const reservationsToDelete = await Reservation.find({ accommodationId: { $nin: validAccommodationIds } });

    // Send emails before deleting reservations
    for (const reservation of reservationsToDelete) {
      if (reservation.email) {
        await sendEmail(reservation.email, reservation);
      }
    }

    // Store deleted reservations before removing them (avoiding duplicates)
    if (reservationsToDelete.length > 0) {
      for (const res of reservationsToDelete) {
        try {
          await DeletedReservation.updateOne(
            { _id: res._id }, // Match by _id
            { $setOnInsert: { ...res.toObject(), deletedAt: new Date() } }, // Insert only if not exists
            { upsert: true } // Ensure it inserts only if missing
          );
        } catch (error) {
          console.error("Error inserting deleted reservation:", error);
        }
      }
    }

    // Delete reservations from main collection
    const resultReservations = await Reservation.deleteMany({ accommodationId: { $nin: validAccommodationIds } });
    console.log(`Deleted ${resultReservations.deletedCount} reservations with invalid accommodationId.`);
    
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
});

export default cron;
