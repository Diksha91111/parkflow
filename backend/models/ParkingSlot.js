const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a parking spot name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please add coordinates'],
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
    totalSlots: {
      type: Number,
      required: [true, 'Please add total slots'],
      min: [1, 'Must have at least 1 slot'],
    },
    availableSlots: {
      type: Number,
      required: [true, 'Please add available slots'],
      min: [0, 'Available slots cannot be negative'],
      validate: {
        validator: function (val) {
          return val <= this.totalSlots;
        },
        message: 'Available slots cannot exceed total slots',
      },
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Please add price per hour'],
      min: [0, 'Price cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    operatingHours: {
      open: { type: String, default: '00:00' },
      close: { type: String, default: '23:59' },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    commissionRate: {
      type: Number,
      default: 0.10,
    },
    type: {
      type: String,
      enum: ['Covered', 'Open', 'Basement', 'EV-friendly', 'Bike'],
      default: 'Open',
    },
    status: {
      type: String,
      enum: ['available', 'occupied'],
      default: 'available',
    },
  },
  { timestamps: true }
);

// Geospatial index for nearby queries
parkingSlotSchema.index({ location: '2dsphere' });

// Text index for search
parkingSlotSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
