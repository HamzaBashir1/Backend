import axios from 'axios';
import ical from 'ical';

export const fetchICal = async (req, res) => {
    try {
        const { calendarId, secretToken } = req.params;
        if (!calendarId || !secretToken) {
            return res.status(400).json({ error: "Calendar ID and Secret Token are required." });
        }

        const iCalUrl = `https://www.airbnb.com/calendar/ical/${calendarId}.ics?s=${secretToken}`;

        // Fetch the iCal data
        const response = await axios.get(iCalUrl);
        const iCalData = response.data;

        // Parse the iCal data
        const events = ical.parseICS(iCalData);
        const bookings = [];

        for (const eventId in events) {
            const event = events[eventId];
            if (event.type === 'VEVENT') {
                bookings.push({
                    start: event.start,
                    end: event.end,
                    summary: event.summary,
                    description: event.description,
                });
            }
        }

        // Return parsed booking data to the client
        res.json({ bookings });
    } catch (error) {
        console.error("Error fetching iCal data:", error.message);
        res.status(500).json({ error: "Failed to fetch calendar data." });
    }
};

export default fetchICal; 

// Generic ICS fetcher that accepts a full URL from any provider (Airbnb, Booking.com, VRBO, Google Calendar, etc.)
export const fetchICalByUrl = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== 'string') { 
            return res.status(400).json({ error: "Query param 'url' is required" });
        }

        // Basic validation: only allow http/https
        let parsed;
        try {
            parsed = new URL(url);
        } catch {
            return res.status(400).json({ error: "Invalid URL" });
        }
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return res.status(400).json({ error: "Only http/https URLs are allowed" });
        }

        // Fetch ICS
        const response = await axios.get(parsed.toString(), { responseType: 'text' });
        const iCalData = response.data;

        // Parse ICS into unified booking objects
        const events = ical.parseICS(iCalData);
        const bookings = [];
        for (const eventId in events) {
            const event = events[eventId];
            if (event && event.type === 'VEVENT') {
                bookings.push({
                    start: event.start,
                    end: event.end,
                    summary: event.summary,
                    description: event.description,
                    uid: event.uid,
                    location: event.location,
                });
            }
        }

        return res.json({ bookings });
    } catch (error) {
        console.error("Error fetching generic iCal:", error.message);
        return res.status(500).json({ error: "Failed to fetch calendar data." });
    }
};
