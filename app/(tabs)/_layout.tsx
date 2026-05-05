import { Tabs, router } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';
// Importamos los iconos
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().rol);
        }
      }
      setLoading(false);
    };
    checkUserRole();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.replace('/login');
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#f44336" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#f44336',
      // Botón de Salir global arriba a la derecha
      headerRight: () => (
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      ),
    }}>
      {/* Pestaña de Pedidos */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hacer Pedido',
          headerTitle: 'KAICLO FOOD 🍕',
          tabBarLabel: 'Pedidos',
          // Este es el icono de la pizza
          tabBarIcon: ({ color }) => <Ionicons name="pizza" size={24} color={color} />,
        }}
      />

      {/* Pestaña de Administración */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Panel Admin',
          headerTitle: 'Administración',
          // Icono de herramientas
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
          // IMPORTANTE: Si no es admin, ocultamos la pestaña
          href: role === 'admin' ? '/explore' : null, 
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 15, backgroundColor: '#f44336', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});