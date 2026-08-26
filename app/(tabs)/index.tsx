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
import { DotLottie } from '@lottiefiles/dotlottie-react-native';

export default function CalendarScreen() {
  const { dates } = useDreamDates();

  const markedDates = useMemo(
    () =>
      Object.fromEntries(
        dates.map((date) => [
          date,
          {
            marked: true,
            dotColor: Colors.blush,
          },
        ])
      ),
    [dates]
  );

  function onDayPress(day: DateData) {
    router.push(`/dream/${day.dateString}`);
  }

  return (
    <ThemedView style={styles.container}>
      <Starfield />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          

          <View>
            <ThemedText type="title" style={styles.title}>
              Dream Atlas
            </ThemedText>

            <ThemedText color="textMuted" style={styles.subtitle}>
              tonight&rsquo;s dream awaits
            </ThemedText>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <Pressable
            accessibilityLabel="Search dreams"
            onPress={() => router.push('/list')}
            style={styles.headerIcon}>
            <Feather
              name="search"
              size={18}
              color={Colors.textSecondary}
            />
          </Pressable>

          <Pressable
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
            style={styles.headerIcon}>
            <Feather
              name="settings"
              size={18}
              color={Colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Calendar */}
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
              selectedDotColor: Colors.background,

              indicatorColor: Colors.lilac,

              monthTextSize: 19,
              monthTextFontWeight: '600',

              textDayFontSize: 15,
              textDayFontWeight: '500',

              textMonthFontSize: 19,
              textMonthFontWeight: '600',

              textDayHeaderFontSize: 11,
              textDayHeaderFontWeight: '600',
            }}
          />



          {/* Bottom hint */}
          <View style={styles.hint}>
            <View style={styles.hintDot} />

            <ThemedText color="textMuted" style={styles.hintText}>
              dreams recorded
            </ThemedText>
          </View>
        </View>
      </View>
      <View style={styles.animationContainer}>
        <DotLottie
          source={require('../../assets/animations/flying-kiki.lottie')}
          autoplay
          loop
          style={styles.animation}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },

  header: {
    marginTop: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  moonGlow: {
    width: 40,
    height: 40,
    borderRadius: 20,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#beaaff1a',
    borderWidth: 1,
    borderColor: 'rgba(190, 170, 255, 0.18)',
  },

  title: {
    fontSize: 25,
    lineHeight: 29,
    letterSpacing: -0.5,
    marginLeft: 10
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    letterSpacing: 0.2,
    marginLeft: 10
  },

  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },

  calendarWrap: {
    paddingTop: 22,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg + 4,

    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.13)',

    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 14,

    overflow: 'hidden',
  },
animationContainer: {
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 8,
},

animation: {
  width: 200,
  height: 200,
},
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,

    marginTop: 4,
    paddingTop: 12,

    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },

  hintDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.blush,
  },

  hintText: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
});