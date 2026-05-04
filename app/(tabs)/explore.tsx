import { getAuth } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { db } from '../../firebaseConfig';

export default function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Obtenemos los datos del admin actual
  const auth = getAuth();
  const adminEmail = auth.currentUser?.email;

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("fecha", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setPedidos(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f44336" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* --- NUEVA CABECERA DE BIENVENIDA --- */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>Bienvenido, Admin 🛠️</Text>
        <Text style={styles.adminEmail}>{adminEmail}</Text>
      </View>

      <Text style={styles.sectionTitle}>Historial de Pedidos</Text>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.userName}>{item.nombre || "Usuario"}</Text>
              <Text style={styles.date}>{item.fecha}</Text>
            </View>
            
            <Text style={styles.productText}>
              🍕 {item.producto} (x{item.unidades})
            </Text>
            
            <Text style={styles.totalText}>Total: {item.total} Bs</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: item.estado === 'PENDIENTE' ? '#FFD700' : '#4CAF50' }]}>
              <Text style={styles.statusText}>{item.estado}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Estilos para el mensaje de bienvenida
  welcomeBox: { 
    backgroundColor: '#333', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 20,
    elevation: 4
  },
  welcomeText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  adminEmail: { color: '#bbb', fontSize: 14, marginTop: 5 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#444' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  userName: { fontWeight: 'bold', fontSize: 15, color: '#f44336' },
  date: { fontSize: 11, color: '#999' },
  productText: { fontSize: 16, color: '#333', marginBottom: 5 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  statusBadge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 5 },
  statusText: { fontSize: 11, fontWeight: 'bold' }
});