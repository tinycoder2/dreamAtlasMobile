import { DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { migrateDbIfNeeded } from '@/services/db';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: 'index',
};

const dreamTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.lilac,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.blush,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="dreams.db" onInit={migrateDbIfNeeded}>
        <ThemeProvider value={dreamTheme}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.background } }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="dream/[date]" options={{ title: 'Dreams' }} />
            <Stack.Screen
              name="dream/entry/[id]"
              options={{ presentation: 'modal', title: 'Dream entry' }}
            />
            <Stack.Screen name="list" options={{ title: 'All Dreams' }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
