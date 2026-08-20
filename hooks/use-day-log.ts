import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getDayLog, upsertDayLog } from '@/services/db';
import type { DayLog, DayLogDraft } from '@/types/day-log';

export function useDayLog(date: string) {
  const db = useSQLiteContext();
  const [dayLog, setDayLog] = useState<DayLog | null>(null);

  const refresh = useCallback(async () => {
    setDayLog(await getDayLog(db, date));
  }, [db, date]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const save = useCallback(
    async (draft: Omit<DayLogDraft, 'date'>) => {
      await upsertDayLog(db, { date, ...draft });
      await refresh();
    },
    [db, date, refresh]
  );

  return { dayLog, save };
}
