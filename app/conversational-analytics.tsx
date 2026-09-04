import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

export default function ConversationalAnalyticsScreen() {
    return (
        <ThemedView style={styles.container}>
            <Starfield />

            <View style={styles.content}>

                <View style={styles.centerContent}>
                    <View style={styles.iconCircle}>
                        <Feather
                            name="message-circle"
                            size={34}
                            color={Colors.lilac}
                        />
                    </View>

                    <ThemedText style={styles.title}>
                        Ask the dream witch!
                    </ThemedText>

                    <ThemedText style={styles.comingSoon}>
                        Coming soon
                    </ThemedText>

                    <ThemedText style={styles.description}>
                        Ask questions about your sleep data and explore
                        patterns using spells and witchcraft! (BigQuery-powered analytics).
                    </ThemedText>
                </View>
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

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },

    headerSpacer: {
        width: 40,
    },

    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 100,
    },

    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },

    title: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },

    comingSoon: {
        fontSize: 15,
        color: Colors.lilac,
        fontWeight: '600',
        marginBottom: 16,
    },

    description: {
        maxWidth: 340,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.7,
    },
});