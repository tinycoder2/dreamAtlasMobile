import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { SLEEP_QUALITIES, SLEEP_QUALITY_COLORS } from '@/constants/sleep-quality';
import type { DayLog } from '@/types/day-log';

export function DayLogCard({
  dayLog,
  onSave,
}: {
  dayLog: DayLog | null;
  onSave: (draft: { sleepHours: number | null; sleepQuality: DayLog['sleepQuality'] }) => void;
}) {
  const [hours, setHours] = useState('');

  useEffect(() => {
    setHours(dayLog?.sleepHours != null ? String(dayLog.sleepHours) : '');
  }, [dayLog?.sleepHours]);

  function commitHours() {
    onSave({
      sleepHours: hours ? Number(hours) : null,
      sleepQuality: dayLog?.sleepQuality ?? null,
    });
  }

  function setQuality(quality: DayLog['sleepQuality']) {
    onSave({
      sleepHours: hours ? Number(hours) : null,
      sleepQuality: dayLog?.sleepQuality === quality ? null : quality,
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Feather name="moon" size={16} color={Colors.textSecondary} />
        <ThemedText color="textSecondary" style={styles.label}>
          How did you sleep tonight?
        </ThemedText>
      </View>
      <TextInput
        style={styles.input}
        value={hours}
        onChangeText={setHours}
        onBlur={commitHours}
        placeholder="Hours of sleep"
        placeholderTextColor={Colors.textMuted}
        keyboardType="decimal-pad"
      />
      <View style={styles.chipRow}>
        {SLEEP_QUALITIES.map((quality) => {
          const active = dayLog?.sleepQuality === quality;
          return (
            <Pressable
              key={quality}
              onPress={() => setQuality(quality)}
              style={[
                styles.chip,
                active && { backgroundColor: Colors[SLEEP_QUALITY_COLORS[quality]], borderColor: Colors[SLEEP_QUALITY_COLORS[quality]] },
              ]}>
              <ThemedText color={active ? 'background' : 'text'}>{quality}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
