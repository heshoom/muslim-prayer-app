/**
 * Utility functions for formatting times and dates
 */

export const formatTime = (time: string, format: '12h' | '24h'): string => {
  if (!time) return time;
  
  // Check if time already has am/pm (from MuslimSalat API)
  const hasAmPm = /\s*(am|pm|AM|PM)\s*$/.test(time);
  
  if (format === '24h') {
    if (hasAmPm) {
      // Convert from 12h to 24h format
      const cleanTime = time.replace(/\s*(am|pm|AM|PM)\s*$/i, '');
      const [hours, minutes] = cleanTime.split(':');
      let hour = parseInt(hours, 10);
      
      const isPM = /pm/i.test(time);
      if (isPM && hour !== 12) {
        hour += 12;
      } else if (!isPM && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    }
    return time; // Already in 24h format
  }
  
  // For 12h format
  if (hasAmPm) {
    // Convert existing am/pm to uppercase
    return time.replace(/\s*(am|pm)\s*$/i, (match) => {
      return match.toLowerCase().includes('am') ? ' AM' : ' PM';
    });
  }
  
  // Convert from 24h to 12h format
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
