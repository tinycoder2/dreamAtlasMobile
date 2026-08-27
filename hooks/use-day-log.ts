import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import type { DayLog, DayLogDraft } from '@/types/day-log';

export function useDayLog(date: string) {
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      if (!user) {
        console.error('No authenticated user');
        return;
      }
      const result = await api.get<DayLog>(
        `/api/users/${user.uid}/days/${date}`,
      );

      setDayLog(result);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('API 404')) {
        setDayLog(null);
      } else {
        console.error('Failed to load day log', error);
        setDayLog(null);
      }
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
    async (draft: Omit<DayLogDraft, 'date'>) => {
      if (!user) {
        console.error('No authenticated user');
        return;
      }
      const result = await api.put<DayLog>(
        `/api/users/${user.uid}/days/${date}`,
        {
          date,
          ...draft,
        },
      );

      setDayLog(result);
    },
    [date],
  );

  return {
    dayLog,
    loading,
    save,
    refresh,
  };
}