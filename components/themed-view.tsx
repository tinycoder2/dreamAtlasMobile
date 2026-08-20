import { View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  color?: keyof typeof Colors;
};

export function ThemedView({ style, color = 'background', ...otherProps }: ThemedViewProps) {
  return <View style={[{ backgroundColor: Colors[color] }, style]} {...otherProps} />;
}
