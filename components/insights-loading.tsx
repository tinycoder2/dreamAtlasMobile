import { Feather } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

export function InsightsLoading() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.65);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, {
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.65, {
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
  }, []);

  const compassStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.compass, compassStyle]}>
        <Feather
          name="compass"
          size={48}
          color={Colors.lilac}
        />
      </Animated.View>

      <Animated.Text style={[styles.text, { opacity }]}>
        Reading your dreams...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },

  compass: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: Colors.textMuted,
    fontSize: 15,
  },
});