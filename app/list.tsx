import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { DreamPreviewCard } from '@/components/dream-preview-card';
import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { MOODS } from '@/constants/moods';
import { DREAM_TYPES } from '@/constants/dream-types';
import { deleteDream, getRecentTags, searchDreams } from '@/services/db';
import type { Dream, DreamType, Mood } from '@/types/dream';

export default function ListScreen() {
  const db = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [dreamType, setDreamType] = useState<DreamType | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setDreams(
      await searchDreams(db, { text: query || undefined, mood, dreamType, tag: tag ?? undefined })
    );
  }, [db, query, mood, dreamType, tag]);

  useEffect(() => {
    getRecentTags(db, 20).then(setAvailableTags);
  }, [db]);

  useEffect(() => {
    const timeout = setTimeout(refresh, 250);
    return () => clearTimeout(timeout);
  }, [refresh]);

  async function onDelete(id: number) {
    await deleteDream(db, id);
    refresh();
  }

  return (
    <View style={styles.root}>
      <Starfield />
      <View style={styles.searchRow}>
        <Feather name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search dreams..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <View style={styles.chipRow}>
        {MOODS.map((m) => (
          <Pressable
            key={m}
            onPress={() => setMood(mood === m ? null : m)}
            style={[styles.chip, mood === m && styles.chipActive]}>
            <ThemedText color={mood === m ? 'background' : 'text'}>{m}</ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.chipRow}>
        {DREAM_TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setDreamType(dreamType === t ? null : t)}
            style={[styles.chip, dreamType === t && styles.chipActive]}>
            <ThemedText color={dreamType === t ? 'background' : 'text'}>{t}</ThemedText>
          </Pressable>
        ))}
      </View>

      {availableTags.length > 0 && (
        <View style={styles.chipRow}>
          {availableTags.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTag(tag === t ? null : t)}
              style={[styles.chip, tag === t && styles.chipActive]}>
              <ThemedText color={tag === t ? 'background' : 'text'}>{t}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      {dreams.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText color="textMuted">No dreams match.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={dreams}
          keyExtractor={(dream) => String(dream.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DreamPreviewCard
              dream={item}
              showDate
              onPress={() => router.push(`/dream/entry/${item.id}?date=${item.date}`)}
              onDelete={() => onDelete(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
  },
  chip: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: Colors.lilac,
    borderColor: Colors.lilac,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
