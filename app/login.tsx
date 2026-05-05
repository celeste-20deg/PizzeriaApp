import { router } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  // 1. Mantenemos la lógica de tu compañera
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.replace('/(tabs)'); 
      })
      .catch((error) => {
        Alert.alert("Error de Acceso", "El correo o la contraseña no son válidos.");
      });
  };

  return (
    <View style={styles.container}>
      {/* Título de tu diseño */}
      <Text style={styles.logoText}>KAICLO</Text>
      <Text style={styles.logoSub}>FOOD</Text>

      {/* Tu Tarjeta */}
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo_sonriente.png')}// Asegúrate que la ruta sea correcta
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Iniciar Sesión</Text>

        {/* Inputs conectados con la lógica de ella */}
        <TextInput
          placeholder="Correo Electrónico"
          style={styles.input}
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
        />

        {/* Botón con la función de entrada */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Link de registro con la navegación de ella */}
        <TouchableOpacity onPress={() => router.push('/registro')}>
          <Text style={styles.register}>
            ¿No tienes cuenta? <Text style={styles.link}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EBDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900', // Si no carga la fuente Nunito, esto ayuda
    color: '#5A4634',
  },
  logoSub: {
    fontSize: 18,
    color: '#5A4634',
    marginBottom: 20,
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    top: -35,
    right: -10,
    backgroundColor: '#F5EBDC',
    borderRadius: 50,
    padding: 5,
    elevation: 6,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5A4634',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#F1E7D6',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#E67E22',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  register: {
    marginTop: 15,
    color: '#555',
  },
  link: {
    color: '#E67E22',
    fontWeight: 'bold',
  },
});
