import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';

export default function PedidosScreen() {
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costo, setCosto] = useState('');

  const auth = getAuth();

  const handlePedido = async () => {
    const usuarioActual = auth.currentUser; // Lo obtenemos justo al presionar el botón

    if (!producto || !cantidad || !costo) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    // Aseguramos que el nombre no sea "Desconocido"
    const identificadorUsuario = usuarioActual?.email || "Usuario Sin Correo";

    const cantidadNumerica = parseInt(cantidad);
    const costoNumerico = parseFloat(costo);
    const totalCalculado = cantidadNumerica * costoNumerico;

    try {
      await addDoc(collection(db, "pedidos"), {
        nombre: identificadorUsuario, 
        producto: producto,
        unidades: cantidadNumerica,
        costo: costoNumerico,
        total: totalCalculado,
        estado: "PENDIENTE",
        fecha: new Date().toLocaleString()
      });
      
      Alert.alert("¡Éxito!", `Pedido enviado por ${identificadorUsuario}. Total: ${totalCalculado} Bs`);
      setProducto('');
      setCantidad('');
      setCosto('');
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con la base de datos");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Realiza tu Pedido 🍕</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>¿Qué pizza deseas?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Pizza Margarita"
          value={producto}
          onChangeText={setProducto}
        />

        <Text style={styles.label}>Cantidad (Unidades):</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          value={cantidad}
          keyboardType="numeric"
          onChangeText={setCantidad}
        />

        <Text style={styles.label}>Costo Unitario (Bs):</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={costo}
          keyboardType="numeric"
          onChangeText={setCosto}
        />

        {cantidad && costo ? (
          <Text style={styles.totalPreview}>
            Total a pagar: {parseInt(cantidad) * parseFloat(costo)} Bs
          </Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handlePedido}>
          <Text style={styles.buttonText}>ENVIAR PEDIDO</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 20, elevation: 5 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#eee', padding: 15, marginBottom: 20, borderRadius: 12 },
  totalPreview: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginBottom: 20 },
  button: { backgroundColor: '#f44336', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});