const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Made optional to support mock users during testing
    },
    parkingSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSlot',
    },
    parkingLocation: {
      locationName: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    vehicle_number: {
      type: String,
      required: true,
    },
    booking_type: {
      type: String,
      enum: ['instant', 'advanced'],
      required: true,
    },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    duration_hours: { type: Number, required: true },
    amount_paid: {
      type: Number,
      required: true
    },
    commissionAmount: {
      type: Number,
      default: 0
    },
    partnerAmount: {
      type: Number,
      default: 0
    },
    payment_status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
    booking_status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    }
  },
  { timestamps: true }
);

// Auto-expire upcoming bookings after 5 minutes (300 seconds) if they haven't finished payment
bookingSchema.index(
  { createdAt: 1 }, 
  { expireAfterSeconds: 300, partialFilterExpression: { payment_status: 'Pending' } }
);

module.exports = mongoose.model('Booking', bookingSchema);
