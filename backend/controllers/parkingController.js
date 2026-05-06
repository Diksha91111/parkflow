const ParkingSlot = require('../models/ParkingSlot');
const mongoose = require('mongoose');

// @desc    Get nearby parking spots
// @route   GET /api/parking/nearby
// @access  Public
exports.getNearbySpots = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = (parseFloat(radius) || 5) * 1000; // km to meters

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const spots = await ParkingSlot.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          distanceField: 'distance',
          maxDistance: maxDistance,
          spherical: true,
        },
      },
      { $match: { isActive: true } },
      { $sort: { distance: 1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          address: 1,
          type: 1,
          status: 1,
          imageUrl: 1,
          isActive: 1,
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
          totalSlots: 1,
          availableSlots: 1,
          pricePerHour: 1,
          amenities: 1,
          operatingHours: 1,
          distance: { $round: ['$distance', 0] },
        },
      },
    ]);

    if (spots.length === 0) {
      // Return empty if no spots found, but don't force dummy data into DB on every request
      // You can return mock data in response only if you want, but don't save it to DB
      const dummySlots = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Nashik Premium Plaza Parking (Sample)',
          address: '101 Main Road, Nearby',
          lat: latitude + 0.001,
          lng: longitude + 0.001,
          totalSlots: 50,
          availableSlots: 42,
          pricePerHour: 40,
          amenities: ['CCTV', 'EV Charging'],
          isActive: true,
          type: 'Open',
          distance: 100
        }
      ];
      return res.status(200).json({ success: true, count: 0, data: [], message: 'No spots found nearby' });
    }


    res.status(200).json({ success: true, count: spots.length, data: spots });
  } catch (error) {
    console.error('GetNearbySpots Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Search parking spots by name/address
// @route   GET /api/parking/search
// @access  Public
exports.searchSpots = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    const spots = await ParkingSlot.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean();

    // Transform coordinates to lat/lng
    const transformed = spots.map((spot) => ({
      ...spot,
      lat: spot.location.coordinates[1],
      lng: spot.location.coordinates[0],
    }));

    res.status(200).json({ success: true, count: transformed.length, data: transformed });
  } catch (error) {
    console.error('SearchSpots Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single parking spot
// @route   GET /api/parking/:id
// @access  Public
exports.getSpotById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid spot ID' });
    }

    const spot = await ParkingSlot.findById(req.params.id).lean();

    if (!spot) {
      return res.status(404).json({ success: false, message: 'Parking spot not found' });
    }

    const transformed = {
      ...spot,
      lat: spot.location.coordinates[1],
      lng: spot.location.coordinates[0],
    };

    res.status(200).json({ success: true, data: transformed });
  } catch (error) {
    console.error('GetSpotById Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
