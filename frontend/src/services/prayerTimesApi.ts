import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getCalculationMethodNumber } from '@/src/utils/calculationMethods';

// Configure API URL based on platform and environment
const LOCAL_IP = '192.168.1.211'; // Your computer's local IP address

const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:3000/api';
    }
    // For Android emulator, localhost points to 10.0.2.2
    if (Platform.OS === 'android' && !Constants.isDevice) {
      return 'http://10.0.2.2:3000/api';
    }
    // For iOS simulator and real devices in development
    return `http://${LOCAL_IP}:3000/api`;
  }
  // Production URL
  return 'https://your-production-api-url.com/api';  // TODO: Replace with your actual production API URL
};

const API_URL = getApiUrl();

export const prayerTimesApi = {
  async getPrayerTimesByCity(city: string, settings?: any, country: string = 'US') {
    try {
      console.log('Fetching prayer times for city:', city);
      console.log('API URL:', `${API_URL}/prayer-times/by-city`);
      
      const params: any = { city, country };
      
      // Add settings parameters if provided
      if (settings) {
        if (settings.prayer.calculationMethod) {
          params.method = getCalculationMethodNumber(settings.prayer.calculationMethod);
        }
        if (settings.prayer.madhab) {
          params.school = settings.prayer.madhab === 'hanafi' ? '1' : '0';
        }
      }
      
      const response = await axios.get(`${API_URL}/prayer-times/by-city`, {
        params,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      throw new Error('Failed to fetch prayer times');
    }
  },

  async getPrayerTimesByCoordinates(latitude: number, longitude: number, settings?: any) {
    try {
      console.log('Fetching prayer times for coordinates:', { latitude, longitude });
      console.log('API URL:', `${API_URL}/prayer-times/by-coordinates`);
      
      const params: any = { latitude, longitude };
      
      // Add settings parameters if provided
      if (settings) {
        if (settings.prayer.calculationMethod) {
          params.method = getCalculationMethodNumber(settings.prayer.calculationMethod);
        }
        if (settings.prayer.madhab) {
          params.school = settings.prayer.madhab === 'hanafi' ? '1' : '0';
        }
      }
      
      const response = await axios.get(`${API_URL}/prayer-times/by-coordinates`, {
        params,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: false,
        timeout: 10000 // 10 second timeout
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (!error.response) {
          throw new Error('Network error. Please check your internet connection.');
        }
        if (error.response.status === 404) {
          throw new Error('Prayer times service not found. Please try again later.');
        }
      }
      throw new Error('Failed to fetch prayer times. Please try again later.');
    }
  },

  // Temporarily disabled - requires paid Google Places API
  // async getNearbyMosques(latitude: number, longitude: number, radius: number = 5000) {
  //   try {
  //     console.log('Fetching nearby mosques for coordinates:', { latitude, longitude, radius });
  //     console.log('API URL:', `${API_URL}/nearby-mosques`);
      
  //     const response = await axios.get(`${API_URL}/nearby-mosques`, {
  //       params: { latitude, longitude, radius },
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json'
  //       },
  //       withCredentials: false,
  //       timeout: 15000 // 15 second timeout for places API
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error('API Error:', error);
  //     if (axios.isAxiosError(error)) {
  //       console.error('Response:', error.response?.data);
  //       console.error('Status:', error.response?.status);
  //       if (error.code === 'ECONNABORTED') {
  //         throw new Error('Request timed out. Please try again.');
  //       }
  //       if (!error.response) {
  //         throw new Error('Network error. Please check your internet connection.');
  //       }
  //       if (error.response.status === 404) {
  //         throw new Error('Mosque finder service not found. Please try again later.');
  //       }
  //     }
  //     throw new Error('Failed to fetch nearby mosques. Please try again later.');
  //   }
  // }
};
