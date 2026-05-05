import { router } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // El _layout.tsx detectará al usuario y permitirá la entrada a (tabs)
        router.replace('/(tabs)'); 
      })
      .catch((error) => {
        // Mensaje más claro para el usuario
        Alert.alert("Error de Acceso", "El correo o la contraseña no son válidos.");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pizzería KAICLO FOOD 🍕</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {/* --- ESTO ES LO NUEVO: Botón para ir a registrarse --- */}
      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => router.push('/registro')}
      >
        <Text style={styles.secondaryButtonText}>¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#f44336' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 20, borderRadius: 10, fontSize: 16 },
  button: { backgroundColor: '#f44336', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  // Estilos para el nuevo botón de registro
  secondaryButton: { marginTop: 25, alignItems: 'center' },
  secondaryButtonText: { color: '#555', fontSize: 14, textDecorationLine: 'underline' }
});