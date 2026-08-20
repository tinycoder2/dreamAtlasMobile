/**
 * Dream Journal's single fixed theme — a pastel dreamy universe, not
 * adapted to system light/dark mode.
 */

import { Platform } from 'react-native';

export const Colors = {
  background: '#2E2A47',
  surface: '#3B3660',
  surfaceElevated: '#443D70',

  text: '#FBF7FF',
  textSecondary: '#C9BCE8',
  textMuted: '#8A82AE',

  lilac: '#D9C4F0',
  blush: '#FFD9EC',
  blushAlt: '#F4C7DC',
  powderBlue: '#C9E4FF',

  border: 'rgba(255, 255, 255, 0.08)',
};

export const Radius = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 999,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
