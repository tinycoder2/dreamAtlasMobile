import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getAllDreams } from '@/services/db';

export async function exportDreamsAsJson(db: SQLiteDatabase): Promise<void> {
  const dreams = await getAllDreams(db);
  const json = JSON.stringify(dreams, null, 2);
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
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
  }
}
