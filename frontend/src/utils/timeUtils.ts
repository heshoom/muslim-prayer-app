/**
 * Utility functions for formatting times and dates
 */

export const formatTime = (time: string, format: '12h' | '24h'): string => {
  if (!time) return time;
  
  if (format === '24h') {
    return time; // Already in 24h format from API
  }
  
  // Convert to 12h format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatDate = (dateString: string, showHijri: boolean): string => {
  if (!showHijri) {
    return dateString; // Return original date
  }
  
  // For now, we'll just return the original date
  // In a full implementation, you would convert to Hijri calendar
  return dateString;
};

export const convertToHijriDate = (gregorianDate: string): string => {
  // This is a placeholder. In a real app, you'd use a proper Hijri conversion library
  // For now, we'll just append a note about Hijri support
  return `${gregorianDate} (Hijri conversion requires additional library)`;
};
