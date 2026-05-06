import { getAuth } from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebaseConfig';

const COLORS = {
  background: "#F5EBDC",
  card: "#FFFFFF",
  primary: "#E67E22",
  textMain: "#5A4634",
  textSoft: "#7A6E65",
  border: "#E0D6C8"
};

interface ItemPedido {
  nombre: string;
  cantidad: number;
}

interface Pedido {
  id: string;
  cliente: string;
  fecha: string;
  items: ItemPedido[];
  total: number;
  estado: string;
}

export default function AdminPanel() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  
  const auth = getAuth();
  const adminEmail = auth.currentUser?.email;

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docsArr: Pedido[] = []; 
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        docsArr.push({ 
          id: doc.id, 
          cliente: data.clienteEmail || "Usuario",
          fecha: data.fecha || "",
          items: data.items || [], 
          total: data.total || 0,
          estado: data.estado || "PENDIENTE"
        });
      });

      setPedidos(docsArr);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const marcarComoEntregado = async (pedidoId: string) => {
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        estado: "POR_CONFIRMAR"
      });
      Alert.alert("Éxito", "Entrega notificada al cliente.");
    } catch {
      Alert.alert("Error", "No se pudo actualizar.");
    }
  };

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return { bg: '#FFD700', text: '#000' };
      case 'POR_CONFIRMAR': return { bg: '#2196F3', text: '#fff' };
      case 'ENTREGADO': return { bg: '#4CAF50', text: '#fff' };
      default: return { bg: '#eee', text: '#000' };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>KAICLO ADMIN</Text>
              <Text style={styles.adminEmail}>{adminEmail}</Text>
            </View>

            <Text style={styles.sectionTitle}>Gestión de Órdenes</Text>
          </>
        }
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const colors = getStatusStyle(item.estado);

          return (
            <View style={styles.card}>

              <View style={styles.cardHeader}>
                <Text style={styles.userName}>{item.cliente}</Text>
                <Text style={styles.date}>{item.fecha}</Text>
              </View>

              <View style={styles.productsList}>
                {item.items.map((prod, index) => (
                  <Text key={index} style={styles.productText}>
                    • {prod.nombre} (x{prod.cantidad})
                  </Text>
                ))}
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.totalText}>{item.total.toFixed(2)} Bs</Text>

                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {item.estado}
                  </Text>
                </View>
              </View>

              {item.estado === 'PENDIENTE' && (
                <TouchableOpacity 
                  style={styles.deliveryBtn}
                  onPress={() => marcarComoEntregado(item.id)}
                >
                  <Text style={styles.deliveryBtnText}>MARCAR ENTREGADO</Text>
                </TouchableOpacity>
              )}

            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 15
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  header: {
    alignItems: "center",
    marginVertical: 10
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMain,
    letterSpacing: 2
  },

  adminEmail: {
    fontSize: 12,
    color: COLORS.textSoft
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: COLORS.textMain,
    textAlign: "center"
  },

  card: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 18,
    marginBottom: 15,
    elevation: 3
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },

  userName: {
    fontWeight: "bold",
    color: COLORS.primary
  },

  date: {
    fontSize: 11,
    color: COLORS.textSoft
  },

  productsList: {
    marginVertical: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border
  },

  productText: {
    fontSize: 14,
    color: COLORS.textMain
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },

  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20
  },

  statusText: {
    fontSize: 11,
    fontWeight: "bold"
  },

  deliveryBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },

  deliveryBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13
  }
});