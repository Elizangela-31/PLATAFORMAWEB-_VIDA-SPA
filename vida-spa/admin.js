import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc  // 👈 NUEVO: para eliminar
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const loginSection = document.getElementById("login-section");
const panelSection = document.getElementById("panel-section");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutButton = document.getElementById("logout-btn");
const solicitudesGrid = document.getElementById("solicitudes-grid");
const panelEmpty = document.getElementById("panel-empty");

let unsubscribeCitas = null;

// ==========================================
// LOGIN / LOGOUT
// ==========================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");

  const correo = document.getElementById("admin-correo").value.trim();
  const clave = document.getElementById("admin-clave").value;

  try {
    await signInWithEmailAndPassword(auth, correo, clave);
    loginForm.reset();
  } catch (error) {
    loginError.textContent = "Correo o clave incorrectos.";
    loginError.classList.remove("hidden");
  }
});

logoutButton.addEventListener("click", () => {
  signOut(auth);
});

// ==========================================
// UTILIDADES
// ==========================================

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function whatsappHref(data) {
  const telefonoLimpio = data.telefono.replace(/\D/g, "").replace(/^0/, "");
  const mensaje = `Hola ${data.nombre}, te escribo de VIDA SPA por tu cita de "${data.interes}".`;
  return `https://wa.me/593${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
}

// ==========================================
// ELIMINAR CITA
// ==========================================

function eliminarCita(id) {
  if (!confirm('¿Estás seguro de eliminar esta cita permanentemente?')) return;
  
  deleteDoc(doc(db, "citas", id))
    .then(() => {
      console.log('Cita eliminada correctamente');
    })
    .catch((error) => {
      console.error('Error al eliminar:', error);
      alert('No se pudo eliminar la cita');
    });
}

// ==========================================
// ELIMINAR MENSAJE
// ==========================================

function eliminarMensaje(id) {
  if (!confirm('¿Eliminar este mensaje?')) return;
  
  deleteDoc(doc(db, "mensajes", id))
    .then(() => {
      console.log("Mensaje eliminado");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("No se pudo eliminar");
    });
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
  estado.textContent = data.estado;
  card.appendChild(estado);

  const nombre = document.createElement("h3");
  nombre.textContent = data.nombre;
  card.appendChild(nombre);

  const interes = document.createElement("p");
  interes.className = "solicitud-servicio";
  interes.textContent = data.interes;
  card.appendChild(interes);

  const pago = document.createElement("p");
  pago.className = "solicitud-meta";
  pago.textContent = `Pago: ${data.metodoPago || "-"} · Total: ${money(data.total)}`;
  card.appendChild(pago);

  const contacto = document.createElement("p");
  contacto.className = "solicitud-meta";
  contacto.textContent = `${data.correo} · ${data.telefono}`;
  card.appendChild(contacto);

  const fecha = document.createElement("p");
  fecha.className = "solicitud-fecha";
  fecha.textContent = data.creadoEn ? data.creadoEn.toDate().toLocaleString("es-EC") : "";
  card.appendChild(fecha);

  const actions = document.createElement("div");
  actions.className = "solicitud-actions";

  // Botón WhatsApp
  const whatsappLink = document.createElement("a");
  whatsappLink.className = "btn btn-whatsapp";
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";
  whatsappLink.textContent = "Responder por WhatsApp";
  whatsappLink.href = whatsappHref(data);
  actions.appendChild(whatsappLink);

  // Botón toggle estado
  const toggleButton = document.createElement("button");
  toggleButton.className = "btn btn-outline";
  toggleButton.type = "button";
  toggleButton.textContent = data.estado === "contactado" ? "Marcar pendiente" : "Marcar contactado";
  toggleButton.addEventListener("click", () => {
    const nuevoEstado = data.estado === "contactado" ? "pendiente" : "contactado";
    updateDoc(doc(db, "citas", id), { estado: nuevoEstado });
  });
  actions.appendChild(toggleButton);

  // 🔥 NUEVO: Botón eliminar
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
// SUSCRIPCIÓN A CITAS
// ==========================================

function subscribeCitas() {
  const citasQuery = query(collection(db, "citas"), orderBy("creadoEn", "desc"));

  unsubscribeCitas = onSnapshot(citasQuery, (snapshot) => {
    solicitudesGrid.innerHTML = "";
    panelEmpty.classList.toggle("hidden", !snapshot.empty);

    snapshot.forEach((docSnap) => {
      solicitudesGrid.appendChild(createSolicitudCard(docSnap.id, docSnap.data()));
    });
  });
}

// ==========================================
// SUSCRIPCIÓN A MENSAJES (OPCIONAL)
// ==========================================

function subscribeMensajes() {
  // Solo si tienes la sección en admin.html
  const grid = document.getElementById("mensajes-grid");
  const empty = document.getElementById("mensajes-empty");
  
  if (!grid) return; // Si no existe la sección, no hace nada
  
  const mensajesQuery = query(collection(db, "mensajes"), orderBy("creadoEn", "desc"));
  
  onSnapshot(mensajesQuery, (snapshot) => {
    grid.innerHTML = '';
    empty.classList.toggle("hidden", !snapshot.empty);
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("article");
      card.className = "solicitud-card";
      
      const nombre = document.createElement("h3");
      nombre.textContent = data.nombre;
      card.appendChild(nombre);
      
      const correo = document.createElement("p");
      correo.className = "solicitud-meta";
      correo.textContent = data.correo;
      card.appendChild(correo);
      
      const telefono = document.createElement("p");
      telefono.className = "solicitud-meta";
      telefono.textContent = data.telefono;
      card.appendChild(telefono);
      
      const mensaje = document.createElement("p");
      mensaje.textContent = data.mensaje;
      card.appendChild(mensaje);
      
      const fecha = document.createElement("p");
      fecha.className = "solicitud-fecha";
      fecha.textContent = data.creadoEn?.toDate().toLocaleString('es-EC') || '';
      card.appendChild(fecha);
      
      const btnEliminar = document.createElement("button");
      btnEliminar.className = "btn btn-danger";
      btnEliminar.type = "button";
      btnEliminar.textContent = "🗑️ Eliminar";
      btnEliminar.style.backgroundColor = "#a3402f";
      btnEliminar.style.color = "white";
      btnEliminar.style.border = "none";
      btnEliminar.style.padding = "10px 16px";
      btnEliminar.style.borderRadius = "999px";
      btnEliminar.style.fontWeight = "700";
      btnEliminar.style.fontSize = "13px";
      btnEliminar.addEventListener("click", () => eliminarMensaje(docSnap.id));
      card.appendChild(btnEliminar);
      
      grid.appendChild(card);
    });
  });
}

// ==========================================
// ESTADO DE AUTENTICACIÓN
// ==========================================

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add("hidden");
    panelSection.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
    subscribeCitas();
    subscribeMensajes(); // Si tienes la sección de mensajes
    return;
  }

  loginSection.classList.remove("hidden");
  panelSection.classList.add("hidden");
  logoutButton.classList.add("hidden");

  if (unsubscribeCitas) {
    unsubscribeCitas();
    unsubscribeCitas = null;
  }
});