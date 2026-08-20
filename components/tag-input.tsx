import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';

export function TagInput({
  tags,
  onChange,
  recentTags,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  recentTags: string[];
}) {
  const [draft, setDraft] = useState('');

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setDraft('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  const suggestions = recentTags.filter((tag) => !tags.includes(tag));

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => addTag(draft)}
          placeholder="Add a tag..."
          placeholderTextColor={Colors.textMuted}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={() => addTag(draft)}>
          <Feather name="plus" size={18} color={Colors.background} />
        </Pressable>
      </View>

      {tags.length > 0 && (
        <View style={styles.chipRow}>
          {tags.map((tag) => (
            <Pressable key={tag} style={styles.activeChip} onPress={() => removeTag(tag)}>
              <ThemedText color="background" style={styles.chipText}>
                {tag}
              </ThemedText>
              <Feather name="x" size={12} color={Colors.background} />
            </Pressable>
          ))}
        </View>
      )}

      {suggestions.length > 0 && (
        <>
          <ThemedText color="textMuted" style={styles.recentLabel}>
            Recent
          </ThemedText>
          <View style={styles.chipRow}>
            {suggestions.map((tag) => (
              <Pressable key={tag} style={styles.chip} onPress={() => addTag(tag)}>
                <ThemedText color="text" style={styles.chipText}>
                  {tag}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.lilac,
    borderRadius: Radius.md,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lilac,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipText: {
    fontSize: 14,
  },
  recentLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
