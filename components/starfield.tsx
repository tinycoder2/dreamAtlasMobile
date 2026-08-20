import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface StarConfig {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  minOpacity: number;
  maxOpacity: number;
  twinkleDuration: number;
  driftDuration: number;
  driftDistance: number;
  delay: number;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeStars(count: number): StarConfig[] {
  return Array.from({ length: count }, () => ({
    left: `${randomBetween(0, 100)}%`,
    top: `${randomBetween(0, 100)}%`,
    size: randomBetween(1.5, 3),
    minOpacity: randomBetween(0.15, 0.35),
    maxOpacity: randomBetween(0.6, 1),
    twinkleDuration: randomBetween(1800, 4200),
    driftDuration: randomBetween(7000, 16000),
    driftDistance: randomBetween(6, 18),
    delay: randomBetween(0, 3000),
  }));
}

function Star({ config }: { config: StarConfig }) {
  const opacity = useSharedValue(config.minOpacity);
  const drift = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(config.maxOpacity, { duration: config.twinkleDuration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    drift.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(config.driftDistance, { duration: config.driftDuration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: -drift.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: config.left,
          top: config.top,
          width: config.size,
          height: config.size,
          borderRadius: config.size,
        },
        animatedStyle,
      ]}
    />
  );
}

export function Starfield({ count = 60 }: { count?: number }) {
  const stars = useMemo(() => makeStars(count), [count]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star, index) => (
        <Star key={index} config={star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: '#FBF7FF',
  },
});
