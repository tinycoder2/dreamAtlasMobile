import { useAuth } from '@/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius } from '@/constants/theme';
import { exportDreamsAsJson } from '@/services/export';
import {
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
  cancelNightlyReminder,
  getScheduledReminder,
  isReminderSupported,
  requestReminderPermission,
  scheduleNightlyReminder,
} from '@/services/notifications';

function formatTime(hour: number, minute: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [reminderOn, setReminderOn] = useState(false);
  const [hour, setHour] = useState(DEFAULT_REMINDER_HOUR);
  const [minute, setMinute] = useState(DEFAULT_REMINDER_MINUTE);
  const [exporting, setExporting] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    getScheduledReminder().then((reminder) => {
      if (reminder) {
        setReminderOn(true);
        setHour(reminder.hour);
        setMinute(reminder.minute);
      }
    });
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out of Dream Atlas?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
        },
      ],
    );
  };
  async function onToggleReminder(value: boolean) {
    if (value) {
      const granted = await requestReminderPermission();
      if (!granted) {
        Alert.alert('Permission needed', 'Enable notifications for Dream Atlas in system settings.');
        return;
      }
      await scheduleNightlyReminder(hour, minute);
    } else {
      await cancelNightlyReminder();
    }
    setReminderOn(value);
  }

  async function onTimeChange(_event: DateTimePickerEvent, selected?: Date) {
    if (!selected) return;
    const newHour = selected.getHours();
    const newMinute = selected.getMinutes();
    setHour(newHour);
    setMinute(newMinute);
    if (reminderOn) {
      await scheduleNightlyReminder(newHour, newMinute);
    }
  }

  async function onExport() {
    setExporting(true);
    try {
      await exportDreamsAsJson();
    } finally {
      setExporting(false);
    }
  }

  const timeValue = new Date();
  timeValue.setHours(hour, minute, 0, 0);

  return (
    <View style={styles.root}>
      <Starfield />

      <View style={styles.row}>
        {user?.photoURL && (
          <Image
            source={{ uri: user.photoURL }}
            style={styles.profileImage}
          />
        )}

        <View style={styles.rowText}>
          <ThemedText type="defaultSemiBold">
            {user?.displayName ?? 'Dreamer'}
          </ThemedText>

          <ThemedText color="textMuted">
            {user?.email ?? 'No email available'}
          </ThemedText>
        </View>
      </View>


      <View style={styles.row}>
        <View style={styles.rowText}>
          <ThemedText type="defaultSemiBold">Nightly reminder</ThemedText>
          {!isReminderSupported && (
            <ThemedText color="textMuted" style={styles.hint}>
              Not available on web
            </ThemedText>
          )}
        </View>
        <Switch value={reminderOn} onValueChange={onToggleReminder} disabled={!isReminderSupported} />
      </View>

      {isReminderSupported && (
        <View style={styles.row}>
          <ThemedText color="textSecondary">Reminder time</ThemedText>
          <DateTimePicker
            value={timeValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={onTimeChange}
          />
        </View>
      )}

      {!isReminderSupported && (
        <View style={styles.row}>
          <ThemedText color="textSecondary">Reminder time</ThemedText>
          <ThemedText color="textMuted">{formatTime(hour, minute)}</ThemedText>
        </View>
      )}

      <Pressable style={styles.exportRow} onPress={onExport} disabled={exporting}>
        <Feather name="download" size={18} color={Colors.text} />
        <ThemedText>{exporting ? 'Exporting...' : 'Export dreams as JSON'}</ThemedText>
      </Pressable>

      <Pressable
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        <ThemedText style={styles.logoutText}>
          Log out
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 16,
  },
  rowText: {
    gap: 2,
  },
  hint: {
    fontSize: 13,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 16,
  },
  logoutButton: {
    marginTop: 24,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    fontSize: 16,
  },
});
