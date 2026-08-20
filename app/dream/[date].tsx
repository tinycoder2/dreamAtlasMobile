import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';

import { DayLogCard } from '@/components/day-log-card';
import { DreamPreviewCard } from '@/components/dream-preview-card';
import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { useDayLog } from '@/hooks/use-day-log';
import { useDreamsForDate } from '@/hooks/use-dreams';
import type { Dream } from '@/types/dream';

export default function DreamDayListScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { dreams, remove, reorder } = useDreamsForDate(date);
  const { dayLog, save: saveDayLog } = useDayLog(date);

  function renderItem({ item, getIndex, drag, isActive }: RenderItemParams<Dream>) {
    return (
      <View style={styles.row}>
        <DreamPreviewCard
          dream={item}
          index={(getIndex() ?? 0) + 1}
          isActive={isActive}
          onPress={() => router.push(`/dream/entry/${item.id}?date=${date}`)}
          onDelete={() => remove(item.id)}
          onDrag={drag}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Starfield />
      <View style={styles.header}>
        <ThemedText type="subtitle">{date}</ThemedText>
      </View>

      <View style={styles.dayLogWrap}>
        <DayLogCard dayLog={dayLog} onSave={saveDayLog} />
      </View>

      {dreams.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText color="textMuted">No dreams logged yet.</ThemedText>
        </View>
      ) : (
        <DraggableFlatList
          data={dreams}
          keyExtractor={(dream) => String(dream.id)}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
          onDragEnd={({ data }) => reorder(data.map((d) => d.id))}
        />
      )}

      <Pressable
        accessibilityLabel="Add dream"
        style={styles.addButton}
        onPress={() => router.push(`/dream/entry/new?date=${date}`)}>
        <Feather name="plus" size={24} color={Colors.background} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dayLogWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  row: {
    marginBottom: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: Colors.lilac,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
