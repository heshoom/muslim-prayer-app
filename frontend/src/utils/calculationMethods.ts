/**
 * Mapping between calculation method names and API numerical values
 * Based on Aladhan API documentation
 */

export const CALCULATION_METHODS = {
  'mwl': '3',       // Muslim World League
  'isna': '2',      // Islamic Society of North America
  'egypt': '5',     // Egyptian General Authority of Survey
  'makkah': '4',    // Umm Al-Qura University, Makkah
  'karachi': '1',   // University of Islamic Sciences, Karachi
  'tehran': '7',    // Institute of Geophysics, University of Tehran
  'jafari': '0',    // Jafari (Shia)
  'gulf': '8',      // Gulf Region
  'kuwait': '9',    // Kuwait
  'qatar': '10',    // Qatar
  'singapore': '11', // Majlis Ugama Islam Singapura, Singapore
  'france': '12',   // Union Organization Islamic de France
  'turkey': '13',   // Diyanet İşleri Başkanlığı, Turkey
  'russia': '14',   // Spiritual Administration of Muslims of Russia
  'moonsighting': '15' // Moonsighting Committee Worldwide
};

export const getCalculationMethodNumber = (methodName: string): string => {
  return CALCULATION_METHODS[methodName as keyof typeof CALCULATION_METHODS] || '2'; // Default to ISNA
};

export const getCalculationMethodName = (methodNumber: string): string => {
  const entry = Object.entries(CALCULATION_METHODS).find(([, value]) => value === methodNumber);
  return entry ? entry[0] : 'isna';
};
