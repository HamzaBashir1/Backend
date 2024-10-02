

import express from "express";
import { 
    updateUser,
    deleteUser, 
    getAllUser, 
    getSingleUser,
    getUserProfile,
} 
from "../Controllers/userController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";



const router = express.Router();

router.get('/:id', authenticate, restrict(['guest']), getSingleUser);
router.get('/', authenticate, restrict(['admin']),  getAllUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/profile/me/:id', authenticate, restrict(['guest']), getUserProfile);

export default router;