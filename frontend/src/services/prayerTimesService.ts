// Fallback to direct Aladhan API since backend requires authentication
const ALADHAN_API_URL = 'https://api.aladhan.com/v1';

// Function to get city name from coordinates using reverse geocoding
const getCityFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    // Using OpenStreetMap Nominatim service (free and reliable)
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
      headers: {
        'User-Agent': 'Muslim Prayer App', // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    // Extract location components
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.municipality;
    const state = address.state || address.region || address.province;
    const country = address.country;
    
    // Build location string
    if (city && state && country) {
      return `${city}, ${state}`;
    } else if (city && country) {
      return `${city}, ${country}`;
    } else if (state && country) {
      return `${state}, ${country}`;
    } else if (country) {
      return country;
    } else {
      return 'Unknown Location';
    }
  } catch (error) {
    console.warn('Could not get city name, using coordinates:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerTimesResponse {
  success: boolean;
  location: string;
  date: string;
  prayerTimes: PrayerTimes;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  method: string;
}


import { getCalculationMethodNumber } from '../utils/calculationMethods';

// Helper: Recommend calculation method by country
const getRecommendedMethodForCountry = (country: string): string => {
  const countryMap: { [key: string]: string } = {
    'United States': 'isna',
    'Canada': 'isna',
    'United Kingdom': 'mwl',
    'France': 'france',
    'Turkey': 'turkey',
    'Saudi Arabia': 'makkah',
    'Kuwait': 'kuwait',
    'Qatar': 'qatar',
    'Russia': 'russia',
    'Singapore': 'singapore',
    'Egypt': 'egypt',
    'Pakistan': 'karachi',
    'Iran': 'tehran',
    'India': 'karachi',
    'Indonesia': 'mwl',
    'Malaysia': 'mwl',
    'UAE': 'makkah',
    'Oman': 'makkah',
    'Bahrain': 'makkah',
    'Jordan': 'mwl',
    'Morocco': 'mwl',
    'Algeria': 'mwl',
    'South Africa': 'mwl',
    // Add more as needed
  };
  return countryMap[country] || 'mwl';
};

export const fetchPrayerTimes = async (
  latitude: number,
  longitude: number,
  calculationMethod: string = 'auto',
): Promise<PrayerTimesResponse> => {
  try {
    console.log('Fetching prayer times for coordinates:', { latitude, longitude });
    // Get city name and country from coordinates
    const cityName = await getCityFromCoordinates(latitude, longitude);
    console.log('Location resolved to:', cityName);

    // Try to extract country from cityName string
    let country = 'Unknown';
    const parts = cityName.split(',').map(s => s.trim());
    if (parts.length > 1) country = parts[parts.length - 1];

    let methodToUse = calculationMethod;
    if (calculationMethod === 'auto') {
      methodToUse = getRecommendedMethodForCountry(country);
    }
    const methodNum = getCalculationMethodNumber(methodToUse);
    // Call Aladhan API with selected method
    const url = `${ALADHAN_API_URL}/timings?latitude=${latitude}&longitude=${longitude}&method=${methodNum}`;
    console.log('Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (data.code !== 200) {
      throw new Error(data.data || 'Failed to fetch prayer times');
    }

    // Transform Aladhan API response to our format
    const timings = data.data.timings;
    const date = data.data.date;
    const meta = data.data.meta;

    const transformedResponse: PrayerTimesResponse = {
      success: true,
      location: cityName,
      date: `${date.readable}`,
      prayerTimes: {
        Fajr: timings.Fajr,
        Sunrise: timings.Sunrise,
        Dhuhr: timings.Dhuhr,
        Asr: timings.Asr,
        Maghrib: timings.Maghrib,
        Isha: timings.Isha,
      },
      coordinates: {
        latitude: parseFloat(meta.latitude),
        longitude: parseFloat(meta.longitude),
      },
      method: meta.method.name || methodToUse,
    };

    console.log('Successfully fetched prayer times for:', transformedResponse.location);
    return transformedResponse;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};
