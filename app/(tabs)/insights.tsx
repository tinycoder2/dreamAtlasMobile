import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function InsightsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Insights</ThemedText>
      <ThemedText color="textMuted">
        Weekly dream insights coming soon
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