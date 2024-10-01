import express from 'express';
import {
  createHost,
  getHostById,
  getAllHosts,
  updateHost,
  deleteHost
} from '../Controllers/HostController.js'; // Adjust the path as needed

const router = express.Router();

// Create a new host
router.post('/hosts', createHost);

// Retrieve a host by ID
router.get('/hosts/:id', getHostById);

// List all hosts
router.get('/hosts', getAllHosts);

// Update a host by ID
router.put('/hosts/:id', updateHost);

// Delete a host by ID
router.delete('/hosts/:id', deleteHost);

export default router;
