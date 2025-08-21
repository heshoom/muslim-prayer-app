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
} from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function OnboardingScreen() {
  const { markOnboardingCompleted } = useOnboarding();
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
      await markOnboardingCompleted();
      router.replace('/(tabs)');
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
              disabled={!locationPermission || !notificationPermission}
            >
              <Text style={getButtonTextStyle(3)}>Continue to App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2980b9',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepsContainer: {
    flex: 1,
  },
  stepContainer: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 10,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  stepDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
    marginBottom: 15,
  },
  permissionButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
