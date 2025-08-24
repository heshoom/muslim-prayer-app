import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Share, Clipboard } from 'react-native';
import { ThemedText } from './ThemedText';

export const ClipboardTextButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      // Use React Native's built-in Clipboard API
      await Clipboard.setString(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return;
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
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
