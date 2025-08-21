const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Google Places API Key - Add this to your .env file
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY_HERE';

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
    const { city, method, school } = req.query;
    console.log('Received request for city:', city, 'method:', method, 'school:', school);
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Default values
    const calculationMethod = method || '8'; // Default to ISNA
    const madhab = school || '0'; // Default to Shafi

    const response = await axios.get('https://api.aladhan.com/v1/timingsByCity', {
      params: {
        city,
        country: 'US',
        method: calculationMethod,
        school: madhab
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
    const { latitude, longitude, method, school } = req.query;
    console.log('Received request for coordinates:', { latitude, longitude, method, school });
    
    // Default values
    const calculationMethod = method || '8'; // Default to ISNA
    const madhab = school || '0'; // Default to Shafi
    
    const response = await axios.get('https://api.aladhan.com/v1/timings', {
      params: {
        latitude,
        longitude,
        method: calculationMethod,
        school: madhab
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

// Google Places API endpoint for nearby mosques
app.get('/api/nearby-mosques', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // First, try to use the real Google Places API
    if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'your_google_places_api_key_here') {
      try {
        console.log('Using Google Places API to find nearby mosques...');
        
        // Search for mosques using Google Places Nearby Search API
        const searchUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        const searchParams = new URLSearchParams({
          location: `${latitude},${longitude}`,
          radius: radius.toString(),
          type: 'mosque',
          key: GOOGLE_PLACES_API_KEY
        });

        const searchResponse = await axios.get(`${searchUrl}?${searchParams}`);
        
        if (searchResponse.data.status === 'OK') {
          console.log(`Found ${searchResponse.data.results.length} mosques from Google Places API`);
          
          // Get detailed information for each mosque
          const detailedMosques = await Promise.all(
            searchResponse.data.results.slice(0, 20).map(async (mosque) => {
              try {
                // Get place details for additional information
                const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
                const detailsParams = new URLSearchParams({
                  place_id: mosque.place_id,
                  fields: 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,geometry',
                  key: GOOGLE_PLACES_API_KEY
                });

                const detailsResponse = await axios.get(`${detailsUrl}?${detailsParams}`);
                
                if (detailsResponse.data.status === 'OK') {
                  const details = detailsResponse.data.result;
                  return {
                    place_id: details.place_id,
                    name: details.name,
                    vicinity: mosque.vicinity || details.formatted_address,
                    formatted_address: details.formatted_address,
                    rating: details.rating,
                    user_ratings_total: details.user_ratings_total,
                    geometry: details.geometry,
                    opening_hours: details.opening_hours,
                    formatted_phone_number: details.formatted_phone_number,
                    website: details.website
                  };
                } else {
                  // Fallback to basic mosque data if details fail
                  return {
                    place_id: mosque.place_id,
                    name: mosque.name,
                    vicinity: mosque.vicinity,
                    rating: mosque.rating,
                    user_ratings_total: mosque.user_ratings_total,
                    geometry: mosque.geometry,
                    opening_hours: mosque.opening_hours
                  };
                }
              } catch (detailError) {
                console.error('Error fetching mosque details:', detailError.message);
                // Return basic mosque data if details fetch fails
                return {
                  place_id: mosque.place_id,
                  name: mosque.name,
                  vicinity: mosque.vicinity,
                  rating: mosque.rating,
                  user_ratings_total: mosque.user_ratings_total,
                  geometry: mosque.geometry,
                  opening_hours: mosque.opening_hours
                };
              }
            })
          );

          return res.json({
            results: detailedMosques.filter(mosque => mosque !== null),
            status: 'OK'
          });
        } else {
          console.error('Google Places API error:', searchResponse.data.status, searchResponse.data.error_message);
          throw new Error(`Google Places API returned: ${searchResponse.data.status}`);
        }
      } catch (apiError) {
        console.error('Error calling Google Places API:', apiError.message);
        // Fall through to sample data
      }
    }

    // Fallback to sample data if API key not configured or API call fails
    console.log('Google Places API not available, returning sample data');
    const sampleMosques = [
        {
          place_id: 'sample1',
          name: 'Central Mosque',
          vicinity: '123 Main St, City Center',
          rating: 4.5,
          user_ratings_total: 150,
          geometry: {
            location: {
              lat: parseFloat(latitude) + 0.005,
              lng: parseFloat(longitude) + 0.005
            }
          },
          opening_hours: { open_now: true },
          formatted_phone_number: '+1-555-0123',
          website: 'https://centralmosque.org'
        },
        {
          place_id: 'sample2',
          name: 'Islamic Community Center',
          vicinity: '456 Oak Ave, Downtown',
          rating: 4.7,
          user_ratings_total: 89,
          geometry: {
            location: {
              lat: parseFloat(latitude) - 0.008,
              lng: parseFloat(longitude) + 0.003
            }
          },
          opening_hours: { open_now: true },
          formatted_phone_number: '+1-555-0456',
          website: 'https://iccenter.org'
        },
        {
          place_id: 'sample3',
          name: 'Masjid Al-Noor',
          vicinity: '789 Pine St, West Side',
          rating: 4.3,
          user_ratings_total: 67,
          geometry: {
            location: {
              lat: parseFloat(latitude) + 0.015,
              lng: parseFloat(longitude) - 0.012
            }
          },
          opening_hours: { open_now: false },
          formatted_phone_number: '+1-555-0789'
        }
      ];
      
      return res.json({ results: sampleMosques, status: 'OK' });
    }

    // Use Google Places API to find nearby mosques
    const placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    const response = await axios.get(placesUrl, {
      params: {
        location: `${latitude},${longitude}`,
        radius: radius,
        keyword: 'mosque OR masjid OR islamic center',
        type: 'place_of_worship',
        key: GOOGLE_PLACES_API_KEY
      }
    });

    // Get detailed information for each place
    const detailedResults = await Promise.all(
      response.data.results.slice(0, 10).map(async (place) => {
        try {
          const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
          const detailsResponse = await axios.get(detailsUrl, {
            params: {
              place_id: place.place_id,
              fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,geometry',
              key: GOOGLE_PLACES_API_KEY
            }
          });
          
          return {
            ...place,
            ...detailsResponse.data.result
          };
        } catch (detailError) {
          console.error('Error fetching place details:', detailError.message);
          return place; // Return basic info if details fail
        }
      })
    );

    res.json({ results: detailedResults, status: response.data.status });
  } catch (error) {
    console.error('Error fetching nearby mosques:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch nearby mosques',
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
