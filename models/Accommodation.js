import mongoose from 'mongoose';

const accommodationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  description: {
    type: String
  },
  url: {
    type: String
  },
  virtualTourUrl: {
    type: String
  },
  propertyType: {
    type: String,
    enum: [
      'Apartment', 'Flat', 'Glamping', 'Cottages', 'Motels/Hostel', 'Wooden Houses', 
      'Guest Houses', 'Secluded Accommodation', 'Hotels', 'Dormitories', 'Caves', 
      'Campsites', 'Treehouses', 'Houseboats', 'Rooms', 'Entire Homes', 'Luxury Accommodation'
    ]
  },
  rentalform: {
    type: String,
    enum: [
      'Entire place', 'Private room', 'Share room'
    ]
  },
  excludedDates: {
    type: [Date], // Array of Date objects
    default: [],
  },
  priceMonThus: {
    type: Number,
    required: true
  },
  priceFriSun: {
    type: Number,
    required: true
  },
  discount: {
    type: Number
  },
  location: {
    address: {
      type: String,
      required: false
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  acreage: {
    type: String,
    enum: [
      '100', '200', '300', '400', '500'
    ]
  },
  tags: { type: [String], default: [] },
  nightMin: { type: Number, required: true },
  nightMax: { type: Number, required: true },
  beds: { type: Number,  },
  kitchen: { type: Number, },
  bedroom: { type: Number,  },  // Number of bedrooms
  bathroom: { type: Number, }, // Number of bathrooms
  person: {type: Number, required: true},
  locationDetails: {
    streetAndNumber: {
      type: String
    },
    roomNumber: {
      type: String
    },
    city: {
      type: String
    },
    zipCode: {
      type: String
    },
    country: {
      type: String
    },
    state: {
      type: String
    },
  },
  // Add userId to reference the user who created the accommodation
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host', // Reference to the User model
    required: true // Ensure that every accommodation has a user associated with it
  },
  arrivalAndDeparture: {
    arrivalFrom: {
      type: String, // Store as a string in "HH:MM" format
      required: false,
    },
    arrivalTo: {
      type: String, // Store as a string in "HH:MM" format
      required: false,
    },
    departureFrom: {
      type: String, // Store as a string in "HH:MM" format
      required: false,
    },
    departureTo: {
      type: String, // Store as a string in "HH:MM" format
      required: false,
    }
  },  
  generalAmenities: [
    {
      type: String,
      enum: [
        'Wifi', 'Internet', 'TV', 'Air conditioning', 'Fan',
        'Private entrance', 'Dryer', 'Heater', 'Washing machine', 'Detergent', 'Clothes dryer',
        'Baby cot', 'Desk', 'Fridge', 'Dryer'
      ]
    }
  ],
  otherAmenities: [
    {
      type: String,
      enum: [
        'Wardrobe', 'Cloth hook', 'Extra cushion', 'Gas stove', 'Toilet paper',
        'Free toiletries', 'Makeup table', 'Hot pot', 'Bathroom heaters', 'Kettle', 'Dishwasher',
        'BBQ grill', 'Toaster', 'Towel', 'Dining table'
      ]
    }
  ],
  safeAmenities: [
    {
      type: String,
      enum: [
        'Fire siren', 'Fire extinguisher', 'Anti-theft key', 'Safe vault'
      ]
    }
  ],
  amenties: {
    type: String,
    enum: [
      'Do not allow',
      'Allow',
      'Charge'
    ]
  },
  pet: {
    type: String,
    enum: [
      'Do not allow',
      'Allow',
      'Charge'
    ]
  },
  partyOrganizing: {
    type: String,
    enum: [
      'Do not allow',
      'Allow',
      'Charge'
    ]
  },
  cooking: {
    type: String,
    enum: [
      'Do not allow',
      'Allow',
      'Charge'
    ]
  },
  images: [
    {
      type: String
    }
  ],
  reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
  averageRating: {
    type: Number,
    default: 0,
  },
  Reservation: [{ type: mongoose.Types.ObjectId, ref: "Reservation" }],
  occupancyCalendar: [
    {
      startDate: {
        type: Date,
        required: false
      },
      endDate: {
        type: Date,
        required: false
      },
      guestName: {
        type: String,
        default: 'N/A'
      },
      status: {
        type: String,
        enum: ['booked', 'available', 'blocked'],
        default: 'booked'
      }
    }
  ],
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  customerInterest: { type: Number, default: 0 },
  date: {
    type: Date,
    default: Date.now // Sets the date to the current date/time upon creation
  }
}, { timestamps: true });

export default mongoose.model('Accommodation', accommodationSchema);
