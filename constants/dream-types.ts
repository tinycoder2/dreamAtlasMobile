import { Colors } from '@/constants/theme';
import type { DreamType } from '@/types/dream';

export const DREAM_TYPES: DreamType[] = ['normal', 'lucid', 'nightmare', 'recurring', 'vivid'];

export const DREAM_TYPE_COLORS: Record<DreamType, keyof typeof Colors> = {
  normal: 'surfaceElevated',
  lucid: 'powderBlue',
  nightmare: 'blushAlt',
  recurring: 'lilac',
  vivid: 'blush',
};
