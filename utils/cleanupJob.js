import cron from 'node-cron';
import Accommodation from '../models/Accommodation.js';
import Host from '../models/Host.js';
import Reservation from '../models/Reservation.js';

// Schedule cleanup task to run every 5 second
cron.schedule('*/5 * * * * *', async () => {
  console.log('Running cleanup task for accommodations and reservations...');

  try {
    // Get all valid host IDs
    const hostIds = await Host.distinct('_id');

    // Delete accommodations where userId is not in the host collection
    const resultAccommodations = await Accommodation.deleteMany({ userId: { $nin: hostIds } });
    console.log(`Deleted ${resultAccommodations.deletedCount} accommodations with invalid userId.`);

    // Get all valid accommodation IDs
    const validAccommodationIds = await Accommodation.distinct('_id');

    // Delete reservations where accommodationId does not exist in Accommodation collection
    const resultReservations = await Reservation.deleteMany({ accommodationId: { $nin: validAccommodationIds } });
    console.log(`Deleted ${resultReservations.deletedCount} reservations with invalid accommodationId.`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

export default cron;
