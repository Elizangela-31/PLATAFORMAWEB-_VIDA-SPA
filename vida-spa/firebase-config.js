// ============================================================
// CONFIGURACIÓN DE FIREBASE - VIDA SPA
// ============================================================
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto (ej. "vida-spa")
// 3. Agrega una app web (ícono </>) y copia aquí tu configuración
// 4. Activa Firestore Database (modo producción) y
//    Authentication > Método de acceso > Correo/contraseña
// Revisa el archivo README.md para la guía completa paso a paso.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD7kugmrzX1_XgSh_-yxMH6_CiZKFz7l7A",
  authDomain: "vida-spa.firebaseapp.com",
  projectId: "vida-spa",
  storageBucket: "vida-spa.firebasestorage.app",
  messagingSenderId: "702194403355",
  appId: "1:702194403355:web:090a384a134b9d1fac90be",
  measurementId: "G-HM4RE8V62X"
};

const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
