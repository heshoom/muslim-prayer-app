export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise: string;
  date_for?: string;
  hijri_date?: {
    day: string;
    month: string;
    year: string;
    monthName: string;
  };
}

export interface LocationError {
  message: string;
}
