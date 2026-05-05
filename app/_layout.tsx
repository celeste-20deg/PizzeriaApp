import { Stack } from 'expo-router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    // onAuthStateChanged devuelve la función de desuscripción directamente
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser); 
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f44336" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 
          QUITAMOS LOS FRAGMENTOS <> </>. 
          En Expo Router, definimos las rutas disponibles. 
          La navegación se controla mediante redirect o el estado del Stack.
      */}
      <Stack.Screen 
        name="login" 
        options={{ redirect: user ? true : false }} 
      />
      <Stack.Screen 
        name="registro" 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ redirect: !user ? true : false }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});
