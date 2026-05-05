import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// 1. Importamos las herramientas de Auth y el almacenamiento
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDU7FIdAU8YiaqWyWr_wt5daXkwy2KnHNo",
  authDomain: "pizzeriaapp-f6f5c.firebaseapp.com",
  projectId: "pizzeriaapp-f6f5c",
  storageBucket: "pizzeriaapp-f6f5c.firebasestorage.app",
  messagingSenderId: "822342754372",
  appId: "1:822342754372:web:3dc631a27c700e3b69c11"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// 2. Inicializamos Auth con persistencia de datos (esto quita el error)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Exportamos 'db' para que el formulario de pedidos pueda usarlo
export const db = getFirestore(app);