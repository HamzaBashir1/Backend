import express from 'express';
import { addMessage, getMessages } from '../Controllers/messageController.js';

const router = express.Router(); // This should be correctly defined here

router.post("/addmsg", addMessage);
router.get("/getmsg", getMessages);

export default router;
