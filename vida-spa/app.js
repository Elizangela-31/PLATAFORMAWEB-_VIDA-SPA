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
// SERVICIOS
// ==========================================

export const servicios = [
  {
    id: "masaje-relajante",
    nombre: "Masaje relajante",
    categoria: "masajes",
    duracion: "60 min",
    precio: 35,
    imagen: "https://placehold.co/700x520/6b8f71/f3f5f0?text=Masaje+Relajante",
    descripcion: "Masaje corporal con aceites esenciales para liberar tensión y calmar la mente."
  },
  {
    id: "masaje-descontracturante",
    nombre: "Masaje descontracturante",
    categoria: "masajes",
    duracion: "50 min",
    precio: 40,
    imagen: "https://placehold.co/700x520/26392e/f3f5f0?text=Descontracturante",
    descripcion: "Técnica de presión profunda enfocada en espalda, cuello y hombros."
  },
  {
    id: "masaje-piedras",
    nombre: "Masaje con piedras calientes",
    categoria: "masajes",
    duracion: "70 min",
    precio: 48,
    imagen: "https://placehold.co/700x520/b3624a/f3f5f0?text=Piedras+Calientes",
    descripcion: "Piedras volcánicas templadas que relajan músculos y mejoran la circulación."
  },
  {
    id: "limpieza-facial",
    nombre: "Limpieza facial profunda",
    categoria: "facial",
    duracion: "45 min",
    precio: 30,
    imagen: "https://placehold.co/700x520/a9c2ac/26392e?text=Limpieza+Facial",
    descripcion: "Exfoliación, extracción e hidratación para un rostro renovado."
  },
  {
    id: "facial-antiedad",
    nombre: "Ritual facial antiedad",
    categoria: "facial",
    duracion: "60 min",
    precio: 45,
    imagen: "https://placehold.co/700x520/e3b2a2/26392e?text=Ritual+Antiedad",
    descripcion: "Masaje facial, sérum y mascarilla con activos antiedad y efecto lifting."
  },
  {
    id: "hidratacion-facial",
    nombre: "Hidratación facial express",
    categoria: "facial",
    duracion: "30 min",
    precio: 22,
    imagen: "https://placehold.co/700x520/dfe3d8/26392e?text=Hidratacion+Express",
    descripcion: "Tratamiento rápido de hidratación intensa ideal para pieles resecas.",
  },
  {
    id: "exfoliacion-corporal",
    nombre: "Exfoliación corporal",
    categoria: "corporal",
    duracion: "40 min",
    precio: 32,
    imagen: "https://placehold.co/700x520/6a6f63/f3f5f0?text=Exfoliacion+Corporal",
    descripcion: "Exfoliación con sales naturales que renueva y suaviza la piel."
  },
  {
    id: "envoltura-corporal",
    nombre: "Envoltura corporal reductora",
    categoria: "corporal",
    duracion: "60 min",
    precio: 50,
    imagen: "https://placehold.co/700x520/26392e/e8e2d4?text=Envoltura+Corporal",
    descripcion: "Envoltura con arcillas activas que reafirma y tonifica la piel."
  },
  {
    id: "manicure-spa",
    nombre: "Manicure spa",
    categoria: "manos-pies",
    duracion: "45 min",
    precio: 18,
    imagen: "https://placehold.co/700x520/b3624a/f3f5f0?text=Manicure+Spa",
    descripcion: "Cuidado completo de manos con exfoliación, masaje y esmaltado."
  },
  {
    id: "pedicure-spa",
    nombre: "Pedicure spa",
    categoria: "manos-pies",
    duracion: "50 min",
    precio: 22,
    imagen: "https://placehold.co/700x520/a9c2ac/26392e?text=Pedicure+Spa",
    descripcion: "Baño de pies, exfoliación, masaje y esmaltado para pies renovados."
  },
  {
    id: "reflexologia",
    nombre: "Reflexología podal",
    categoria: "manos-pies",
    duracion: "40 min",
    precio: 28,
    imagen: "https://placehold.co/700x520/e3b2a2/26392e?text=Reflexologia",
    descripcion: "Presión en puntos específicos del pie para equilibrar cuerpo y mente."
  },
  {
    id: "dia-spa-completo",
    nombre: "Día de spa completo",
    categoria: "corporal",
    duracion: "3 h",
    precio: 95,
    imagen: "https://placehold.co/700x520/26392e/f3f5f0?text=Dia+de+Spa",
    descripcion: "Masaje, facial y pedicure en una experiencia completa de bienestar."
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
    fecha: "",
    hora: "",
    metodoPago: ""
  });

  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
  updateCartCount();

  alert(`"${servicio.nombre}" agregado al carrito 🛒`);
}


// ==========================================
// MOSTRAR SERVICIOS
// ==========================================

function showServices(lista = servicios) {
  const grid = $("#service-grid");
  if (!grid) return;

  grid.innerHTML = lista.map(s => `
    <article class="service-card" data-category="${s.categoria}" data-name="${s.nombre}">

      <div class="service-media">
        <img src="${s.imagen}" alt="${s.nombre}">
        <span class="badge badge-duration">${s.duracion}</span>
        <span class="badge badge-category">${s.categoria.replace("-", " y ")}</span>
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
              Agregar
            </button>
          </div>
        </div>
      </div>

    </article>
  `).join("");

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
