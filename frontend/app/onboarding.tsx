import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useOnboarding } from '../src/contexts/OnboardingContext';

export default function OnboardingScreen() {
  const { markOnboardingCompleted, isOnboardingCompleted } = useOnboarding();
  const [locationPermission, setLocationPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: location, 2: notification, 3: complete

  useEffect(() => {
    // Check existing permissions on mount
    checkExistingPermissions();
  }, []);

  const checkExistingPermissions = async () => {
    // Check location permission
    const locationStatus = await Location.getForegroundPermissionsAsync();
    if (locationStatus.status === 'granted') {
      setLocationPermission(true);
      setCurrentStep(2);
    }

    // Check notification permission
    const notificationStatus = await Notifications.getPermissionsAsync();
    if (notificationStatus.status === 'granted') {
      setNotificationPermission(true);
      if (locationPermission) {
        setCurrentStep(3);
      }
    }
  };

  const requestLocationPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        setCurrentStep(2);
        Alert.alert('Success', 'Location permission granted!');
      } else {
        Alert.alert(
          'Permission Required',
          'Location permission is required to provide accurate prayer times for your area.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    setIsLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationPermission(true);
        setCurrentStep(3);
        Alert.alert('Success', 'Notification permission granted!');
      } else {
        Alert.alert(
          'Permission Required',
          'Notification permission is required to receive prayer time reminders.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permission.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (locationPermission && notificationPermission) {
      console.log('Starting onboarding completion...');
      setIsLoading(true);
      try {
        console.log('Marking onboarding as completed...');
        await markOnboardingCompleted();
        console.log('Onboarding marked as completed');
        
        // The context will handle the state update, so we can navigate immediately
        console.log('Navigating to main app...');
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStepStatus = (step: number) => {
    if (step === 1) return currentStep >= 1;
    if (step === 2) return locationPermission && currentStep >= 2;
    if (step === 3) return locationPermission && notificationPermission && currentStep >= 3;
    return false;
  };

  const getButtonStyle = (step: number) => {
    const isActive = getStepStatus(step);
    return {
      ...styles.permissionButton,
      backgroundColor: isActive ? '#2980b9' : '#bdc3c7',
      opacity: isActive ? 1 : 0.6,
    };
  };

  const getButtonTextStyle = (step: number) => {
    const isActive = getStepStatus(step);
    return {
      ...styles.permissionButtonText,
      color: isActive ? '#fff' : '#7f8c8d',
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Muslim Prayer App</Text>
            <Text style={styles.subtitle}>
              Let's set up your app to provide accurate prayer times and reminders
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            {/* Step 1: Location Permission */}
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={[
                  styles.stepNumber, 
                  { 
                    backgroundColor: getStepStatus(1) ? '#27ae60' : currentStep === 1 ? '#2980b9' : '#bdc3c7',
                    borderWidth: currentStep === 1 ? 2 : 0,
                    borderColor: '#2980b9'
                  }
                ]}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={[styles.stepTitle, { color: currentStep === 1 ? '#2980b9' : '#2c3e50' }]}>Location Access</Text>
              </View>
              <Text style={styles.stepDescription}>
                Allow location access to get accurate prayer times for your area
              </Text>
              <TouchableOpacity
                style={getButtonStyle(1)}
                onPress={requestLocationPermission}
                disabled={isLoading || locationPermission}
              >
                {isLoading && currentStep === 1 ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={getButtonTextStyle(1)}>
                    {locationPermission ? '✓ Location Granted' : 'Grant Location Access'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Step 2: Notification Permission */}
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={[
                  styles.stepNumber, 
                  { 
                    backgroundColor: getStepStatus(2) ? '#27ae60' : currentStep === 2 ? '#2980b9' : '#bdc3c7',
                    borderWidth: currentStep === 2 ? 2 : 0,
                    borderColor: '#2980b9'
                  }
                ]}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={[styles.stepTitle, { color: currentStep === 2 ? '#2980b9' : '#2c3e50' }]}>Notifications</Text>
              </View>
              <Text style={styles.stepDescription}>
                Enable notifications to receive prayer time reminders
              </Text>
              <TouchableOpacity
                style={getButtonStyle(2)}
                onPress={requestNotificationPermission}
                disabled={isLoading || !locationPermission || notificationPermission}
              >
                {isLoading && currentStep === 2 ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={getButtonTextStyle(2)}>
                    {notificationPermission ? '✓ Notifications Granted' : 'Grant Notification Access'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Step 3: Continue Button */}
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={[
                  styles.stepNumber, 
                  { 
                    backgroundColor: getStepStatus(3) ? '#27ae60' : currentStep === 3 ? '#2980b9' : '#bdc3c7',
                    borderWidth: currentStep === 3 ? 2 : 0,
                    borderColor: '#2980b9'
                  }
                ]}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={[styles.stepTitle, { color: currentStep === 3 ? '#2980b9' : '#2c3e50' }]}>Get Started</Text>
              </View>
              <Text style={styles.stepDescription}>
                You're all set! Tap continue to start using the app
              </Text>
              <TouchableOpacity
                style={getButtonStyle(3)}
                onPress={handleContinue}
                disabled={!locationPermission || !notificationPermission || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={getButtonTextStyle(3)}>Continue to App</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: Math.min(20, screenWidth * 0.05),
    paddingTop: Platform.OS === 'android' ? Math.min(40, screenHeight * 0.05) : Math.min(20, screenHeight * 0.025),
  },
  header: {
    alignItems: 'center',
    marginBottom: Math.min(40, screenHeight * 0.05),
  },
  title: {
    fontSize: Math.min(28, screenWidth * 0.07),
    fontWeight: 'bold',
    color: '#2980b9',
    textAlign: 'center',
    marginBottom: Math.min(10, screenHeight * 0.012),
  },
  subtitle: {
    fontSize: Math.min(16, screenWidth * 0.04),
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: Math.min(24, screenWidth * 0.06),
  },
  stepsContainer: {
    flex: 1,
  },
  stepContainer: {
    marginBottom: Math.min(30, screenHeight * 0.035),
    backgroundColor: '#fff',
    borderRadius: Math.min(12, screenWidth * 0.03),
    padding: Math.min(20, screenWidth * 0.05),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Math.min(10, screenHeight * 0.012),
  },
  stepNumber: {
    width: Math.min(30, screenWidth * 0.075),
    height: Math.min(30, screenWidth * 0.075),
    borderRadius: Math.min(15, screenWidth * 0.0375),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Math.min(15, screenWidth * 0.0375),
  },
  stepNumberText: {
    color: '#fff',
    fontSize: Math.min(16, screenWidth * 0.04),
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: Math.min(18, screenWidth * 0.045),
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  stepDescription: {
    fontSize: Math.min(14, screenWidth * 0.035),
    color: '#7f8c8d',
    lineHeight: Math.min(20, screenWidth * 0.05),
    marginBottom: Math.min(15, screenHeight * 0.018),
  },
  permissionButton: {
    height: Math.min(50, screenHeight * 0.06),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Math.min(8, screenWidth * 0.02),
    paddingHorizontal: Math.min(20, screenWidth * 0.05),
  },
  permissionButtonText: {
    fontSize: Math.min(16, screenWidth * 0.04),
    fontWeight: 'bold',
  },
});
