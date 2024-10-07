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
  propertyType: {
    type: String,
    enum: [
      'Apartment', 'Flat', 'Glamping', 'Cottages', 'Motels/Hostel', 'Wooden Houses', 
      'Guest Houses', 'Secluded Accommodation', 'Hotels', 'Dormitories', 'Caves', 
      'Campsites', 'Treehouses', 'Houseboats', 'Rooms', 'Entire Homes', 'Luxury Accommodation'
    ]
  },
  price: {
    type: Number,
    required: false
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
  bedroomCount: { type: Number, required: true },  // Number of bedrooms
  bathroomCount: { type: Number, required: true }, // Number of bathrooms
  person: {type: Number, required: true},
  locationDetails: {
    streetAndNumber: {
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
    locationDescription: {
      type: String
    },
    placesNearby: [
      {
        placeType: {
          type: String,
          enum: [
              'Restaurant',
              'Supermarket',
              'BusStation',
              'TrainStation',
              'Airport',
              'SkiSlope',
              'AquaPark',
              'TouristTrail',
              'CycleRoute',
              'ATM',
              'GasStation',
              'ChargingStation',
              'CableCar',
              'SwimmingPool',
              'WaterArea',
              'TheSea',
              'Beach',
              'Castle',
              'Zoo',
              'Museum',
              'BusinessCenter',
          ]
        },
        distance: {
          type: Number,  // This already supports decimal numbers
          required: true,
          min: 0,  // Minimum value can be 0
          validate: {
            validator: function(value) {
              return value >= 0;  // Only positive numbers
            },
            message: 'Distance cannot be negative'
          }
        }
      }
    ]
  },
  contactDetails: {
    host: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    website: {
      type: String
    },
    whatsapp: {
      type: String
    },
    additionalContactInfo: {
      type: String
    }
  },
  // Add userId to reference the user who created the accommodation
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true // Ensure that every accommodation has a user associated with it
  },
  arrivalAndDeparture: {
    arrivalFrom: {
      type: String, // Store as a string in "HH:MM" format
      required: true,
    },
    arrivalTo: {
      type: String, // Store as a string in "HH:MM" format
      required: true,
    },
    departureFrom: {
      type: String, // Store as a string in "HH:MM" format
      required: true,
    },
    departureTo: {
      type: String, // Store as a string in "HH:MM" format
      required: true,
    }
  },    
  checkinCheckoutProcess: {
    type: String,
    enum: [
      'Reception',
      'Reception 24/7',
      'Self-Service Accommodation Process',
      'By Agreement with Accommodation Provider'
    ]
  },
  wifi: {
    type: String,
    enum: ['Free of Charge', 'For a Fee', 'Not Available']
  },
  equipmentAndServices: [
    {
      type: String,
      enum: [
        'Free Wifi', 'High speed internet', 'Barrier-free access', 'Charging station', 'Reception', 
        'Invoicing possible', 'Card payment possible', 'Room service', 'Air conditioning', 'ATM', 
        'Parking', 'Kitchen', 'Exchange office', 'Restaurant', 'Bar', 'Wellness', 'Swimming pool', 
        'Hairdressing', 'Game room', 'Fireplace', 'Grill', 'Shelter', 'Terrace', 'Conference Room', 
        'Laundry Room', 'Cleaning plant'
      ]
    }
  ],
  children: [
    {
      type: String,
      enum: [
        'Children are welcome here', 'Family rooms', 'Children pool', 'Children Menu', 
        'Babysitting', 'Children corner', 'Children playground', 'Sandbox', 'Slide', 'Children Toys'
      ]
    }
  ],
  diet: [
    {
      type: String,
      enum: ['Own catering', 'Breakfast', 'Half board', 'Full board', 'All inclusive']
    }
  ],
  typeOfStay: [
    {
      type: String,
      enum: [
        'With children', 'For Seniors', 'Romance for two', 'For the demanding', 
        'For groups', 'Corporate action', 'With a pet', 'Without children', 'For the undemanding'
      ]
    }
  ],
  responseSpeed: {
    type: String,
    enum: [
      "I don't want state", 'Within an hour', 'Within 24 hours', 'The next day', 
      'Within an hour on weekdays', 'On working days up to 24 hours', 
      'We always try to respond as soon as possible'
    ]
  },
  pets: {
    type: String,
    enum: ["They are not allowed", 'Pets are allowed', 'Allowed for a fee', 'By agreement with accommodation provider']
  },
  loudMusic: {
    type: String,
    enum: ["It is not allowed", 'It is allowed']
  },
  smoking: {
    type: String,
    enum: ["It is not allowed", 'It is allowed']
  },
  parking: {
    type: String,
    enum: ["Free of charge", 'For a fee', 'We do not provide', 'Free and for a fee']
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
