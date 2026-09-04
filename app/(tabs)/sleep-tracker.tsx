import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

type SleepSession = {
  sleepId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  startUtcOffsetSeconds: number;
  endUtcOffsetSeconds: number;
  timezone: string;
  localSleepDate: string;
  localWakeDate: string;
  sleepType: string;
  mainSleep: boolean;
  platform: string | null;
  deviceName: string | null;
  recordingMethod: string | null;
  durationMinutes: number;
  minutesAsleep: number;
  minutesAwake: number;
  stageAwakeMinutes: number;
  lightMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  stageCount: number;
  hrSampleCount: number;
  meanHr: number | null;
  minHr: number | null;
  maxHr: number | null;
  hrStddev: number | null;
};

type Dream = {
  id: string;
  date: string;
  text: string;
  mood: string;
  dreamType: string;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type SleepDay = {
  date: string;
  sleep: SleepSession | null;
  dreams: Dream[];
};

type WeeklySleepResponse = {
  weekStart: string;
  weekEnd: string;
  days: SleepDay[];
};

type WeeklySleepStats = {
  averageSleepMinutes: number;
  averageRemMinutes: number;
  averageMeanHr: number;
  totalDreams: number;
  vividDreams: number;
  greatDreams: number;
  goodDreams: number;
  neutralDreams: number;
  badDreams: number;
  nightmares: number;
};

type WeeklySleepInsightsResponse = {
  weekStart: string;
  weekEnd: string;
  stats: WeeklySleepStats;
};

type DayItem = {
  label: string;
  date: string;
  key: string;
};

export default function SleepTrackerScreen() {
  const { user } = useAuth();


  const [weekStart, setWeekStart] = useState(
    getSunday(new Date('2026-09-01'))
  );

  const [selectedDay, setSelectedDay] = useState('2026-09-01');

  const [data, setData] = useState<WeeklySleepResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekEnd = useMemo(
    () => addDays(weekStart, 6),
    [weekStart]
  );

  const days = useMemo(
    () => buildDays(weekStart),
    [weekStart]
  );

  const selected = data?.days.find(
    (day) => day.date === selectedDay
  );

  const selectedSleep = selected?.sleep ?? null;
  const selectedDreams = selected?.dreams ?? [];

  const [insights, setInsights] =
    useState<WeeklySleepInsightsResponse | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    loadWeek();
  }, [user, weekStart]);

  async function loadWeek() {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);


      const [sleepResponse, insightsResponse] =
        await Promise.all([
          api.get<WeeklySleepResponse>(
            `/api/users/${user.uid}/sleep?startDate=${formatDate(
              weekStart
            )}&endDate=${formatDate(weekEnd)}`
          ),

          api.get<WeeklySleepInsightsResponse>(
            `/api/users/${user.uid}/sleep/stats?startDate=${formatDate(
              weekStart
            )}&endDate=${formatDate(weekEnd)}`
          ),
        ]);

      setData(sleepResponse);
      setInsights(insightsResponse);

      // Keep selected day inside the currently loaded week.
      const selectedExists = sleepResponse.days.some(
        (day) => day.date === selectedDay
      );

      if (!selectedExists) {
        setSelectedDay(sleepResponse.weekStart);
      }
    } catch (err) {
      console.error('Failed to load sleep data:', err);
      setError('Unable to load sleep data.');
      setData(null);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }

  function goToPreviousWeek() {
    const previous = addDays(weekStart, -7);

    setWeekStart(previous);
    setSelectedDay(formatDate(addDays(previous, 2)));
  }

  function goToNextWeek() {
    const next = addDays(weekStart, 7);

    setWeekStart(next);
    setSelectedDay(formatDate(addDays(next, 2)));
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Week navigation */}
          <View style={styles.weekHeader}>
            <Pressable
              style={styles.iconButton}
              onPress={goToPreviousWeek}
            >
              <Feather
                name="chevron-left"
                size={22}
                color="#fff"
              />
            </Pressable>

            <ThemedText type="subtitle">
              Week of {formatWeekTitle(weekStart)}
            </ThemedText>

            <Pressable
              style={styles.iconButton}
              onPress={goToNextWeek}
            >
              <Feather
                name="chevron-right"
                size={22}
                color="#fff"
              />
            </Pressable>
          </View>

          {/* Days */}
          <View style={styles.daysRow}>
            {days.map((day) => {
              const isSelected = day.key === selectedDay;

              return (
                <Pressable
                  key={day.key}
                  onPress={() => setSelectedDay(day.key)}
                  style={styles.dayItem}
                >
                  <ThemedText
                    color={isSelected ? 'text' : 'textMuted'}
                    style={styles.dayLabel}
                  >
                    {day.label}
                  </ThemedText>

                  <View
                    style={[
                      styles.dayCircle,
                      isSelected && styles.dayCircleSelected,
                    ]}
                  >
                    <ThemedText
                      color={isSelected ? 'text' : 'textMuted'}
                      style={styles.dayNumber}
                    >
                      {day.date}
                    </ThemedText>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedDot} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              <ThemedText
                color="textMuted"
                style={styles.loadingText}
              >
                Loading sleep data...
              </ThemedText>
            </View>
          )}

          {error && !loading && (
            <View style={styles.errorContainer}>
              <ThemedText>{error}</ThemedText>

              <Pressable
                style={styles.retryButton}
                onPress={loadWeek}
              >
                <ThemedText>Retry</ThemedText>
              </Pressable>
            </View>
          )}

          {!loading && !error && (
            <>
              {/* Sleep */}
              <View style={styles.section}>
                <ThemedText
                  type="subtitle"
                  style={styles.sectionTitle}
                >
                  {selected
                    ? days
                      .find((day) => day.key === selectedDay)
                      ?.label.toUpperCase()
                    : 'SLEEP'}{' '}
                  NIGHT'S SLEEP
                </ThemedText>

                {selectedSleep ? (
                  <>
                    <View style={styles.sleepTimes}>
                      <ThemedText color="textMuted">
                        {formatLocalTime(
                          selectedSleep.startTimeUtc,
                          selectedSleep.startUtcOffsetSeconds
                        )}
                      </ThemedText>

                      <ThemedText style={styles.duration}>
                        {formatDuration(
                          selectedSleep.durationMinutes
                        )}
                      </ThemedText>

                      <ThemedText color="textMuted">
                        {formatLocalTime(
                          selectedSleep.endTimeUtc,
                          selectedSleep.endUtcOffsetSeconds
                        )}
                      </ThemedText>
                    </View>

                    <View style={styles.sleepLine}>
                      <View style={styles.sleepLineFill} />
                    </View>

                    {/* Stage summary */}
                    <StageSummary sleep={selectedSleep} />
                  </>
                ) : (
                  <EmptySleepState />
                )}
              </View>

              {/* Heart rate */}
              {selectedSleep && (
                <View style={styles.section}>
                  <ThemedText
                    type="subtitle"
                    style={styles.sectionTitle}
                  >
                    HEART RATE
                  </ThemedText>

                  <View style={styles.heartRateContainer}>
                    <View style={styles.hrLabels}>
                      <ThemedText
                        color="textMuted"
                        style={styles.hrLabel}
                      >
                        {selectedSleep.maxHr ?? '--'}
                      </ThemedText>

                      <ThemedText
                        color="textMuted"
                        style={styles.hrLabel}
                      >
                        {selectedSleep.meanHr
                          ? Math.round(selectedSleep.meanHr)
                          : '--'}
                      </ThemedText>

                      <ThemedText
                        color="textMuted"
                        style={styles.hrLabel}
                      >
                        {selectedSleep.minHr ?? '--'}
                      </ThemedText>
                    </View>

                    <View style={styles.hrChart}>
                      <View style={styles.gridLine} />
                      <View style={styles.gridLine} />
                      <View style={styles.gridLine} />

                      {/* Placeholder shape until detailed HR samples endpoint */}
                      <View style={styles.hrLine}>
                        <View
                          style={[
                            styles.hrPoint,
                            { left: '4%', top: 45 },
                          ]}
                        />
                        <View
                          style={[
                            styles.hrPoint,
                            { left: '18%', top: 35 },
                          ]}
                        />
                        <View
                          style={[
                            styles.hrPoint,
                            { left: '32%', top: 48 },
                          ]}
                        />
                        <View
                          style={[
                            styles.hrPoint,
                            { left: '46%', top: 25 },
                          ]}
                        />
                        <View
                          style={[
                            styles.hrPoint,
                            { left: '60%', top: 42 },
                          ]}
                        />
                        <View
                          style={[
                            styles.hrPoint,
                            { left: '74%', top: 32 },
                          ]}
                        />
                        <View
                          style={[
                            styles.hrPoint,
                            { left: '88%', top: 38 },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.hrSummary}>
                    <Metric
                      label="Average"
                      value={formatBpm(selectedSleep.meanHr)}
                    />

                    <Metric
                      label="Lowest"
                      value={formatBpm(selectedSleep.minHr)}
                    />

                    <Metric
                      label="Highest"
                      value={formatBpm(selectedSleep.maxHr)}
                    />
                  </View>
                </View>
              )}

              {/* Dreams */}
              <View style={styles.section}>
                <View style={styles.dreamHeader}>
                  <ThemedText type="subtitle">
                    Dreams
                  </ThemedText>

                  <ThemedText color="textMuted">
                    {selectedDreams.length}{' '}
                    {selectedDreams.length === 1
                      ? 'dream'
                      : 'dreams'}
                  </ThemedText>
                </View>

                {selectedDreams.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dreamCards}
                  >
                    {selectedDreams.map((dream, index) => (
                      <Pressable
                        key={dream.id}
                        style={styles.dreamCard}
                      >
                        <ThemedText
                          color="textMuted"
                          style={styles.dreamNumber}
                        >
                          #{index + 1}
                        </ThemedText>

                        <ThemedText
                          style={styles.dreamMood}
                        >
                          {capitalize(dream.mood)}
                        </ThemedText>

                        <ThemedText color="textMuted">
                          · {capitalize(dream.dreamType)}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <ThemedText color="textMuted">
                    No dreams recorded for this sleep.
                  </ThemedText>
                )}
              </View>
              {/* Weekly stats */}
              <View style={styles.insightsSection}>
                <View style={styles.insightsHeader}>
                  <View>
                    <ThemedText type="subtitle">
                      WEEKLY STATS
                    </ThemedText>

                    <ThemedText
                      color="textMuted"
                      style={styles.insightsSubtitle}
                    >
                      Sleep ↔ Dreams
                    </ThemedText>
                  </View>

                  <Pressable style={styles.chatButton}>
                    <Feather
                      name="message-circle"
                      size={16}
                      color="#fff"
                    />

                    <ThemedText style={styles.chatText}>
                      Chat with AI
                    </ThemedText>
                  </Pressable>
                </View>

                {insights && (
                  <>
                    <InsightRow
                      left="Average sleep"
                      leftValue={formatDuration(
                        insights.stats.averageSleepMinutes
                      )}
                      right="Dream frequency"
                      rightValue={`${insights.stats.totalDreams} dreams`}
                    />

                    <InsightRow
                      left="Average REM"
                      leftValue={formatDuration(
                        insights.stats.averageRemMinutes
                      )}
                      right="Vivid dreams"
                      rightValue={`${insights.stats.vividDreams}`}
                    />

                    <InsightRow
                      left="Mean HR"
                      leftValue={`${insights.stats.averageMeanHr} bpm`}
                      right="Dream mood"
                      rightValue={formatDreamMood(insights.stats)}
                    />

                    <InsightRow
                      left="HRV"
                      leftValue="--"
                      right="Nightmares"
                      rightValue={`${insights.stats.nightmares}`}
                    />
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function StageSummary({
  sleep,
}: {
  sleep: SleepSession;
}) {
  const total =
    sleep.stageAwakeMinutes +
    sleep.lightMinutes +
    sleep.deepMinutes +
    sleep.remMinutes;

  return (
    <View style={styles.stageChart}>
      <StageRow
        label="REM"
        minutes={sleep.remMinutes}
        total={total}
      />

      <StageRow
        label="LIGHT"
        minutes={sleep.lightMinutes}
        total={total}
      />

      <StageRow
        label="DEEP"
        minutes={sleep.deepMinutes}
        total={total}
      />

      <StageRow
        label="AWAKE"
        minutes={sleep.stageAwakeMinutes}
        total={total}
      />
    </View>
  );
}

function StageRow({
  label,
  minutes,
  total,
}: {
  label: string;
  minutes: number;
  total: number;
}) {
  const width =
    total > 0 ? `${(minutes / total) * 100}%` : '0%';

  return (
    <View style={styles.stageRow}>
      <ThemedText
        color="textMuted"
        style={styles.stageLabel}
      >
        {label}
      </ThemedText>

      <View style={styles.stageTrack}>
        <View
          style={[
            styles.stageBlock,
            {
              width,
            },
          ]}
        />
      </View>

      <ThemedText
        color="textMuted"
        style={styles.stageMinutes}
      >
        {minutes}m
      </ThemedText>
    </View>
  );
}

function EmptySleepState() {
  return (
    <View style={styles.emptySleep}>
      <Feather
        name="moon"
        size={22}
        color="rgba(255,255,255,0.45)"
      />

      <ThemedText color="textMuted">
        No sleep recorded for this day.
      </ThemedText>
    </View>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <ThemedText
        color="textMuted"
        style={styles.metricLabel}
      >
        {label}
      </ThemedText>

      <ThemedText style={styles.metricValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function InsightRow({
  left,
  leftValue,
  right,
  rightValue,
}: {
  left: string;
  leftValue: string;
  right: string;
  rightValue: string;
}) {
  return (
    <View style={styles.insightRow}>
      <View style={styles.insightMetric}>
        <ThemedText color="textMuted">
          {left}
        </ThemedText>

        <ThemedText style={styles.insightValue}>
          {leftValue}
        </ThemedText>
      </View>

      <View style={styles.insightMetric}>
        <ThemedText color="textMuted">
          {right}
        </ThemedText>

        <ThemedText style={styles.insightValue}>
          {rightValue}
        </ThemedText>
      </View>
    </View>
  );
}

function buildDays(start: Date): DayItem[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);

    return {
      label: date.toLocaleDateString('en-US', {
        weekday: 'short',
      }),
      date: String(date.getDate()),
      key: formatDate(date),
    };
  });
}

function getSunday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();

  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);

  return result;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatWeekTitle(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(minutes: number): string {
  const totalMinutes = Math.round(minutes);

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatBpm(value: number | null): string {
  return value == null
    ? '--'
    : `${Math.round(value)} bpm`;
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatLocalTime(
  utcString: string,
  offsetSeconds: number
): string {
  const utcDate = new Date(utcString);

  const localMillis =
    utcDate.getTime() + offsetSeconds * 1000;

  const localDate = new Date(localMillis);

  return localDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  });
}

function formatDreamMood(
  stats: WeeklySleepStats
): string {
  const parts: string[] = [];

  if (stats.greatDreams > 0) {
    parts.push(`${stats.greatDreams} great`);
  }

  if (stats.goodDreams > 0) {
    parts.push(`${stats.goodDreams} good`);
  }

  if (stats.neutralDreams > 0) {
    parts.push(`${stats.neutralDreams} neutral`);
  }

  if (stats.badDreams > 0) {
    parts.push(`${stats.badDreams} bad`);
  }

  return parts.join(' · ') || '--';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  insightMetric: {
    flex: 1,
  },

  insightValue: {
    marginTop: 4,
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
  },

  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 34,
  },

  dayItem: {
    alignItems: 'center',
    width: 42,
  },

  dayLabel: {
    fontSize: 12,
    marginBottom: 8,
  },

  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayCircleSelected: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  dayNumber: {
    fontSize: 14,
  },

  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 6,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },

  loadingText: {
    fontSize: 12,
  },

  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 14,
  },

  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  section: {
    marginBottom: 34,
  },

  sectionTitle: {
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 20,
  },

  sleepTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  duration: {
    fontSize: 12,
  },

  sleepLine: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginTop: 10,
    marginBottom: 22,
  },

  sleepLineFill: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  emptySleep: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 10,
  },

  stageChart: {
    gap: 10,
  },

  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stageLabel: {
    width: 50,
    fontSize: 11,
  },

  stageTrack: {
    flex: 1,
    height: 18,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },

  stageBlock: {
    height: 18,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  stageMinutes: {
    width: 38,
    marginLeft: 8,
    fontSize: 10,
    textAlign: 'right',
  },

  heartRateContainer: {
    flexDirection: 'row',
    height: 130,
  },

  hrLabels: {
    width: 35,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  hrLabel: {
    fontSize: 10,
  },

  hrChart: {
    flex: 1,
    position: 'relative',
    justifyContent: 'space-between',
  },

  gridLine: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  hrLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  hrPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },

  hrSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },

  metric: {
    alignItems: 'center',
  },

  metricLabel: {
    fontSize: 11,
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 13,
  },

  dreamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  dreamCards: {
    gap: 12,
  },

  dreamCard: {
    minWidth: 150,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dreamNumber: {
    fontSize: 11,
  },

  dreamMood: {
    fontSize: 14,
  },

  insightsSection: {
    marginTop: 4,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },

  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  insightsSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  chatText: {
    fontSize: 11,
  },

  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
});