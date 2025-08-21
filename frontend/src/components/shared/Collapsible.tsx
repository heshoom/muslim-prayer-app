import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/src/components/shared/ThemedText';
import { ThemedView } from '@/src/components/shared/ThemedView';
import { IconSymbol } from '@/src/components/shared/IconSymbol';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/utils/useColorScheme';

//Hello, this is a collapsible component that can be used to show or hide content based on user interaction.
//It uses a chevron icon to indicate whether the content is expanded or collapsed.
// It is styled to fit both light and dark themes.
// The component accepts children to render inside the collapsible area and a title for the header.    
export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
