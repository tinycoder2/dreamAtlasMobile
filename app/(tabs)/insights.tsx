import { InsightsLoading } from '@/components/insights-loading';
import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

type WeeklyTheme = {
    name: string;
    prominence: number;
};

type EmotionalPattern = {
    pattern: string;
    jungianConcept: string | null;
    interpretation: string;
};

type WeeklyInsightData = {
    weeklySummary: string;
    recurringThemeCount: number;
    emotionalPatternCount: number;
    themes: WeeklyTheme[];
    emotionalPatterns: EmotionalPattern[];
};

type WeeklyInsightResponse = {
    startDate: string;
    endDate: string;
    hasEnoughDreams: boolean;
    insights: WeeklyInsightData | null;
};

function getWeekStart(date = new Date()) {
    const result = new Date(date);
    const day = result.getDay();

    // Sunday = start of week
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);

    return result;
}

function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function formatWeekRange(start: Date) {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const startLabel = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const endLabel = end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    return `${startLabel} – ${endLabel}`;
}

export default function InsightsScreen() {
    const [weekStart, setWeekStart] = useState(() => getWeekStart());
    const [data, setData] = useState<WeeklyInsightResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const refreshRotation = useSharedValue(0);
    const currentWeekStart = getWeekStart();
    const isCurrentWeek =
        weekStart.getTime() === currentWeekStart.getTime();

    const refreshCompassStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${refreshRotation.value}deg` },
        ],
    }));


    async function loadInsights(start: Date) {
        try {
            setLoading(true);
            setError(null);

            if (!user) {
                throw new Error('User is not signed in');
            }

            const response = await api.get<WeeklyInsightResponse>(
                `/api/users/${user.uid}/insights/weekly?startDate=${formatDate(start)}`,
            );

            setData(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load weekly insights',
            );
        } finally {
            setLoading(false);
        }
    }

    async function refreshInsights() {
        if (!user) {
            return;
        }

        try {
            setRefreshing(true);
            setError(null);

            const response = await api.post<WeeklyInsightResponse>(
                `/api/users/${user.uid}/insights/weekly/refresh?startDate=${formatDate(weekStart)}`,
                {},
            );

            setData(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to refresh weekly insights',
            );
        } finally {
            setRefreshing(false);
        }
    }


    function changeWeek(amount: number) {
        const next = new Date(weekStart);
        next.setDate(next.getDate() + amount * 7);
        setWeekStart(next);
    }

    useEffect(() => {
        loadInsights(weekStart);
    }, [weekStart, user]);


    useEffect(() => {
        if (refreshing) {
            refreshRotation.value = withRepeat(
                withTiming(360, {
                    duration: 1000,
                    easing: Easing.linear,
                }),
                -1,
                false,
            );
        } else {
            refreshRotation.value = 0;
        }
    }, [refreshing]);



    return (
        <ThemedView style={styles.container}>
            <Starfield />

            <View style={styles.contentLayer}>

                <View style={styles.weekSelector}>
                    <Pressable
                        onPress={() => changeWeek(-1)}
                        style={styles.weekArrow}
                        hitSlop={8}>
                        <Feather
                            name="chevron-left"
                            size={20}
                            color={Colors.lilac}
                        />
                    </Pressable>

                    <View style={styles.weekInfo}>
                        <ThemedText
                            color="textMuted"
                            style={styles.weekCaption}>
                            WEEK OF
                        </ThemedText>

                        <ThemedText style={styles.weekLabel}>
                            {formatWeekRange(weekStart)}
                        </ThemedText>
                    </View>

                    <Pressable
                        onPress={() => changeWeek(1)}
                        disabled={isCurrentWeek}
                        style={[
                            styles.weekArrow,
                            isCurrentWeek && styles.weekArrowDisabled,
                        ]}
                        hitSlop={8}>
                        <Feather
                            name="chevron-right"
                            size={20}
                            color={isCurrentWeek ? Colors.textMuted : Colors.lilac}
                        />
                    </Pressable>
                </View>

                {loading ? (
                    <InsightsLoading />
                ) : error ? (
                    <View style={styles.center}>
                        <ThemedText color="textMuted">
                            {error}
                        </ThemedText>
                    </View>
                ) : !data?.hasEnoughDreams ? (
                    <View style={styles.center}>
                        <Feather
                            name="moon"
                            size={36}
                            color={Colors.lilac}
                        />

                        <ThemedText type="subtitle" style={styles.emptyTitle}>
                            Nothing to uncover yet
                        </ThemedText>

                        <ThemedText
                            color="textMuted"
                            style={styles.emptyText}>
                            Journal at least 3 dreams this week to uncover
                            recurring themes and emotional patterns.
                        </ThemedText>
                    </View>
                ) : (
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                Weekly Overview
                            </ThemedText>

                            <View style={styles.overviewCard}>
                                <ThemedText style={styles.summary}>
                                    {data.insights?.weeklySummary}
                                </ThemedText>

                                <View style={styles.statsRow}>
                                    <View style={styles.stat}>
                                        <ThemedText style={styles.statValue}>
                                            {data.insights?.recurringThemeCount}
                                        </ThemedText>
                                        <ThemedText color="textMuted" style={styles.statLabel}>
                                            recurring themes
                                        </ThemedText>
                                    </View>

                                    <View style={styles.statDivider} />

                                    <View style={styles.stat}>
                                        <ThemedText style={styles.statValue}>
                                            {data.insights?.emotionalPatternCount}
                                        </ThemedText>
                                        <ThemedText color="textMuted" style={styles.statLabel}>
                                            emotional patterns
                                        </ThemedText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                Recurring Themes
                            </ThemedText>

                            <View style={styles.themesCard}>
                                {data.insights?.themes
                                    .slice()
                                    .sort((a, b) => b.prominence - a.prominence)
                                    .map((theme) => (
                                        <View key={theme.name} style={styles.themeItem}>
                                            <View style={styles.themeHeader}>
                                                <ThemedText style={styles.themeName}>
                                                    {theme.name}
                                                </ThemedText>

                                                <ThemedText color="textMuted">
                                                    {theme.prominence}%
                                                </ThemedText>
                                            </View>

                                            <View style={styles.progressTrack}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        { width: `${theme.prominence}%` },
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    ))}
                            </View>
                        </View>

                        {data.insights?.emotionalPatterns &&
                            data.insights.emotionalPatterns.length > 0 && (
                                <View style={styles.section}>
                                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                                        The Inner Landscape
                                    </ThemedText>

                                    <ThemedText
                                        color="textMuted"
                                        style={styles.landscapeIntro}>
                                        Recurring emotional patterns across your dreams.
                                    </ThemedText>

                                    <View style={styles.landscapeCards}>
                                        {data.insights.emotionalPatterns
                                            .slice(0, 3)
                                            .map((pattern, index) => (
                                                <View
                                                    key={`${pattern.pattern}-${index}`}
                                                    style={styles.landscapeCard}>
                                                    <View style={styles.patternHeader}>
                                                        <View style={styles.patternNumber}>
                                                            <ThemedText style={styles.patternNumberText}>
                                                                {index + 1}
                                                            </ThemedText>
                                                        </View>

                                                        <ThemedText style={styles.patternTitle}>
                                                            {pattern.pattern}
                                                        </ThemedText>
                                                    </View>

                                                    {pattern.jungianConcept && (
                                                        <View style={styles.conceptBadge}>
                                                            <ThemedText style={styles.conceptText}>
                                                                {pattern.jungianConcept}
                                                            </ThemedText>
                                                        </View>
                                                    )}

                                                    <ThemedText
                                                        color="textMuted"
                                                        style={styles.interpretation}>
                                                        {pattern.interpretation}
                                                    </ThemedText>
                                                </View>
                                            ))}
                                    </View>
                                </View>
                            )}
                        <Pressable
                            style={styles.refreshButton}
                            onPress={refreshInsights}
                            disabled={refreshing}>
                            {refreshing ? (
                                <Animated.View
                                    style={refreshCompassStyle}>
                                    <Feather
                                        name="compass"
                                        size={17}
                                        color={Colors.background}
                                    />
                                </Animated.View>
                            ) : (
                                <Feather
                                    name="refresh-cw"
                                    size={16}
                                    color={Colors.background}
                                />
                            )}

                            <ThemedText style={styles.refreshButtonText}>
                                {refreshing ? 'Re-reading your dreams...' : 'Refresh Insights'}
                            </ThemedText>
                        </Pressable>
                    </ScrollView>
                )}
            </View>
        </ThemedView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 70,
        paddingHorizontal: 20,
    },
    contentLayer: {
        flex: 1,
        zIndex: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },

    weekSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
    },

    weekArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    weekInfo: {
        alignItems: 'center',
        gap: 3,
    },

    weekCaption: {
        fontSize: 10,
        letterSpacing: 1.5,
        fontWeight: '600',
    },

    weekLabel: {
        fontSize: 17,
        fontWeight: '500',
    },

    arrowButton: {
        padding: 8,
    },

    weekArrowDisabled: {
        opacity: 0.4,
    },

    content: {
        paddingBottom: 40,
        gap: 14,
    },

    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 18,
        gap: 10,
        marginBottom: 10,
    },

    summary: {
        lineHeight: 23,
    },


    themeName: {
        fontWeight: '600',
    },

    pattern: {
        fontWeight: '600',
        fontSize: 17,
    },

    concept: {
        fontStyle: 'italic',
    },

    interpretation: {
        lineHeight: 22,
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        gap: 12,
    },

    emptyTitle: {
        textAlign: 'center',
    },

    emptyText: {
        textAlign: 'center',
        lineHeight: 22,
    },
    refreshButton: {
        marginTop: 8,
        marginBottom: 20,
        minHeight: 48,
        borderRadius: Radius.md,
        backgroundColor: Colors.lilac,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },

    refreshButtonText: {
        color: Colors.background,
        fontWeight: '600',
    },
    section: {
        gap: 10,
        marginBottom: 10,
    },

    sectionTitle: {
        marginLeft: 4,
    },

    overviewCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 20,
        gap: 20,
    },

    summary: {
        fontSize: 16,
        lineHeight: 25,
    },

    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    stat: {
        flex: 1,
        alignItems: 'center',
        gap: 3,
    },

    statValue: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.lilac,
    },

    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },

    statDivider: {
        width: 1,
        height: 34,
        backgroundColor: Colors.border,
    },

    themesCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 18,
        gap: 20,
    },

    themeItem: {
        gap: 8,
    },

    themeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    themeName: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    progressTrack: {
        height: 5,
        borderRadius: 3,
        backgroundColor: Colors.border,
        overflow: 'hidden',
    },

    progressFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: Colors.lilac,
    },

    landscapeIntro: {
        marginLeft: 4,
        marginTop: -4,
        marginBottom: 2,
        fontSize: 13,
        lineHeight: 20,
    },

    landscapeCards: {
        gap: 12,
    },

    landscapeCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 18,
        gap: 14,
    },

    patternHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    patternNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.lilac,
        alignItems: 'center',
        justifyContent: 'center',
    },

    patternNumberText: {
        color: Colors.background,
        fontSize: 13,
        fontWeight: '600',
    },

    patternTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
    },

    conceptBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    conceptText: {
        fontSize: 12,
        color: Colors.lilac,
        fontStyle: 'italic',
    },

    interpretation: {
        fontSize: 14,
        lineHeight: 22,
    },
});