import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  type User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let pendingHashSignIn = false;

    // On web: check if we just returned from a Google OAuth redirect.
    // Google's implicit flow puts the id_token in the URL hash fragment.
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = window.location.hash;

      if (hash.includes('id_token=')) {
        pendingHashSignIn = true;

        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get('id_token');

        // Clear the hash immediately so it won't be re-processed on
        // subsequent renders or hot-reloads.
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        );

        if (idToken) {
          console.log('🔥 Found id_token in URL hash, signing in…');

          const credential = GoogleAuthProvider.credential(idToken);

          signInWithCredential(auth, credential)
            .then((result) => {
              console.log('🔥 Redirect sign-in OK:', result.user.email);
              // onAuthStateChanged will fire with the user next
            })
            .catch((error) => {
              console.error('🔥 Redirect sign-in failed:', error);
              pendingHashSignIn = false;
              setLoading(false);
            });
        } else {
          pendingHashSignIn = false;
        }
      }
    }

    return onAuthStateChanged(auth, (currentUser) => {
      console.log('🔥 AUTH STATE:', currentUser?.email ?? 'NULL');
      setUser(currentUser);

      // If a hash-based sign-in is in progress and we received a null user
      // (the initial auth state), keep loading=true so AuthGate doesn't
      // redirect to /login and strip the hash before sign-in completes.
      if (pendingHashSignIn && !currentUser) {
        return;
      }

      setLoading(false);
    });
  }, []);

  async function signInWithGoogle(idToken: string) {
    console.log('🔥 GOOGLE ID TOKEN RECEIVED');

    const credential = GoogleAuthProvider.credential(idToken);

    const result = await signInWithCredential(auth, credential);

    console.log('🔥 FIREBASE SIGN-IN:', result.user.email);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}