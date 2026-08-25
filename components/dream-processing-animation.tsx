import { useEffect, useState } from 'react';
import {
    Image,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

const WAND = require('@/assets/images/dream-wand.png');
const STAR = require('@/assets/images/dream-star.png');

interface DreamProcessingAnimationProps {
    processing: boolean;
}

export function DreamProcessingAnimation({
    processing,
}: DreamProcessingAnimationProps) {

    const message = processing
        ? 'charting your dreams...'
        : 'go on, ramble away...';

    const [displayedText, setDisplayedText] = useState('');

    const wandX = useSharedValue(0);
    const wandY = useSharedValue(0);
    const wandRotation = useSharedValue(0);

    const { width, height } = useWindowDimensions();

    const screenWidth = useSharedValue(width);
    const screenHeight = useSharedValue(height);

    useEffect(() => {
        setDisplayedText('');

        let index = 0;

        const interval = setInterval(() => {
            index += 1;

            setDisplayedText(message.slice(0, index));

            if (index >= message.length) {
                clearInterval(interval);
            }
        }, 70);

        return () => clearInterval(interval);
    }, [message]);

    useEffect(() => {
        screenWidth.value = width;
        screenHeight.value = height;
    }, [width, height]);

    useEffect(() => {
        // Wander horizontally across the sky.
        wandX.value = withRepeat(
            withSequence(
                withTiming(-110, {
                    duration: 2800,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(100, {
                    duration: 5000,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(30, {
                    duration: 2600,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(0, {
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                }),
            ),
            -1,
            false,
        );

        // Move up and down independently.
        wandY.value = withRepeat(
            withSequence(
                withTiming(-70, {
                    duration: 3200,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(45, {
                    duration: 4200,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(-20, {
                    duration: 2600,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(0, {
                    duration: 2800,
                    easing: Easing.inOut(Easing.sin),
                }),
            ),
            -1,
            false,
        );

        // Rotate slightly as the wand searches.
        wandRotation.value = withRepeat(
            withSequence(
                withTiming(-18, {
                    duration: 2800,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(14, {
                    duration: 5000,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(-8, {
                    duration: 2600,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(0, {
                    duration: 3000,
                    easing: Easing.inOut(Easing.sin),
                }),
            ),
            -1,
            false,
        );
    }, []);

    const wandStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: wandX.value },
            { translateY: wandY.value },
            { rotate: `${wandRotation.value}deg` },
        ],
    }));

    return (
        <View style={styles.container}>
            <Starfield
                count={45}
                wandX={wandX}
                wandY={wandY}
                screenWidth={screenWidth}
                screenHeight={screenHeight}
            />

            {/* Larger dream stars */}
            <Image
                source={STAR}
                style={[styles.dreamStar, styles.starOne]}
            />

            <Image
                source={STAR}
                style={[styles.dreamStar, styles.starTwo]}
            />

            <Image
                source={STAR}
                style={[styles.dreamStar, styles.starThree]}
            />

            {/* Wand */}
            <Animated.View style={[styles.wandContainer, wandStyle]}>
                <Image source={WAND} style={styles.wand} />
            </Animated.View>

            {/* Status */}
            <View style={styles.message}>
                <ThemedText type="subtitle">
                    {displayedText}
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    wandContainer: {
        position: 'absolute',
        bottom: 270,
        alignItems: 'center',
        justifyContent: 'center',
    },

    message: {
        position: 'absolute',
        bottom: 150,
        alignItems: 'center',
        gap: 6,
    },

    wand: {
        width: 55,
        height: 55,
        resizeMode: 'contain',
    },

    dreamStar: {
        position: 'absolute',
        width: 18,
        height: 18,
        resizeMode: 'contain',
    },

    starOne: {
        top: '18%',
        left: '24%',
    },

    starTwo: {
        top: '28%',
        right: '20%',
    },

    starThree: {
        top: '38%',
        left: '58%',
    },


});