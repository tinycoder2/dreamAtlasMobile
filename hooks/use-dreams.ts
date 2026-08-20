import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import {
  createDream,
  deleteDream,
  getDreamDates,
  getDreamsByDate,
  getRecentTags,
  reorderDreams,
  updateDream,
} from '@/services/db';
import type { Dream, DreamDraft } from '@/types/dream';

export function useDreamDates() {
  const db = useSQLiteContext();
  const [dates, setDates] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    setDates(await getDreamDates(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { dates, refresh };
}

export function useDreamsForDate(date: string) {
  const db = useSQLiteContext();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setDreams(await getDreamsByDate(db, date));
    setLoading(false);
  }, [db, date]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const save = useCallback(
    async (id: number | null, draft: DreamDraft) => {
      if (id == null) {
        await createDream(db, draft);
      } else {
        await updateDream(db, id, draft);
      }
      await refresh();
    },
    [db, refresh]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteDream(db, id);
      await refresh();
    },
    [db, refresh]
  );

  const reorder = useCallback(
    async (orderedIds: number[]) => {
      // Optimistic: reflect the new order immediately, then persist.
      setDreams((prev) =>
        orderedIds
          .map((id) => prev.find((d) => d.id === id))
          .filter((d): d is Dream => d != null)
      );
      await reorderDreams(db, orderedIds);
      await refresh();
    },
    [db, refresh]
  );

  return { dreams, loading, refresh, save, remove, reorder };
}

export function useRecentTags() {
  const db = useSQLiteContext();
  const [tags, setTags] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRecentTags(db).then(setTags);
    }, [db])
  );

  return tags;
}
