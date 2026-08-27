import { AuthProvider } from '@/context/AuthContext';
import { DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
// import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';

import { useAuth } from '@/context/AuthContext';
import { Redirect, useSegments } from 'expo-router';


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

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.lilac} />
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
