const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Local MongoDB not found: ${error.message}`);
    console.log(`Spinning up a mock in-memory MongoDB for you instead...`);
    
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const memConn = await mongoose.connect(uri);
      console.log(`Fallback InMemoryDB Connected: ${memConn.connection.host}`);
    } catch (memError) {
      console.error(`Failed to start memory server: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
