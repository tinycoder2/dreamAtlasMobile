export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';

export interface DayLog {
  date: string; // 'YYYY-MM-DD' — one log per date
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  createdAt: string;
  updatedAt: string;
}

export type DayLogDraft = Omit<DayLog, 'createdAt' | 'updatedAt'>;
