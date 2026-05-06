import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebaseConfig';

const COLORS = {
  background: "#F5EBDC",
  card: "#FFFFFF",
  input: "#F1E7D6",
  primary: "#E67E22",
  textMain: "#5A4634",
  textSoft: "#7A6E65",
  border: "#E0D6C8"
};

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
          mostrarAlertaConfirmacion(change.doc.id, pedidoData.items, pedidoData.total);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const mostrarAlertaConfirmacion = (pedidoId: string, items: any[], total: number) => {
    const detallePedido = items.map(item => 
      `• ${item.cantidad}x ${item.nombre} - ${(item.cantidad * item.precio).toFixed(2)} Bs`
    ).join('\n');

    const mensajeCompleto = 
      `Detalle de tu orden:\n${detallePedido}\n\n` + 
      `Total: ${total.toFixed(2)} Bs\n\n` +
      `¿Confirmas que recibiste tu pedido correctamente?`;

    Alert.alert("¡Tu pedido ha llegado! 🍕", mensajeCompleto, [
      { text: "Aún no", style: "cancel" },
      { text: "Sí, Recibido", onPress: () => finalizarPedidoCliente(pedidoId) }
    ]);
  };

  const finalizarPedidoCliente = async (pedidoId: string) => {
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        estado: "ENTREGADO",
        fechaConfirmacion: new Date().toLocaleString(),
        confirmadoCliente: true
      });
      Alert.alert("¡Disfruta!", "Pedido confirmado.");
    } catch {
      Alert.alert("Error", "No se pudo confirmar.");
    }
  };

  const menu: Producto[] = [
    { id: '1', nombre: 'Café', precio: 10, icon: 'cafe' },
    { id: '2', nombre: 'Pizza', precio: 50, icon: 'pizza' },
    { id: '3', nombre: 'Pollo', precio: 35, icon: 'restaurant' },
    { id: '4', nombre: 'Helado', precio: 15, icon: 'ice-cream' },
    { id: '5', nombre: 'Sandwich', precio: 25, icon: 'fast-food' },
    { id: '6', nombre: 'Picante', precio: 30, icon: 'flame' },
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
      Alert.alert("¡Éxito!", "Pedido enviado.");
      setCarrito([]);
    } catch {
      Alert.alert("Error", "No se pudo enviar.");
    }
  };

  // 🔥 BOTÓN SALIR
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch {
      Alert.alert("Error", "No se pudo cerrar sesión");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>

        {/* BOTÓN SALIR */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.logoCircle}>
          <Ionicons name="pizza" size={30} color={COLORS.primary} />
        </View>
        <Text style={styles.logoText}>KAICLO</Text>
        <Text style={styles.logoSub}>FOOD</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 15 }}>
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
              <Ionicons name={item.icon as any} size={32} color={COLORS.primary} />
              <Text style={styles.menuName}>{item.nombre}</Text>

              <View style={styles.priceCircle}>
                <Text style={styles.priceText}>{item.precio} Bs</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.resumenContainer}>
          <Text style={styles.sectionTitle}>TU PEDIDO:</Text>

          {carrito.map(item => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={{ flex: 1 }}>{item.cantidad}</Text>
              <Text style={{ flex: 2 }}>{item.nombre}</Text>
              <Text style={{ flex: 1 }}>{(item.cantidad * item.precio).toFixed(2)}</Text>

              <TouchableOpacity onPress={() => eliminarDelCarrito(item.id)}>
                <Ionicons name="trash" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>
              Total: {calcularTotal().toFixed(2)} Bs
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleEnviarPedido}>
            <Text style={styles.buttonText}>CONFIRMAR PEDIDO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    alignItems: "center",
    paddingVertical: 10
  },

  logoutBtn: {
    position: "absolute",
    top: 10,
    right: 15,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    elevation: 4
  },

  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4
  },

  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textMain,
    letterSpacing: 2,
    marginTop: 5
  },

  logoSub: {
    fontSize: 12,
    color: COLORS.textSoft,
    letterSpacing: 2
  },

  headerCard: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 18,
    marginBottom: 20,
    elevation: 3
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 10,
    color: COLORS.textMain
  },

  label: {
    fontSize: 14,
    color: COLORS.textSoft,
    marginBottom: 5
  },

  input: {
    backgroundColor: COLORS.input,
    borderRadius: 12,
    padding: 10,
    textAlign: 'center',
    fontSize: 18
  },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  menuItem: {
    backgroundColor: COLORS.card,
    width: '48%',
    padding: 15,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3
  },

  menuName: {
    fontWeight: '600',
    marginTop: 5,
    color: COLORS.textMain
  },

  priceCircle: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50
  },

  priceText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  resumenContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 15,
    marginTop: 10,
    marginBottom: 40
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: COLORS.border,
    alignItems: 'center'
  },

  totalRow: {
    marginTop: 15,
    alignItems: 'flex-end'
  },

  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary
  },

  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});