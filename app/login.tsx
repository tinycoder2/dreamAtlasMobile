import { Feather } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Starfield } from '@/components/starfield';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Radius } from '@/constants/theme';
import { auth } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();



WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      if (id_token) {
        const credential = GoogleAuthProvider.credential(id_token);

        signInWithCredential(auth, credential).catch((error) => {
          console.error('Firebase Google sign-in failed:', error);
        });
      }
    }
  }, [response]);

  return (
    <ThemedView style={styles.container}>
      <Starfield />

      <View style={styles.content}>
        <Feather name="moon" size={42} color={Colors.lilac} />

        <ThemedText type="title" style={styles.title}>
          Dream Atlas
        </ThemedText>

        <ThemedText color="textMuted" style={styles.subtitle}>
          Your dreams, remembered.
        </ThemedText>

        <Pressable
          disabled={!request}
          onPress={() => promptAsync()}
          style={styles.googleButton}>
          <Feather name="log-in" size={20} color={Colors.text} />

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