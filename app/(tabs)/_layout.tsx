import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>

      <Tabs.Screen
        name="index"
        options={{
          title: "Pedidos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fast-food" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}