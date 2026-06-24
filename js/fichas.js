// fichas.js — Módulo de descarga de fichas (PDF y PNG)
// Inyecta los botones en el sidebar de detalle-propiedad.html
// Cargar DESPUÉS de detalle-propiedad.js (requiere que el DOM ya esté listo)
//
// INTEGRACIÓN EN detalle-propiedad.html:
//   <script src="js/fichas.js"></script>
//   (agregar al final de la lista de scripts, después de detalle-propiedad.js)
//
// NO modifica ningún archivo existente. Solo escucha que la propiedad
// termine de cargar y agrega el bloque de botones en .sidebar-contacto

(function () {
  "use strict";

  // ─── ESTILOS DEL BLOQUE (sin tocar styles.css) ────────────────────────────
  const ESTILOS = `
    .fichas-bloque {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border-light);
    }

    .fichas-bloque-titulo {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--color-text-light);
      display: block;
      margin-bottom: 12px;
    }

    .fichas-botones {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-ficha {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 14px 20px;
      border: 1px solid var(--color-border);
      background: var(--color-ivory);
      color: var(--color-ink-mid);
      font-family: var(--font-body);
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
      border-radius: 0;
    }

    .btn-ficha:hover {
      background: var(--color-ink);
      color: var(--color-white);
      border-color: var(--color-ink);
    }

    .btn-ficha.btn-ficha-pdf {
      border-left: 3px solid var(--color-gold);
    }

    .btn-ficha.btn-ficha-png {
      border-left: 3px solid var(--color-ink-mid);
    }

    .btn-ficha.btn-ficha-wa {
      border-left: 3px solid #25D366;
      background: #f0fdf4;
      color: #15803d;
    }

    .btn-ficha.btn-ficha-wa:hover {
      background: #25D366;
      color: var(--color-white);
      border-color: #25D366;
    }

    .btn-ficha-icono {
      font-size: 1rem;
      flex-shrink: 0;
    }
  `;

  // ─── INYECTAR ESTILOS ─────────────────────────────────────────────────────
  function inyectarEstilos() {
    if (document.getElementById("fichas-estilos")) return;
    const style = document.createElement("style");
    style.id = "fichas-estilos";
    style.textContent = ESTILOS;
    document.head.appendChild(style);
  }

  // ─── CONSTRUIR EL BLOQUE DE BOTONES ──────────────────────────────────────
  function construirBloque(codigo) {
    if (!codigo) return null;

    const basePath = window.location.pathname
      .replace(/\/[^/]*$/, "/"); // directorio actual

    const urlPDF = `${basePath}ficha-pdf.html?codigo=${encodeURIComponent(codigo)}`;
    const urlPNG = `${basePath}ficha-png.html?codigo=${encodeURIComponent(codigo)}`;

    const bloque = document.createElement("div");
    bloque.className = "fichas-bloque";
    bloque.id = "fichasBloque";

    bloque.innerHTML = `
      <span class="fichas-bloque-titulo">Descargar ficha</span>
      <div class="fichas-botones">
        <a
          href="${urlPDF}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-ficha btn-ficha-pdf"
          aria-label="Descargar ficha PDF de la propiedad"
        >
          <span class="btn-ficha-icono">📄</span>
          Ficha completa PDF
        </a>
        <a
          href="${urlPNG}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-ficha btn-ficha-png"
          aria-label="Descargar ficha PNG de la propiedad"
        >
          <span class="btn-ficha-icono">🖼️</span>
          Ficha rápida PNG
        </a>
        <a
          // href="${basePath}ficha-whatsapp.html?codigo=${encodeURIComponent(codigo)}" 

          href="#"
             class="btn-ficha btn-ficha-wa"
                 id="btnFichaWa"
  
          target="_blank"
          rel="noopener noreferrer"
          class="btn-ficha btn-ficha-wa"
          aria-label="Compartir ficha por WhatsApp"
        >
          <span class="btn-ficha-icono">📲</span>
          Compartir por WhatsApp
        </a>
      </div>
    `;











    setTimeout(function() {
  const btn = document.getElementById("btnFichaWa");
  if (!btn) return;
  btn.addEventListener("click", function(e) {
    e.preventDefault();
    const titulo = document.getElementById("propTitulo")?.textContent || "";
    const precio = document.getElementById("propPrecioVenta")?.textContent || "";
    const ubicacion = document.getElementById("propUbicacion")?.textContent || "";
    const area = document.getElementById("propArea")?.textContent || "";
    const hab = document.getElementById("propHabitaciones")?.textContent || "";
    const banos = document.getElementById("propBanos")?.textContent || "";
    const parq = document.getElementById("propParqueaderos")?.textContent || "";
    const link = "https://teamrealtyhistory.com/fichasws/" + codigo + ".html";

    const mensaje =
      titulo + "\n" +
      precio + "\n" +
      "📍 " + ubicacion + "\n" +
      "📐 " + area + " m² · 🛏 " + hab + " hab · 🚿 " + banos + " baños · 🚗 " + parq + " parq\n\n" +
      "¿Quieres saber más de esta historia?\n" + link;

    window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
  });
}, 500);


















    return bloque;
  }

  // ─── INSERTAR EN SIDEBAR ──────────────────────────────────────────────────
  function insertarEnSidebar(codigo) {
    // Evitar duplicados si se llama más de una vez
    if (document.getElementById("fichasBloque")) return;

    const sidebar = document.querySelector(".sidebar-contacto");
    if (!sidebar) {
      console.warn("fichas.js: no se encontró .sidebar-contacto");
      return;
    }

    const bloque = construirBloque(codigo);
    if (!bloque) return;

    sidebar.appendChild(bloque);
  }

  // ─── OBTENER CÓDIGO DESDE LA URL ─────────────────────────────────────────
  function obtenerCodigo() {
    return new URLSearchParams(window.location.search).get("codigo") || null;
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────
  // detalle-propiedad.js muestra #contenidoPropiedad cuando termina.
  // Observamos ese cambio de display con MutationObserver para no
  // depender de ningún evento personalizado ni modificar el JS existente.

  function init() {
    inyectarEstilos();

    const codigo = obtenerCodigo();
    if (!codigo) return; // no estamos en detalle de propiedad

    const contenido = document.getElementById("contenidoPropiedad");

    if (!contenido) {
      // Fallback: intentar en DOMContentLoaded si el elemento no existe aún
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    // Si ya está visible (carga muy rápida), insertar de inmediato
    if (contenido.style.display !== "none" && contenido.style.display !== "") {
      insertarEnSidebar(codigo);
      return;
    }

    // Observar cuando detalle-propiedad.js lo hace visible
    const observer = new MutationObserver(function (mutations) {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const display = contenido.style.display;
          if (display && display !== "none") {
            observer.disconnect();
            insertarEnSidebar(codigo);
            return;
          }
        }
      }
    });

    observer.observe(contenido, { attributes: true });
  }

  // Arrancar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
