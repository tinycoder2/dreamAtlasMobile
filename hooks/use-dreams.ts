import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { Dream, DreamDraft } from '@/types/dream';

export function useDreamDates() {
  const [dates, setDates] = useState<string[]>([]);
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    try {
      if (!user) {
        console.error('No authenticated user');
        return;
      }
      const result = await api.get<{
        date: string;
      }[]>(`/api/users/${user.uid}/days`);

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
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const result = await api.get<Dream[]>(
        `/api/users/${user.uid}/days/${date}/dreams`,
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
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      if (id == null) {
        await api.post<Dream>(
          `/api/users/${user.uid}/days/${date}/dreams`,
          draft,
        );
      } else {
        await api.put<Dream>(
          `/api/users/${user.uid}/days/${date}/dreams/${id}`,
          draft,
        );
      }

      await refresh();
    },
    [date, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!user) {
        console.error('No authenticated user');
        return;
      }

      await api.delete(
        `/api/users/${user.uid}/days/${date}/dreams/${id}`,
      );

      await refresh();
    },
    [date, refresh],
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      try {
        if (!user) {
          console.error('No authenticated user');
          return;
        }

        await api.put(

          `/api/users/${user.uid}/days/${date}/dreams/order`,
          { orderedIds },
        );

        await refresh();
      } catch (error) {
        console.error('Failed to reorder dreams', error);
        throw error;
      }
    },
    [date, refresh],
  );


  return {
    dreams,
    loading,
    refresh,
    save,
    remove,
    reorder,
  };
}

export function useRecentTags() {
  const [tags, setTags] = useState<string[]>([]);
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function loadTags() {
        try {
          if (!user) {
            console.error('No authenticated user');
            return;
          }

          const result = await api.get<string[]>(
            `/api/users/${user.uid}/dreams/tags/recent`,
          );

          if (!cancelled) {
            setTags(result);
          }
        } catch (error) {
          console.error('Failed to load recent tags', error);

          if (!cancelled) {
            setTags([]);
          }
        }
      }

      loadTags();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  return tags;
}

