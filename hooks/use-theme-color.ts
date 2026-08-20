import { Colors } from '@/constants/theme';

export function useThemeColor(colorName: keyof typeof Colors) {
  return Colors[colorName];
}
