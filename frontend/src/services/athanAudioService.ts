import { Audio } from 'expo-av';
import { AppState, AppStateStatus } from 'react-native';

class AthanAudioService {
  private currentSound: Audio.Sound | null = null;
  // Removed app state forced stop to allow background playback

  // Force immediate stop without any fade or transition
  async forceStopSound(): Promise<void> {
    if (this.currentSound) {
      // Set volume to 0 immediately before stopping for instant silence
      await this.currentSound.setVolumeAsync(0);
      await this.currentSound.stopAsync();
      await this.currentSound.unloadAsync();
      console.log('Athan sound force stopped immediately');
      this.currentSound = null;
    }
  }

  async playAthanSound(athanType: string): Promise<void> {
    try {
      // Stop any currently playing sound immediately
      await this.stopCurrentSound();

      // Configure audio mode for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Get the sound file based on athan type
      const soundFile = this.getAthanSoundFile(athanType);
      if (!soundFile) {
        console.log('No custom sound file, using system notification');
        return;
      }

      // Create and load the sound
      const { sound } = await Audio.Sound.createAsync(
        soundFile,
        {
          shouldPlay: true,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
        }
      );
      this.currentSound = sound;

      // Set up playback status monitoring
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            this.cleanup();
          }
          // Note: Audio interruptions from lock button will automatically pause/stop the audio
        } else if (!status.isLoaded && 'error' in status && status.error) {
          console.log('Audio playback error - stopping sound');
          this.cleanup();
        }
      });

      console.log(`Playing athan sound: ${athanType}`);
    } catch (error) {
      console.error('Error playing athan sound:', error);
      await this.cleanup();
    }
  }

  async testAthanSound(athanType: string): Promise<void> {
    try {
      console.log(`Testing athan sound: ${athanType}`);
      await this.playAthanSound(athanType);
      
      // For testing, stop after 10 seconds
      setTimeout(async () => {
        await this.stopCurrentSound();
      }, 10000);
    } catch (error) {
      console.error('Error testing athan sound:', error);
    }
  }

  // Play a full adhān file (bundled m4a) using expo-av and keep playback
  // active in background/locked state. fileName should be the asset filename
  // e.g. 'fajr_full.m4a' which must be present under assets/sounds/full/.
  async playFullAthan(fileName: string): Promise<void> {
    try {
      // Stop any short sound first
      await this.stopCurrentSound();

      // Configure audio mode for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Map filenames to required assets so bundler includes them
      const fullMap: Record<string, any> = {
        'fajr_full.m4a': require('../../assets/sounds/full/fajr_full.m4a'),
        'dhuhr_full.m4a': require('../../assets/sounds/full/dhuhr_full.m4a'),
        'asr_full.m4a': require('../../assets/sounds/full/asr_full.m4a'),
        'maghrib_full.m4a': require('../../assets/sounds/full/maghrib_full.m4a'),
        'isha_full.m4a': require('../../assets/sounds/full/isha_full.m4a'),
      };

      const module = fullMap[fileName];
      if (!module) {
        console.warn('Full athan file not found in map:', fileName);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        module,
        {
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        }
      );

      this.currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        try {
          if (!status || !(status as any).isLoaded) return;
          if ((status as any).didJustFinish === true) {
            this.cleanup();
          }
        } catch (err) {
          console.error('Error in playback status update:', err);
        }
      });

      console.log('Playing full athan file:', fileName);
    } catch (err) {
      console.error('Error playing full athan:', err);
      await this.cleanup();
    }
  }

  private getAthanSoundFile(athanType: string) {
    switch (athanType) {
      case 'makkah':
        return require('../../assets/sounds/athan/makkah.mp3');
      case 'madinah':
        return require('../../assets/sounds/athan/madinah.mp3');
      case 'egypt':
        return require('../../assets/sounds/athan/egypt.mp3');
      case 'turkey':
        return require('../../assets/sounds/athan/turkey.mp3');
      case 'nasiralqatami':
        return require('../../assets/sounds/athan/nasiralqatami.mp3');
      default:
        return null; // Use system sound
    }
  }

  async stopCurrentSound(): Promise<void> {
    if (this.currentSound) {
      try {
        // Set volume to 0 first for immediate silence, then stop
        await this.currentSound.setVolumeAsync(0);
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
      this.currentSound = null;
      console.log('Athan sound stopped');
    }
  }

  // Public method to check if sound is currently playing
  isPlaying(): boolean {
    return this.currentSound !== null;
  }

  private async cleanup(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.unloadAsync();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
      this.currentSound = null;
    }
  }

  // Method to clean up subscriptions when service is destroyed
  destroy(): void {
  this.forceStopSound();
  }
}

export const athanAudioService = new AthanAudioService();
