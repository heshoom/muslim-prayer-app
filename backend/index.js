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
    provider: {
      city_search: 'MuslimSalat.com API (supports date navigation)',
      coordinates: 'Aladhan.com API (fallback for coordinates)',
      gps_flow: 'GPS → Aladhan (coordinates to city) → MuslimSalat (city prayer times)'
    },
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      coordinates_to_city: '/api/coordinates-to-city?latitude=40.7128&longitude=-74.0060',
      prayer_times: {
        by_city: '/api/prayer-times/by-city?city=CityName&method=2&date=DD-MM-YYYY',
        by_coordinates: '/api/prayer-times/by-coordinates?latitude=40.7128&longitude=-74.0060&method=2&date=DD-MM-YYYY',
        monthly_by_coordinates: '/api/prayer-times/monthly-by-coordinates?latitude=40.7128&longitude=-74.0060&method=2&year=2025&month=8'
      }
    },
    calculation_methods: {
      '1': 'Egyptian General Authority of Survey',
      '2': 'Islamic Circle of North America (ISNA)',
      '3': 'Muslim World League (MWL)',
      '4': 'Umm al-Qura, Makkah',
      '5': 'Egyptian General Authority of Survey',
      '6': 'Fixed Isha',
      '7': 'University of Tehran'
    },
    date_format: 'DD-MM-YYYY (e.g., 15-08-2025)',
    features: {
      date_navigation: 'All searches support previous/next day prayer times via MuslimSalat',
      gps_smart_conversion: 'GPS coordinates automatically converted to city for better date support',
      flexible_dates: 'Works with past and future dates consistently',
      global_coverage: 'Worldwide city and coordinate support',
      optimized_flow: 'GPS → City conversion → MuslimSalat for best performance and date accuracy'
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

// Convert coordinates to city name endpoint
app.get('/api/coordinates-to-city', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    console.log('Converting coordinates to city:', { latitude, longitude });

    // Use Aladhan API to get location info from coordinates
    const apiUrl = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}`;

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Muslim-Prayer-App/1.0'
      }
    });

    if (response.data && response.data.code === 200) {
      const meta = response.data.data.meta;
      let cityName = 'Unknown';
      
      // Extract city name from timezone or other available data
      if (meta.timezone) {
        // Extract city from timezone (e.g., "America/New_York" -> "New York")
        const timezoneParts = meta.timezone.split('/');
        if (timezoneParts.length > 1) {
          cityName = timezoneParts[timezoneParts.length - 1].replace(/_/g, ' ');
        }
      }
      
      res.json({
        success: true,
        city: cityName,
        country: meta.timezone ? meta.timezone.split('/')[0] : 'Unknown',
        timezone: meta.timezone,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });
    } else {
      throw new Error('Invalid response from location API');
    }
  } catch (error) {
    console.error('Error converting coordinates to city:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    
    res.status(500).json({ 
      error: 'Failed to convert coordinates to city',
      message: error.message 
    });
  }
});

// Prayer times by city endpoint
app.get('/api/prayer-times/by-city', async (req, res) => {
  try {
    const { city, method, school, country, date } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    console.log('Received request for city:', {
      city,
      country,
      method,
      school,
      date
    });

    // Build the API URL for MuslimSalat API
    let apiUrl = `https://muslimsalat.com/${encodeURIComponent(city)}`;
    
    // Add date parameter if provided (format: DD-MM-YYYY)
    if (date) {
      apiUrl += `/${encodeURIComponent(date)}`;
    }
    
    apiUrl += '.json?key=test';
    
    // MuslimSalat API method mapping (if provided)
    if (method) {
      // Map Aladhan methods to MuslimSalat methods
      const methodMapping = {
        '1': '1', // Egyptian General Authority of Survey
        '2': '4', // Islamic Circle of North America (ISNA)
        '3': '5', // Muslim World League (MWL)
        '4': '6', // Umm al-Qura, Makkah
        '5': '1', // Egyptian General Authority of Survey
        '7': '4', // Default to ICNA
        '8': '5', // Default to MWL
        '9': '4', // Default to ICNA
        '10': '4', // Default to ICNA
        '11': '4', // Default to ICNA
        '12': '4', // Default to ICNA
        '13': '4', // Default to ICNA
        '14': '4'  // Default to ICNA
      };
      const mappedMethod = methodMapping[method] || '4';
      apiUrl += `&method=${mappedMethod}`;
    }

    console.log('Making API request to:', apiUrl);

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Muslim-Prayer-App/1.0'
      }
    });

    if (response.data && response.data.status_valid === 1) {
      // Transform MuslimSalat response to match Aladhan format
      const transformedData = {
        code: 200,
        status: 'OK',
        data: {
          timings: {
            Fajr: response.data.items[0].fajr,
            Sunrise: response.data.items[0].shurooq,
            Dhuhr: response.data.items[0].dhuhr,
            Asr: response.data.items[0].asr,
            Sunset: '', // Not provided by MuslimSalat
            Maghrib: response.data.items[0].maghrib,
            Isha: response.data.items[0].isha,
            Imsak: '', // Not provided by MuslimSalat
            Midnight: '', // Not provided by MuslimSalat
            Firstthird: '', // Not provided by MuslimSalat
            Lastthird: '' // Not provided by MuslimSalat
          },
          date: {
            readable: response.data.items[0].date_for,
            timestamp: Math.floor(new Date(response.data.items[0].date_for).getTime() / 1000),
            gregorian: {
              date: response.data.items[0].date_for,
              format: 'YYYY-M-D',
              day: new Date(response.data.items[0].date_for).getDate().toString().padStart(2, '0'),
              weekday: {
                en: new Date(response.data.items[0].date_for).toLocaleDateString('en', { weekday: 'long' })
              },
              month: {
                number: (new Date(response.data.items[0].date_for).getMonth() + 1),
                en: new Date(response.data.items[0].date_for).toLocaleDateString('en', { month: 'long' })
              },
              year: new Date(response.data.items[0].date_for).getFullYear().toString(),
              designation: {
                abbreviated: 'AD',
                expanded: 'Anno Domini'
              }
            },
            hijri: {
              date: '', // Would need conversion
              format: '',
              day: '',
              weekday: { en: '', ar: '' },
              month: { number: 0, en: '', ar: '' },
              year: '',
              designation: { abbreviated: 'AH', expanded: 'Anno Hegirae' },
              holidays: []
            }
          },
          meta: {
            latitude: parseFloat(response.data.latitude),
            longitude: parseFloat(response.data.longitude),
            timezone: response.data.timezone,
            method: {
              id: parseInt(method) || 4,
              name: response.data.prayer_method_name,
              params: {}
            },
            latitudeAdjustmentMethod: 3,
            midnightMode: 0,
            school: 0,
            offset: {}
          }
        }
      };
      
      res.json(transformedData);
    } else {
      throw new Error('Invalid response from prayer times API');
    }
  } catch (error) {
    console.error('Error fetching prayer times by city:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Failed to fetch prayer times',
        message: error.response.data?.message || error.message
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch prayer times',
      message: error.message 
    });
  }
});

// Monthly prayer times by coordinates endpoint (GPS -> City -> MuslimSalat)
app.get('/api/prayer-times/monthly-by-coordinates', async (req, res) => {
  try {
    const { latitude, longitude, method, year, month } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    console.log('Received monthly request for coordinates:', {
      latitude,
      longitude,
      method,
      year,
      month
    });

    // Step 1: Convert coordinates to city using Aladhan API
    const cityApiUrl = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}`;
    
    console.log('Step 1: Converting coordinates to city using:', cityApiUrl);

    const cityResponse = await axios.get(cityApiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Muslim-Prayer-App/1.0'
      }
    });

    if (!cityResponse.data || cityResponse.data.code !== 200) {
      throw new Error('Failed to get city from coordinates');
    }

    // Extract city name from timezone or other available data
    const meta = cityResponse.data.data.meta;
    let cityName = 'Unknown';
    
    if (meta.timezone) {
      // Extract city from timezone (e.g., "America/New_York" -> "New York")
      const timezoneParts = meta.timezone.split('/');
      if (timezoneParts.length > 1) {
        cityName = timezoneParts[timezoneParts.length - 1].replace(/_/g, ' ');
      }
    }

    console.log('Step 1 Result: Extracted city name:', cityName);

    // Step 2: Get monthly prayer times from MuslimSalat using the city
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || (new Date().getMonth() + 1);
    
    console.log('Step 2: Fetching monthly prayer times by iterating through each day');
    
    // Get the number of days in the month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const monthlyItems = [];
    
    // Method mapping for MuslimSalat
    let methodParam = '';
    if (method) {
      const methodMapping = {
        '1': '1', // Egyptian General Authority of Survey
        '2': '4', // Islamic Circle of North America (ISNA)
        '3': '5', // Muslim World League (MWL)
        '4': '6', // Umm al-Qura, Makkah
        '5': '1', // Egyptian General Authority of Survey
        '7': '4', // Default to ICNA
        '8': '5', // Default to MWL
        '9': '4', // Default to ICNA
        '10': '4', // Default to ICNA
        '11': '4', // Default to ICNA
        '12': '4', // Default to ICNA
        '13': '4', // Default to ICNA
        '14': '4'  // Default to ICNA
      };
      const mappedMethod = methodMapping[method] || '4';
      methodParam = `&method=${mappedMethod}`;
    }
    
    // Fetch prayer times for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      try {
        const dayStr = day.toString().padStart(2, '0');
        const monthStr = currentMonth.toString().padStart(2, '0');
        const dateStr = `${dayStr}-${monthStr}-${currentYear}`;
        
        const dayApiUrl = `https://muslimsalat.com/${encodeURIComponent(cityName)}/${dateStr}.json?key=test${methodParam}`;
        
        console.log(`Fetching day ${day}/${currentMonth}: ${dayApiUrl}`);
        
        const dayResponse = await axios.get(dayApiUrl, {
          timeout: 8000,
          headers: {
            'User-Agent': 'Muslim-Prayer-App/1.0'
          }
        });
        
        if (dayResponse.data && dayResponse.data.status_valid === 1 && dayResponse.data.items && dayResponse.data.items.length > 0) {
          const dayData = dayResponse.data.items[0];
          monthlyItems.push({
            ...dayData,
            date_for: `${currentYear}-${monthStr}-${dayStr}` // Standardize date format
          });
        } else {
          console.warn(`No valid data for day ${day}/${currentMonth}/${currentYear}`);
        }
        
        // Small delay to avoid overwhelming the API
        if (day < daysInMonth) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (dayError) {
        console.error(`Error fetching day ${day}:`, dayError.message);
        // Continue with other days even if one fails
      }
    }
    
    if (monthlyItems.length === 0) {
      throw new Error('No prayer times data could be fetched for the requested month');
    }
    
    // Create response in MuslimSalat format with all days
    const monthlyResponse = {
      title: "",
      query: cityName,
      for: "monthly",
      method: parseInt(method) || 4,
      prayer_method_name: "Islamic Circle of North America",
      daylight: "1",
      timezone: "-5",
      map_image: `https://maps.google.com/maps/api/staticmap?center=${latitude},${longitude}&sensor=false&zoom=13&size=300x300`,
      sealevel: "2",
      today_weather: { pressure: "", temperature: "" },
      link: `http://muslimsalat.com/${encodeURIComponent(cityName)}`,
      qibla_direction: "58.51",
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      address: "",
      city: cityName,
      state: "",
      postal_code: "",
      country: "USA",
      country_code: "US",
      items: monthlyItems,
      status_valid: 1,
      status_code: 1,
      status_description: "Success.",
      city_info: {
        name: cityName,
        timezone: meta.timezone,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      }
    };
    
    console.log(`Step 2 Result: Successfully fetched ${monthlyItems.length} days of prayer times for ${cityName}`);
    
    res.json(monthlyResponse);
  } catch (error) {
    console.error('Error fetching monthly prayer times by coordinates:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Failed to fetch monthly prayer times',
        message: error.response.data?.message || error.message
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch monthly prayer times',
      message: error.message 
    });
  }
});

// Prayer times by coordinates endpoint
app.get('/api/prayer-times/by-coordinates', async (req, res) => {
  try {
    const { latitude, longitude, method, school, date } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    console.log('Received request for coordinates:', {
      latitude,
      longitude,
      method,
      school,
      date
    });

    // Step 1: Convert coordinates to city using Aladhan API
    const cityApiUrl = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}`;
    
    console.log('Step 1: Converting coordinates to city using:', cityApiUrl);

    const cityResponse = await axios.get(cityApiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Muslim-Prayer-App/1.0'
      }
    });

    if (!cityResponse.data || cityResponse.data.code !== 200) {
      throw new Error('Failed to get city from coordinates');
    }

    // Extract city name from timezone or other available data
    const meta = cityResponse.data.data.meta;
    let cityName = 'Unknown';
    
    if (meta.timezone) {
      // Extract city from timezone (e.g., "America/New_York" -> "New York")
      const timezoneParts = meta.timezone.split('/');
      if (timezoneParts.length > 1) {
        cityName = timezoneParts[timezoneParts.length - 1].replace(/_/g, ' ');
      }
    }

    console.log('Step 1 Result: Extracted city name:', cityName);

    // Step 2: Get prayer times from MuslimSalat using the city
    let apiUrl = `https://muslimsalat.com/${encodeURIComponent(cityName)}`;
    
    // Add date parameter if provided (format: DD-MM-YYYY)
    if (date) {
      apiUrl += `/${encodeURIComponent(date)}`;
    }
    
    apiUrl += '.json?key=test';
    
    // MuslimSalat API method mapping (if provided)
    if (method) {
      // Map Aladhan methods to MuslimSalat methods
      const methodMapping = {
        '1': '1', // Egyptian General Authority of Survey
        '2': '4', // Islamic Circle of North America (ISNA)
        '3': '5', // Muslim World League (MWL)
        '4': '6', // Umm al-Qura, Makkah
        '5': '1', // Egyptian General Authority of Survey
        '7': '4', // Default to ICNA
        '8': '5', // Default to MWL
        '9': '4', // Default to ICNA
        '10': '4', // Default to ICNA
        '11': '4', // Default to ICNA
        '12': '4', // Default to ICNA
        '13': '4', // Default to ICNA
        '14': '4'  // Default to ICNA
      };
      const mappedMethod = methodMapping[method] || '4';
      apiUrl += `&method=${mappedMethod}`;
    }

    console.log('Step 2: Fetching prayer times from MuslimSalat:', apiUrl);

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Muslim-Prayer-App/1.0'
      }
    });

    if (response.data && response.data.status_valid === 1) {
      // Transform MuslimSalat response to match Aladhan format and add city info
      const transformedData = {
        code: 200,
        status: 'OK',
        data: {
          timings: {
            Fajr: response.data.items[0].fajr,
            Sunrise: response.data.items[0].shurooq,
            Dhuhr: response.data.items[0].dhuhr,
            Asr: response.data.items[0].asr,
            Sunset: '', // Not provided by MuslimSalat
            Maghrib: response.data.items[0].maghrib,
            Isha: response.data.items[0].isha,
            Imsak: '', // Not provided by MuslimSalat
            Midnight: '', // Not provided by MuslimSalat
            Firstthird: '', // Not provided by MuslimSalat
            Lastthird: '' // Not provided by MuslimSalat
          },
          date: {
            readable: response.data.items[0].date_for,
            timestamp: Math.floor(new Date(response.data.items[0].date_for).getTime() / 1000),
            gregorian: {
              date: response.data.items[0].date_for,
              format: 'YYYY-M-D',
              day: new Date(response.data.items[0].date_for).getDate().toString().padStart(2, '0'),
              weekday: {
                en: new Date(response.data.items[0].date_for).toLocaleDateString('en', { weekday: 'long' })
              },
              month: {
                number: (new Date(response.data.items[0].date_for).getMonth() + 1),
                en: new Date(response.data.items[0].date_for).toLocaleDateString('en', { month: 'long' })
              },
              year: new Date(response.data.items[0].date_for).getFullYear().toString(),
              designation: {
                abbreviated: 'AD',
                expanded: 'Anno Domini'
              }
            },
            hijri: {
              date: '', // Would need conversion
              format: '',
              day: '',
              weekday: { en: '', ar: '' },
              month: { number: 0, en: '', ar: '' },
              year: '',
              designation: { abbreviated: 'AH', expanded: 'Anno Hegirae' },
              holidays: []
            }
          },
          meta: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            timezone: meta.timezone,
            city: cityName,
            method: {
              id: parseInt(method) || 4,
              name: response.data.prayer_method_name,
              params: {}
            },
            latitudeAdjustmentMethod: 3,
            midnightMode: 0,
            school: 0,
            offset: {}
          }
        }
      };
      
      console.log('Step 2 Result: Successfully fetched prayer times for', cityName);
      
      res.json(transformedData);
    } else {
      throw new Error('Invalid response from prayer times API');
    }
  } catch (error) {
    console.error('Error fetching prayer times by coordinates:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'Failed to fetch prayer times',
        message: error.response.data?.message || error.message
      });
    }

    res.status(500).json({ 
      error: 'Failed to fetch prayer times',
      message: error.message 
    });
  }
});

// Google Places API endpoint for nearby mosques - TEMPORARILY DISABLED
// Requires paid Google Places API - keeping code for future implementation
/*
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
        const searchParams = {
          location: `${latitude},${longitude}`,
          radius: radius.toString(),
          type: 'mosque',
          key: GOOGLE_PLACES_API_KEY
        };

        const searchResponse = await axios.get(searchUrl, { params: searchParams });
        
        if (searchResponse.data.status === 'OK') {
          console.log(`Found ${searchResponse.data.results.length} mosques from Google Places API`);
          
          // Get detailed information for each mosque (limit to 20 for performance)
          const detailedMosques = await Promise.all(
            searchResponse.data.results.slice(0, 20).map(async (mosque) => {
              try {
                // Get place details for additional information
                const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
                const detailsParams = {
                  place_id: mosque.place_id,
                  fields: 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,geometry',
                  key: GOOGLE_PLACES_API_KEY
                };

                const detailsResponse = await axios.get(detailsUrl, { params: detailsParams });
                
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
  } catch (error) {
    console.error('Error finding nearby mosques:', error);
    res.status(500).json({ 
      error: 'Failed to find nearby mosques',
      message: error.message 
    });
  }
});
*/

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
