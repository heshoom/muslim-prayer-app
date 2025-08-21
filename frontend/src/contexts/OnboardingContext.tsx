import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export function useOnboarding() {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      setIsOnboardingCompleted(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markOnboardingCompleted = async () => {
    try {
      console.log('Setting onboarding completed in AsyncStorage...');
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      
      // Force a re-check of the status
      await checkOnboardingStatus();
      
      console.log('Onboarding completion verified');
    } catch (error) {
      console.error('Error marking onboarding as completed:', error);
      throw error; // Re-throw to handle in the calling component
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      setIsOnboardingCompleted(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return {
    isOnboardingCompleted,
    isLoading,
    markOnboardingCompleted,
    resetOnboarding,
  };
}
