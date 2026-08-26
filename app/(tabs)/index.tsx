import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
import { useDreamDates } from '@/hooks/use-dreams';

export default function CalendarScreen() {
  const { dates } = useDreamDates();

  const markedDates = useMemo(
    () => Object.fromEntries(dates.map((date) => [date, { marked: true, dotColor: Colors.blush }])),
    [dates]
  );

  function onDayPress(day: DateData) {
    router.push(`/dream/${day.dateString}`);
  }

  return (
    <ThemedView style={styles.container}>
      <Starfield />
      <View style={styles.header}>
        <Feather name="moon" size={22} color={Colors.lilac} />
        <ThemedText type="title" style={styles.title}>
          Dream Atlas
        </ThemedText>
      </View>
      <View style={styles.headerIcons}>
        <Pressable
          accessibilityLabel="Search dreams"
          onPress={() => router.push('/list')}
          style={styles.headerIcon}>
          <Feather name="search" size={20} color={Colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityLabel="Settings"
          onPress={() => router.push('/settings')}
          style={styles.headerIcon}>
          <Feather name="settings" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>
      <ThemedText color="textMuted" style={styles.subtitle}>
        tonight&rsquo;s dream awaits
      </ThemedText>

      <View style={styles.calendarWrap}>
        <View style={styles.card}>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: Colors.textMuted,
              dayTextColor: Colors.text,
              monthTextColor: Colors.text,
              textDisabledColor: Colors.textMuted,
              arrowColor: Colors.lilac,
              todayTextColor: Colors.blush,
              selectedDayBackgroundColor: Colors.lilac,
              selectedDayTextColor: Colors.background,
              dotColor: Colors.blush,
              indicatorColor: Colors.lilac,
            }}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 110,
    paddingHorizontal: 20,
  },
  headerIcons: {
    position: 'absolute',
    top: 110,
    right: 20,
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 4,
  },
  calendarWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
    overflow: 'hidden',
  },
});
