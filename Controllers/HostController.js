import Host from '../models/Host.js';
import mongoose from 'mongoose';

export const updateHost = async (req, res) => {
    const id = req.params.id;

    try {
        const updatedHost = await Host.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).json({ success: true, message: 'Successfully updated', data: updatedHost });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update' });
    }
};

export const deleteHost = async (req, res) => {
    const id = req.params.id;

    try {
        await Host.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Successfully deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete' });
    }
};

export const getSingleHost = async (req, res) => {
    const id = req.params.id;

    try {
        const host = await Host.findById(id).select('-password');

        if (!host) {
            return res.status(404).json({ success: false, message: 'No host found' });
        }

        res.status(200).json({ success: true, message: 'Host found', data: host });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

export const getAllHosts = async (req, res) => {
    try {
        const hosts = await Host.find({}).select('-password');

        res.status(200).json({ success: true, message: 'Hosts found', data: hosts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

export const getHostProfile = async (req, res) => {
    const id = req.params.id;

    try {
        const host = await Host.findById(id);

        if (!host) {
            return res.status(404).json({ success: false, message: 'Host not found' });
        }

        const { password, ...rest } = host._doc;

        res.status(200).json({ success: true, message: 'Profile info retrieved', data: { ...rest } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
};

export const getHostById = async (req, res) => {
  const { userId } = req.params;

  console.log("Received userId:", userId); // Log userId

  // Check if userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.log("Invalid userId format:", userId); // Log invalid userId
    return res.status(400).json({ message: "Invalid host ID format" });
  }

  try {
    // Fetch host by ID from the database
    const user = await Host.findById(userId);

    // If the host doesn't exist, return a 404
    if (!user) {
      return res.status(404).json({ message: "Host not found" });
    }

    // Return the host data
    return res.status(200).json(user);
  } catch (error) {
    // Log error and return a 500 status code
    console.error("Error fetching host by ID:", error);
    return res.status(500).json({ message: "Server error" });
  }
};