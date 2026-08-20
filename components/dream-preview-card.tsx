import { Feather } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { DREAM_TYPE_COLORS } from '@/constants/dream-types';
import { MOOD_COLORS } from '@/constants/moods';
import type { Dream } from '@/types/dream';
import { confirmDestructive } from '@/utils/confirm';

export function DreamPreviewCard({
  dream,
  index,
  showDate = false,
  isActive = false,
  onPress,
  onDelete,
  onDrag,
}: {
  dream: Dream;
  index?: number;
  showDate?: boolean;
  isActive?: boolean;
  onPress: () => void;
  onDelete: () => void;
  onDrag?: () => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  async function confirmDelete() {
    const confirmed = await confirmDestructive('Delete dream?', 'This cannot be undone.');
    if (confirmed) {
      onDelete();
    } else {
      swipeableRef.current?.close();
    }
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <Pressable accessibilityLabel="Delete dream from list" style={styles.deleteAction} onPress={confirmDelete}>
          <Feather name="trash-2" size={18} color={Colors.background} />
        </Pressable>
      )}
      overshootRight={false}>
      <Pressable
        style={[styles.card, isActive && styles.cardActive]}
        onPress={onPress}
        onLongPress={onDrag}>
        <View style={styles.headerRow}>
          {index != null && (
            <ThemedText color="textMuted" style={styles.index}>
              #{index}
            </ThemedText>
          )}
          {showDate && <ThemedText color="textMuted" style={styles.date}>{dream.date}</ThemedText>}
          {dream.mood && (
            <View style={[styles.chip, { backgroundColor: Colors[MOOD_COLORS[dream.mood]] }]}>
              <ThemedText color="background" style={styles.chipText}>
                {dream.mood}
              </ThemedText>
            </View>
          )}
          {dream.dreamType && (
            <View
              style={[styles.chip, { backgroundColor: Colors[DREAM_TYPE_COLORS[dream.dreamType]] }]}>
              <ThemedText color="background" style={styles.chipText}>
                {dream.dreamType}
              </ThemedText>
            </View>
          )}
          {onDrag && (
            <Pressable accessibilityLabel="Drag to reorder" onLongPress={onDrag} style={styles.dragHandle}>
              <Feather name="menu" size={16} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
        <ThemedText numberOfLines={2} style={styles.text}>
          {dream.text || 'No description'}
        </ThemedText>
        {dream.tags.length > 0 && (
          <View style={styles.tagRow}>
            {dream.tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <ThemedText color="textSecondary" style={styles.tagText}>
                  {tag}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    gap: 8,
  },
  cardActive: {
    borderColor: Colors.lilac,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  index: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  chip: {
    borderRadius: Radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dragHandle: {
    marginLeft: 'auto',
    padding: 4,
  },
  text: {
    fontSize: 15,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
  },
  deleteAction: {
    backgroundColor: '#E0788A',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    borderRadius: Radius.md,
    marginLeft: 8,
  },
});
