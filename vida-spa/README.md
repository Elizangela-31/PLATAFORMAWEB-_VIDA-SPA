# VIDA SPA — Sitio web con carrito, agenda y Firebase

Proyecto web para un spa: Inicio, Servicios, Carrito (agenda de cita + método
de pago), Contáctanos y Panel de administrador, conectado a **Firebase**
(Firestore + Authentication).

```
vida-spa/
├── index.html          Inicio + Servicios + Contáctanos
├── carrito.html         Carrito: agenda de cita y pago
├── admin.html            Panel de administrador
├── app.js                 Datos de servicios, carrito, formulario de contacto
├── carrito.js              Lógica del carrito (fecha, hora, pago, Firestore)
├── admin.js                 Login y listado de citas en tiempo real
├── firebase-config.js         Configuración central de Firebase (EDITAR AQUÍ)
├── estilos.css                 Estilos (diseño responsive)
└── README.md
```

> ⚠️ El pago con tarjeta es **una simulación visual** (no procesa cobros
> reales). Para cobrar de verdad necesitas integrar una pasarela como
> Stripe, PayPal o Datafast, lo cual queda fuera de este alcance.

---

## 1. Crear el proyecto en Firebase

1. Entra a **https://console.firebase.google.com** con tu cuenta de Google.
2. Clic en **"Agregar proyecto"** → nómbralo `vida-spa` → continúa (puedes
   desactivar Google Analytics) → **Crear proyecto**.
3. En el menú lateral entra a **Compilación → Firestore Database** → **Crear
   base de datos** → elige una ubicación (ej. `us-central`) → inicia en
   **modo de producción**.
4. En **Firestore → Reglas**, pega esto para empezar (lectura/escritura solo
   para usuarios con sesión iniciada, ideal para el panel admin; los
   formularios públicos seguirán funcionando porque solo *escriben*):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /citas/{docId} {
         allow create: if true;
         allow read, update, delete: if request.auth != null;
       }
       match /mensajes/{docId} {
         allow create: if true;
         allow read, update, delete: if request.auth != null;
       }
     }
   }
   ```

5. En el menú lateral entra a **Compilación → Authentication** → **Comenzar**
   → pestaña **Sign-in method** → habilita **Correo electrónico/contraseña**.
6. Ve a la pestaña **Users** → **Add user** → crea tu usuario administrador
   (correo + clave). Con ese usuario entrarás a `admin.html`.
7. Ve a **⚙️ Configuración del proyecto** (ícono de engranaje) →
   baja hasta **"Tus apps"** → clic en el ícono `</>` (Web) → dale un
   apodo (ej. `vida-spa-web`) → **Registrar app**.
8. Firebase te muestra un objeto `firebaseConfig`. Cópialo completo.

---

## 2. Conectar el proyecto en Visual Studio Code

1. Abre la carpeta `vida-spa` en VS Code.
2. Abre `firebase-config.js` y reemplaza los valores de ejemplo por los
   que copiaste en el paso 8:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "vida-spa-xxxx.firebaseapp.com",
     projectId: "vida-spa-xxxx",
     storageBucket: "vida-spa-xxxx.firebasestorage.app",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

3. Guarda el archivo. Ese único archivo alimenta a `carrito.js`, `admin.js`
   y `app.js` (formulario de contacto), así que solo lo editas una vez.
4. Instala la extensión **Live Server** (Ritwick Dey) en VS Code.
5. Clic derecho sobre `index.html` → **Open with Live Server**. Se abrirá
   el sitio en `http://127.0.0.1:5500`. Como el proyecto usa `type="module"`,
   **debe** abrirse con un servidor (Live Server, no doble clic al archivo).
6. Prueba: agrega un servicio al carrito, agenda fecha/hora, elige un
   método de pago y confirma. Debe aparecer un nuevo documento en
   Firestore → colección `citas`.
7. Entra a `admin.html`, inicia sesión con el usuario que creaste en el
   paso 6 de Firebase y verifica que la cita aparezca en el panel.

---

## 3. Subir el proyecto a GitHub

1. En VS Code abre una terminal: **Terminal → New Terminal**.
2. Inicializa git (si no lo has hecho):

   ```bash
   git init
   git add .
   git commit -m "Proyecto VIDA SPA inicial"
   ```

3. Crea un archivo `.gitignore` (opcional, útil si luego usas Node):

   ```
   node_modules/
   .DS_Store
   ```

4. Ve a **https://github.com** → **New repository** → nómbralo
   `vida-spa` → **no** marques "Add a README" (ya tienes uno) → **Create
   repository**. GitHub te mostrará comandos como estos:

   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/vida-spa.git
   git push -u origin main
   ```

5. Ejecuta esos tres comandos en la terminal de VS Code (reemplazando
   `TU_USUARIO`). Si te pide iniciar sesión, sigue el flujo de
   autenticación de GitHub (VS Code puede abrir el navegador).
6. Verifica en GitHub que todos los archivos se hayan subido.

> Nota de seguridad: la `apiKey` de Firebase que queda en el repositorio
> **no es secreta** en el sentido tradicional (las apps web siempre la
> exponen en el navegador); lo que realmente protege tus datos son las
> **reglas de Firestore** del paso 1.4 y el login del panel admin.

---

## 4. Publicar en Hostinger

Hostinger sirve el sitio como archivos estáticos (HTML/CSS/JS), así que no
necesitas configurar Node ni build: subes la carpeta tal cual.

### Opción A: Subir por el Administrador de archivos (más simple)

1. Entra a **hPanel** (panel de Hostinger) de tu hosting.
2. Ve a **Sitios web → Administrar** sobre el dominio donde publicarás.
3. Abre **Archivos → Administrador de archivos**.
4. Entra a la carpeta `public_html` (bórrala si tiene archivos de
   demostración que no necesitas, o muévelos a un backup).
5. Clic en **Subir** → selecciona **todos** los archivos de la carpeta
   `vida-spa` (`index.html`, `carrito.html`, `admin.html`, `app.js`,
   `carrito.js`, `admin.js`, `firebase-config.js`, `estilos.css`).
   Deben quedar sueltos directamente dentro de `public_html`, no dentro de
   una subcarpeta `vida-spa/`.
6. Espera a que termine la subida y visita tu dominio
   (`https://tudominio.com`) para verificar que cargue.

### Opción B: Conectar el repositorio de GitHub (automatizado)

1. En **hPanel** ve a **Avanzado → Git** (disponible en la mayoría de
   planes de hosting compartido de Hostinger).
2. Clic en **Crear nuevo repositorio**.
3. Pega la URL de tu repositorio:
   `https://github.com/TU_USUARIO/vida-spa.git`
4. Selecciona la rama `main` y como **ruta de instalación** indica
   `public_html` (o una subcarpeta si prefieres mantener otro sitio ahí).
5. Guarda. Hostinger clonará el repositorio dentro de `public_html`.
6. Cada vez que hagas cambios en VS Code:

   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push
   ```

   y luego, en hPanel → **Avanzado → Git**, presiona **Actualizar desde
   repositorio** (deploy manual) para reflejar los cambios en el sitio
   publicado.

### Después de publicar

- Verifica que Firestore reciba datos también desde el dominio en línea
  (agenda una cita de prueba desde `https://tudominio.com`).
- Si usas Firebase **Authentication**, no necesitas agregar el dominio de
  Hostinger a ninguna lista para que el login funcione con correo y
  contraseña (esa restricción solo aplica a métodos como Google Sign-In).
- Activa el **certificado SSL gratuito** de Hostinger (hPanel → **Seguridad
  → SSL**) para que el sitio cargue en `https://`.

---

## 5. Resumen del flujo de trabajo diario

1. Editas el código en VS Code.
2. Pruebas localmente con Live Server.
3. `git add . && git commit -m "..." && git push`.
4. Si usaste la Opción A en Hostinger: vuelves a subir los archivos
   modificados por el Administrador de archivos.
   Si usaste la Opción B: presionas "Actualizar desde repositorio" en
   hPanel.
