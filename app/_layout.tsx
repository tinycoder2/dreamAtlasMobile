import { AuthProvider } from '@/context/AuthContext';
import { DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
WebBrowser.maybeCompleteAuthSession();
// import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import * as Linking from 'expo-linking';
import { Redirect, Stack, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
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
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  const healthFlowUid = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      healthFlowUid.current = null;
      return;
    }

    // Prevent duplicate execution for the same signed-in user.
    if (healthFlowUid.current === user.uid) {
      return;
    }

    healthFlowUid.current = user.uid;

    async function setupHealth() {
      try {
        // 1. Check whether Google Health is already connected.
        const status = await api.get<{
          connected: boolean;
        }>('/api/health/google/status');

        console.log(
          'Google Health connection status:',
          status.connected
        );

        // 2. First-time connection.
        if (!status.connected) {
          console.log(
            'Google Health not connected. Starting authorization...'
          );

          const { authorizationUrl } =
            await api.get<{
              authorizationUrl: string;
            }>('/api/health/google/connect-url');

          const redirectUri =
            Platform.OS === 'web'
              ? `${window.location.origin}/google-health-callback`
              : Linking.createURL('google-health-callback');

          console.log('OAuth redirect URI:', redirectUri);

          console.log(
            'Opening Google Health authorization...'
          );

          const result =
            await WebBrowser.openAuthSessionAsync(
              authorizationUrl,
              redirectUri
            );

          console.log(
            'Google Health OAuth result:',
            result
          );

          // User completed Google authorization.
          if (
            result.type === 'success' &&
            result.url.includes('status=connected')
          ) {
            console.log(
              'Google Health connected. Starting ingestion...'
            );

            const ingestion =
              await api.post(
                '/api/health/google/ingest',
                {}
              );

            console.log(
              'Health ingestion after authorization:',
              ingestion
            );
          } else if (result.type === 'cancel') {
            console.log(
              'Google Health authorization cancelled.'
            );
          }

          return;
        }

        // 3. Already connected.
        console.log(
          'Google Health already connected. Starting ingestion...'
        );

        const ingestion =
          await api.post(
            '/api/health/google/ingest',
            {}
          );

        console.log(
          'Health ingestion:',
          ingestion
        );

      } catch (error) {
        console.error(
          'Health setup/ingestion failed:',
          error
        );
      }
    }

    setupHealth();

  }, [user, loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color={Colors.lilac}
        />
      </View>
    );
  }

  const inLogin = segments[0] === 'login';

  if (!user && !inLogin) {
    return <Redirect href="/login" />;
  }

  if (user && inLogin) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <SQLiteProvider databaseName="dreams.db" onInit={migrateDbIfNeeded}> */}
      <AuthProvider>
        <AuthGate>
          <ThemeProvider value={dreamTheme}>
            <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.background } }}>

              <Stack.Screen
                name="login"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="dream/[date]"
                options={{ title: 'Dreams' }}
              />

              <Stack.Screen
                name="dream/entry/[id]"
                options={{
                  presentation: 'modal',
                  title: 'Dream entry',
                }}
              />

              <Stack.Screen
                name="list"
                options={{ title: 'All Dreams' }}
              />

              <Stack.Screen
                name="settings"
                options={{ title: 'Settings' }}
              />
            </Stack>

            <StatusBar style="light" />
          </ThemeProvider>
        </AuthGate>
      </AuthProvider>
      {/* </SQLiteProvider> */}
    </GestureHandlerRootView>
  );
}
