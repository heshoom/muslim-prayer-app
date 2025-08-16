import axios from 'axios';

export interface LocationSuggestion {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  displayName: string;
  importance?: number;
}

export interface ValidationResult {
  isValid: boolean;
  suggestion?: LocationSuggestion;
  error?: string;
}

class LocationValidationService {
  private static instance: LocationValidationService;
  private cache = new Map<string, LocationSuggestion[]>();
  private validationCache = new Map<string, ValidationResult>();

  static getInstance(): LocationValidationService {
    if (!LocationValidationService.instance) {
      LocationValidationService.instance = new LocationValidationService();
    }
    return LocationValidationService.instance;
  }

  /**
   * Get city suggestions as user types
   * Uses OpenStreetMap Nominatim API (free, no API key required)
   * Enhanced to include global coverage
   */
  async getCitySuggestions(query: string): Promise<LocationSuggestion[]> {
    if (query.length < 2) return [];

    const cacheKey = query.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // First attempt: Search with broader parameters for global coverage
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 15, // Increased limit to get more results
          'accept-language': 'en',
          // Removed countrycodes restriction for global coverage
          extratags: 1, // Get extra tags for better classification
          namedetails: 1 // Get name details for better matching
        },
        headers: {
          'User-Agent': 'Muslim Prayer App'
        },
        timeout: 8000 // Increased timeout for global search
      });

      let suggestions: LocationSuggestion[] = response.data
        .filter((item: any) => {
          // More comprehensive filtering for cities and towns
          const isPlace = item.class === 'place';
          const isAdministrative = item.class === 'boundary' && item.type === 'administrative';
          const validTypes = [
            'city', 'town', 'municipality', 'village', 
            'hamlet', 'suburb', 'district', 'county',
            'administrative'
          ];
          
          // Check if it's a valid settlement type
          const hasValidType = validTypes.includes(item.type) || isPlace || isAdministrative;
          
          // Exclude very small places or non-settlements
          const excludeTypes = ['house', 'building', 'address', 'road', 'amenity'];
          const isNotExcluded = !excludeTypes.includes(item.class);
          
          return hasValidType && isNotExcluded;
        })
        .map((item: any) => ({
          id: item.place_id.toString(),
          name: this.extractCityName(item),
          country: item.address?.country || '',
          region: item.address?.state || item.address?.region || item.address?.county || '',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          displayName: this.formatDisplayName(item),
          importance: parseFloat(item.importance || '0') // Add importance for sorting
        }))
        .filter((suggestion: LocationSuggestion) => 
          suggestion.name && 
          suggestion.country && 
          suggestion.name.length > 1 &&
          !suggestion.name.includes('/') // Exclude complex names
        )
        // Sort by importance (larger cities first)
        .sort((a: any, b: any) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 8); // Final limit

      // If we don't have enough results, try a second search with different parameters
      if (suggestions.length < 3) {
        const fallbackResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: `${query} city`,
            format: 'json',
            addressdetails: 1,
            limit: 10,
            'accept-language': 'en'
          },
          headers: {
            'User-Agent': 'Muslim Prayer App'
          },
          timeout: 5000
        });

        const fallbackSuggestions = fallbackResponse.data
          .filter((item: any) => item.class === 'place')
          .map((item: any) => ({
            id: item.place_id.toString(),
            name: this.extractCityName(item),
            country: item.address?.country || '',
            region: item.address?.state || item.address?.region || '',
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            displayName: this.formatDisplayName(item)
          }))
          .filter((suggestion: LocationSuggestion) => 
            suggestion.name && suggestion.country
          );

        // Merge and deduplicate
        const allSuggestions = [...suggestions, ...fallbackSuggestions];
        const uniqueSuggestions = allSuggestions.filter((item, index, self) => 
          index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase() && t.country === item.country)
        );
        
        suggestions = uniqueSuggestions.slice(0, 8);
      }

      this.cache.set(cacheKey, suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      return [];
    }
  }

  /**
   * Validate if a city name exists and get its details
   * Enhanced with multiple search strategies
   */
  async validateCity(cityName: string): Promise<ValidationResult> {
    const cacheKey = cityName.toLowerCase().trim();
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    try {
      // Strategy 1: Try getting suggestions first
      let suggestions = await this.getCitySuggestions(cityName);
      
      // Strategy 2: If no results, try direct search with different parameters
      if (suggestions.length === 0) {
        try {
          const directResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
              q: cityName,
              format: 'json',
              addressdetails: 1,
              limit: 5,
              'accept-language': 'en'
            },
            headers: {
              'User-Agent': 'Muslim Prayer App'
            },
            timeout: 5000
          });

          suggestions = directResponse.data
            .filter((item: any) => item.class === 'place' || item.class === 'boundary')
            .map((item: any) => ({
              id: item.place_id.toString(),
              name: this.extractCityName(item),
              country: item.address?.country || '',
              region: item.address?.state || item.address?.region || '',
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
              displayName: this.formatDisplayName(item)
            }))
            .filter((suggestion: LocationSuggestion) => 
              suggestion.name && suggestion.country
            );
        } catch (directError) {
          console.warn('Direct search failed:', directError);
        }
      }
      
      if (suggestions.length === 0) {
        const result: ValidationResult = {
          isValid: false,
          error: 'City not found. Please check the spelling or try a different city.'
        };
        this.validationCache.set(cacheKey, result);
        return result;
      }

      // Find exact match or closest match
      const exactMatch = suggestions.find(s => 
        s.name.toLowerCase() === cityName.toLowerCase()
      );

      // If no exact match, try partial matching
      const partialMatch = !exactMatch ? suggestions.find(s => 
        s.name.toLowerCase().includes(cityName.toLowerCase()) ||
        cityName.toLowerCase().includes(s.name.toLowerCase())
      ) : null;

      const bestMatch = exactMatch || partialMatch || suggestions[0];
      
      const result: ValidationResult = {
        isValid: true,
        suggestion: bestMatch
      };

      this.validationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error validating city:', error);
      return {
        isValid: false,
        error: 'Unable to validate city. Please check your internet connection.'
      };
    }
  }

  /**
   * Extract city name from OpenStreetMap response
   */
  private extractCityName(item: any): string {
    // Try multiple fields to get the best city name
    return item.address?.city || 
           item.address?.town || 
           item.address?.municipality || 
           item.address?.village ||
           item.address?.hamlet ||
           item.display_name?.split(',')[0] ||
           item.name || 
           '';
  }

  /**
   * Format display name for suggestions
   */
  private formatDisplayName(item: any): string {
    const city = item.address?.city || item.address?.town || item.address?.municipality || item.name;
    const state = item.address?.state || item.address?.region;
    const country = item.address?.country;

    let displayName = city;
    if (state && state !== city) {
      displayName += `, ${state}`;
    }
    if (country) {
      displayName += `, ${country}`;
    }

    return displayName;
  }

  /**
   * Clear cache (useful for memory management)
   */
  clearCache(): void {
    this.cache.clear();
    this.validationCache.clear();
  }

  /**
   * Get popular cities for quick selection with better global coverage
   */
  getPopularCities(): LocationSuggestion[] {
    return [
      // Major Islamic cities
      {
        id: 'popular_1',
        name: 'Mecca',
        country: 'Saudi Arabia',
        region: 'Makkah',
        latitude: 21.3891,
        longitude: 39.8579,
        displayName: 'Mecca, Makkah, Saudi Arabia'
      },
      {
        id: 'popular_2',
        name: 'Medina',
        country: 'Saudi Arabia',
        region: 'Al Madinah',
        latitude: 24.5247,
        longitude: 39.5692,
        displayName: 'Medina, Al Madinah, Saudi Arabia'
      },
      {
        id: 'popular_3',
        name: 'Istanbul',
        country: 'Turkey',
        region: 'Istanbul',
        latitude: 41.0082,
        longitude: 28.9784,
        displayName: 'Istanbul, Turkey'
      },
      {
        id: 'popular_4',
        name: 'Jakarta',
        country: 'Indonesia',
        region: 'Jakarta',
        latitude: -6.2088,
        longitude: 106.8456,
        displayName: 'Jakarta, Indonesia'
      },
      {
        id: 'popular_5',
        name: 'Cairo',
        country: 'Egypt',
        region: 'Cairo',
        latitude: 30.0444,
        longitude: 31.2357,
        displayName: 'Cairo, Egypt'
      },
      {
        id: 'popular_6',
        name: 'Karachi',
        country: 'Pakistan',
        region: 'Sindh',
        latitude: 24.8607,
        longitude: 67.0011,
        displayName: 'Karachi, Sindh, Pakistan'
      },
      {
        id: 'popular_7',
        name: 'Dhaka',
        country: 'Bangladesh',
        region: 'Dhaka',
        latitude: 23.8103,
        longitude: 90.4125,
        displayName: 'Dhaka, Bangladesh'
      },
      {
        id: 'popular_8',
        name: 'Dubai',
        country: 'United Arab Emirates',
        region: 'Dubai',
        latitude: 25.2048,
        longitude: 55.2708,
        displayName: 'Dubai, United Arab Emirates'
      },
      // Major global cities
      {
        id: 'popular_9',
        name: 'London',
        country: 'United Kingdom',
        region: 'England',
        latitude: 51.5074,
        longitude: -0.1278,
        displayName: 'London, England, United Kingdom'
      },
      {
        id: 'popular_10',
        name: 'New York',
        country: 'United States',
        region: 'New York',
        latitude: 40.7128,
        longitude: -74.0060,
        displayName: 'New York, NY, United States'
      },
      {
        id: 'popular_11',
        name: 'Paris',
        country: 'France',
        region: 'Île-de-France',
        latitude: 48.8566,
        longitude: 2.3522,
        displayName: 'Paris, Île-de-France, France'
      },
      {
        id: 'popular_12',
        name: 'Berlin',
        country: 'Germany',
        region: 'Berlin',
        latitude: 52.5200,
        longitude: 13.4050,
        displayName: 'Berlin, Germany'
      }
    ];
  }
}

export const locationValidationService = LocationValidationService.getInstance();
