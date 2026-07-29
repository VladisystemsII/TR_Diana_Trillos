// propiedades.js — Team Realty History
// Dependencia: config.js debe cargarse antes.
//
// PANTALLA A: Galería de miniaturas + pregunta filtro
// PANTALLA B: Fichas completas filtradas (idénticas al diseño original)
// Al elegir filtro: A desaparece, B aparece.
// Clic en miniatura: va directo a detalle-propiedad.html

// ===== UTILS =====
function extraerFileId(url) {
  if (!url || url.trim() === '') return null;
  url = url.trim();
  let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  return null;
}

function normalizarFoto(url) {
  if (!url || url.trim() === '') return null;
  const fileId = extraerFileId(url);
  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  return url;
}

function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ===== CLASIFICAR TIPO DE NEGOCIO =====
// Retorna objeto { grupo, badge, clase }
// grupo  → en qué pantalla B aparece: 'venta' | 'arriendo' | null
// badge  → texto de la etiqueta
// clase  → clase CSS del badge
function clasificarNegocio(prop) {
  const raw = (prop["Tipo de Negocio"] || prop["Estado"] || "").trim();
  const t   = raw.toLowerCase();

  if (t.includes("vendida") || t.includes("vendido")) {
    return { grupo: "venta",    badge: "Vendida",          clase: "vendida" };
  }
  if (t === "en arriendo" && !t.includes("venta")) {
    // detectar si ya fue arrendada (campo puede venir como "Arrendada")
    return { grupo: "arriendo", badge: "En Arriendo",      clase: "arriendo" };
  }
  if (t.includes("arrendada")) {
    return { grupo: "arriendo", badge: "Arrendada",        clase: "vendida" };
  }
  if (t.includes("venta") && t.includes("arriendo")) {
    return { grupo: "ambos",    badge: "Venta y Arriendo", clase: "ambos" };
  }
  if (t.includes("venta")) {
    return { grupo: "venta",    badge: "En Venta",         clase: "venta" };
  }
  if (t.includes("arriendo")) {
    return { grupo: "arriendo", badge: "En Arriendo",      clase: "arriendo" };
  }
  // Tipo desconocido → mostrar igual
  return { grupo: "ambos", badge: raw || "Disponible", clase: "ambos" };
}

// ===== ESTADO GLOBAL =====
let _propiedades = [];

// ===== PRIMERA FOTO =====
function obtenerFoto(prop) {
  for (let i = 1; i <= 9; i++) {
    const url = prop[`Foto ${i}`];
    if (url && url.trim() !== '') {
      const n = normalizarFoto(url);
      if (n) return n;
    }
  }
  return 'img/sin-imagen.png';
}

// ===== PANTALLA A: MINIATURAS =====
// Muestra TODAS las propiedades activas con su badge
function renderizarMiniaturas(propiedades) {
  const grid = document.getElementById("thumbGrid");
  grid.innerHTML = "";

  if (propiedades.length === 0) {
    grid.innerHTML = `<p class="thumb-empty">No hay propiedades disponibles.</p>`;
    return;
  }

  propiedades.forEach((prop, index) => {
    const codigo  = prop["CÓDIGO"] || "";
    const titulo  = prop["Título"] || prop["Titulo"] || "Sin título";
    const barrio  = prop["Barrio/Sector"] || "";
    const negocio = clasificarNegocio(prop);
    const foto    = obtenerFoto(prop);

    // ¿Está vendida o arrendada? → mostrar ribbon
    const esCerrada = negocio.clase === "vendida";

    const card = document.createElement("div");
    card.className = "thumb-card";
    card.style.animationDelay = `${index * 35}ms`;
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalle de ${sanitize(titulo)}`);

    card.innerHTML = `
      <div class="thumb-img-wrap">
        <img src="${foto}" alt="${sanitize(titulo)}" loading="lazy"
             onerror="this.src='img/sin-imagen.png'">
        <div class="thumb-overlay"><span>Ver detalle</span></div>
        ${esCerrada ? `<div class="thumb-ribbon"><span>${sanitize(negocio.badge)}</span></div>` : ''}
      </div>
      <div class="thumb-footer">
        <span class="thumb-titulo">${sanitize(titulo)}</span>
        ${barrio ? `<span class="thumb-barrio">📍 ${sanitize(barrio)}</span>` : ''}
        <span class="thumb-badge ${negocio.clase}">${sanitize(negocio.badge)}</span>
      </div>
    `;

    const irADetalle = () => {
      window.location.href = `detalle-propiedad.html?codigo=${encodeURIComponent(codigo)}`;
    };
    card.addEventListener("click", irADetalle);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); irADetalle(); }
    });

    grid.appendChild(card);
  });
}

// ===== PANTALLA B: FICHAS COMPLETAS =====
function renderizarFichas(filtro) {
  const grid = document.getElementById("propiedadesGrid");
  grid.innerHTML = "";

  // Filtrar: venta → grupo venta + ambos; arriendo → grupo arriendo + ambos
  const filtradas = _propiedades.filter(prop => {
    const { grupo } = clasificarNegocio(prop);
    if (filtro === "venta")    return grupo === "venta"    || grupo === "ambos";
    if (filtro === "arriendo") return grupo === "arriendo" || grupo === "ambos";
    return true;
  });

  const tituloEl = document.getElementById("tituloFichas");
  if (tituloEl) {
    tituloEl.textContent = filtro === "venta"
      ? "Propiedades en Venta"
      : "Propiedades en Arriendo";
  }

  if (filtradas.length === 0) {
    grid.innerHTML = `
      <p style="text-align:center;color:#555;padding:40px;grid-column:1/-1;">
        No hay propiedades disponibles en este grupo por el momento.
      </p>`;
    return;
  }

  filtradas.forEach(prop => {
    const codigo    = prop["CÓDIGO"] || "";
    const titulo    = prop["Título"] || prop["Titulo"] || "Sin título";
    const ciudad    = prop["Ciudad"] || "";
    const barrio    = prop["Barrio/Sector"] || "";
    const tipo      = prop["Tipo"] || "";
    const area      = prop["Área m2"] || "0";
    const hab       = prop["Habitaciones"] || "0";
    const banos     = prop["Baños"] || "0";
    const negocio   = clasificarNegocio(prop);
    const pVenta    = prop["Precio Venta COP"] || "";
    const pArriendo = prop["Precio Arriendo COP"] || "";
    const foto      = obtenerFoto(prop);

    let precio = "Consultar";
    if (filtro === "venta" && pVenta)            precio = pVenta;
    else if (filtro === "arriendo" && pArriendo) precio = pArriendo;
    else if (pVenta)                              precio = pVenta;
    else if (pArriendo)                           precio = pArriendo;

    const ubicacion = `${ciudad}${barrio ? ', ' + barrio : ''}`;

    const card = document.createElement("div");
    card.className = "prop-card";

    // Si está vendida/arrendada, agregar clase visual
    if (negocio.clase === "vendida") card.classList.add("prop-card--cerrada");

    card.innerHTML = `
      <div class="prop-img">
        <img src="${foto}" alt="${sanitize(titulo)}" loading="lazy"
             onerror="this.src='img/sin-imagen.png'">
        ${negocio.clase === "vendida"
          ? `<div class="prop-ribbon"><span>${sanitize(negocio.badge)}</span></div>`
          : ''}
      </div>
      <div class="prop-body">
        <h3>${sanitize(titulo)}</h3>
        <p class="prop-meta">📍 ${sanitize(ubicacion)}</p>
        <p class="prop-meta">${sanitize(tipo)} · ${sanitize(area)} m²
          · 🛏️ ${sanitize(hab)} · 🚿 ${sanitize(banos)}</p>
        <p class="prop-meta">${sanitize(negocio.badge)}</p>
        <div class="prop-price">${sanitize(precio)}</div>
        <button class="prop-btn" data-codigo="${sanitize(codigo)}">Ver detalle</button>
      </div>
    `;

    card.querySelector(".prop-btn").addEventListener("click", function () {
      window.location.href = `detalle-propiedad.html?codigo=${encodeURIComponent(this.getAttribute("data-codigo"))}`;
    });

    grid.appendChild(card);
  });
}

// ===== CAMBIO DE PANTALLA =====
function mostrarFichas(filtro) {
  document.getElementById("buscadorMiniaturas").style.display = "none";
  document.getElementById("propiedades").style.display = "block";
  renderizarFichas(filtro);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mostrarMiniaturas() {
  document.getElementById("propiedades").style.display = "none";
  document.getElementById("buscadorMiniaturas").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== CARGA PRINCIPAL =====
async function loadPropiedades() {
  const loadingMini = document.getElementById("loadingMiniaturas");
  try {
    loadingMini.style.display = "block";
    const response = await fetch(TEAM_REALTY_HISTORY_CONFIG.PROPIEDADES_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    _propiedades = data.filter(
      p => String(p["Activo (si/no)"]).toLowerCase() === "si"
    );
    renderizarMiniaturas(_propiedades);
  } catch (err) {
    console.error("❌ Error cargando propiedades:", err);
    document.getElementById("thumbGrid").innerHTML = `
      <p class="thumb-empty" style="color:#d32f2f;">
        Error al cargar las propiedades. Intenta más tarde.
      </p>`;
  } finally {
    loadingMini.style.display = "none";
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".btn-filtro").forEach(btn => {
    btn.addEventListener("click", () => {
      mostrarFichas(btn.getAttribute("data-filtro"));
    });
  });
  const btnVolver = document.getElementById("btnVolverMiniaturas");
  if (btnVolver) btnVolver.addEventListener("click", mostrarMiniaturas);
  loadPropiedades();
});
