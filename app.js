import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

export const CART_KEY = "vidaspa_carrito";

// ==========================================
// SERVICIOS CON IMÁGENES REALES DE UNSPLASH
// ==========================================

export const servicios = [
  {
    id: "masaje-relajante",
    nombre: "Masaje relajante",
    categoria: "masajes",
    duracion: "60 min",
    precio: 35,
    imagen: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&crop=center",
    descripcion: "Masaje corporal con aceites esenciales para liberar tensión y calmar la mente. Ideal para desconectar del estrés diario."
  },
  {
    id: "masaje-descontracturante",
    nombre: "Masaje descontracturante",
    categoria: "masajes",
    duracion: "50 min",
    precio: 40,
    imagen: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop&crop=center",
    descripcion: "Técnica de presión profunda enfocada en espalda, cuello y hombros. Perfecto para eliminar nudos musculares."
  },
  {
    id: "masaje-piedras",
    nombre: "Masaje con piedras calientes",
    categoria: "masajes",
    duracion: "70 min",
    precio: 48,
    imagen: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&h=400&fit=crop&crop=center",
    descripcion: "Piedras volcánicas templadas que relajan músculos y mejoran la circulación. Una experiencia única de calor y bienestar."
  },
  {
    id: "limpieza-facial",
    nombre: "Limpieza facial profunda",
    categoria: "facial",
    duracion: "45 min",
    precio: 30,
    imagen: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop&crop=center",
    descripcion: "Exfoliación, extracción e hidratación para un rostro renovado. Tu piel lucirá más radiante y saludable."
  },
  {
    id: "facial-antiedad",
    nombre: "Ritual facial antiedad",
    categoria: "facial",
    duracion: "60 min",
    precio: 45,
    imagen: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=400&fit=crop&crop=center",
    descripcion: "Masaje facial, sérum y mascarilla con activos antiedad y efecto lifting. Recupera la juventud de tu piel."
  },
  {
    id: "hidratacion-facial",
    nombre: "Hidratación facial express",
    categoria: "facial",
    duracion: "30 min",
    precio: 22,
    imagen: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=400&fit=crop&crop=center",
    descripcion: "Tratamiento rápido de hidratación intensa ideal para pieles resecas. Resultados visibles al instante."
  },
  {
    id: "exfoliacion-corporal",
    nombre: "Exfoliación corporal",
    categoria: "corporal",
    duracion: "40 min",
    precio: 32,
    imagen: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop&crop=center",
    descripcion: "Exfoliación con sales naturales que renueva y suaviza la piel. Elimina células muertas y revitaliza tu cuerpo."
  },
  {
    id: "envoltura-corporal",
    nombre: "Envoltura corporal reductora",
    categoria: "corporal",
    duracion: "60 min",
    precio: 50,
    imagen: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=400&fit=crop&crop=center",
    descripcion: "Envoltura con arcillas activas que reafirma y tonifica la piel. Resultados visibles desde la primera sesión."
  },
  {
    id: "manicure-spa",
    nombre: "Manicure spa",
    categoria: "manos-pies",
    duracion: "45 min",
    precio: 18,
    imagen: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=400&fit=crop&crop=center",
    descripcion: "Cuidado completo de manos con exfoliación, masaje y esmaltado. Tus manos lucirán espectaculares."
  },
  {
    id: "pedicure-spa",
    nombre: "Pedicure spa",
    categoria: "manos-pies",
    duracion: "50 min",
    precio: 22,
    imagen: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop&crop=center",
    descripcion: "Baño de pies, exfoliación, masaje y esmaltado para pies renovados. Olvídate del cansancio."
  },
  {
    id: "reflexologia",
    nombre: "Reflexología podal",
    categoria: "manos-pies",
    duracion: "40 min",
    precio: 28,
    imagen: "https://images.unsplash.com/photo-1616671276441-2f2c2a5c9c3e?w=600&h=400&fit=crop&crop=center",
    descripcion: "Presión en puntos específicos del pie para equilibrar cuerpo y mente. Terapia milenaria con resultados comprobados."
  },
  {
    id: "dia-spa-completo",
    nombre: "Día de spa completo",
    categoria: "corporal",
    duracion: "3 h",
    precio: 95,
    imagen: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&h=400&fit=crop&crop=center",
    descripcion: "Masaje, facial y pedicure en una experiencia completa de bienestar. El mejor regalo que puedes hacerte."
  }
];

// ==========================================
// CARRITO
// ==========================================

export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

export function updateCartCount() {
  const contador = $("#cart-count");
  if (contador) contador.textContent = getCart().length;
}

function addToCart(servicio) {
  const carrito = getCart();

  if (carrito.some(s => s.servicioId === servicio.id)) {
    alert(`"${servicio.nombre}" ya está en el carrito.`);
    return;
  }

  carrito.push({
    id: Date.now(),
    servicioId: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    categoria: servicio.categoria,
    duracion: servicio.duracion,
    precio: servicio.precio,
    imagen: servicio.imagen,
    fecha: "",
    hora: "",
    metodoPago: ""
  });

  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
  updateCartCount();

  alert(`"${servicio.nombre}" agregado al carrito 🛒`);
}

// ==========================================
// MODAL DE DETALLES
// ==========================================

function crearModal() {
  if (document.getElementById("servicio-modal")) return;

  const modalHTML = `
    <div id="servicio-modal" class="modal-overlay hidden">
      <div class="modal-content">
        <button class="modal-close" id="modal-close">✕</button>
        <div id="modal-body"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  document.getElementById("servicio-modal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) cerrarModal();
  });

  document.getElementById("modal-close").addEventListener("click", cerrarModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });
}

function abrirModal(servicio) {
  crearModal();

  const modal = document.getElementById("servicio-modal");
  const body = document.getElementById("modal-body");
  
  body.innerHTML = `
    <div class="modal-service-image">
      <img src="${servicio.imagen}" alt="${servicio.nombre}">
    </div>
    <div class="modal-service-info">
      <span class="modal-category">${servicio.categoria.replace("-", " y ")}</span>
      <h2>${servicio.nombre}</h2>
      <div class="modal-meta">
        <span>⏱️ ${servicio.duracion}</span>
        <span>💰 Desde $${servicio.precio}</span>
      </div>
      <p class="modal-description">${servicio.descripcion}</p>
      <div class="modal-actions">
        <button class="btn btn-primary add-btn-modal" data-id="${servicio.id}">
          🛒 Agregar al carrito
        </button>
        <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
      </div>
    </div>
  `;

  body.querySelector(".add-btn-modal")?.addEventListener("click", (e) => {
    const servicioEncontrado = servicios.find(s => s.id === e.target.dataset.id);
    if (servicioEncontrado) {
      addToCart(servicioEncontrado);
      cerrarModal();
    }
  });

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  const modal = document.getElementById("servicio-modal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

window.cerrarModal = cerrarModal;

// ==========================================
// MOSTRAR SERVICIOS
// ==========================================

function showServices(lista = servicios) {
  const grid = $("#service-grid");
  if (!grid) return;

  grid.innerHTML = lista.map(s => `
    <article class="service-card" data-id="${s.id}" data-category="${s.categoria}" data-name="${s.nombre}">

      <div class="service-media">
        <img src="${s.imagen}" alt="${s.nombre}" loading="lazy">
        <span class="badge badge-duration">${s.duracion}</span>
        <span class="badge badge-category">${s.categoria.replace("-", " y ")}</span>
        <div class="service-overlay">
          <span>👆 Ver detalles</span>
        </div>
      </div>

      <div class="service-body">
        <h3>${s.nombre}</h3>
        <p>${s.descripcion}</p>

        <div class="service-footer">
          <div class="price">
            <span class="price-label">Desde</span>
            <strong>$${s.precio}</strong>
          </div>

          <div class="service-actions">
            <button class="btn btn-primary btn-small add-btn" data-id="${s.id}">
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>

    </article>
  `).join("");

  grid.querySelectorAll(".service-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".add-btn")) return;
      const servicio = servicios.find(s => s.id === card.dataset.id);
      if (servicio) abrirModal(servicio);
    });
  });

  $("#service-empty")?.classList.toggle("hidden", lista.length > 0);
}

// ==========================================
// FILTRAR Y BUSCAR
// ==========================================

let categoria = "todos";

function filterServices() {
  const texto = ($("#service-search")?.value || "").toLowerCase();

  const filtrados = servicios.filter(s =>
    (categoria === "todos" || s.categoria === categoria) &&
    s.nombre.toLowerCase().includes(texto)
  );

  showServices(filtrados);
}

$$(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    categoria = btn.dataset.filter;
    $$(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filterServices();
  };
});

$("#service-search")?.addEventListener("input", filterServices);

// ==========================================
// BOTÓN AGREGAR
// ==========================================

$("#service-grid")?.addEventListener("click", e => {
  const boton = e.target.closest(".add-btn");
  if (!boton) return;

  const servicio = servicios.find(s => s.id === boton.dataset.id);
  if (servicio) addToCart(servicio);
});

// ==========================================
// FORMULARIO DE CONTACTO
// ==========================================

const contactForm = $("#contact-form");
const contactResponse = $("#contact-response");

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  contactResponse.classList.remove("error");

  if (!contactForm.checkValidity()) {
    contactResponse.textContent = "Completa todos los campos correctamente.";
    contactResponse.classList.add("error");
    contactForm.reportValidity();
    return;
  }

  const boton = contactForm.querySelector("button[type='submit']");
  boton.disabled = true;
  boton.textContent = "Enviando...";
  contactResponse.textContent = "";

  const nombre = $("#contact-nombre").value.trim();
  const correo = $("#contact-correo").value.trim();
  const telefono = $("#contact-telefono").value.trim();
  const mensaje = $("#contact-mensaje").value.trim();

  try {
    await addDoc(collection(db, "mensajes"), {
      nombre,
      correo,
      telefono,
      mensaje,
      estado: "pendiente",
      creadoEn: serverTimestamp()
    });

    contactResponse.textContent = "Mensaje enviado. Te contactaremos pronto.";
    contactForm.reset();
  } catch (error) {
    console.error(error);
    contactResponse.textContent = "No se pudo enviar el mensaje. Intenta de nuevo.";
    contactResponse.classList.add("error");
  } finally {
    boton.disabled = false;
    boton.textContent = "Enviar mensaje";
  }
});

// ==========================================
// MENÚ
// ==========================================

$(".menu-toggle")?.addEventListener("click", () => {
  $(".nav-links")?.classList.toggle("open");
});

$$(".nav-link").forEach(link => {
  link.onclick = () => {
    $(".nav-links")?.classList.remove("open");
    $$(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  };
});

// ==========================================
// INICIO
// ==========================================

showServices();
updateCartCount();