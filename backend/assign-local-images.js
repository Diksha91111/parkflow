require('dotenv').config();
const mongoose = require('mongoose');
const ParkingSlot = require('./models/ParkingSlot');
const connectDB = require('./config/db');

async function assignLocalImages() {
  await connectDB();
  console.log("Configuring database to load your local images...");
  
  await ParkingSlot.updateMany({ name: { $regex: /city/i } }, { imageUrl: '/city-mall.jpg' });
  await ParkingSlot.updateMany({ name: { $regex: /metro/i } }, { imageUrl: '/metro.jpg' });
  await ParkingSlot.updateMany({ name: { $regex: /plaza/i } }, { imageUrl: '/plaza.jpg' });
  
  console.log("Done!");
  process.exit(0);
}
assignLocalImages();
