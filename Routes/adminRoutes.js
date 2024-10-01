import express from 'express';
import { registerAdmin, loginAdmin, getAllAdmins, getAdminById, updateAdmin, deleteAdmin } from '../Controllers/AdminController.js';


const router = express.Router();

// Register Admin
router.post('/register', registerAdmin);

// Login Admin
router.post('/login', loginAdmin);

// Get All Admins
router.get('/', getAllAdmins);

// Get Admin by ID
router.get('/:adminId', getAdminById);

// Update Admin
router.patch('/:adminId', updateAdmin);

// Delete Admin
router.delete('/:adminId', deleteAdmin);

export default router;