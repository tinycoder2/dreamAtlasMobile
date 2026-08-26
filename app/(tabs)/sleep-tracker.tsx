import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SleepTrackerScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sleep Tracker</ThemedText>
      <ThemedText color="textMuted">
        Coming soon
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});