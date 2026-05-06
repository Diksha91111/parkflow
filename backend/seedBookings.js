const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();
  const Booking = require('./models/Booking');
  const User = require('./models/User');
  const ParkingSlot = require('./models/ParkingSlot');

  const users = await User.find();
  const slots = await ParkingSlot.find();

  if (users.length === 0 || slots.length === 0) {
    console.log('Need at least 1 user and 1 slot to seed bookings');
    // We will create a dummy user and dummy slot if not exist
  }

  let user = users[0];
  if (!user) {
    user = await User.create({
      name: "Dummy User",
      email: "dummy@user.com",
      password: "password123"
    });
  }

  let slot = slots[0];
  if (!slot) {
    slot = await ParkingSlot.create({
      name: "Dummy Slot",
      address: "123 Smart Park",
      location: { type: 'Point', coordinates: [73.85, 18.52] },
      totalSlots: 10,
      availableSlots: 10,
      pricePerHour: 50
    });
  }

  const bookingsToInsert = [];
  
  // Create bookings over the last 10 days
  for (let i = 0; i < 20; i++) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 10));
    pastDate.setHours(Math.floor(Math.random() * 24));
    
    bookingsToInsert.push({
      userId: user._id,
      parkingSlotId: slot._id,
      parkingLocation: {
        locationName: slot.name,
        lat: slot.location.coordinates[1],
        lng: slot.location.coordinates[0]
      },
      vehicle_number: "MH12JD" + Math.floor(Math.random() * 9999),
      booking_type: "instant",
      start_time: pastDate,
      end_time: new Date(pastDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
      duration_hours: 2,
      amount_paid: slot.pricePerHour * 2,
      payment_status: 'Completed',
      booking_status: 'completed',
      createdAt: pastDate
    });
  }

  await Booking.insertMany(bookingsToInsert);
  console.log('Inserted', bookingsToInsert.length, 'completed bookings.');
  process.exit();
};

seedData();
