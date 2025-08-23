import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/src/components/shared/ThemedText';
import { useTranslation } from '@/src/i18n';

export const ResetOnboardingButton = ({ onReset }: { onReset?: () => void }) => {
  const { t } = useTranslation();
  const resetOnboarding = async () => {
    Alert.alert(
      t('resetOnboarding') || 'Reset Onboarding',
      t('resetOnboardingConfirm') || 'This will clear your settings and restart the onboarding flow. Continue?',
      [
        { text: t('cancel') || 'Cancel', style: 'cancel' },
        { 
          text: t('reset') || 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['userSettings', 'app:lastBuildId']);
              console.log('✅ Onboarding reset successfully');
              onReset?.();
              // You might want to restart the app or navigate to onboarding
            } catch (error) {
              console.error('❌ Error resetting onboarding:', error);
              Alert.alert(t('error') || 'Error', t('failedToResetOnboarding') || 'Failed to reset onboarding');
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity onPress={resetOnboarding} style={{ padding: 10 }}>
      <ThemedText style={{ color: 'red', textAlign: 'center' }}>
        🔄 {t('resetOnboardingDebug') || 'Reset Onboarding (Debug)'}
      </ThemedText>
    </TouchableOpacity>
  );
};

// Usage: Add this to any screen for testing
// <ResetOnboardingButton onReset={() => router.replace('/')} />
