import { Audio } from 'expo-av';
import { AppState, AppStateStatus } from 'react-native';

class AthanAudioService {
  private currentSound: Audio.Sound | null = null;
  private appStateSubscription: any = null;

  constructor() {
    this.setupAudioInterruptions();
  }

  private setupAudioInterruptions() {
    // Configure audio mode to handle interruptions properly
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Listen for app state changes (includes lock button press)
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Force immediate stop when app goes to background or inactive (lock button pressed)
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      console.log('App went to background/inactive - forcing immediate athan stop');
      await this.forceStopSound();
    }
  };

  // Force immediate stop without any fade or transition
  async forceStopSound(): Promise<void> {
    if (this.currentSound) {
      try {
        // Set volume to 0 immediately before stopping for instant silence
        await this.currentSound.setVolumeAsync(0);
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        console.log('Athan sound force stopped immediately');
      } catch (error) {
        console.error('Error force stopping sound:', error);
      }
      this.currentSound = null;
    }
  }

  async playAthanSound(athanType: string): Promise<void> {
    try {
      // Stop any currently playing sound immediately
      await this.stopCurrentSound();

      // Configure audio mode for immediate interruption handling
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false, // Changed to false for immediate stop
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false, // Changed to false for immediate stop
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
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}

export const athanAudioService = new AthanAudioService();