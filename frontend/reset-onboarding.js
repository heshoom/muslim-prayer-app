#!/usr/bin/env node

/**
 * Debugging script to reset onboarding state for testing
 * Run with: node reset-onboarding.js
 */

const fs = require('fs');
const path = require('path');

// For iOS Simulator
const simulatorPath = path.join(
  process.env.HOME,
  'Library/Developer/CoreSimulator/Devices'
);

// For Android Emulator  
const androidPath = path.join(
  process.env.HOME,
  '.android/avd'
);

function clearAsyncStorage() {
  console.log('🔄 Clearing AsyncStorage for onboarding reset...\n');
  
  // Instructions for manual clearing
  console.log('📱 To fully test onboarding on a fresh install:');
  console.log('');
  console.log('iOS Simulator:');
  console.log('1. Device > Erase All Content and Settings');
  console.log('2. Or: Delete app and reinstall');
  console.log('');
  console.log('Android Emulator:');
  console.log('1. Long press app icon > App info > Storage > Clear Storage');
  console.log('2. Or: Uninstall and reinstall the app');
  console.log('');
  
  // Alternative: Clear specific AsyncStorage keys via Metro
  console.log('🛠️  Alternative: Run this in Metro debugger console:');
  console.log('');
  console.log('// Clear onboarding state');
  console.log('import AsyncStorage from "@react-native-async-storage/async-storage";');
  console.log('AsyncStorage.multiRemove(["userSettings", "app:lastBuildId"]);');
  console.log('');
  
  console.log('✅ After clearing, the app should show the onboarding screen again.');
}

// Check if we're in the right directory
if (!fs.existsSync('./app.json')) {
  console.error('❌ Please run this script from the frontend directory');
  process.exit(1);
}

clearAsyncStorage();
