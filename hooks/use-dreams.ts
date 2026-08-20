import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { api, USER_ID } from '@/services/api';
import type { Dream, DreamDraft } from '@/types/dream';

export function useDreamDates() {
  const [dates, setDates] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const result = await api.get<{
        date: string;
      }[]>(`/api/users/${USER_ID}/days`);

      setDates(result.map((day) => day.date));
    } catch (error) {
      console.error('Failed to load dream dates', error);
      setDates([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { dates, refresh };
}

export function useDreamsForDate(date: string) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const result = await api.get<Dream[]>(
        `/api/users/${USER_ID}/days/${date}/dreams`,
      );

      setDreams(result);
    } catch (error) {
      console.error('Failed to load dreams', error);
      setDreams([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const save = useCallback(
    async (id: string | null, draft: DreamDraft) => {
      if (id == null) {
        await api.post<Dream>(
          `/api/users/${USER_ID}/days/${date}/dreams`,
          draft,
        );
      } else {
        await api.put<Dream>(
          `/api/users/${USER_ID}/days/${date}/dreams/${id}`,
          draft,
        );
      }

      await refresh();
    },
    [date, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await api.delete(
        `/api/users/${USER_ID}/days/${date}/dreams/${id}`,
      );

      await refresh();
    },
    [date, refresh],
  );

  return {
    dreams,
    loading,
    refresh,
    save,
    remove,
  };
}

export function useRecentTags() {
  return [];
}