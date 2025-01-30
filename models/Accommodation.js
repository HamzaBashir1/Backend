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
      "Nature House", "Wooden House", "Houseboats", "Farm House", "Dome House",
      "Wooden Dome", "Apartment", "Glamping", "Cottages", "Motels/Hostel",
      "Wooden Houses", "Guest Houses", "Secluded Accommodation", "Hotels",
      "Dormitories", "Campsites", "Treehouses", "Rooms", "Entire Homes",
      "Luxury Accommodation",
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
  singlebed : { type: Number },
  doublebed : { type: Number},
  kitchen: { type: Number, },
  bedroom: { type: Number,  },  // Number of bedrooms
  bathroom: { type: Number, }, // Number of bathrooms
  person: {type: Number, required: true},
  locationDetails: {
    streetAndNumber: {
      type: String,
      set: (value) => value?.toLowerCase()
    },
    roomNumber: {
      type: String,
      set: (value) => value?.toLowerCase()
    },
    city: {
      type: String,
      set: (value) => value?.toLowerCase()
    },
    zipCode: {
      type: String
    },
    country: {
      type: String
    },
    state: {
      type: String,
      set: (value) => value?.toLowerCase()
    },
  },
  // Add userId to reference the user who created the accommodation
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host', // Reference to the User model
    required: true // Ensure that every accommodation has a user associated with it
  },
  phoneNumber: { type: String, required: true },
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
  },
  // generalAmenities: [
  //   {
  //     type: String,
  //     enum: [
  //       'Wifi', 'Internet', 'TV', 'Air conditioning', 'Fan',
  //       'Private entrance', 'Dryer', 'Heater', 'Washing machine', 'Detergent', 'Clothes dryer',
  //       'Baby cot', 'Desk', 'Fridge', 'Dryer'
  //     ]
  //   }
  // ],
  // otherAmenities: [
  //   {
  //     type: String,
  //     enum: [
  //       'Wardrobe', 'Cloth hook', 'Extra cushion', 'Gas stove', 'Toilet paper',
  //       'Free toiletries', 'Makeup table', 'Hot pot', 'Bathroom heaters', 'Kettle', 'Dishwasher',
  //       'BBQ grill', 'Toaster', 'Towel', 'Dining table'
  //     ]
  //   }
  // ],
  // safeAmenities: [
  //   {
  //     type: String,
  //     enum: [
  //       'Fire siren', 'Fire extinguisher', 'Anti-theft key', 'Safe vault'
  //     ]
  //   }
  // ],
  services: [
    {
      type: String,
      enum: [
        "Wifi", "TV", "PC Desk(workspace)"
      ]
    }
  ],
  bathroomAmenities: [
    {
      type: String,
      enum: [
        'Bathtub', 'Shower', 'Washing Machine', 'Dryer', 'Ironing',
      ],
    },
  ],
  kitchenDiningAmenities: [
    {
      type: String,
      enum: [
        'Stovetop', 'Oven', 'Dishwasher', 'Refrigerator', 'Freezer', 
        'Dining Table', 'Coffee Maker',
      ],
    },
  ],
  heatingCoolingAmenities: [
    {
      type: String,
      enum: [
        'Indoor FirePlace', 'Air Conditioning', 'Central Heating',
      ],
    },
  ],
  safetyAmenities: [
    {
      type: String,
      enum: [
        'Fire Extinguisher', 'First Aid Kit',
      ],
    },
  ],
  wellnessAmenities: [
    {
      type: String,
      enum: [
        'Sauna', 'Hot Tub', 'Indoor pool', 'Outdoor pool', 'None',
      ],
    },
  ],
  outdoorAmenities: [
    {
      type: String,
      enum: [
        'Firepit', 'Balcony', 'Terrace', 'Outdoor dining area', 'Grill', 'None',
      ],
    },
  ],
  parkingFacilities: [
    {
      type: String,
      enum: [
        'Free Parking on-site', 'Paid Parking on-site', 'Public Parking',
      ],
    },
  ],
  checkIn: [
    {
      type: String,
      enum: [
        'Self Check-in', 'Reception', 'Host Greeting',
      ],
    },
  ],
  meals: [
    {
      type: String,
      enum: [
        'No Meals', 'Breakfast', 'Half Board', 'Full Board', 'All-Inclusive',
      ],
    },
  ],
  // amenties: {
  //   type: String,
  //   enum: [
  //     'Do not allow',
  //     'Allow',
  //     'Charge'
  //   ]
  // },
  pet: {
    type: String,
    enum: [
      'Allowed at no extra charge',
      'Allowed with an additional fee',
      'Not Allowed'
    ]
  },
  partyOrganizing: {
    type: String,
    enum: [
      'Allowed',
      'Not Allowed'
    ]
  },
  smoking: {
    type: String,
    enum: [
      'Allowed indoors',
      'Allow in designated areas',
      'Not allowed'
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
