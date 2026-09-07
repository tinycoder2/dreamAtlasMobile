import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
import { api } from '@/services/api';

type AnalyticsResponse = {
    answer: string;
};

const SUGGESTED_QUESTIONS = [
    'How does my sleep relate to my dreams?',
    'Which nights had the most REM sleep?',
    'What moods do I dream in most often?',
    'Do I dream more when I get more REM sleep?',
];

export default function ConversationalAnalyticsScreen() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const askQuestion = async (text?: string) => {
        const message = (text ?? question).trim();

        if (!message || loading) {
            return;
        }

        setQuestion(message);
        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            const response = await api.post<AnalyticsResponse>(
                '/api/analytics/chat',
                {
                    message,
                },
            );

            setAnswer(response.answer);
        } catch (err) {
            console.error('Analytics error:', err);

            setError(
                err instanceof Error
                    ? err.message
                    : 'Something went wrong while reading your dreams.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Starfield />

            <View style={styles.content}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <View style={styles.headerIcon}>
                            <Feather
                                name="message-circle"
                                size={24}
                                color={Colors.lilac}
                            />
                        </View>

                        <View style={styles.headerText}>
                            <ThemedText style={styles.title}>
                                Ask the dream witch
                            </ThemedText>

                            <ThemedText style={styles.subtitle}>
                                Your sleep & dream oracle
                            </ThemedText>
                        </View>
                    </View>

                    <ThemedText style={styles.description}>
                        Ask me anything about your sleep, dreams, and the
                        patterns hiding between them.
                    </ThemedText>

                    <ThemedText style={styles.sectionTitle}>
                        Try asking
                    </ThemedText>

                    <View style={styles.suggestions}>
                        {SUGGESTED_QUESTIONS.map((item) => (
                            <Pressable
                                key={item}
                                style={styles.suggestion}
                                onPress={() => askQuestion(item)}
                                disabled={loading}
                            >
                                <ThemedText style={styles.suggestionText}>
                                    {item}
                                </ThemedText>

                                <Feather
                                    name="arrow-up-right"
                                    size={15}
                                    color={Colors.lilac}
                                />
                            </Pressable>
                        ))}
                    </View>

                    {answer && (
                        <View style={styles.answerCard}>
                            <View style={styles.answerHeader}>
                                <View style={styles.answerIcon}>
                                    <Feather
                                        name="moon"
                                        size={18}
                                        color={Colors.lilac}
                                    />
                                </View>

                                <ThemedText style={styles.answerTitle}>
                                    The witch sees...
                                </ThemedText>
                            </View>

                            <ThemedText style={styles.answerText}>
                                {answer}
                            </ThemedText>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorCard}>
                            <Feather
                                name="alert-circle"
                                size={18}
                                color={Colors.lilac}
                            />

                            <ThemedText style={styles.errorText}>
                                {error}
                            </ThemedText>
                        </View>
                    )}

                    <View style={styles.inputSection}>
                        <TextInput
                            value={question}
                            onChangeText={setQuestion}
                            placeholder="Ask about your sleep or dreams..."
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            editable={!loading}
                            style={styles.input}
                            onSubmitEditing={() => askQuestion()}
                        />

                        <Pressable
                            style={[
                                styles.askButton,
                                (!question.trim() || loading) &&
                                    styles.askButtonDisabled,
                            ]}
                            onPress={() => askQuestion()}
                            disabled={!question.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={Colors.background}
                                />
                            ) : (
                                <>
                                    <ThemedText style={styles.askButtonText}>
                                        Ask
                                    </ThemedText>

                                    <Feather
                                        name="arrow-up"
                                        size={17}
                                        color={Colors.background}
                                    />
                                </>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 70,
        paddingHorizontal: 20,
    },

    content: {
        flex: 1,
        zIndex: 1,
    },

    scrollContent: {
        paddingBottom: 50,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    headerText: {
        flex: 1,
    },

    title: {
        fontSize: 24,
        fontWeight: '600',
    },

    subtitle: {
        fontSize: 14,
        opacity: 0.55,
        marginTop: 2,
    },

    description: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.7,
        marginBottom: 28,
    },

    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },

    suggestions: {
        gap: 10,
    },

    suggestion: {
        minHeight: 52,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: Radius.md,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    suggestionText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        marginRight: 10,
    },

    inputSection: {
        marginTop: 28,
    },

    input: {
        minHeight: 90,
        maxHeight: 150,
        borderRadius: Radius.md,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 14,
        color: Colors.text,
        fontSize: 15,
        textAlignVertical: 'top',
    },

    askButton: {
        height: 48,
        borderRadius: Radius.md,
        marginTop: 10,
        backgroundColor: Colors.lilac,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },

    askButtonDisabled: {
        opacity: 0.45,
    },

    askButtonText: {
        color: Colors.background,
        fontSize: 15,
        fontWeight: '600',
    },

    answerCard: {
    marginTop: 28,
    padding: 18,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    answerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },

    answerIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    answerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },

    answerText: {
        fontSize: 15,
        lineHeight: 23,
        opacity: 0.85,
    },

    errorCard: {
        marginTop: 20,
        padding: 16,
        borderRadius: 14,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },

    errorText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.75,
    },
});