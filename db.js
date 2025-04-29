const mongoose = require('mongoose');
require('dotenv').config();


const mongoUrl = process.env.MONGODB_URL;

      // Connect to MongoDB
      mongoose.connect(mongoUrl);
  
      // Mongoose default connection
      const db = mongoose.connection;
  
      // Event listeners
      db.on('connected', () => {
        console.log('MongoDB connected successfully');
      });
  
      db.on('error', (err) => {
        console.error('MongoDB connection error:', err.message);
      });
  
      db.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });
  
module.exports = db;


