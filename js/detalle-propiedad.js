// detalle-propiedad.js — Lógica de carga del detalle de una propiedad

// ===== HELPER UNIVERSAL (null-safe) =====
// Convierte cualquier valor del JSON a string limpio, sin errores
function val(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

// ===== NORMALIZAR URLs DE GOOGLE DRIVE =====
function extraerFileId(url) {
  const u = val(url);
  if (!u) return null;

  let m = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];

  m = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];

  m = u.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];

  return null;
}

function normalizarFoto(url) {
  const u = val(url);
  if (!u) return null;
  const fileId = extraerFileId(u);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }
  return u;
}

// ===== ALT AUTOMÁTICO =====
function generarAlt(prop, index = 0) {
  const titulo = val(prop["Título"] || prop["Titulo"]) || "Propiedad";
  const codigo = val(prop["CÓDIGO"]) || "SIN-CODIGO";
  return `${titulo} - ${codigo} - Foto ${index + 1}`;
}

// ===== SEO DINÁMICO =====
function actualizarSEO(prop, fotoPrincipal) {
  const titulo = val(prop["Título"] || prop["Titulo"]) || "Propiedad";
  const ciudad = val(prop["Ciudad"]);
  const tipo = val(prop["Tipo"]);
  const descripcion = val(prop["Descripción"] || prop["Descripcion"]);
  const codigo = val(prop["CÓDIGO"]);

  // Title de la pestaña
  document.title = `${titulo} | ${tipo} en ${ciudad} | Team Realty History`;

  // Meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    const texto = descripcion
      ? descripcion.substring(0, 150)
      : `${tipo} en ${ciudad} - ${codigo} | Team Realty History`;
    metaDesc.setAttribute("content", texto);
  }

  // Open Graph
  const setOG = (prop, value) => {
    const el = document.querySelector(`meta[property="${prop}"]`);
    if (el) el.setAttribute("content", value);
  };

  setOG("og:title", `${titulo} | Team Realty History`);
  setOG("og:description", descripcion ? descripcion.substring(0, 150) : `${tipo} en ${ciudad}`);
  setOG("og:image", fotoPrincipal || "");
  setOG("og:url", window.location.href);
}


async function cargarPropiedad() {
  const mensajeCarga = document.getElementById('mensajeCarga');
  const contenidoPropiedad = document.getElementById('contenidoPropiedad');

  const params = new URLSearchParams(window.location.search);
  const codigo = params.get("codigo");

  if (!codigo) {
    mostrarError('No se especificó el código de la propiedad.');
    return;
  }

  try {
    mensajeCarga.style.display = 'block';
    contenidoPropiedad.style.display = 'none';

    const response = await fetch(TEAM_REALTY_HISTORY_CONFIG.PROPIEDADES_ENDPOINT, {
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const data = await response.json();

    // Búsqueda directa con nombres exactos confirmados desde el JSON
    const propiedad = data.find(p =>
      val(p["CÓDIGO"]) === codigo.trim() &&
      val(p["Activo (si/no)"]).toLowerCase() === "si"
    );

    if (!propiedad) {
      mostrarError('Propiedad no encontrada o inactiva.');
      return;
    }

    renderizarPropiedad(propiedad);

    mensajeCarga.style.display = 'none';
    contenidoPropiedad.style.display = 'block';

  } catch (error) {
    console.error('❌ Error cargando propiedad:', error);
    mostrarError('Error al cargar la información. Intenta más tarde.');
  }
}

// ===== RENDERIZAR =====
function renderizarPropiedad(prop) {

  const titulo = val(prop["Título"] || prop["Titulo"]) || "Sin título";
  document.getElementById('propTitulo').textContent = titulo;

  const ciudad = val(prop["Ciudad"]);
  const barrio = val(prop["Barrio/Sector"]);
  document.getElementById('propUbicacion').textContent =
    `${ciudad}${barrio ? ', ' + barrio : ''}`;

  const tipo = val(prop["Tipo"]) || "Propiedad";
  //const clasificacion = val(prop["Residencial / Comercial"]);
  // NUEVO
  const clasificacion = val(prop["Uso del suelo"]);




  document.getElementById('propTipo').textContent =
    `${tipo} ${clasificacion}`.trim();

  document.getElementById('propArea').textContent = val(prop["Área m2"]) || "0";
  document.getElementById('propHabitaciones').textContent = val(prop["Habitaciones"]) || "0";
  document.getElementById('propBanos').textContent = val(prop["Baños"]) || "0";
  document.getElementById('propParqueaderos').textContent = val(prop["Parqueaderos"]) || "0";

  const descripcion = val(prop["Descripción"] || prop["Descripcion"]);
  document.getElementById('propDescripcion').innerHTML =
    descripcion ? marked.parse(descripcion) : "<p>Sin descripción disponible.</p>";

  //const estado = val(prop["Estado"]);
  //const pVenta = val(prop["Precio Venta COP"]);
  //const pArriendo = val(prop["Precio Arriendo COP"]);

  //if (estado.includes("Venta") && pVenta) {
  //  document.getElementById('propPrecioVenta').textContent = pVenta;
  //  document.getElementById('propEstadoVenta').textContent = "Precio de venta";
  //} else if (estado.includes("Arriendo") && pArriendo) {
  //  document.getElementById('propPrecioVenta').textContent = pArriendo;
  //  document.getElementById('propEstadoVenta').textContent = "Precio de arriendo";
  //} else {
  //  document.getElementById('propPrecioVenta').textContent = "Consultar";
  //  document.getElementById('propEstadoVenta').textContent = "";
  //}



  // DESPUÉS
const tipoNegocio = val(prop["Tipo de Negocio"]);
const pVenta      = val(prop["Precio Venta COP"]);
const pArriendo   = val(prop["Precio Arriendo COP"]);

if (tipoNegocio.includes("Venta") && pVenta) {
  document.getElementById('propPrecioVenta').textContent = pVenta;
  document.getElementById('propEstadoVenta').textContent = "Precio de venta";
} else if (tipoNegocio.includes("Arriendo") && pArriendo) {
  document.getElementById('propPrecioVenta').textContent = pArriendo;
  document.getElementById('propEstadoVenta').textContent = "Precio de arriendo";
} else {
  document.getElementById('propPrecioVenta').textContent = pVenta || pArriendo || "Consultar";
  document.getElementById('propEstadoVenta').textContent = "";
}










  document.getElementById('propEstrato').textContent = val(prop["Estrato"]) || "-";
  //document.getElementById('propAdministracion').textContent = val(prop["Administración"]) || "-";
  //document.getElementById('propClasificacion').textContent = val(prop["Residencial / Comercial"]) || "-";

  document.getElementById('propAdministracion').textContent = val(prop["Administración"]) || "-";






  // NUEVO
  document.getElementById('propClasificacion').textContent = val(prop["Uso del suelo"]) || "-";
  var elAgente = document.getElementById('propAgente');
  if (elAgente) elAgente.textContent = val(prop["Agente"]) || "";


  cargarGaleria(prop);

  // SEO dinámico con foto principal
  const fotoPrincipal = normalizarFoto(val(prop["Foto 1"]));
  actualizarSEO(prop, fotoPrincipal);

  document.getElementById('btnWhatsapp').onclick = () => {
    const codProp = val(prop["CÓDIGO"]);
    const mensaje = `Hola! Estoy interesado en la propiedad *${codProp}*: ${titulo}`;
    window.open(
      `https://wa.me/${TEAM_REALTY_HISTORY_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
      '_blank'
    );
  };
}

// ===== GALERÍA =====
function cargarGaleria(prop) {
  const fotosArray = [];

  for (let i = 1; i <= 9; i++) {
    const url = val(prop[`Foto ${i}`]);
    if (!url) continue;

    const normalizada = normalizarFoto(url);
    if (normalizada) fotosArray.push(normalizada);
  }

  if (fotosArray.length === 0) {
    fotosArray.push('img/sin-imagen.png');
  }

  const imgPrincipal = document.getElementById('imgPrincipal');
  imgPrincipal.src = fotosArray[0];
  imgPrincipal.alt = generarAlt(prop, 0);

  imgPrincipal.onerror = function () {
    this.src = 'img/sin-imagen.png';
    this.alt = 'Imagen no disponible';
  };

  const thumbnailsContainer = document.getElementById('thumbnailsContainer');
  thumbnailsContainer.innerHTML = '';

  fotosArray.forEach((foto, index) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');

    const img = document.createElement('img');
    img.width = 300;
    img.height = 200;
    img.src = foto;
    img.alt = generarAlt(prop, index);
    img.loading = 'lazy';

    img.onerror = function () {
      this.src = 'img/sin-imagen.png';
    };

    thumbnail.appendChild(img);

    thumbnail.addEventListener('click', () => {
      const main = document.getElementById('imgPrincipal');
      main.src = foto;
      main.alt = generarAlt(prop, index);

      document.querySelectorAll('.thumbnail')
        .forEach(t => t.classList.remove('active'));

      thumbnail.classList.add('active');
    });

    thumbnailsContainer.appendChild(thumbnail);
  });
}

// ===== ERROR =====
function mostrarError(mensaje) {
  document.getElementById('mensajeCarga').innerHTML = `
    <div class="mensaje-error">
      <h2>⚠️ ${mensaje}</h2>
      <p>La propiedad que buscas no está disponible.</p>
      <a href="propiedades.html" class="btn-volver">
        ← Volver al listado
      </a>
    </div>
  `;
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', cargarPropiedad);
