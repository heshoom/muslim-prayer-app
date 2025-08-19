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

// Helper: Recommend calculation method by country using regional defaults
// Mapping updated per product request:
// - North America → ISNA
// - Europe → MWL
// - Middle East & Africa → Egyptian / Umm al-Qura (we map Africa -> egypt, Middle East -> makkah by country)
// - South Asia → Karachi
// - Iran → Tehran
// - Saudi Arabia → Umm al-Qura (makkah)
// - High Latitudes → MWL (or ISNA with twilight adjustments)
const getRecommendedMethodForCountry = (country: string): string => {
  const normalized = (country || '').toLowerCase().trim();

  const NORTH_AMERICA = ['united states', 'usa', 'canada', 'mexico'];
  const EUROPE = [
    'united kingdom', 'uk', 'france', 'germany', 'spain', 'italy', 'portugal', 'netherlands', 'belgium', 'switzerland', 'austria', 'poland', 'sweden', 'norway', 'finland', 'denmark', 'ireland', 'greece', 'czech republic'
  ];
  const SOUTH_ASIA = ['pakistan', 'india', 'bangladesh', 'sri lanka', 'nepal', 'bhutan'];
  const MIDDLE_EAST = ['united arab emirates', 'uae', 'oman', 'qatar', 'kuwait', 'bahrain', 'jordan', 'lebanon', 'syria', 'iraq', 'israel', 'palestine', 'yemen', 'turkey'];
  const AFRICA = ['egypt', 'morocco', 'algeria', 'tunisia', 'libya', 'south africa', 'nigeria', 'kenya', 'ethiopia', 'ghana', 'tanzania', 'uganda', 'angola'];
  const HIGH_LATITUDE = ['norway', 'sweden', 'finland', 'iceland', 'greenland'];

  // Iran and Saudi Arabia explicit mappings
  if (normalized === 'iran') return 'tehran';
  if (normalized === 'saudi arabia' || normalized === 'saudi') return 'makkah';

  if (NORTH_AMERICA.includes(normalized)) return 'isna';
  if (EUROPE.includes(normalized)) return 'mwl';
  if (SOUTH_ASIA.includes(normalized)) return 'karachi';
  if (MIDDLE_EAST.includes(normalized)) return 'makkah';
  if (AFRICA.includes(normalized)) return 'egypt';
  if (HIGH_LATITUDE.includes(normalized)) {
    // High-latitude rule: prefer MWL (or ISNA with special twilight handling)
    return 'mwl';
  }

  // Fallbacks for common names
  if (normalized === 'united kingdom' || normalized === 'uk') return 'mwl';
  if (normalized === 'singapore') return 'singapore';

  // Default to MWL if unknown
  return 'mwl';
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
