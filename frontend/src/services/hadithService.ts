import hadiths from '../../assets/data/nawawi-42hadith.json';
import { translations } from '../i18n/translations';

export type Hadith = {
  number: number;
  arabic: string;
  english?: string;
  urdu?: string;
  turkish?: string;
  reference?: string;
};

export type LocalizedHadith = Hadith & {
  // the text chosen for the UI language (fallbacks already applied)
  localizedText?: string;
  languageUsed?: string;
};

/**
 * Deterministically select a hadith for a given date and return a localized version.
 * - date: Date to pick the hadith for (defaults to today)
 * - language: app language code (e.g. 'en','ar','ur','tr') used to pick localized text
 */
export function getHadithOfTheDay(date = new Date(), language = 'en'): LocalizedHadith {
  const list = (hadiths as Hadith[]) || [];
  if (!list.length) return { number: 0, arabic: '', english: '', reference: '', localizedText: '', languageUsed: language };

  // compute day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = Number(date) - Number(start);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % list.length;
  const chosen = list[index];

  // Map language -> property on the hadith object
  const langMap: Record<string, keyof Hadith> = {
    ar: 'arabic',
    en: 'english',
    ur: 'urdu',
    tr: 'turkish',
  };

  const targetProp = langMap[language] || 'english';
  // Prefer translations.ts hadiths map for ur/tr if available (centralized translations),
  // otherwise prefer fields in the JSON (english/urdu/turkish), then arabic.
  let localized = '';
  if ((language === 'ur' || language === 'tr') && translations[language] && (translations as any)[language].hadiths) {
    const map = (translations as any)[language].hadiths as Record<string, string>;
    localized = map[String(chosen.number)] || '';
  }
  if (!localized) {
    localized = (chosen as any)[targetProp] || chosen.english || chosen.arabic || '';
  }

  return {
    ...chosen,
    localizedText: localized,
    languageUsed: targetProp === 'arabic' ? 'ar' : targetProp === 'english' ? 'en' : targetProp === 'urdu' ? 'ur' : targetProp === 'turkish' ? 'tr' : language,
  };
}
