import cron from 'node-cron';
import Accommodation from '../models/Accommodation.js';
import Host from '../models/Host.js';

// Schedule cleanup task to run every 5 minutes
cron.schedule('*/1 * * * *', async () => {
  console.log('Running cleanup task for accommodations...');

  try {
    // Get all valid host IDs
    const hostIds = await Host.distinct('_id');

    // Delete accommodations where userId is not in the host collection
    const result = await Accommodation.deleteMany({ userId: { $nin: hostIds } });

    console.log(`Deleted ${result.deletedCount} accommodations with invalid userId.`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

export default cron;
