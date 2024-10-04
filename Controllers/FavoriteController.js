import User from '../models/User.js';
import Accommodation from '../models/Accommodation.js';

// Add an accommodation to favorites
export const addFavorite = async (req, res) => {
    try {
        const { userId, accommodationId } = req.body;

        if (!userId || !accommodationId) {
            return res.status(400).json({ error: 'User ID and Accommodation ID are required' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the accommodation exists
        const accommodation = await Accommodation.findById(accommodationId);
        if (!accommodation) {
            return res.status(404).json({ error: 'Accommodation not found' });
        }

        // Check if the accommodation is already in favorites
        if (user.favorites.includes(accommodationId)) {
            return res.status(400).json({ error: 'Accommodation already in favorites' });
        }

        // Add the accommodation to the user's favorites
        user.favorites.push(accommodationId);
        await user.save();

        res.status(200).json({ message: 'Added to favorites successfully' });
    } catch (error) {
        console.error("Error in addFavorite controller:", error.message);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Remove an accommodation from favorites
export const removeFavorite = async (req, res) => {
    try {
        const { userId, accommodationId } = req.body;

        if (!userId || !accommodationId) {
            return res.status(400).json({ error: 'User ID and Accommodation ID are required' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the accommodation from favorites
        user.favorites = user.favorites.filter(favId => favId.toString() !== accommodationId);
        await user.save();

        res.status(200).json({ message: 'Removed from favorites successfully' });
    } catch (error) {
        console.error("Error in removeFavorite controller:", error.message);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get all favorite accommodations of the user
export const getFavorites = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Check if the user exists
        const user = await User.findById(userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ favorites: user.favorites });
    } catch (error) {
        console.error("Error in getFavorites controller:", error.message);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};
