import { Feather } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();

  console.log('🔥 Login platform:', Platform.OS);

  // iOS/Android Google OAuth (expo-auth-session)
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    selectAccount: true,
  });

  // Process expo-auth-session response (iOS/Android only)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    if (response?.type !== 'success') {
      return;
    }

    const { id_token } = response.params;

    if (!id_token) {
      console.error('Google sign-in did not return an ID token');
      return;
    }

    signInWithGoogle(id_token)
      .then(() => {
        console.log('🔥 Firebase Google sign-in successful');
      })
      .catch((error) => {
        console.error(
          '🔥 Firebase Google sign-in failed:',
          error
        );
      });
  }, [response, signInWithGoogle]);

async function handleGoogleSignIn() {
  try {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);

      console.log('🔥 WEB GOOGLE SUCCESS:', result.user.email);

      return;
    }

    // iOS / Android
    if (!request) {
      console.log('🔥 Google request not ready');
      return;
    }

    await promptAsync();
  } catch (error: any) {
    console.error('🔥 GOOGLE SIGN-IN ERROR:', error);
    console.error('🔥 ERROR CODE:', error?.code);
    console.error('🔥 ERROR MESSAGE:', error?.message);
    console.error('🔥 ERROR CUSTOM DATA:', error?.customData);
    console.error('🔥 ERROR NAME:', error?.name);
  }
}

  return (
    <ThemedView style={styles.container}>
      <Starfield />

      <View style={styles.content}>
        <Feather
          name="moon"
          size={42}
          color={Colors.lilac}
        />

        <ThemedText
          type="title"
          style={styles.title}
        >
          Dream Atlas
        </ThemedText>

        <ThemedText
          color="textMuted"
          style={styles.subtitle}
        >
          Your dreams, remembered.
        </ThemedText>

        <Pressable
          onPress={handleGoogleSignIn}
          style={styles.googleButton}
        >
          <Feather
            name="log-in"
            size={20}
            color={Colors.text}
          />

          <ThemedText style={styles.buttonText}>
            Continue with Google
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 16,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 40,
  },
  googleButton: {
    width: '100%',
    maxWidth: 360,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
  },
});