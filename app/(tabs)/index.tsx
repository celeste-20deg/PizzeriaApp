//app/(tabs)/index.tsx
// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  icon: string;
}

interface ItemCarrito extends Producto {
  cantidad: number;
}

export default function PedidosScreen() {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [cantidadInput, setCantidadInput] = useState('1');
  const auth = getAuth();

  // --- LÓGICA DE ESCUCHA EN TIEMPO REAL (PARA CONFIRMACIÓN) ---
  useEffect(() => {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) return;

    const q = query(
      collection(db, "pedidos"),
      where("clienteId", "==", usuarioActual.uid),
      where("estado", "==", "POR_CONFIRMAR")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const pedidoData = change.doc.data();
          // Pasamos el ID, los items y el total para el desglose del Alert
          mostrarAlertaConfirmacion(change.doc.id, pedidoData.items, pedidoData.total);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const mostrarAlertaConfirmacion = (pedidoId: string, items: any[], total: number) => {
    // Generamos el detalle línea por línea: Cantidad x Nombre - Subtotal
    const detallePedido = items.map(item => 
      `• ${item.cantidad}x ${item.nombre} - ${(item.cantidad * item.precio).toFixed(2)} Bs`
    ).join('\n');

    const mensajeCompleto = 
      `Detalle de tu orden:\n${detallePedido}\n\n` + 
      `Total: ${total.toFixed(2)} Bs\n\n` +
      `¿Confirmas que recibiste tu pedido correctamente?`;

    Alert.alert(
      "¡Tu pedido ha llegado! 🍕",
      mensajeCompleto,
      [
        { text: "Aún no", style: "cancel" },
        { 
          text: "Sí, Recibido", 
          onPress: () => finalizarPedidoCliente(pedidoId),
          style: "default"
        }
      ],
      { cancelable: false }
    );
  };

  const finalizarPedidoCliente = async (pedidoId: string) => {
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        estado: "ENTREGADO",
        fechaConfirmacion: new Date().toLocaleString(),
        confirmadoCliente: true
      });
      Alert.alert("¡Disfruta!", "El pedido se ha marcado como entregado satisfactoriamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo confirmar la recepción.");
    }
  };
  // ---------------------------------------------------------

  const menu: Producto[] = [
    { id: '1', nombre: 'Café', precio: 10, icon: 'cafe-outline' },
    { id: '2', nombre: 'Pizza', precio: 50, icon: 'pizza-outline' },
    { id: '3', nombre: 'Pollo', precio: 35, icon: 'restaurant-outline' },
    { id: '4', nombre: 'Helado', precio: 15, icon: 'ice-cream-outline' },
    { id: '5', nombre: 'Sandwich', precio: 25, icon: 'fast-food-outline' },
    { id: '6', nombre: 'Picante', precio: 30, icon: 'flame-outline' },
  ];

  const agregarAlCarrito = (producto: Producto) => {
    const cant = parseInt(cantidadInput) || 1;
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + cant } : item
        );
      }
      return [...prev, { ...producto, cantidad: cant }];
    });
    setCantidadInput('1');
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  };

  const handleEnviarPedido = async () => {
    const usuarioActual = auth.currentUser;
    if (carrito.length === 0) {
      Alert.alert("Error", "El carrito está vacío");
      return;
    }

    try {
      await addDoc(collection(db, "pedidos"), {
        clienteId: usuarioActual?.uid,
        clienteEmail: usuarioActual?.email || "Anónimo",
        items: carrito,
        total: calcularTotal(),
        estado: "PENDIENTE",
        confirmadoCliente: false,
        fecha: new Date().toLocaleString()
      });
      Alert.alert("¡Éxito!", "Pedido enviado. Espera a que el admin te lo entregue.");
      setCarrito([]);
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el pedido.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.label}>Cantidad para el siguiente plato:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={cantidadInput}
          onChangeText={setCantidadInput}
        />
      </View>

      <Text style={styles.sectionTitle}>MENÚ</Text>
      <View style={styles.menuGrid}>
        {menu.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem} 
            onPress={() => agregarAlCarrito(item)}
          >
            <Ionicons name={item.icon as any} size={30} color="#5D4037" />
            <Text style={styles.menuName}>{item.nombre}</Text>
            <Text style={styles.menuPrice}>{item.precio} Bs</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.resumenContainer}>
        <Text style={styles.sectionTitle}>RESUMEN DE TU PEDIDO</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, { flex: 1 }]}>Cant.</Text>
          <Text style={[styles.headerText, { flex: 2 }]}>Descripción</Text>
          <Text style={[styles.headerText, { flex: 1 }]}>Importe</Text>
          <Text style={[styles.headerText, { flex: 0.5 }]}></Text>
        </View>

        {carrito.map(item => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={{ flex: 1 }}>{item.cantidad}</Text>
            <Text style={{ flex: 2 }}>{item.nombre}</Text>
            <Text style={{ flex: 1 }}>{(item.cantidad * item.precio).toFixed(2)}</Text>
            <TouchableOpacity onPress={() => eliminarDelCarrito(item.id)} style={{ flex: 0.5 }}>
              <Ionicons name="trash-outline" size={18} color="red" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total: {calcularTotal().toFixed(2)} Bs</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEnviarPedido}>
          <Text style={styles.buttonText}>ENVIAR PEDIDO</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfcf0', padding: 15 },
  headerCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#3E2723' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 5, textAlign: 'center', fontSize: 18 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuItem: { backgroundColor: '#fff', width: '48%', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15, elevation: 2 },
  menuName: { fontWeight: 'bold', marginTop: 5 },
  menuPrice: { color: '#795548' },
  resumenContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginTop: 10, marginBottom: 40 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 5 },
  headerText: { fontWeight: 'bold', color: '#888' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 0.5, borderColor: '#eee', alignItems: 'center' },
  totalRow: { marginTop: 15, alignItems: 'flex-end' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  button: { backgroundColor: '#f44336', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});