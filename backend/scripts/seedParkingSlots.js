const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ParkingSlot = require('../models/ParkingSlot');
const connectDB = require('../config/db');

const seedData = [
  {
    name: 'Connaught Place Underground Parking',
    address: 'Block A, Connaught Place, New Delhi',
    location: { type: 'Point', coordinates: [77.2195, 28.6315] },
    totalSlots: 200,
    availableSlots: 145,
    pricePerHour: 60,
    amenities: ['CCTV', 'Covered', '24/7', 'EV Charging'],
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Nehru Place Parking Complex',
    address: 'Nehru Place, South Delhi',
    location: { type: 'Point', coordinates: [77.2507, 28.5494] },
    totalSlots: 150,
    availableSlots: 89,
    pricePerHour: 40,
    amenities: ['CCTV', 'Covered'],
    operatingHours: { open: '06:00', close: '23:00' },
  },
  {
    name: 'Saket Select Citywalk Parking',
    address: 'Select Citywalk, Saket, New Delhi',
    location: { type: 'Point', coordinates: [77.2190, 28.5285] },
    totalSlots: 300,
    availableSlots: 210,
    pricePerHour: 80,
    amenities: ['CCTV', 'Covered', 'EV Charging', 'Valet'],
    operatingHours: { open: '08:00', close: '23:00' },
  },
  {
    name: 'MG Road Smart Parking',
    address: 'MG Road, Bengaluru, Karnataka',
    location: { type: 'Point', coordinates: [77.6101, 12.9752] },
    totalSlots: 100,
    availableSlots: 67,
    pricePerHour: 50,
    amenities: ['CCTV', '24/7'],
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Indiranagar Multi-Level Parking',
    address: 'Indiranagar, Bengaluru, Karnataka',
    location: { type: 'Point', coordinates: [77.6408, 12.9784] },
    totalSlots: 180,
    availableSlots: 120,
    pricePerHour: 45,
    amenities: ['CCTV', 'Covered', 'EV Charging'],
    operatingHours: { open: '06:00', close: '22:00' },
  },
  {
    name: 'Bandra Kurla Complex Parking',
    address: 'BKC, Bandra East, Mumbai',
    location: { type: 'Point', coordinates: [72.8656, 19.0596] },
    totalSlots: 250,
    availableSlots: 180,
    pricePerHour: 100,
    amenities: ['CCTV', 'Covered', '24/7', 'EV Charging', 'Valet'],
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Andheri West Street Parking',
    address: 'Andheri West, Mumbai',
    location: { type: 'Point', coordinates: [72.8296, 19.1197] },
    totalSlots: 60,
    availableSlots: 12,
    pricePerHour: 30,
    amenities: ['CCTV'],
    operatingHours: { open: '07:00', close: '22:00' },
  },
  {
    name: 'Salt Lake Sector V Parking',
    address: 'Sector V, Salt Lake, Kolkata',
    location: { type: 'Point', coordinates: [88.4336, 22.5726] },
    totalSlots: 120,
    availableSlots: 95,
    pricePerHour: 30,
    amenities: ['CCTV', '24/7'],
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Park Street Parking Hub',
    address: 'Park Street, Kolkata',
    location: { type: 'Point', coordinates: [88.3527, 22.5530] },
    totalSlots: 80,
    availableSlots: 45,
    pricePerHour: 40,
    amenities: ['CCTV', 'Covered'],
    operatingHours: { open: '06:00', close: '23:00' },
  },
  {
    name: 'Anna Nagar Tower Parking',
    address: 'Anna Nagar, Chennai',
    location: { type: 'Point', coordinates: [80.2101, 13.0878] },
    totalSlots: 90,
    availableSlots: 65,
    pricePerHour: 35,
    amenities: ['CCTV', 'Covered'],
    operatingHours: { open: '06:00', close: '22:00' },
  },
  {
    name: 'Jubilee Hills Parking Zone',
    address: 'Jubilee Hills, Hyderabad',
    location: { type: 'Point', coordinates: [78.4074, 17.4326] },
    totalSlots: 110,
    availableSlots: 78,
    pricePerHour: 40,
    amenities: ['CCTV', '24/7', 'Covered'],
    operatingHours: { open: '00:00', close: '23:59' },
  },
  {
    name: 'Aundh ITI Road Parking',
    address: 'Aundh, Pune',
    location: { type: 'Point', coordinates: [73.8077, 18.5581] },
    totalSlots: 70,
    availableSlots: 55,
    pricePerHour: 25,
    amenities: ['CCTV'],
    operatingHours: { open: '07:00', close: '22:00' },
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    await ParkingSlot.deleteMany({});
    const created = await ParkingSlot.insertMany(seedData);
    console.log(`Seeded ${created.length} parking slots successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDB();
