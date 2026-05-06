const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  location: { type: String, required: true },
  totalSlots: { type: Number, required: true },
  availableSlots: { type: Number, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);
