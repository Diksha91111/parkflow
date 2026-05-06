require('dotenv').config();
const mongoose = require('mongoose');
const ParkingSlot = require('./models/ParkingSlot');
const connectDB = require('./config/db');

async function fixBrokenImages() {
  await connectDB();
  console.log("Fixing broken image URLs...");
  
  // Using picsum seeds for reliable placeholder images that won't 404
  await ParkingSlot.updateMany({ name: { $regex: /city/i } }, { imageUrl: 'https://picsum.photos/seed/citymall/600/400' });
  await ParkingSlot.updateMany({ name: { $regex: /metro/i } }, { imageUrl: 'https://picsum.photos/seed/metro/600/400' });
  await ParkingSlot.updateMany({ name: { $regex: /plaza/i } }, { imageUrl: 'https://picsum.photos/seed/plaza/600/400' });
  
  console.log("Done fixing images!");
  process.exit(0);
}
fixBrokenImages();
