import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';

import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
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
  const router = useRouter();
  const { user } = useAuth();

  const [weekStart, setWeekStart] = useState(
    getSunday(new Date())
  );

  const [selectedDay, setSelectedDay] = useState(
    formatDate(new Date())
  );

  const [data, setData] =
    useState<WeeklySleepResponse | null>(null);

  const [insights, setInsights] =
    useState<WeeklySleepInsightsResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

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

  const currentWeekStart = getSunday(new Date());

  const isCurrentWeek =
    weekStart.getTime() === currentWeekStart.getTime();

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

      const selectedExists =
        sleepResponse.days.some(
          (day) => day.date === selectedDay
        );

      if (!selectedExists) {
        setSelectedDay(sleepResponse.weekStart);
      }
    } catch (err) {
      console.error(
        'Failed to load sleep data:',
        err
      );

      setError('Unable to load sleep data.');
      setData(null);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }

  function changeWeek(amount: number) {
    const next = addDays(
      weekStart,
      amount * 7
    );

    setWeekStart(next);

    setSelectedDay(
      formatDate(addDays(next, 2))
    );
  }

  /*
   * Wizard hat jingle.
   *
   * The hat stays still for 3 seconds,
   * then quickly shifts back and forth
   * like something underneath is moving.
   */
  const hatJingle = useMemo(
    () => new Animated.Value(0),
    []
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(3000),

        Animated.timing(hatJingle, {
          toValue: 1,
          duration: 55,
          useNativeDriver: true,
        }),

        Animated.timing(hatJingle, {
          toValue: -1,
          duration: 55,
          useNativeDriver: true,
        }),

        Animated.timing(hatJingle, {
          toValue: 0.7,
          duration: 45,
          useNativeDriver: true,
        }),

        Animated.timing(hatJingle, {
          toValue: -0.5,
          duration: 45,
          useNativeDriver: true,
        }),

        Animated.timing(hatJingle, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [hatJingle]);

  const hatJingleX = hatJingle.interpolate({
    inputRange: [-1, 1],
    outputRange: [-2.5, 2.5],
  });

  const hatJingleY = hatJingle.interpolate({
    inputRange: [-1, 1],
    outputRange: [1.5, -1.5],
  });

  return (
    <ThemedView style={styles.container}>
      <Starfield />

      <View style={styles.contentLayer}>
        {/* Week selector */}
        <View style={styles.weekSelector}>
          <Pressable
            onPress={() => changeWeek(-1)}
            style={styles.weekArrow}
            hitSlop={8}
          >
            <Feather
              name="chevron-left"
              size={20}
              color={Colors.lilac}
            />
          </Pressable>

          <View style={styles.weekInfo}>
            <ThemedText
              color="textMuted"
              style={styles.weekCaption}
            >
              WEEK OF
            </ThemedText>

            <ThemedText
              style={styles.weekLabel}
            >
              {formatWeekRange(weekStart)}
            </ThemedText>
          </View>

          <Pressable
            onPress={() => changeWeek(1)}
            disabled={isCurrentWeek}
            style={[
              styles.weekArrow,
              isCurrentWeek &&
              styles.weekArrowDisabled,
            ]}
            hitSlop={8}
          >
            <Feather
              name="chevron-right"
              size={20}
              color={
                isCurrentWeek
                  ? Colors.textMuted
                  : Colors.lilac
              }
            />
          </Pressable>
        </View>

        {/* Day selector */}
        <View style={styles.daysRow}>
          {days.map((day) => {
            const isSelected =
              day.key === selectedDay;

            return (
              <Pressable
                key={day.key}
                onPress={() =>
                  setSelectedDay(day.key)
                }
                style={styles.dayItem}
              >
                <ThemedText
                  color={
                    isSelected
                      ? 'text'
                      : 'textMuted'
                  }
                  style={styles.dayLabel}
                >
                  {day.label}
                </ThemedText>

                <View
                  style={[
                    styles.dayCircle,
                    isSelected &&
                    styles.dayCircleSelected,
                  ]}
                >
                  <ThemedText
                    color={
                      isSelected
                        ? 'text'
                        : 'textMuted'
                    }
                    style={styles.dayNumber}
                  >
                    {day.date}
                  </ThemedText>
                </View>

                {isSelected && (
                  <View
                    style={styles.selectedDot}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              color={Colors.lilac}
            />

            <ThemedText
              color="textMuted"
              style={styles.loadingText}
            >
              Reading your sleep...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Feather
              name="moon"
              size={34}
              color={Colors.lilac}
            />

            <ThemedText
              type="subtitle"
              style={styles.emptyTitle}
            >
              Something went wrong
            </ThemedText>

            <ThemedText
              color="textMuted"
              style={styles.emptyText}
            >
              {error}
            </ThemedText>

            <Pressable
              style={styles.retryButton}
              onPress={loadWeek}
            >
              <ThemedText
                style={styles.retryText}
              >
                Retry
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={
              styles.scrollContent
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Sleep */}
            <View style={styles.section}>
              <ThemedText
                type="subtitle"
                style={styles.sectionTitle}
              >
                {selected
                  ? days
                    .find(
                      (day) =>
                        day.key ===
                        selectedDay
                    )
                    ?.label.toUpperCase()
                  : 'SLEEP'}{' '}
                NIGHT'S SLEEP
              </ThemedText>

              {selectedSleep ? (
                <View style={styles.card}>
                  <View
                    style={styles.sleepTimes}
                  >
                    <View>
                      <ThemedText
                        style={styles.timeValue}
                      >
                        {formatLocalTime(
                          selectedSleep.startTimeUtc,
                          selectedSleep.startUtcOffsetSeconds
                        )}
                      </ThemedText>

                      <ThemedText
                        color="textMuted"
                        style={styles.timeLabel}
                      >
                        BEDTIME
                      </ThemedText>
                    </View>

                    <View
                      style={
                        styles.durationContainer
                      }
                    >
                      <Feather
                        name="moon"
                        size={14}
                        color={Colors.lilac}
                      />

                      <ThemedText
                        style={styles.duration}
                      >
                        {formatDuration(
                          selectedSleep.durationMinutes
                        )}
                      </ThemedText>
                    </View>

                    <View
                      style={styles.wakeTime}
                    >
                      <ThemedText
                        style={styles.timeValue}
                      >
                        {formatLocalTime(
                          selectedSleep.endTimeUtc,
                          selectedSleep.endUtcOffsetSeconds
                        )}
                      </ThemedText>

                      <ThemedText
                        color="textMuted"
                        style={styles.timeLabel}
                      >
                        WAKE
                      </ThemedText>
                    </View>
                  </View>

                  <View
                    style={styles.sleepTimeline}
                  >
                    <View
                      style={
                        styles.sleepTimelineFill
                      }
                    />
                  </View>

                  <StageSummary
                    sleep={selectedSleep}
                  />
                </View>
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

                <View style={styles.card}>
                  <View
                    style={
                      styles.heartRateContainer
                    }
                  >
                    <View
                      style={styles.hrLabels}
                    >
                      <ThemedText
                        color="textMuted"
                        style={styles.hrLabel}
                      >
                        {selectedSleep.maxHr ??
                          '--'}
                      </ThemedText>

                      <ThemedText
                        color="textMuted"
                        style={styles.hrLabel}
                      >
                        {selectedSleep.meanHr
                          ? Math.round(
                            selectedSleep.meanHr
                          )
                          : '--'}
                      </ThemedText>

                      <ThemedText
                        color="textMuted"
                        style={styles.hrLabel}
                      >
                        {selectedSleep.minHr ??
                          '--'}
                      </ThemedText>
                    </View>

                    <View
                      style={styles.hrChart}
                    >
                      <View
                        style={styles.gridLine}
                      />

                      <View
                        style={styles.gridLine}
                      />

                      <View
                        style={styles.gridLine}
                      />

                      <View
                        style={styles.hrLine}
                      >
                        <View
                          style={[
                            styles.hrPoint,
                            {
                              left: '4%',
                              top: 48,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.hrPoint,
                            {
                              left: '18%',
                              top: 36,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.hrPoint,
                            {
                              left: '32%',
                              top: 50,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.hrPoint,
                            {
                              left: '46%',
                              top: 27,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.hrPoint,
                            {
                              left: '60%',
                              top: 43,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.hrPoint,
                            {
                              left: '74%',
                              top: 34,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.hrPoint,
                            {
                              left: '88%',
                              top: 40,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View
                    style={styles.hrSummary}
                  >
                    <Metric
                      label="Average"
                      value={formatBpm(
                        selectedSleep.meanHr
                      )}
                    />

                    <Metric
                      label="Lowest"
                      value={formatBpm(
                        selectedSleep.minHr
                      )}
                    />

                    <Metric
                      label="Highest"
                      value={formatBpm(
                        selectedSleep.maxHr
                      )}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Dreams */}
            <View style={styles.section}>
              <View
                style={styles.sectionHeader}
              >
                <ThemedText
                  type="subtitle"
                  style={
                    styles.sectionTitleInline
                  }
                >
                  Dreams
                </ThemedText>

                <ThemedText
                  color="textMuted"
                  style={styles.sectionCount}
                >
                  {selectedDreams.length}{' '}
                  {selectedDreams.length === 1
                    ? 'dream'
                    : 'dreams'}
                </ThemedText>
              </View>

              {selectedDreams.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.dreamCards
                  }
                >
                  {selectedDreams.map(
                    (dream, index) => (
                      <Pressable
                        key={dream.id}
                        style={
                          styles.dreamCard
                        }
                      >
                        <View
                          style={
                            styles.dreamCardHeader
                          }
                        >
                          <View
                            style={
                              styles.dreamNumber
                            }
                          >
                            <ThemedText
                              style={
                                styles.dreamNumberText
                              }
                            >
                              {index + 1}
                            </ThemedText>
                          </View>

                          <ThemedText
                            color="textMuted"
                            style={
                              styles.dreamType
                            }
                          >
                            {capitalize(
                              dream.dreamType
                            )}
                          </ThemedText>
                        </View>

                        <ThemedText
                          style={styles.dreamMood}
                        >
                          {capitalize(
                            dream.mood
                          )}
                        </ThemedText>

                        {dream.tags?.length >
                          0 && (
                            <ThemedText
                              color="textMuted"
                              style={
                                styles.dreamTags
                              }
                            >
                              {dream.tags
                                .slice(0, 2)
                                .map(
                                  (tag) =>
                                    `#${tag}`
                                )
                                .join(' ')}
                            </ThemedText>
                          )}
                      </Pressable>
                    )
                  )}
                </ScrollView>
              ) : (
                <View
                  style={styles.emptyDreams}
                >
                  <Feather
                    name="moon"
                    size={20}
                    color={Colors.lilac}
                  />

                  <ThemedText color="textMuted">
                    No dreams recorded for
                    this sleep.
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Weekly stats */}
            <View style={styles.section}>

              <View style={styles.statsCard}>
                <View
                  style={styles.statsHeader}
                >
                  <View>
                    <ThemedText
                      style={styles.statsTitle}
                    >
                      Sleep ↔ Dreams
                    </ThemedText>

                    <ThemedText
                      color="textMuted"
                      style={
                        styles.statsSubtitle
                      }
                    >
                      Your week at a
                      glance
                    </ThemedText>
                  </View>

                  <Pressable
                    onPress={() =>
                      router.push('/conversational-analytics')
                    }
                    hitSlop={10}
                  >
                    <Animated.Image
                      source={require('@/assets/images/wizard2.png')}
                      resizeMode="contain"
                      style={[
                        styles.wizardIcon,
                        {
                          transform: [
                            { translateX: hatJingleX },
                            { translateY: hatJingleY },
                          ],
                        },
                      ]}
                    />
                  </Pressable>
                </View>

                {insights && (
                  <View
                    style={styles.statsRows}
                  >
                    <InsightRow
                      left="Average sleep"
                      leftValue={formatDuration(
                        insights.stats
                          .averageSleepMinutes
                      )}
                      right="Dream frequency"
                      rightValue={`${insights.stats.totalDreams} dreams`}
                    />

                    <InsightRow
                      left="Average REM"
                      leftValue={formatDuration(
                        insights.stats
                          .averageRemMinutes
                      )}
                      right="Vivid dreams"
                      rightValue={`${insights.stats.vividDreams}`}
                    />

                    <InsightRow
                      left="Mean HR"
                      leftValue={`${Math.round(
                        insights.stats
                          .averageMeanHr
                      )} bpm`}
                      right="Dream mood"
                      rightValue={formatDreamMood(
                        insights.stats
                      )}
                    />

                    <InsightRow
                      left="HRV"
                      leftValue="--"
                      right="Nightmares"
                      rightValue={`${insights.stats.nightmares}`}
                    />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
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
    total > 0
      ? `${(minutes / total) * 100}%`
      : '0%';

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
        {Math.round(minutes)}m
      </ThemedText>
    </View>
  );
}

function EmptySleepState() {
  return (
    <View style={styles.emptyCard}>
      <Feather
        name="moon"
        size={30}
        color={Colors.lilac}
      />

      <ThemedText
        type="subtitle"
        style={styles.emptyTitle}
      >
        No sleep recorded
      </ThemedText>

      <ThemedText
        color="textMuted"
        style={styles.emptyText}
      >
        There is no sleep data recorded for this
        night.
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
        <ThemedText
          color="textMuted"
          style={styles.insightLabel}
        >
          {left}
        </ThemedText>

        <ThemedText
          style={styles.insightValue}
        >
          {leftValue}
        </ThemedText>
      </View>

      <View style={styles.insightMetric}>
        <ThemedText
          color="textMuted"
          style={styles.insightLabel}
        >
          {right}
        </ThemedText>

        <ThemedText
          style={styles.insightValue}
        >
          {rightValue}
        </ThemedText>
      </View>
    </View>
  );
}

function buildDays(start: Date): DayItem[] {
  return Array.from(
    { length: 7 },
    (_, index) => {
      const date = addDays(start, index);

      return {
        label: date.toLocaleDateString(
          'en-US',
          {
            weekday: 'short',
          }
        ),
        date: String(date.getDate()),
        key: formatDate(date),
      };
    }
  );
}

function getSunday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();

  result.setDate(
    result.getDate() - day
  );

  result.setHours(0, 0, 0, 0);

  return result;
}

function addDays(
  date: Date,
  amount: number
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatWeekRange(
  start: Date
): string {
  const end = addDays(start, 6);

  const startLabel =
    start.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
      }
    );

  const endLabel =
    end.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
      }
    );

  return `${startLabel} – ${endLabel}`;
}

function formatDuration(
  minutes: number
): string {
  const totalMinutes =
    Math.round(minutes);

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const remainingMinutes =
    totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatBpm(
  value: number | null
): string {
  return value == null
    ? '--'
    : `${Math.round(value)} bpm`;
}

function capitalize(
  value: string
): string {
  if (!value) {
    return value;
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function formatLocalTime(
  utcString: string,
  offsetSeconds: number
): string {
  const utcDate =
    new Date(utcString);

  const localMillis =
    utcDate.getTime() +
    offsetSeconds * 1000;

  const localDate =
    new Date(localMillis);

  return localDate.toLocaleTimeString(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }
  );
}

function formatDreamMood(
  stats: WeeklySleepStats
): string {
  const parts: string[] = [];

  if (stats.greatDreams > 0) {
    parts.push(
      `${stats.greatDreams} great`
    );
  }

  if (stats.goodDreams > 0) {
    parts.push(
      `${stats.goodDreams} good`
    );
  }

  if (stats.neutralDreams > 0) {
    parts.push(
      `${stats.neutralDreams} neutral`
    );
  }

  if (stats.badDreams > 0) {
    parts.push(
      `${stats.badDreams} bad`
    );
  }

  if (stats.nightmares > 0) {
    parts.push(
      `${stats.nightmares} nightmare`
    );
  }

  return (
    parts.join(' · ') || '--'
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

  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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

  weekArrowDisabled: {
    opacity: 0.4,
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

  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  dayItem: {
    alignItems: 'center',
    width: 38,
  },

  dayLabel: {
    fontSize: 11,
    marginBottom: 7,
  },

  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayCircleSelected: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  dayNumber: {
    fontSize: 14,
  },

  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.lilac,
    marginTop: 6,
  },

  scrollContent: {
    paddingBottom: 40,
    gap: 4,
  },

  section: {
    marginBottom: 20,
    gap: 10,
  },

  sectionTitle: {
    marginLeft: 4,
    fontSize: 15,
    letterSpacing: 0.8,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitleInline: {
    marginLeft: 4,
    fontSize: 17,
  },

  sectionCount: {
    fontSize: 12,
    marginRight: 4,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    gap: 18,
  },

  sleepTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timeValue: {
    fontSize: 17,
    fontWeight: '500',
  },

  timeLabel: {
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 3,
  },

  wakeTime: {
    alignItems: 'flex-end',
  },

  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  duration: {
    fontSize: 12,
    fontWeight: '600',
  },

  sleepTimeline: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },

  sleepTimelineFill: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lilac,
    opacity: 0.65,
  },

  stageChart: {
    gap: 11,
  },

  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stageLabel: {
    width: 48,
    fontSize: 10,
    letterSpacing: 0.5,
  },

  stageTrack: {
    flex: 1,
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },

  stageBlock: {
    height: '100%',
    backgroundColor: Colors.lilac,
    opacity: 0.7,
    borderRadius: 4,
  },

  stageMinutes: {
    width: 40,
    marginLeft: 8,
    fontSize: 10,
    textAlign: 'right',
  },

  heartRateContainer: {
    flexDirection: 'row',
    height: 125,
  },

  hrLabels: {
    width: 32,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  hrLabel: {
    fontSize: 9,
  },

  hrChart: {
    flex: 1,
    position: 'relative',
  },

  gridLine: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.border,
    marginBottom: 40,
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
    backgroundColor: Colors.lilac,
  },

  hrSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  metric: {
    alignItems: 'center',
    flex: 1,
  },

  metricLabel: {
    fontSize: 11,
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 13,
    fontWeight: '500',
  },

  dreamCards: {
    gap: 12,
    paddingRight: 20,
  },

  dreamCard: {
    width: 165,
    minHeight: 110,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 8,
  },

  dreamCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dreamNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dreamNumberText: {
    color: Colors.background,
    fontSize: 11,
    fontWeight: '600',
  },

  dreamType: {
    fontSize: 10,
  },

  dreamMood: {
    fontSize: 15,
    fontWeight: '600',
  },

  dreamTags: {
    fontSize: 11,
    lineHeight: 17,
  },

  emptyDreams: {
    minHeight: 90,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
  },

  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  statsSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  statsRows: {
    gap: 0,
  },

  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  insightMetric: {
    flex: 1,
  },

  insightLabel: {
    fontSize: 11,
  },

  insightValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },

  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  emptyTitle: {
    textAlign: 'center',
  },

  emptyText: {
    textAlign: 'center',
    lineHeight: 21,
    fontSize: 13,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 12,
  },

  loadingText: {
    fontSize: 12,
  },

  retryButton: {
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  retryText: {
    color: Colors.lilac,
    fontWeight: '600',
  },


  wizardIcon: {
    width: 50,
    height: 50,
  },
});