import { DreamProcessingAnimation } from '@/components/dream-processing-animation';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import DraggableFlatList, { type RenderItemParams } from 'react-native-draggable-flatlist';

import { DayLogCard } from '@/components/day-log-card';
import { DreamPreviewCard } from '@/components/dream-preview-card';
import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useDayLog } from '@/hooks/use-day-log';
import { useDreamsForDate } from '@/hooks/use-dreams';
import { api } from '@/services/api';
import type { Dream } from '@/types/dream';
import { useState } from 'react';
import { Platform } from 'react-native';

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export default function DreamDayListScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const showDreamAnimation =
    recorderState.isRecording || processing;

  const startRecording = async () => {
    const { granted } =
      await AudioModule.requestRecordingPermissionsAsync();

    if (!granted) {
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    console.log('🎙️ stopRecording START');

    await recorder.stop();
    console.log('🎙️ recorder.stop() completed');

    const uri = recorder.uri;
    console.log('🎙️ recorder.uri:', uri);

    if (!uri) {
      console.error('❌ No recording URI');
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();

      console.log('🌐 Platform:', Platform.OS);

      if (Platform.OS === 'web') {
        console.log('🌐 Fetching recorded blob...');

        const response = await fetch(uri);

        console.log('🌐 Blob fetch response:', response.status, response.ok);

        const blob = await response.blob();

        console.log('🌐 Blob:', {
          size: blob.size,
          type: blob.type,
        });

        formData.append('audio', blob, 'dream-recording.webm');

        console.log('🌐 Audio appended to FormData');
      } else {
        formData.append('audio', {
          uri,
          name: 'dream-recording.m4a',
          type: 'audio/mp4',
        } as any);
      }

      if (!user) {
        console.error('❌ No authenticated user');
        return;
      }

      console.log('🚀 Sending AI request...');

      const createdDreams = await api.postMultipart<Dream[]>(
        `/api/users/${user.uid}/days/${date}/dreams/ai`,
        formData,
      );

      console.log('✅ AI created dreams:', createdDreams);

      await refresh();

      console.log('🔄 Refresh completed');
    } catch (error) {
      console.error('❌ Failed to process dream audio:', error);
    } finally {
      setProcessing(false);
      console.log('🎙️ stopRecording END');
    }
  };

  const { date } = useLocalSearchParams<{ date: string }>();
  const { dreams, remove, reorder, refresh } = useDreamsForDate(date);
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

      {showDreamAnimation && (
        <DreamProcessingAnimation processing={processing} />
      )}


      <View style={styles.actionButtons}>
        <Pressable
          accessibilityLabel={
            recorderState.isRecording
              ? 'Stop Gemini recording'
              : 'Record dream with Gemini'
          }
          disabled={processing}
          style={styles.geminiButton}
          onPress={
            recorderState.isRecording
              ? stopRecording
              : startRecording
          }
        >
          <Feather
            name={recorderState.isRecording ? 'square' : 'mic'}
            size={22}
            color={Colors.background}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Add dream"
          style={styles.addButton}
          onPress={() =>
            router.push(`/dream/entry/new?date=${date}`)
          }>
          <Feather
            name="plus"
            size={24}
            color={Colors.background}
          />
        </Pressable>


      </View>
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
  actionButtons: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  geminiButton: {
    backgroundColor: Colors.lilac,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButton: {
    backgroundColor: Colors.lilac,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
