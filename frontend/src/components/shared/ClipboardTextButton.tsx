import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Share } from 'react-native';
import { ThemedText } from './ThemedText';

// Avoid importing expo-clipboard at module evaluation time because in some
// environments (Expo Go / certain dev clients) the native module may not be
// available and will crash on import with "Cannot find native module 'ExpoClipboard'".
// Instead, dynamically import it inside the handler and gracefully fall back.
export const ClipboardTextButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      // dynamic import so bundler doesn't try to resolve native module at load
      const clipboard = await import('expo-clipboard');
      if (clipboard && typeof clipboard.setStringAsync === 'function') {
        await clipboard.setStringAsync(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
      }
    } catch (e) {
      // If expo-clipboard isn't available, fall through to fallback below
    }

    // Fallback: open share sheet as a way for user to copy/save the text.
    try {
      await Share.share({ message: text });
    } catch (e) {
      // swallow errors; copy action failed
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onCopy}>
      <ThemedText style={styles.buttonText}>{copied ? 'Copied' : 'Copy'}</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'transparent' },
  buttonText: { fontSize: 14, fontWeight: '600' },
});
