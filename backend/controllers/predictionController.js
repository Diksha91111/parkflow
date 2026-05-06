const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');

// @desc    Get demand prediction for an area
// @route   GET /api/prediction/demand
// @access  Private
exports.getDemandPrediction = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Find nearby parking slots within 2km
    const nearbySlots = await ParkingSlot.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: 2000,
          spherical: true,
        },
      },
      { $match: { isActive: true } },
    ]);

    const slotIds = nearbySlots.map((s) => s._id);

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0=Sunday ... 6=Saturday
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Get bookings from last 28 days for these slots
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    // Compute demand for current hour and next 3 hours
    const forecast = [];
    for (let offset = 0; offset <= 3; offset++) {
      const targetHour = (currentHour + offset) % 24;

      const bookingCounts = await Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: fourWeeksAgo },
            status: { $ne: 'Cancelled' },
            ...(slotIds.length > 0 ? { parkingSlotId: { $in: slotIds } } : {}),
          },
        },
        {
          $project: {
            hour: { $hour: '$time.startTime' },
            dayOfWeek: { $dayOfWeek: '$time.startTime' }, // 1=Sunday ... 7=Saturday
          },
        },
        {
          $match: {
            hour: targetHour,
            dayOfWeek: currentDay + 1, // MongoDB $dayOfWeek is 1-indexed
          },
        },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
          },
        },
      ]);

      const totalBookings = bookingCounts.length > 0 ? bookingCounts[0].totalBookings : 0;
      const avgBookings = totalBookings / 4; // 4 weeks

      let demand = 'Low';
      if (avgBookings >= 8) demand = 'High';
      else if (avgBookings >= 4) demand = 'Medium';

      forecast.push({
        hour: targetHour,
        demand,
        avgBookings: Math.round(avgBookings * 10) / 10,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        currentDemand: forecast[0].demand,
        currentHour,
        dayOfWeek: daysOfWeek[currentDay],
        forecast,
        nearbySpots: nearbySlots.length,
      },
    });
  } catch (error) {
    console.error('GetDemandPrediction Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get best parking spot suggestion
// @route   GET /api/prediction/best-spot
// @access  Private
exports.getBestSpot = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Find nearby active spots with availability
    const spots = await ParkingSlot.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: 5000, // 5km
          spherical: true,
        },
      },
      { $match: { isActive: true, availableSlots: { $gt: 0 } } },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
          totalSlots: 1,
          availableSlots: 1,
          pricePerHour: 1,
          distance: 1,
        },
      },
    ]);

    if (spots.length === 0) {
      return res.status(200).json({
        success: true,
        data: { recommended: null, alternatives: [], message: 'No available spots nearby' },
      });
    }

    // Normalize and score
    const maxPrice = Math.max(...spots.map((s) => s.pricePerHour));
    const minPrice = Math.min(...spots.map((s) => s.pricePerHour));
    const maxDist = Math.max(...spots.map((s) => s.distance));
    const minDist = Math.min(...spots.map((s) => s.distance));

    const scored = spots.map((spot) => {
      const availabilityScore = spot.availableSlots / spot.totalSlots;

      const priceRange = maxPrice - minPrice;
      const priceScore = priceRange > 0 ? 1 - (spot.pricePerHour - minPrice) / priceRange : 1;

      const distRange = maxDist - minDist;
      const distanceScore = distRange > 0 ? 1 - (spot.distance - minDist) / distRange : 1;

      const score = 0.4 * availabilityScore + 0.3 * priceScore + 0.3 * distanceScore;

      return { ...spot, score: Math.round(score * 100) / 100 };
    });

    scored.sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      data: {
        recommended: scored[0],
        alternatives: scored.slice(1, 3),
      },
    });
  } catch (error) {
    console.error('GetBestSpot Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
