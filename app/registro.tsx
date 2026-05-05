import { router } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegistro = async () => {
    if (!nombre || !email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const auth = getAuth();
    try {
      // 1. Crear el usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Crear el documento del usuario en Firestore con rol de 'cliente'
      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: nombre,
        correo: email,
        rol: 'cliente' // Por defecto, todos los que se registren aquí son clientes
      });

      Alert.alert("¡Bienvenido!", "Cuenta creada con éxito");
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la cuenta. Revisa si el correo ya existe.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Únete a KAICLO FOOD 🍕</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Tu nombre completo"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegistro}>
        <Text style={styles.buttonText}>Crear mi cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
        <Text style={{ color: '#555', textAlign: 'center' }}>Volver al Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#4CAF50' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 15, borderRadius: 10 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});