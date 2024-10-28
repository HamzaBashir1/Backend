import express from 'express';
import fetchICal from '../Controllers/Calendar.js';

const router = express.Router();

// Route to fetch Airbnb iCal calendar
router.get("/calendar/:calendarId/:secretToken", fetchICal);

export default router;
