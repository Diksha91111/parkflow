const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function run(){
  try{
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://user:o68q4Y22w8lEwR7d@cluster0.7ztwv7f.mongodb.net/smart-parking-db?retryWrites=true&w=majority');
    const admin = await User.findOne({ role: 'admin' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    
    const res = await axios.post('http://localhost:5000/api/admin/add-slot', {
      name: 'Test via API 2',
      address: 'Test Addr',
      lat: 18.5204,
      lng: 73.8567,
      totalSlots: 10,
      pricePerHour: 20
    }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log("Success:", res.data);
  } catch(e) {
    console.error('ERROR:', e.response ? e.response.data : e.message);
  } finally {
    mongoose.connection.close();
  }
}
run();
