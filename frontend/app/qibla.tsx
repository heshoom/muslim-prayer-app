import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { QiblaCompass } from '@/src/components/shared/QiblaCompass';
import { ThemedView } from '@/src/components/shared/ThemedView';

export default function QiblaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <QiblaCompass />
      </ThemedView>
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
  },
});
