import { router } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig'; // Asegúrate de que esta ruta sea correcta

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: nombre,
        correo: email,
        rol: 'cliente' 
      });

      Alert.alert("¡Bienvenido!", "Cuenta creada con éxito");
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la cuenta. Revisa si el correo ya existe.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Título con el estilo de tu Login */}
      <Text style={styles.title}>Únete a KAICLO FOOD</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre completo"
          placeholderTextColor="#999"
          value={nombre}
          onChangeText={setNombre}
        />

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña (mín. 6 caracteres)"
          placeholderTextColor="#999"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegistro}>
          <Text style={styles.buttonText}>Crear mi cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* Tu imagen del dumpling señalando */}
      <Image
        source={require('../assets/logo_registro.png')} 
        style={styles.bigLogo}
      />

      <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
        <Text style={styles.linkText}>Volver al Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 30, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 40, 
    color: '#5A4634' // Color marrón de tu login
  },
  formContainer: {
    width: '100%',
  },
  input: { 
    width: '100%',
    height: 55,
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    paddingHorizontal: 20, 
    marginBottom: 15, 
    borderRadius: 15, // Mismo redondeado que tu login
    fontSize: 16,
    color: '#5A4634'
  },
  button: { 
    backgroundColor: '#E67E22', // Naranja de tu botón "Entrar"
    height: 55, 
    borderRadius: 15, 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  bigLogo: {
    width: 200,
    height: 200,
    marginTop: 20,
    resizeMode: 'contain',
  },
  linkText: { 
    color: '#5A4634', 
    textAlign: 'center', 
    fontSize: 16,
    textDecorationLine: 'underline' 
  }
});
