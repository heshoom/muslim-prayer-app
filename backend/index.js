const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint - API welcome page
app.get('/', (req, res) => {
  res.json({
    name: 'Muslim Prayer App API',
    version: '1.0.0',
    description: 'Backend API for Muslim Prayer Times application',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      prayer_times: '/api/prayer-times?latitude=40.7128&longitude=-74.0060'
    },
    documentation: 'https://github.com/heshoom/muslim-prayer-app',
    contact: 'Built with ❤️ for the Muslim community'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Simple prayer times endpoint using Aladhan API
app.get('/api/prayer-times', async (req, res) => {
  try {
    const { latitude, longitude, method = 2 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    console.log('Fetching prayer times for coordinates:', { latitude, longitude, method });

    // Use Aladhan API directly - simple and reliable
    const apiUrl = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`;

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Muslim-Prayer-App/1.0'
      }
    });

    if (response.data && response.data.code === 200) {
      const timings = response.data.data.timings;
      const meta = response.data.data.meta;
      
      // Extract city from timezone
      let cityName = 'Unknown Location';
      if (meta.timezone) {
        const timezoneParts = meta.timezone.split('/');
        if (timezoneParts.length > 1) {
          cityName = timezoneParts[timezoneParts.length - 1].replace(/_/g, ' ');
        }
      }
      
      // Return simplified prayer times
      res.json({
        success: true,
        location: cityName,
        date: response.data.data.date.readable,
        prayerTimes: {
          Fajr: timings.Fajr,
          Sunrise: timings.Sunrise,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha
        },
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        method: meta.method.name
      });
    } else {
      throw new Error('Invalid response from prayer times API');
    }
  } catch (error) {
    console.error('Error fetching prayer times:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch prayer times',
      message: error.message 
    });
  }
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
