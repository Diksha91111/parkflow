const Feedback = require('../models/Feedback');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');

// @desc    Submit new feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { parkingSpotId, rating, comment, spotName } = req.body;

    if (!parkingSpotId || !rating) {
      return res.status(400).json({ success: false, message: 'Please provide parking spot and rating' });
    }

    let resolvedSpotName = spotName || 'Unknown Spot';
    try {
      if (parkingSpotId && parkingSpotId.length === 24) {
        const spot = await ParkingSlot.findById(parkingSpotId);
        if (spot) resolvedSpotName = spot.name;
      }
    } catch(err) {}

    // Verify user has booked this spot before
    // const hasBooked = await Booking.findOne({
    //   userId: req.user._id,
    //   parkingSlotId: parkingSpotId,
    //   booking_status: 'completed'
    // });

    // if (!hasBooked) {
    //   return res.status(400).json({ success: false, message: 'You can only review spots you have completed a booking for.' });
    // }

    const feedback = await Feedback.create({
      userId: req.user._id,
      userName: req.user.name,
      parkingSpotId,
      spotName: resolvedSpotName,
      rating: Number(rating),
      comment
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Submit Feedback Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
