import Host from '../models/Host.js'; // Adjust the path as needed
import User from '../models/User.js'; // Adjust the path as needed

// Create a new host
export const createHost = async (req, res) => {
  try {
    const { userId, ...hostData } = req.body;

    // Optionally ensure user exists (if userId is provided)
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    // Create the host
    const host = new Host({ user: userId, ...hostData });
    await host.save();

    return res.status(201).json({ message: 'Host created successfully' });
  } catch (error) {
    console.error('Error creating host:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Retrieve a host by ID with user details (if user is populated)
export const getHostById = async (req, res) => {
  try {
    const { id } = req.params;
    const host = await Host.findById(id).populate('user').exec();

    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    return res.status(200).json(host);
  } catch (error) {
    console.error('Error retrieving host:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// List all hosts
export const getAllHosts = async (req, res) => {
  try {
    const hosts = await Host.find().populate('user').exec();
    return res.status(200).json(hosts);
  } catch (error) {
    console.error('Error listing hosts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a host by ID
export const updateHost = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedHost = await Host.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedHost) {
      return res.status(404).json({ message: 'Host not found' });
    }

    return res.status(200).json(updatedHost);
  } catch (error) {
    console.error('Error updating host:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a host by ID
export const deleteHost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHost = await Host.findByIdAndDelete(id);

    if (!deletedHost) {
      return res.status(404).json({ message: 'Host not found' });
    }

    return res.status(200).json({ message: 'Host deleted successfully' });
  } catch (error) {
    console.error('Error deleting host:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
