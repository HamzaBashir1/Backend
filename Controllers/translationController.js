import fetch from "node-fetch";
import Accommodation from "../models/Accommodation.js"; // Adjust path as needed

export const translateAccommodation = async (req, res) => {
    const { id, from, to } = req.query;

    if (!id || !from || !to) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
        // ✅ 1. Fetch accommodation data from MongoDB
        const accommodation = await Accommodation.findById(id).lean();

        if (!accommodation) {
            return res.status(404).json({ error: "Accommodation not found" });
        }

        // ✅ 2. Define fields to translate
        const fieldsToTranslate = [
            "name",
            "description",
            "propertyType",
            "rentalform",
            "pet",
            "partyOrganizing",
            "smoking"
        ];

        const arrayFieldsToTranslate = [
            "services",
            "bathroomAmenities",
            "kitchenDiningAmenities",
            "heatingCoolingAmenities",
            "safetyAmenities",
            "wellnessAmenities",
            "outdoorAmenities",
            "parkingFacilities",
            "checkIn",
            "meals"
        ];

        const translatedAccommodation = { ...accommodation }; // Clone object

        // ✅ 3. Translate individual text fields
        if (from !== to) {
            for (const field of fieldsToTranslate) {
                if (accommodation[field]) {
                    const lingvaApiUrl = `https://lingva.ml/api/v1/${from}/${to}/${encodeURIComponent(accommodation[field])}`;

                    try {
                        const response = await fetch(lingvaApiUrl);
                        if (response.ok) {
                            const data = await response.json();
                            translatedAccommodation[field] = data.translation;
                        } else {
                            console.error(`Translation failed for field: ${field}`);
                        }
                    } catch (error) {
                        console.error(`Error fetching translation for field: ${field}`, error);
                    }
                }
            }

            // ✅ 4. Translate array fields
            for (const field of arrayFieldsToTranslate) {
                if (Array.isArray(accommodation[field]) && accommodation[field].length > 0) {
                    const translatedArray = await Promise.all(
                        accommodation[field].map(async (item) => {
                            const lingvaApiUrl = `https://lingva.ml/api/v1/${from}/${to}/${encodeURIComponent(item)}`;
                            try {
                                const response = await fetch(lingvaApiUrl);
                                if (response.ok) {
                                    const data = await response.json();
                                    return data.translation; // Return translated text
                                }
                            } catch (error) {
                                console.error(`Error fetching translation for field: ${field}, item: ${item}`, error);
                            }
                            return item; // Fallback to original value if translation fails
                        })
                    );
                    translatedAccommodation[field] = translatedArray;
                }
            }
        }

        // ✅ 5. Return translated (or original) data
        res.status(200).json(translatedAccommodation);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
};
