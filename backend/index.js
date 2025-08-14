const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic CORS middleware
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Simple middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.status(200).json({ message: 'Backend server is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    details: err.message 
  });
});

// Routes
app.get('/api/prayer-times/by-city', async (req, res) => {
  try {
    const { city } = req.query;
    console.log('Received request for city:', city);
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const response = await axios.get('https://api.aladhan.com/v1/timingsByCity', {
      params: {
        city,
        country: 'US',
        method: 8
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching prayer times:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch prayer times',
      message: error.message 
    });
  }
});

app.get('/api/prayer-times/by-coordinates', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const response = await axios.get('https://api.aladhan.com/v1/timings', {
      params: {
        latitude,
        longitude,
        method: 8 // ISNA method
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch prayer times',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Try accessing:');
  console.log(`1. http://localhost:${PORT}/api/test`);
  console.log(`2. http://localhost:${PORT}/api/prayer-times/by-city?city=New%20York`);
});
