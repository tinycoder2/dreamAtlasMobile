import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { api, USER_ID } from '@/services/api';

type DaySummary = {
  date: string;
  sleepHours: number | null;
  sleepQuality: string | null;
};

type DayDetails = {
  date: string;
  sleep: {
    sleepHours: number | null;
    sleepQuality: string | null;
  };
  dreams: unknown[];
};

export async function exportDreamsAsJson(): Promise<void> {
  // Get all days
  const days = await api.get<DaySummary[]>(
    `/api/users/${USER_ID}/days?from=2000-01-01&to=2099-12-31`,
  );

  // Get sleep + dreams for every day
  const details = await Promise.all(
    days.map((day) =>
      api.get<DayDetails>(
        `/api/users/${USER_ID}/days/${day.date}/details`,
      ),
    ),
  );

  const json = JSON.stringify(details, null, 2);
  const filename = `dream-atlas-export-${Date.now()}.json`;

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, filename);
  file.write(json);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      UTI: 'public.json',
    });
  }
}