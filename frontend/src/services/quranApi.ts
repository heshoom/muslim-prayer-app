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

class QuranApiService {
  private baseUrl = 'https://api.alquran.cloud/v1';

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
