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
