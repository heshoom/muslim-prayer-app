import * as Location from "expo-location";
// Returns { fajr: Date, dhuhr: Date, asr: Date, maghrib: Date, isha: Date } for the given date (local time)
export async function getPrayerTimesForDate(
  date: Date
): Promise<{ fajr: Date; dhuhr: Date; asr: Date; maghrib: Date; isha: Date }> {
  // 1. Get current location
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location permission denied");
  const loc = await Location.getCurrentPositionAsync({});
  const latitude = loc.coords.latitude;
  const longitude = loc.coords.longitude;

  // 2. Fetch prayer times for today (using default method/madhab)
  const resp = await fetchPrayerTimes(latitude, longitude);
  const pt = resp.prayerTimes;

  // 3. Convert time strings to Date objects for the given date
  function toDate(timeStr: string): Date {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  }

  return {
    fajr: toDate(pt.Fajr),
    dhuhr: toDate(pt.Dhuhr),
    asr: toDate(pt.Asr),
    maghrib: toDate(pt.Maghrib),
    isha: toDate(pt.Isha),
  };
}

// ...existing code...

// --- DEVELOPMENT MOCK ONLY ---
// Comment out the real export below during testing
// export async function getPrayerTimesForDate(date: Date) {
//   const now = new Date();
//   return {
//     fajr: new Date(now.getTime() + 1 * 60 * 1000),
//     dhuhr: new Date(now.getTime() + 2 * 60 * 1000),
//     asr: new Date(now.getTime() + 3 * 60 * 1000),
//     maghrib: new Date(now.getTime() + 4 * 60 * 1000),
//     isha: new Date(now.getTime() + 5 * 60 * 1000),
//   };
// }
// --- END MOCK ---

// Fallback to direct Aladhan API since backend requires authentication
const ALADHAN_API_URL = "https://api.aladhan.com/v1";

// Function to get city name from coordinates using reverse geocoding
const getCityFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    // Using OpenStreetMap Nominatim service (free and reliable)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Muslim Prayer App", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed");
    }

    const data = await response.json();
    console.log("🗺️  Geocoding response:", data.address);

    // Extract location components
    const address = data.address || {};
    const city =
      address.city || address.town || address.village || address.municipality;
    const state = address.state || address.region || address.province;
    const country = address.country;

    // Build location string with proper country detection
    let locationString = "";
    if (city && state && country) {
      locationString = `${city}, ${state}, ${country}`;
    } else if (city && country) {
      locationString = `${city}, ${country}`;
    } else if (state && country) {
      locationString = `${state}, ${country}`;
    } else if (country) {
      locationString = country;
    } else {
      locationString = "Unknown Location";
    }

    console.log(`🌍 Location resolved: "${locationString}"`);
    return locationString;
  } catch (error) {
    console.warn("Could not get city name, using coordinates:", error);
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

import { getCalculationMethodNumber } from "../utils/calculationMethods";

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
  const normalized = (country || "").toLowerCase().trim();

  const NORTH_AMERICA = [
    "united states",
    "usa",
    "us",
    "america",
    "united states of america",
    "canada",
    "mexico",
  ];
  const EUROPE = [
    "united kingdom",
    "uk",
    "britain",
    "great britain",
    "england",
    "scotland",
    "wales",
    "france",
    "germany",
    "spain",
    "italy",
    "portugal",
    "netherlands",
    "belgium",
    "switzerland",
    "austria",
    "poland",
    "sweden",
    "norway",
    "finland",
    "denmark",
    "ireland",
    "greece",
    "czech republic",
    "romania",
    "hungary",
    "bulgaria",
  ];
  const SOUTH_ASIA = [
    "pakistan",
    "india",
    "bangladesh",
    "sri lanka",
    "nepal",
    "bhutan",
  ];
  const MIDDLE_EAST = [
    "united arab emirates",
    "uae",
    "oman",
    "qatar",
    "kuwait",
    "bahrain",
    "jordan",
    "lebanon",
    "syria",
    "iraq",
    "israel",
    "palestine",
    "yemen",
    "turkey",
  ];
  const AFRICA = [
    "egypt",
    "morocco",
    "algeria",
    "tunisia",
    "libya",
    "south africa",
    "nigeria",
    "kenya",
    "ethiopia",
    "ghana",
    "tanzania",
    "uganda",
    "angola",
    "sudan",
    "libya",
    "mozambique",
    "madagascar",
    "cameroon",
    "ivory coast",
    "mali",
    "burkina faso",
  ];
  const HIGH_LATITUDE = [
    "norway",
    "sweden",
    "finland",
    "iceland",
    "greenland",
    "alaska",
  ];

  console.log(
    `🗺️  Country detection: "${country}" normalized to "${normalized}"`
  );

  // Iran and Saudi Arabia explicit mappings
  if (normalized === "iran") {
    console.log("✅ Detected Iran → Using Tehran method");
    return "tehran";
  }
  if (normalized === "saudi arabia" || normalized === "saudi") {
    console.log("✅ Detected Saudi Arabia → Using Makkah method");
    return "makkah";
  }

  if (NORTH_AMERICA.includes(normalized)) {
    console.log("✅ Detected North America → Using ISNA method");
    return "isna";
  }
  if (EUROPE.includes(normalized)) {
    console.log("✅ Detected Europe → Using MWL method");
    return "mwl";
  }
  if (SOUTH_ASIA.includes(normalized)) {
    console.log("✅ Detected South Asia → Using Karachi method");
    return "karachi";
  }
  if (MIDDLE_EAST.includes(normalized)) {
    console.log("✅ Detected Middle East → Using Makkah method");
    return "makkah";
  }
  if (AFRICA.includes(normalized)) {
    console.log("✅ Detected Africa → Using Egypt method");
    return "egypt";
  }
  if (HIGH_LATITUDE.includes(normalized)) {
    console.log("✅ Detected High Latitude → Using MWL method");
    return "mwl";
  }

  // Fallbacks for common names
  if (normalized === "united kingdom" || normalized === "uk") {
    console.log("✅ Detected UK → Using MWL method");
    return "mwl";
  }
  if (normalized === "singapore") {
    console.log("✅ Detected Singapore → Using Singapore method");
    return "singapore";
  }

  // Default to MWL if unknown
  console.log(
    `⚠️  Unknown country "${normalized}" → Using MWL method as fallback`
  );
  return "mwl";
};

export const fetchPrayerTimes = async (
  latitude: number,
  longitude: number,
  calculationMethod: string = "auto",
  madhab: "shafi" | "hanafi" = "shafi"
): Promise<PrayerTimesResponse> => {
  try {
    console.log("Fetching prayer times for coordinates:", {
      latitude,
      longitude,
    });
    // Get city name and country from coordinates
    const cityName = await getCityFromCoordinates(latitude, longitude);
    console.log("Location resolved to:", cityName);

    // Try to extract country from cityName string
    let country = "Unknown";
    const parts = cityName.split(",").map((s) => s.trim());
    if (parts.length > 1) {
      country = parts[parts.length - 1];
    }

    console.log(`🌍 Location breakdown: "${cityName}" → Country: "${country}"`);

    let methodToUse = calculationMethod;
    if (calculationMethod === "auto") {
      methodToUse = getRecommendedMethodForCountry(country);
      console.log(
        `🕌 Auto calculation method: "${country}" → "${methodToUse}"`
      );
    } else {
      console.log(`🕌 Manual calculation method: "${calculationMethod}"`);
    }
    const methodNum = getCalculationMethodNumber(methodToUse);
    // school: 0 = Shafi (default), 1 = Hanafi
    const school = madhab === "hanafi" ? 1 : 0;
    // Call Aladhan API with selected method and madhab (school) for Asr calculation
    const url = `${ALADHAN_API_URL}/timings?latitude=${latitude}&longitude=${longitude}&method=${methodNum}&school=${school}`;
    console.log("Making request to:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      redirect: "follow",
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (data.code !== 200) {
      throw new Error(data.data || "Failed to fetch prayer times");
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

    console.log(
      "Successfully fetched prayer times for:",
      transformedResponse.location
    );
    return transformedResponse;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
};
