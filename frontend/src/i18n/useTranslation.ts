import { useSettings } from '@/src/contexts/SettingsContext';
import { translations } from './translations';

export const useTranslation = () => {
  const { settings } = useSettings();
  const currentLanguage = settings.appearance.language || 'en';
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage as keyof typeof translations];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key if no translation found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const getCurrentLanguage = () => currentLanguage;
  
  const isRTL = () => ['ar', 'ur'].includes(currentLanguage);

  return { t, getCurrentLanguage, isRTL };
};
