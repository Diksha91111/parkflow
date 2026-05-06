const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// @desc    Create a parking spot (Alias for add-slot)
// @route   POST /api/admin/parking
// @access  Private/Admin
exports.createParkingSpot = async (req, res) => {
  try {
    // Helper function to get single value from potentially array field (FormData can send arrays)
    const getSingleValue = (value) => {
      if (Array.isArray(value)) return value[0];
      return value;
    };
    
    // Extract and normalize values from req.body (handle FormData arrays)
    const name = getSingleValue(req.body.name);
    const address = getSingleValue(req.body.address);
    const lat = getSingleValue(req.body.lat);
    const lng = getSingleValue(req.body.lng);
    const totalSlots = getSingleValue(req.body.totalSlots);
    const pricePerHour = getSingleValue(req.body.pricePerHour);
    const type = getSingleValue(req.body.type);
    let amenities = getSingleValue(req.body.amenities);
    let operatingHours = getSingleValue(req.body.operatingHours);

    console.log("Creating spot - Request Body:", req.body);
    console.log("Creating spot - Normalized values:", { name, address, lat, lng, totalSlots, pricePerHour, type });
    if (req.file) console.log("Creating spot - File:", req.file.path);

    if (!name || !address) {
      return res.status(400).json({ success: false, message: "Name and address are required" });
    }
    if (lat == null || lat === '' || lng == null || lng === '') {
      return res.status(400).json({ success: false, message: "Coordinates (lat/lng) are required" });
    }
    if (totalSlots == null || totalSlots === '') {
      return res.status(400).json({ success: false, message: "Total slots is required" });
    }
    if (pricePerHour == null || pricePerHour === '') {
      return res.status(400).json({ success: false, message: "Price per hour is required" });
    }
    
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedTotalSlots = parseInt(totalSlots, 10);
    const parsedPrice = parseFloat(pricePerHour);

    if (isNaN(parsedLat) || isNaN(parsedLng) || isNaN(parsedTotalSlots) || isNaN(parsedPrice)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid numeric values for lat, lng, totalSlots, or pricePerHour' 
      });
    }

    let imageUrl = req.body.imageUrl || '';
    if (req.file) {
      imageUrl = req.file.path;
    }

    const spot = await ParkingSlot.create({
      name,
      address,
      location: { type: 'Point', coordinates: [parsedLng, parsedLat] },
      totalSlots: parsedTotalSlots,
      availableSlots: parsedTotalSlots,
      pricePerHour: parsedPrice,
      type: type || 'Open',
      imageUrl: imageUrl,
      amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',') : []),
      operatingHours: operatingHours || { open: '00:00', close: '23:59' },
      isActive: true,
      status: 'available'
    });

    const transformedSpot = {
      ...spot.toObject(),
      lat: spot.location.coordinates[1],
      lng: spot.location.coordinates[0]
    };

    if (req.app.get('io')) {
      req.app.get('io').emit('SLOT_ADDED', transformedSpot);
    }

    res.status(201).json({ success: true, data: transformedSpot });
  } catch (error) {
    console.error('CreateParkingSpot Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

// @desc    Add a parking slot (Specific endpoint as per requirement)
// @route   POST /api/admin/add-slot
// @access  Private/Admin
exports.addParkingSlot = async (req, res) => {
  try {
    console.log("--- START ADD SLOT PROCESS ---");
    console.log("Request Headers:", req.headers['content-type']);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    
    // Helper function to get single value from potentially array field (FormData can send arrays)
    const getSingleValue = (value) => {
      if (Array.isArray(value)) return value[0];
      return value;
    };
    
    // Support both single fields and nested fields if they exist
    // Handle FormData arrays by taking first element
    const name = getSingleValue(req.body.name) || getSingleValue(req.body.spotName);
    const address = getSingleValue(req.body.address);
    const lat = getSingleValue(req.body.lat);
    const lng = getSingleValue(req.body.lng);
    const totalSlots = getSingleValue(req.body.totalSlots);
    const pricePerHour = getSingleValue(req.body.pricePerHour) || getSingleValue(req.body.price);
    const type = getSingleValue(req.body.type) || 'Open';
    let amenities = getSingleValue(req.body.amenities);
    let operatingHours = getSingleValue(req.body.operatingHours);

    if (req.file) {
      console.log("Image File Received:", req.file.path);
    } else {
      console.log("No Image File Received in req.file");
    }

    // Step 1: Validation with specific error messages
    if (!name) return res.status(400).json({ success: false, message: "Spot Name is required" });
    if (!address) return res.status(400).json({ success: false, message: "Address is required" });
    if (lat === undefined || lat === null || lat === '') return res.status(400).json({ success: false, message: "Latitude is required" });
    if (lng === undefined || lng === null || lng === '') return res.status(400).json({ success: false, message: "Longitude is required" });
    if (totalSlots === undefined || totalSlots === null || totalSlots === '') return res.status(400).json({ success: false, message: "Total Slots is required" });
    if (pricePerHour === undefined || pricePerHour === null || pricePerHour === '') return res.status(400).json({ success: false, message: "Price per Hour is required" });

    // Step 2: Data Parsing
    const parsedTotalSlots = parseInt(totalSlots, 10);
    const parsedPrice = parseFloat(pricePerHour);
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedTotalSlots)) return res.status(400).json({ success: false, message: `Total Slots must be a valid number (received: ${totalSlots})` });
    if (isNaN(parsedPrice)) return res.status(400).json({ success: false, message: `Price per Hour must be a valid number (received: ${pricePerHour})` });
    if (isNaN(parsedLat)) return res.status(400).json({ success: false, message: `Latitude must be a valid number (received: ${lat})` });
    if (isNaN(parsedLng)) return res.status(400).json({ success: false, message: `Longitude must be a valid number (received: ${lng})` });

    // Step 3: Handle complex fields (amenities/hours)
    let parsedAmenities = [];
    if (Array.isArray(amenities)) {
      parsedAmenities = amenities;
    } else if (typeof amenities === 'string' && amenities.trim() !== '') {
      try {
        // Try parsing as JSON if it's a stringified array
        const jsonAmenities = JSON.parse(amenities);
        parsedAmenities = Array.isArray(jsonAmenities) ? jsonAmenities : [amenities];
      } catch (e) {
        // If not JSON, split by comma
        parsedAmenities = amenities.split(',').map(a => a.trim());
      }
    }

    let parsedHours = { open: '00:00', close: '23:59' };
    if (operatingHours) {
      try {
        parsedHours = typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours;
      } catch (e) {
        console.warn("Could not parse operatingHours, using defaults");
      }
    }

    let imageUrl = req.body.imageUrl || '';
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    }

    // Step 4: Database Save with detailed error catching
    console.log("Attempting to save to MongoDB...");
    
    const newSlotData = {
      name: name.trim(),
      address: address.trim(),
      location: { 
        type: 'Point', 
        coordinates: [parsedLng, parsedLat] 
      },
      totalSlots: parsedTotalSlots,
      availableSlots: parsedTotalSlots,
      pricePerHour: parsedPrice,
      type: type || 'Open',
      imageUrl: imageUrl,
      amenities: parsedAmenities,
      operatingHours: parsedHours,
      isActive: true,
      status: 'available'
    };
    
    // Only add owner if it's a valid MongoDB ObjectId
    if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
      newSlotData.owner = req.user._id;
    }

    try {
      console.log("Saving new spot data with direct save()...");
      const newSlot = new ParkingSlot(newSlotData);
      await newSlot.save();
      console.log("SUCCESS: Slot saved with ID:", newSlot._id);

      const transformedSpot = {
        ...newSlot.toObject(),
        lat: newSlot.location.coordinates[1],
        lng: newSlot.location.coordinates[0]
      };

      // WebSocket Notification
      try {
        if (req.app.get('io')) {
          req.app.get('io').emit('SLOT_ADDED', transformedSpot);
          console.log("WebSocket event emitted");
        }
      } catch (wsErr) {
        console.error("Non-fatal WebSocket error:", wsErr.message);
      }

      return res.status(201).json({ 
        success: true, 
        message: "Slot added successfully", 
        data: transformedSpot 
      });

    } catch (dbErr) {
      console.error("MONGODB SAVE ERROR:", dbErr);
      if (dbErr.name === 'ValidationError') {
        const messages = Object.values(dbErr.errors).map(val => val.message);
        return res.status(400).json({ success: false, message: `Database Validation: ${messages.join(', ')}` });
      }
      if (dbErr.code === 11000) {
        return res.status(400).json({ success: false, message: "A parking spot with this exact name or location already exists." });
      }
      throw dbErr; // Rethrow to be caught by outer catch
    }

  } catch (error) {
    console.error("FATAL ADD SLOT ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server side error while adding spot. Please check if all fields are correct.",
      error: error.message 
    });
  }
};

// @desc    Update a parking spot
// @route   PUT /api/admin/parking/:id
// @access  Private/Admin
exports.updateParkingSpot = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid spot ID' });
    }

    // Helper function to get single value from potentially array field (FormData can send arrays)
    const getSingleValue = (value) => {
      if (Array.isArray(value)) return value[0];
      return value;
    };

    // Normalize FormData arrays
    const updateData = {};
    for (const [key, value] of Object.entries(req.body)) {
      updateData[key] = getSingleValue(value);
    }

    if (req.file) {
      // With CloudinaryStorage, req.file.path will be the secure_url
      updateData.imageUrl = req.file.path;
    }

    // Rebuild GeoJSON if coordinates are provided
    if (updateData.lat != null && updateData.lng != null) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(updateData.lng), parseFloat(updateData.lat)],
      };
      delete updateData.lat;
      delete updateData.lng;
    }

    const spot = await ParkingSlot.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!spot) {
      return res.status(404).json({ success: false, message: 'Parking spot not found' });
    }

    res.status(200).json({ success: true, data: spot });
  } catch (error) {
    console.error('UpdateParkingSpot Error Details:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a parking spot
// @route   DELETE /api/admin/parking/:id
// @access  Private/Admin
exports.deleteParkingSpot = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid spot ID' });
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      parkingSlotId: req.params.id,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${activeBookings} active booking(s) exist for this spot`,
      });
    }

    const spot = await ParkingSlot.findByIdAndDelete(req.params.id);

    if (!spot) {
      return res.status(404).json({ success: false, message: 'Parking spot not found' });
    }

    res.status(200).json({ success: true, message: 'Parking spot deleted' });
  } catch (error) {
    console.error('DeleteParkingSpot Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all parking spots (admin view)
// @route   GET /api/admin/parking
// @access  Private/Admin
exports.getAllParkingSpots = async (req, res) => {
  try {
    const spots = await ParkingSlot.find({}).sort({ createdAt: -1 }).lean();

    const transformed = spots.map((spot) => ({
      ...spot,
      lat: spot.location.coordinates[1],
      lng: spot.location.coordinates[0],
    }));

    res.status(200).json({ success: true, count: transformed.length, data: transformed });
  } catch (error) {
    console.error('GetAllParkingSpots Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
