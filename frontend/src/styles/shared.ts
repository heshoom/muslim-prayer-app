import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gap8: {
    gap: 8,
  },
  gap16: {
    gap: 16,
  },
  padding32: {
    padding: 32,
  }
});
