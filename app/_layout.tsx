import { Stack } from 'expo-router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import SplashScreen from './SplashScreen';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false); 

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsReady(true);
    }, 2000);
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f44336" />
      </View>
    );
  }

 return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        // Si hay usuario, solo mostramos las tabs
        <Stack.Screen name="(tabs)" />
      ) : (
        // Si NO hay usuario, mostramos login y registro
        // Al ponerlos por separado y sin <>, expo los acepta perfecto
        [
          <Stack.Screen key="login" name="login" />,
          <Stack.Screen key="registro" name="registro" />
        ]
      )}
    </Stack>
  );
}
