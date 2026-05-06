const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');

// Initialize Razorpay (will throw if keys are missing but app shouldn't crash until used)
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret'
  });
};

// @desc    Create Razorpay Order and initialize Booking
// @route   POST /api/bookings/create
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { spotId, locationName, lat, lng, price, durationHours, vehicleNumber, bookingType, startTime } = req.body;
    
    if (!vehicleNumber || !bookingType) {
      return res.status(400).json({ success: false, message: 'Vehicle number and booking type are required' });
    }
    
    const totalAmount = price * durationHours;

    // Razorpay amount is always in paisa/cents
    const options = {
      amount: totalAmount * 100,  
      currency: "INR",
      receipt: `rcpt_${Math.floor(Math.random() * 10000)}`
    };

    // Bypassing Razorpay Instantiation to avoid API crashes with mock credentials
    // const rzp = getRazorpayInstance();
    // const order = await rzp.orders.create(options);
    
    const order = { id: `order_mock_${Math.floor(Math.random() * 1000000)}` };

    let commissionAmount = 0;
    let partnerAmount = totalAmount;

    // Default 10% commission if no premium user or complex logic triggers
    // You can refine this using user.isPremium later
    if (spotId) {
      commissionAmount = totalAmount * 0.10;
      partnerAmount = totalAmount - commissionAmount;
    }

    // Calculate exact start and end times based on instant vs advanced
    let finalStartTime = new Date();
    if (bookingType === 'advanced' && startTime) {
      finalStartTime = new Date(startTime);
    }
    const finalEndTime = new Date(finalStartTime.getTime() + durationHours * 60 * 60 * 1000);

    // Save pending booking to DB
    // Check if userId is a valid ObjectId, otherwise use null for mock users
    const mongoose = require('mongoose');
    const validUserId = mongoose.Types.ObjectId.isValid(req.user._id) ? req.user._id : null;
    
    const booking = await Booking.create({
      userId: validUserId,
      parkingSlotId: spotId || undefined,
      parkingLocation: {
        locationName,
        lat,
        lng
      },
      vehicle_number: vehicleNumber,
      booking_type: bookingType,
      start_time: finalStartTime,
      end_time: finalEndTime,
      duration_hours: durationHours,
      amount_paid: totalAmount,
      commissionAmount,
      partnerAmount,
      razorpayOrderId: order.id,
      payment_status: 'Completed', // Mocked as explicitly Completed per frontend bypass
      booking_status: 'upcoming'
    });

    // Atomically decrement available slots if spotId is a valid ParkingSlot
    if (spotId) {
      const updated = await ParkingSlot.findOneAndUpdate(
        { _id: spotId, availableSlots: { $gt: 0 } },
        { $inc: { availableSlots: -1 } },
        { new: true }
      );
      if (!updated) {
        await Booking.findByIdAndDelete(booking._id);
        return res.status(400).json({ success: false, message: 'No available slots for this parking spot' });
      }
    }

    res.status(201).json({
      success: true,
      booking,
      orderId: order.id,
      amount: totalAmount
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Server Error during payment init' });
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/bookings/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    // Verify signature logic
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret';
    
    // Hash HMAC SHA256
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment Successful - update DB
      await Booking.findByIdAndUpdate(bookingId, {
        payment_status: 'Completed',
        razorpayPaymentId: razorpay_payment_id
      });

      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, message: 'Server Verification Error' });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if userId is a valid ObjectId (skip query for mock users)
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      // Return empty array for mock users
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    
    const bookings = await Booking.find({ userId })
      .populate('parkingSlotId', 'name address')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error('GetMyBookings Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Mark Slot as Occupied (I've Parked)
// @route   POST /api/bookings/:id/occupy
// @access  Private
exports.markOccupied = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    booking.booking_status = 'active';
    await booking.save();

    if (booking.parkingSlotId) {
       await ParkingSlot.findByIdAndUpdate(booking.parkingSlotId, {
         status: 'occupied',
         availableSlots: 0 // Simplistic override to mark fully occupied for the demo
       });
       
       // Trigger Socket.io broadcast via app instance
       const io = req.app.get('io');
       if (io) {
         io.emit('SLOT_UPDATED', { slotId: booking.parkingSlotId, status: 'occupied' });
       }
    }

    res.status(200).json({ success: true, message: 'Slot marked as occupied successfully' });
  } catch (error) {
    console.error('Mark Occupied Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get current user's dashboard metrics
// @route   GET /api/bookings/my-metrics
// @access  Private
exports.getMyMetrics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if userId is a valid ObjectId (skip query for mock users)
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      // Return mock metrics for mock users
      return res.status(200).json({
        success: true,
        data: {
          totalBookings: 0,
          activeBookings: 0,
          totalSpent: 0
        }
      });
    }
    
    const bookings = await Booking.find({ userId });
    
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.booking_status === 'active' || b.booking_status === 'upcoming').length;
    const totalSpent = bookings
      .filter(b => b.payment_status === 'Completed')
      .reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        activeBookings,
        totalSpent
      }
    });
  } catch (error) {
    console.error('my-metrics error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};
