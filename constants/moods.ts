import { Colors } from '@/constants/theme';
import type { Mood } from '@/types/dream';

export const MOODS: Mood[] = ['great', 'good', 'neutral', 'bad', 'nightmare'];

export const MOOD_COLORS: Record<Mood, keyof typeof Colors> = {
  great: 'blush',
  good: 'powderBlue',
  neutral: 'lilac',
  bad: 'blushAlt',
  nightmare: 'surfaceElevated',
};
