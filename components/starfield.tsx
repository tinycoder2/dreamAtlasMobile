import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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

const reactionRadius = 120;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeStars(count: number): StarConfig[] {
  return Array.from({ length: count }, () => ({
    left: `${randomBetween(0, 100)}%`,
    top: `${randomBetween(0, 100)}%`,
    size: randomBetween(1, 2.2),
    minOpacity: randomBetween(0.15, 0.35),
    maxOpacity: randomBetween(0.6, 1),
    twinkleDuration: randomBetween(1800, 4200),
    driftDuration: randomBetween(7000, 16000),
    driftDistance: randomBetween(6, 18),
    delay: randomBetween(0, 3000),
  }));
}

function Star({
  config,
  wandX,
  wandY,
  screenWidth,
  screenHeight,
}: {
  config: StarConfig;
  wandX?: Animated.SharedValue<number>;
  wandY?: Animated.SharedValue<number>;
  screenWidth: number;
  screenHeight: number;
}) {
  const opacity = useSharedValue(config.minOpacity);
  const drift = useSharedValue(0);

  const starX =
    (parseFloat(config.left) / 100) * screenWidth;

  const starY =
    (parseFloat(config.top) / 100) * screenHeight;

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(config.maxOpacity, {
          duration: config.twinkleDuration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    drift.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(config.driftDistance, {
          duration: config.driftDuration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    let reactionScale = 1;
    let reactionOpacity = 1;

    if (wandX && wandY) {
      const wandScreenX =
        screenWidth / 2 + wandX.value;

      const wandScreenY =
        screenHeight - 190 + wandY.value;

      const dx = starX - wandScreenX;
      const dy = starY - wandScreenY;

      const distance = Math.sqrt(
        dx * dx + dy * dy,
      );

      if (distance < reactionRadius) {
        const strength =
          1 - distance / reactionRadius;

        reactionScale = 1 + strength * 2;
        reactionOpacity = 1 + strength * 0.5;
      }
    }

    return {
      opacity: Math.min(
        opacity.value * reactionOpacity,
        1,
      ),

      transform: [
        { translateY: -drift.value },
        { scale: reactionScale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: config.left,
          top: config.top,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.starText,
          {
            fontSize: config.size * 4,
          },
        ]}
      >
        ✦
      </Text>
    </Animated.View>
  );
}

export function Starfield({
  count = 60,
  wandX,
  wandY,
}: {
  count?: number;
  wandX?: Animated.SharedValue<number>;
  wandY?: Animated.SharedValue<number>;
}) {
  const { width, height } = useWindowDimensions();

  const stars = useMemo(
    () => makeStars(count),
    [count],
  );

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {stars.map((star, index) => (
        <Star
          key={index}
          config={star}
          wandX={wandX}
          wandY={wandY}
          screenWidth={width}
          screenHeight={height}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  starText: {
    color: '#FBF7FF',
    includeFontPadding: false,
  },
});