// ==========================================
// ADMIN.JS - VERSIÓN CORREGIDA
// ==========================================

console.log("🚀🚀🚀 ADMIN.JS SE ESTÁ EJECUTANDO 🚀🚀🚀");

import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

console.log("✅ Imports completados");

// ==========================================
// ELEMENTOS DEL DOM - CON VERIFICACIÓN
// ==========================================

function getElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.error(`❌ Elemento "${id}" no encontrado en el HTML`);
  }
  return el;
}

const loginSection = getElement("login-section");
const panelSection = getElement("panel-section");
const loginForm = getElement("login-form");
const loginError = getElement("login-error");
const logoutButton = getElement("logout-btn");
const solicitudesGrid = getElement("solicitudes-grid");
const panelEmpty = getElement("panel-empty");

// ==========================================
// LOGIN
// ==========================================

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("📝 Botón INGRESAR presionado");
    
    if (loginError) loginError.classList.add("hidden");

    const correoInput = document.getElementById("admin-correo");
    const claveInput = document.getElementById("admin-clave");
    
    if (!correoInput || !claveInput) {
      console.error("❌ Inputs de login no encontrados");
      return;
    }

    const correo = correoInput.value.trim();
    const clave = claveInput.value;

    console.log("🔐 Intentando login con:", correo);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, correo, clave);
      console.log("✅ Login exitoso:", userCredential.user.email);
      loginForm.reset();
    } catch (error) {
      console.error("❌ Error de login:", error.code, error.message);
      if (loginError) {
        loginError.textContent = "Correo o clave incorrectos.";
        loginError.classList.remove("hidden");
      }
    }
  });
} else {
  console.error("❌ Formulario de login no encontrado");
}

// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    console.log("🔓 Cerrando sesión");
    signOut(auth);
  });
}

// ==========================================
// UTILIDADES
// ==========================================

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function whatsappHref(data) {
  const telefonoLimpio = data.telefono ? data.telefono.replace(/\D/g, "").replace(/^0/, "") : "0999999999";
  const mensaje = `Hola ${data.nombre || "cliente"}, te escribo de VIDA SPA por tu cita de "${data.interes || "servicio"}".`;
  return `https://wa.me/593${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
}

// ==========================================
// ELIMINAR CITA
// ==========================================

async function eliminarCita(id) {
  if (!confirm('¿Eliminar esta cita permanentemente?')) return;
  
  try {
    await deleteDoc(doc(db, "citas", id));
    console.log("✅ Cita eliminada");
    cargarCitas();
  } catch (error) {
    console.error("❌ Error:", error);
    alert('Error: ' + error.message);
  }
}

// ==========================================
// CAMBIAR ESTADO
// ==========================================

async function cambiarEstado(id, estadoActual) {
  const nuevoEstado = estadoActual === "contactado" ? "pendiente" : "contactado";
  
  try {
    await updateDoc(doc(db, "citas", id), { estado: nuevoEstado });
    console.log("✅ Estado cambiado a:", nuevoEstado);
    cargarCitas();
  } catch (error) {
    console.error("❌ Error:", error);
    alert('Error: ' + error.message);
  }
}

// ==========================================
// CREAR TARJETA DE CITA
// ==========================================

function createSolicitudCard(id, data) {
  const card = document.createElement("article");
  card.className = "solicitud-card";
  if (data.estado === "contactado") {
    card.classList.add("contactado");
  }

  const estado = document.createElement("span");
  estado.className = "badge-estado";
  estado.textContent = data.estado || "pendiente";
  card.appendChild(estado);

  const nombre = document.createElement("h3");
  nombre.textContent = data.nombre || "Sin nombre";
  card.appendChild(nombre);

  const interes = document.createElement("p");
  interes.className = "solicitud-servicio";
  interes.textContent = data.interes || "Sin servicio";
  card.appendChild(interes);

  const pago = document.createElement("p");
  pago.className = "solicitud-meta";
  pago.textContent = `Pago: ${data.metodoPago || "-"} · Total: ${money(data.total)}`;
  card.appendChild(pago);

  const contacto = document.createElement("p");
  contacto.className = "solicitud-meta";
  contacto.textContent = `${data.correo || ""} · ${data.telefono || ""}`;
  card.appendChild(contacto);

  const fecha = document.createElement("p");
  fecha.className = "solicitud-fecha";
  if (data.creadoEn) {
    if (typeof data.creadoEn.toDate === 'function') {
      fecha.textContent = data.creadoEn.toDate().toLocaleString("es-EC");
    } else {
      fecha.textContent = data.creadoEn;
    }
  } else {
    fecha.textContent = "Fecha no disponible";
  }
  card.appendChild(fecha);

  const actions = document.createElement("div");
  actions.className = "solicitud-actions";

  const whatsappLink = document.createElement("a");
  whatsappLink.className = "btn btn-whatsapp";
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";
  whatsappLink.textContent = "Responder por WhatsApp";
  whatsappLink.href = whatsappHref(data);
  actions.appendChild(whatsappLink);

  const toggleButton = document.createElement("button");
  toggleButton.className = "btn btn-outline";
  toggleButton.type = "button";
  toggleButton.textContent = data.estado === "contactado" ? "Marcar pendiente" : "Marcar contactado";
  toggleButton.addEventListener("click", () => cambiarEstado(id, data.estado));
  actions.appendChild(toggleButton);

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-danger";
  deleteButton.type = "button";
  deleteButton.textContent = "🗑️ Eliminar";
  deleteButton.style.backgroundColor = "#a3402f";
  deleteButton.style.color = "white";
  deleteButton.style.border = "none";
  deleteButton.style.padding = "10px 16px";
  deleteButton.style.borderRadius = "999px";
  deleteButton.style.fontWeight = "700";
  deleteButton.style.fontSize = "13px";
  deleteButton.addEventListener("click", () => eliminarCita(id));
  actions.appendChild(deleteButton);

  card.appendChild(actions);
  return card;
}

// ==========================================
// CARGAR CITAS
// ==========================================

async function cargarCitas() {
  console.log("🔄 Cargando citas desde Firebase...");
  
  try {
    const citasRef = collection(db, "citas");
    const q = query(citasRef, orderBy("creadoEn", "desc"));
    const querySnapshot = await getDocs(q);
    
    console.log("📋 Citas encontradas:", querySnapshot.size);
    
    if (solicitudesGrid) solicitudesGrid.innerHTML = "";
    
    if (querySnapshot.empty) {
      if (panelEmpty) panelEmpty.classList.remove("hidden");
      console.log("⚠️ No hay citas");
      return;
    }
    
    if (panelEmpty) panelEmpty.classList.add("hidden");
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      console.log("📄 Procesando:", data.nombre);
      const card = createSolicitudCard(docSnap.id, data);
      if (solicitudesGrid) solicitudesGrid.appendChild(card);
    });
    
    console.log("✅ Citas cargadas correctamente");
    
  } catch (error) {
    console.error("❌ ERROR al cargar citas:", error);
    if (panelEmpty) {
      panelEmpty.textContent = "❌ Error: " + error.message;
      panelEmpty.classList.remove("hidden");
    }
  }
}

// ==========================================
// ESTADO DE AUTENTICACIÓN
// ==========================================

onAuthStateChanged(auth, (user) => {
  console.log("🔐 Estado de autenticación:", user ? "✅ Usuario logueado" : "❌ No logueado");
  
  if (user) {
    console.log("👤 Usuario:", user.email);
    if (loginSection) loginSection.classList.add("hidden");
    if (panelSection) panelSection.classList.remove("hidden");
    if (logoutButton) logoutButton.classList.remove("hidden");
    cargarCitas();
  } else {
    if (loginSection) loginSection.classList.remove("hidden");
    if (panelSection) panelSection.classList.add("hidden");
    if (logoutButton) logoutButton.classList.add("hidden");
  }
});

console.log("✅ Admin panel completamente cargado");