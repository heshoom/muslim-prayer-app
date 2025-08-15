import AsyncStorage from '@react-native-async-storage/async-storage';

type QuranVerse = {
  number: number;
  text: string;
  translation?: string;
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    type: string;
  };
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
  };
};

type QuranResponse = {
  code: number;
  status: string;
  data: QuranVerse;
};

type CachedVerse = {
  verse: QuranVerse;
  date: string;
};

class QuranApiService {
  private baseUrl = 'https://api.alquran.cloud/v1';
  private cacheKey = 'dailyVerse';

  // Generate a deterministic random number based on a seed (date)
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Get current date string in YYYY-MM-DD format
  private getCurrentDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  // Convert date string to seed number
  private dateToSeed(dateString: string): number {
    return dateString.split('-').reduce((acc, part) => acc + parseInt(part), 0);
  }

  async getDailyVerse(): Promise<QuranVerse> {
    try {
      const today = this.getCurrentDateString();
      
      // Check if we have a cached verse for today
      const cachedData = await AsyncStorage.getItem(this.cacheKey);
      if (cachedData) {
        const parsed: CachedVerse = JSON.parse(cachedData);
        if (parsed.date === today) {
          console.log('Using cached verse for today');
          return parsed.verse;
        }
      }

      console.log('Fetching new verse for today');
      
      // Generate deterministic random numbers based on today's date
      const seed = this.dateToSeed(today);
      const surah = Math.floor(this.seededRandom(seed) * 114) + 1;
      
      // First, get the surah to know how many verses it has
      const surahResponse = await fetch(`${this.baseUrl}/surah/${surah}`);
      const surahData = await surahResponse.json();
      const numberOfAyahs = surahData.data.numberOfAyahs;
      
      // Get a deterministic verse from this surah
      const ayah = Math.floor(this.seededRandom(seed + 1) * numberOfAyahs) + 1;
      
      // Get both Arabic and English translations
      const [arabicResponse, englishResponse] = await Promise.all([
        fetch(`${this.baseUrl}/ayah/${surah}:${ayah}`),
        fetch(`${this.baseUrl}/ayah/${surah}:${ayah}/en.sahih`)
      ]);

      const arabicData: QuranResponse = await arabicResponse.json();
      const englishData: QuranResponse = await englishResponse.json();

      const verse: QuranVerse = {
        ...arabicData.data,
        translation: englishData.data.text
      };

      // Cache the verse with today's date
      const cacheData: CachedVerse = {
        verse,
        date: today
      };
      await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cacheData));

      return verse;
    } catch (error) {
      console.error('Error fetching daily Quran verse:', error);
      throw error;
    }
  }

  async getRandomVerse(): Promise<QuranVerse> {
    try {
      // Get a random surah (1-114) and random verse
      const surah = Math.floor(Math.random() * 114) + 1;
      
      // First, get the surah to know how many verses it has
      const surahResponse = await fetch(`${this.baseUrl}/surah/${surah}`);
      const surahData = await surahResponse.json();
      const numberOfAyahs = surahData.data.numberOfAyahs;
      
      // Get a random verse from this surah
      const ayah = Math.floor(Math.random() * numberOfAyahs) + 1;
      
      // Get both Arabic and English translations
      const [arabicResponse, englishResponse] = await Promise.all([
        fetch(`${this.baseUrl}/ayah/${surah}:${ayah}`),
        fetch(`${this.baseUrl}/ayah/${surah}:${ayah}/en.sahih`)
      ]);

      const arabicData: QuranResponse = await arabicResponse.json();
      const englishData: QuranResponse = await englishResponse.json();

      return {
        ...arabicData.data,
        translation: englishData.data.text
      };
    } catch (error) {
      console.error('Error fetching Quran verse:', error);
      throw error;
    }
  }
}

export const quranApi = new QuranApiService();
