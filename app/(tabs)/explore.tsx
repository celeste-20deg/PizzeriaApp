//app/(tabs)/explore.tsx
// app/(tabs)/explore.tsx
import { getAuth } from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';

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
          cliente: data.clienteEmail || data.cliente || "Usuario", // Ajustado para usar email del cliente
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

  // FUNCIÓN PARA QUE EL ADMIN MARQUE LA ENTREGA
  const marcarComoEntregado = async (pedidoId: string) => {
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        estado: "POR_CONFIRMAR" // Esto dispara la alerta en el index.tsx del cliente
      });
      Alert.alert("Éxito", "Entrega notificada al cliente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el estado.");
    }
  };

  const getStatusStyle = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return { bg: '#FFD700', text: '#000' }; // Amarillo
      case 'POR_CONFIRMAR': return { bg: '#2196F3', text: '#fff' }; // Azul
      case 'ENTREGADO': return { bg: '#4CAF50', text: '#fff' }; // Verde
      default: return { bg: '#eee', text: '#000' };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f44336" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>Bienvenido, Admin 🛠️</Text>
        <Text style={styles.adminEmail}>{adminEmail}</Text>
      </View>

      <Text style={styles.sectionTitle}>Gestión de Órdenes</Text>

      <FlatList
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
              
              <Text style={styles.totalText}>Total: {item.total.toFixed(2)} Bs</Text>
              
              <View style={styles.actionContainer}>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={[styles.statusText, { color: colors.text }]}>{item.estado}</Text>
                </View>

                {/* SOLO MOSTRAR BOTÓN SI ESTÁ PENDIENTE */}
                {item.estado === 'PENDIENTE' && (
                  <TouchableOpacity 
                    style={styles.deliveryBtn} 
                    onPress={() => marcarComoEntregado(item.id)}
                  >
                    <Text style={styles.deliveryBtnText}>Entregar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeBox: { backgroundColor: '#333', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 4 },
  welcomeText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  adminEmail: { color: '#bbb', fontSize: 14, marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  userName: { fontWeight: 'bold', fontSize: 15, color: '#f44336' },
  date: { fontSize: 11, color: '#999' },
  productsList: { marginVertical: 8, borderLeftWidth: 2, borderLeftColor: '#eee', paddingLeft: 10 },
  productText: { fontSize: 14, color: '#333', marginBottom: 2 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 5 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  deliveryBtn: { backgroundColor: '#f44336', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  deliveryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});