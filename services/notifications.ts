import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const REMINDER_ID = 'nightly-dream-reminder';
export const DEFAULT_REMINDER_HOUR = 21;
export const DEFAULT_REMINDER_MINUTE = 0;

// Scheduled local notifications aren't implemented on web (expo-notifications
// throws "not available on web" for these calls), so every function here
// no-ops there instead of surfacing that as a crash.
const SUPPORTED = Platform.OS !== 'web';
export const isReminderSupported = SUPPORTED;

export async function requestReminderPermission(): Promise<boolean> {
  if (!SUPPORTED) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNightlyReminder(hour: number, minute: number): Promise<void> {
  if (!SUPPORTED) return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Dream Atlas',
      body: 'Log tonight’s dream before it fades…',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelNightlyReminder(): Promise<void> {
  if (!SUPPORTED) return;
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
}

// The scheduled notification's own trigger is the source of truth for the
// reminder time — no separate settings table needed. Reads back cross
// platform: Android trigger reads back as `daily` with hour/minute
// directly, iOS as `calendar` with hour/minute inside `dateComponents`.
export async function getScheduledReminder(): Promise<{ hour: number; minute: number } | null> {
  if (!SUPPORTED) return null;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const request = scheduled.find((n) => n.identifier === REMINDER_ID);
  if (!request) return null;

  const trigger = request.trigger as { type?: string; hour?: number; minute?: number; dateComponents?: { hour?: number; minute?: number } };
  if (trigger?.type === 'calendar' && trigger.dateComponents) {
    const { hour, minute } = trigger.dateComponents;
    if (hour != null && minute != null) return { hour, minute };
  }
  if (trigger?.hour != null && trigger?.minute != null) {
    return { hour: trigger.hour, minute: trigger.minute };
  }
  return null;
}
