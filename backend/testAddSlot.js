const mongoose = require('mongoose');
const User = require('./models/User');
const ParkingSlot = require('./models/ParkingSlot');
require('dotenv').config();

async function testAddSlot() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://user:o68q4Y22w8lEwR7d@cluster0.7ztwv7f.mongodb.net/smart-parking-db?retryWrites=true&w=majority');
  
  const newSlotData = {
    name: "Test Spot " + Date.now(),
    address: "123 Test St",
    location: { type: 'Point', coordinates: [73.5, 18.5] },
    totalSlots: 10,
    availableSlots: 10,
    pricePerHour: 20,
    type: 'Open',
    imageUrl: '',
    amenities: [],
    operatingHours: { open: '00:00', close: '23:59' },
    isActive: true,
    status: 'available',
  };

  try {
    const spot = new ParkingSlot(newSlotData);
    await spot.save();
    console.log("Success:", spot._id);
  } catch (e) {
    console.error("Save failed:", e);
  }
  mongoose.connection.close();
}

testAddSlot();
