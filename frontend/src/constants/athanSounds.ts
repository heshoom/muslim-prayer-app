// Centralized configuration for athan sounds
// This ensures consistency across all services

export const ATHAN_SOUND_CONFIG = {
  // File names for iOS notifications (must match files in iOS project)
  iosNotificationSounds: {
    makkah: 'makkah_short.aiff',
    madinah: 'madinah.aiff',
    egypt: 'egypt_short.aiff',
    turkey: 'turkey_short.aiff',
    nasiralqatami: 'nasiralqatami_short.aiff',
    default: 'default',
  },
  
  // File paths for app audio playback (must match files in assets/sounds/athan/)
  appAudioFiles: {
    makkah: require('../../assets/sounds/athan/makkah_short.aiff'),
    madinah: require('../../assets/sounds/athan/madinah.aiff'),
    egypt: require('../../assets/sounds/athan/egypt_short.aiff'),
    turkey: require('../../assets/sounds/athan/turkey_short.aiff'),
    nasiralqatami: require('../../assets/sounds/athan/nasiralqatami_short.aiff'),
  },
  
  // Display names for UI
  displayNames: {
    makkah: 'Makkah (Sheikh Al-Sudais)',
    madinah: 'Madinah (Sheikh Ali Ahmed Mulla)',
    egypt: 'Egypt (Sheikh Mahmoud Al-Husary)',
    turkey: 'Turkey (Sheikh Hafez Mustafa Ozcan)',
    nasiralqatami: 'Nasir Al-Qatami',
    default: 'Default System Sound',
  },
  
  // Available athan types
  availableTypes: ['makkah', 'madinah', 'egypt', 'turkey', 'nasiralqatami', 'default'] as const,
} as const;

export type AthanType = typeof ATHAN_SOUND_CONFIG.availableTypes[number];

// Helper functions
export const getIosNotificationSound = (athanType: AthanType): string => {
  return ATHAN_SOUND_CONFIG.iosNotificationSounds[athanType] || 'default';
};

export const getAppAudioFile = (athanType: AthanType) => {
  if (athanType === 'default') return null;
  return ATHAN_SOUND_CONFIG.appAudioFiles[athanType] || null;
};

export const getDisplayName = (athanType: AthanType): string => {
  return ATHAN_SOUND_CONFIG.displayNames[athanType] || 'Unknown Athan';
};
