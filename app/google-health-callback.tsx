import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function GoogleHealthCallback() {
  const { status } = useLocalSearchParams<{
    status?: string;
  }>();

  const router = useRouter();

  useEffect(() => {
    // The auth session detects the callback URL.
    // This route is also a safe fallback.
    if (status === 'connected') {
      router.replace('/');
    } else if (status === 'error') {
      router.replace('/');
    }
  }, [status]);

  return <View style={{ flex: 1 }} />;
}