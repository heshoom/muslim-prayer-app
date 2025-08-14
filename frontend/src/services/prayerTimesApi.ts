import axios from 'axios';

import { Platform } from 'react-native';

// Configure API URL based on platform and environment
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  // For Android emulator, localhost points to 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  // For iOS simulator or real devices
  return 'http://localhost:3000/api';
};

const API_URL = getApiUrl();

export const prayerTimesApi = {
  async getPrayerTimesByCity(city: string) {
    try {
      console.log('Fetching prayer times for city:', city);
      console.log('API URL:', `${API_URL}/prayer-times/by-city`);
      
      const response = await axios.get(`${API_URL}/prayer-times/by-city`, {
        params: { city },
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

  async getPrayerTimesByCoordinates(latitude: number, longitude: number) {
    try {
      const response = await axios.get(`${API_URL}/prayer-times/by-coordinates`, {
        params: { latitude, longitude }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch prayer times');
    }
  }
};
