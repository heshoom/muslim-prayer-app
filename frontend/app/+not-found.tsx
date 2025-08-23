import { Link, Stack } from 'expo-router';
import { useTranslation } from '@/src/i18n';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/src/components/shared/ThemedText';
import { ThemedView } from '@/src/components/shared/ThemedView';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('notFoundTitle') || 'Oops!' }} />
          <ThemedView style={styles.container}>
            <ThemedText type="title">{t('notFoundMessage') || 'This screen does not exist.'}</ThemedText>
            <Link href="/" style={styles.link}>
              <ThemedText type="link">{t('goHome') || 'Go to home screen!'}</ThemedText>
            </Link>
          </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
