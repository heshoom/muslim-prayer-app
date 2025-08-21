// Test onboarding reset - Run this in the Metro debugger console

// To reset onboarding and test the flow:
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reset onboarding
const resetOnboarding = async () => {
  try {
    // Option 1: Clear all settings (simulates fresh install)
    await AsyncStorage.removeItem('userSettings');
    await AsyncStorage.removeItem('app:lastBuildId');
    console.log('✅ Cleared all settings - app should show onboarding on next reload');
    
    // Option 2: Just reset onboarding flag
    // const settings = await AsyncStorage.getItem('userSettings');
    // if (settings) {
    //   const parsed = JSON.parse(settings);
    //   parsed.onboarding = { completed: false };
    //   await AsyncStorage.setItem('userSettings', JSON.stringify(parsed));
    //   console.log('✅ Reset onboarding flag only');
    // }
    
    // Reload the app to see changes
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ Error resetting onboarding:', error);
  }
};

// Check current settings
const checkSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem('userSettings');
    console.log('Current settings:', settings ? JSON.parse(settings) : 'No settings found');
  } catch (error) {
    console.error('Error checking settings:', error);
  }
};

// Export functions for use
window.resetOnboarding = resetOnboarding;
window.checkSettings = checkSettings;

console.log('🛠️  Test functions available:');
console.log('  resetOnboarding() - Clear settings and reset onboarding');
console.log('  checkSettings() - View current settings');
