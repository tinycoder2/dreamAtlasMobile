import { useAuth } from '@/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
import { api } from '@/services/api';

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

    useEffect(() => {
        loadInsights(weekStart);
    }, [weekStart, user]);

    function changeWeek(amount: number) {
        const next = new Date(weekStart);
        next.setDate(next.getDate() + amount * 7);
        setWeekStart(next);
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Insights</ThemedText>
            </View>

            <View style={styles.weekSelector}>
                <Pressable
                    onPress={() => changeWeek(-1)}
                    style={styles.arrowButton}>
                    <Feather
                        name="chevron-left"
                        size={22}
                        color={Colors.lilac}
                    />
                </Pressable>

                <ThemedText style={styles.weekLabel}>
                    {formatWeekRange(weekStart)}
                </ThemedText>

                <Pressable
                    onPress={() => changeWeek(1)}
                    style={styles.arrowButton}>
                    <Feather
                        name="chevron-right"
                        size={22}
                        color={Colors.lilac}
                    />
                </Pressable>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={Colors.lilac} />
                </View>
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
                        Not enough dreams yet
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
                    <ThemedText type="subtitle">
                        Weekly Overview
                    </ThemedText>

                    <View style={styles.card}>
                        <ThemedText style={styles.summary}>
                            {data.insights?.weeklySummary}
                        </ThemedText>

                        <ThemedText color="textMuted">
                            {data.insights?.recurringThemeCount} recurring themes ·{' '}
                            {data.insights?.emotionalPatternCount} emotional patterns
                        </ThemedText>
                    </View>

                    <ThemedText type="subtitle">
                        Recurring Themes
                    </ThemedText>

                    {data.insights?.themes.map((theme) => (
                        <View
                            key={theme.name}
                            style={styles.themeRow}>
                            <ThemedText style={styles.themeName}>
                                {theme.name}
                            </ThemedText>

                            <ThemedText color="textMuted">
                                {theme.prominence}%
                            </ThemedText>
                        </View>
                    ))}

                    {!!data.insights?.emotionalPatterns.length && (
                        <>
                            <ThemedText type="subtitle">
                                The Inner Landscape
                            </ThemedText>

                            {data.insights.emotionalPatterns.map((pattern, index) => (
                                <View
                                    key={`${pattern.pattern}-${index}`}
                                    style={styles.card}>
                                    <ThemedText style={styles.pattern}>
                                        {pattern.pattern}
                                    </ThemedText>

                                    {pattern.jungianConcept && (
                                        <ThemedText
                                            color="textMuted"
                                            style={styles.concept}>
                                            {pattern.jungianConcept}
                                        </ThemedText>
                                    )}

                                    <ThemedText style={styles.interpretation}>
                                        {pattern.interpretation}
                                    </ThemedText>
                                </View>
                            ))}
                        </>
                    )}
                    <Pressable
                        style={styles.refreshButton}
                        onPress={refreshInsights}
                        disabled={refreshing}>
                        {refreshing ? (
                            <ActivityIndicator
                                size="small"
                                color={Colors.background}
                            />
                        ) : (
                            <>
                                <Feather
                                    name="refresh-cw"
                                    size={16}
                                    color={Colors.background}
                                />
                                <ThemedText style={styles.refreshButtonText}>
                                    Refresh Insights
                                </ThemedText>
                            </>
                        )}
                    </Pressable>
                </ScrollView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 70,
        paddingHorizontal: 20,
    },

    header: {
        alignItems: 'center',
        marginBottom: 16,
    },

    weekSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },

    arrowButton: {
        padding: 8,
    },

    weekLabel: {
        fontSize: 17,
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

    themeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 16,
        paddingVertical: 14,
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
});