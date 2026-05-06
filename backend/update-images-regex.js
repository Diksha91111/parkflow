require('dotenv').config();
const mongoose = require('mongoose');
const ParkingSlot = require('./models/ParkingSlot');
const connectDB = require('./config/db');

async function updateAllImages() {
  await connectDB();
  console.log("Updating images with regex...");
  await ParkingSlot.updateMany({ name: { $regex: /city/i } }, { imageUrl: 'https://images.unsplash.com/photo-1620002131972-e1c7209ac749?auto=format&fit=crop&w=600&q=80' });
  await ParkingSlot.updateMany({ name: { $regex: /metro/i } }, { imageUrl: 'https://images.unsplash.com/photo-1595029053225-b40b7af7df02?auto=format&fit=crop&w=600&q=80' });
  await ParkingSlot.updateMany({ name: { $regex: /plaza/i } }, { imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' });
  console.log("Done updating!");
  process.exit(0);
}
updateAllImages();
