import { Colors } from '@/constants/theme';
import type { SleepQuality } from '@/types/day-log';

export const SLEEP_QUALITIES: SleepQuality[] = ['excellent', 'good', 'fair', 'poor', 'terrible'];

export const SLEEP_QUALITY_COLORS: Record<SleepQuality, keyof typeof Colors> = {
  excellent: 'blush',
  good: 'powderBlue',
  fair: 'lilac',
  poor: 'blushAlt',
  terrible: 'surfaceElevated',
};
