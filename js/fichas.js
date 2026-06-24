// fichas.js — Módulo de fichas y compartir por WhatsApp
(function () {
  "use strict";

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
    .btn-ficha.btn-ficha-pdf { border-left: 3px solid var(--color-gold); }
    .btn-ficha.btn-ficha-png { border-left: 3px solid var(--color-ink-mid); }
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
    .btn-ficha-icono { font-size: 1rem; flex-shrink: 0; }
  `;

  function inyectarEstilos() {
    if (document.getElementById("fichas-estilos")) return;
    const style = document.createElement("style");
    style.id = "fichas-estilos";
    style.textContent = ESTILOS;
    document.head.appendChild(style);
  }

  function construirBloque(codigo) {
    if (!codigo) return null;

    const basePath = window.location.pathname.replace(/\/[^/]*$/, "/");
    const urlPDF = basePath + "ficha-pdf.html?codigo=" + encodeURIComponent(codigo);
    const urlPNG = basePath + "ficha-png.html?codigo=" + encodeURIComponent(codigo);

    const bloque = document.createElement("div");
    bloque.className = "fichas-bloque";
    bloque.id = "fichasBloque";

    bloque.innerHTML =
      '<span class="fichas-bloque-titulo">Descargar ficha</span>' +
      '<div class="fichas-botones">' +
        '<a href="' + urlPDF + '" target="_blank" rel="noopener noreferrer" class="btn-ficha btn-ficha-pdf" aria-label="Descargar ficha PDF">' +
          '<span class="btn-ficha-icono">📄</span> Ficha completa PDF' +
        '</a>' +
        '<a href="' + urlPNG + '" target="_blank" rel="noopener noreferrer" class="btn-ficha btn-ficha-png" aria-label="Descargar ficha PNG">' +
          '<span class="btn-ficha-icono">🖼️</span> Ficha rapida PNG' +
        '</a>' +
        '<button class="btn-ficha btn-ficha-wa" id="btnFichaWa" aria-label="Compartir por WhatsApp">' +
          '<span class="btn-ficha-icono">📲</span> Compartir por WhatsApp' +
        '</button>' +
      '</div>';

    setTimeout(function () {
      var btn = document.getElementById("btnFichaWa");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var titulo    = document.getElementById("propTitulo") ? document.getElementById("propTitulo").textContent : "";
        var precioV   = document.getElementById("propPrecioVenta") ? document.getElementById("propPrecioVenta").textContent.trim() : "";
        var precioA   = document.getElementById("propPrecioArriendo") ? document.getElementById("propPrecioArriendo").textContent.trim() : "";
        var precio    = precioV || precioA;
        var ubicacion = document.getElementById("propUbicacion") ? document.getElementById("propUbicacion").textContent : "";
        var area      = document.getElementById("propArea") ? document.getElementById("propArea").textContent : "";
        var hab       = document.getElementById("propHabitaciones") ? document.getElementById("propHabitaciones").textContent : "";
        var banos     = document.getElementById("propBanos") ? document.getElementById("propBanos").textContent : "";
        var parq      = document.getElementById("propParqueaderos") ? document.getElementById("propParqueaderos").textContent : "";
        var link      = "https://teamrealtyhistory.com/fichasws/" + codigo + ".html";

        var mensaje =
          titulo + "\n" +
          precio + "\n" +
          "Ubicacion: " + ubicacion + "\n" +
          "Area: " + area + " m2 | " + hab + " hab | " + banos + " banos | " + parq + " parq\n\n" +
          "Quieres saber mas de esta historia?\n" + link + "\n\n" +
          "Diana Trillos\n" +
          "+57 316 462 4872";

        window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
      });
    }, 500);

    return bloque;
  }

  function insertarEnSidebar(codigo) {
    if (document.getElementById("fichasBloque")) return;
    var sidebar = document.querySelector(".sidebar-contacto");
    if (!sidebar) return;
    var bloque = construirBloque(codigo);
    if (!bloque) return;
    sidebar.appendChild(bloque);
  }

  function obtenerCodigo() {
    return new URLSearchParams(window.location.search).get("codigo") || null;
  }

  function init() {
    inyectarEstilos();
    var codigo = obtenerCodigo();
    if (!codigo) return;

    var contenido = document.getElementById("contenidoPropiedad");
    if (!contenido) {
      document.addEventListener("DOMContentLoaded", init);
      return;
    }

    if (contenido.style.display !== "none" && contenido.style.display !== "") {
      insertarEnSidebar(codigo);
      return;
    }

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].type === "attributes" && mutations[i].attributeName === "style") {
          var display = contenido.style.display;
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
