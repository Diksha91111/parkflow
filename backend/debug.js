require('dotenv').config();
const mongoose = require('mongoose');
const ParkingSlot = require('./models/ParkingSlot');
const connectDB = require('./config/db');

async function debugNames() {
  await connectDB();
  const spots = await ParkingSlot.find({}, { name: 1, imageUrl: 1, _id: 0 });
  console.log("SPOTS:", spots);
  process.exit(0);
}
debugNames();
