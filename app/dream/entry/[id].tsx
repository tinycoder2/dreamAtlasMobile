import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { Starfield } from '@/components/starfield';
import { TagInput } from '@/components/tag-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
import { MOODS, MOOD_COLORS } from '@/constants/moods';
import { DREAM_TYPES, DREAM_TYPE_COLORS } from '@/constants/dream-types';
import { useDreamsForDate, useRecentTags } from '@/hooks/use-dreams';
import type { DreamType, Mood } from '@/types/dream';
import { confirmDestructive } from '@/utils/confirm';

export default function DreamEntryScreen() {
  const { id, date } = useLocalSearchParams<{ id: string; date: string }>();
  const { dreams, save, remove } = useDreamsForDate(date);
  const recentTags = useRecentTags();

  const isNew = id === 'new';
  const dream = isNew ? null : dreams.find((d) => String(d.id) === id) ?? null;

  const [mode, setMode] = useState<'view' | 'edit'>(isNew ? 'edit' : 'view');
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [dreamType, setDreamType] = useState<DreamType | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (dream) {
      setText(dream.text);
      setMood(dream.mood);
      setDreamType(dream.dreamType);
      setTags(dream.tags);
    }
  }, [dream]);

  async function onSave() {
    await save(isNew ? null : Number(id), {
      date,
      text,
      mood,
      dreamType,
      tags,
    });
    router.back();
  }

  function onCancelEdit() {
    if (dream) {
      setText(dream.text);
      setMood(dream.mood);
      setDreamType(dream.dreamType);
      setTags(dream.tags);
      setMode('view');
    } else {
      router.back();
    }
  }

  async function onDelete() {
    if (!dream) return;
    const confirmed = await confirmDestructive('Delete dream?', 'This cannot be undone.');
    if (confirmed) {
      await remove(dream.id);
      router.back();
    }
  }

  return (
    <View style={styles.root}>
      <Starfield />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ThemedView color="background" style={styles.container}>
          <View style={styles.topRow}>
            <ThemedText type="subtitle">{date}</ThemedText>
            {mode === 'view' && dream && (
              <View style={styles.iconRow}>
                <Pressable accessibilityLabel="Edit dream" onPress={() => setMode('edit')}>
                  <Feather name="edit-2" size={20} color={Colors.textSecondary} />
                </Pressable>
                <Pressable accessibilityLabel="Delete dream" onPress={onDelete}>
                  <Feather name="trash-2" size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>
            )}
            {mode === 'edit' && !isNew && (
              <Pressable accessibilityLabel="Cancel edit" onPress={onCancelEdit}>
                <Feather name="x" size={20} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {mode === 'view' && dream ? (
            <>
              <View style={styles.chipRow}>
                {dream.mood && (
                  <View style={[styles.moodChip, { backgroundColor: Colors[MOOD_COLORS[dream.mood]] }]}>
                    <ThemedText color="background">{dream.mood}</ThemedText>
                  </View>
                )}
                {dream.dreamType && (
                  <View
                    style={[
                      styles.moodChip,
                      { backgroundColor: Colors[DREAM_TYPE_COLORS[dream.dreamType]] },
                    ]}>
                    <ThemedText color="background">{dream.dreamType}</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={styles.viewText}>{dream.text || 'No description'}</ThemedText>
              {dream.tags.length > 0 && (
                <View style={styles.chipRow}>
                  {dream.tags.map((tag) => (
                    <View key={tag} style={styles.chip}>
                      <ThemedText>{tag}</ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.labelRow}>
                <Feather name="feather" size={16} color={Colors.textSecondary} />
                <ThemedText color="textSecondary" style={styles.label}>
                  Tonight&rsquo;s dream
                </ThemedText>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={text}
                onChangeText={setText}
                placeholder="Whisper what you remember..."
                placeholderTextColor={Colors.textMuted}
                multiline
              />

              <View style={styles.labelRow}>
                <Feather name="cloud" size={16} color={Colors.textSecondary} />
                <ThemedText color="textSecondary" style={styles.label}>
                  Mood
                </ThemedText>
              </View>
              <View style={styles.chipRow}>
                {MOODS.map((m) => (
                  <Pressable
                    key={m}
                    onPress={() => setMood(mood === m ? null : m)}
                    style={[
                      styles.chip,
                      mood === m && { backgroundColor: Colors.lilac, borderColor: Colors.lilac },
                    ]}>
                    <ThemedText color={mood === m ? 'background' : 'text'}>{m}</ThemedText>
                  </Pressable>
                ))}
              </View>

              <View style={styles.labelRow}>
                <Feather name="tag" size={16} color={Colors.textSecondary} />
                <ThemedText color="textSecondary" style={styles.label}>
                  Type of dream
                </ThemedText>
              </View>
              <View style={styles.chipRow}>
                {DREAM_TYPES.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setDreamType(dreamType === t ? null : t)}
                    style={[
                      styles.chip,
                      dreamType === t && {
                        backgroundColor: Colors[DREAM_TYPE_COLORS[t]],
                        borderColor: Colors[DREAM_TYPE_COLORS[t]],
                      },
                    ]}>
                    <ThemedText color={dreamType === t ? 'background' : 'text'}>{t}</ThemedText>
                  </Pressable>
                ))}
              </View>

              <View style={styles.labelRow}>
                <Feather name="anchor" size={16} color={Colors.textSecondary} />
                <ThemedText color="textSecondary" style={styles.label}>
                  Tags
                </ThemedText>
              </View>
              <TagInput tags={tags} onChange={setTags} recentTags={recentTags} />

              <Pressable style={styles.saveButton} onPress={onSave}>
                <ThemedText color="background" style={styles.saveButtonText}>
                  Save dream
                </ThemedText>
              </Pressable>
            </>
          )}
        </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 4,
    backgroundColor: 'transparent',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 16,
  },
  viewText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  moodChip: {
    borderRadius: Radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: Colors.lilac,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: '600',
  },
});
