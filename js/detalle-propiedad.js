// detalle-propiedad.js — Lógica de carga del detalle de una propiedad

// ===== NORMALIZAR URLs DE GOOGLE DRIVE =====
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
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }
  return url;
}

// ===== ALT AUTOMÁTICO =====
function generarAlt(prop, index = 0) {
  const titulo = (prop && (prop["Título"] || prop["Titulo"])) || "Propiedad";
  const codigo = (prop && prop["CÓDIGO"]) || "SIN-CODIGO";
  return `${titulo} - ${codigo} - Foto ${index + 1}`;
}

// ===== CARGA PRINCIPAL =====
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

    const response = await fetch(PORTAL33_CONFIG.PROPIEDADES_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const data = await response.json();

    const propiedad = data.find(p =>
      p["CÓDIGO"]?.trim() === codigo.trim() &&
      String(p["Activo (si/no)"]).toLowerCase() === "si"
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

  const titulo = prop["Título"] || prop["Titulo"] || "Sin título";
  document.getElementById('propTitulo').textContent = titulo;

  const ciudad = prop["Ciudad"] || "";
  const barrio = prop["Barrio/Sector"] || "";
  document.getElementById('propUbicacion').textContent =
    `${ciudad}${barrio ? ', ' + barrio : ''}`;

  const tipo = prop["Tipo"] || "Propiedad";
  const clasificacion = prop["Residencial / Comercial"] || "";
  document.getElementById('propTipo').textContent =
    `${tipo} ${clasificacion}`.trim();

  document.getElementById('propArea').textContent = prop["Área m2"] || "0";
  document.getElementById('propHabitaciones').textContent = prop["Habitaciones"] || "0";
  document.getElementById('propBanos').textContent = prop["Baños"] || "0";
  document.getElementById('propParqueaderos').textContent = prop["Parqueaderos"] || "0";

  const descripcion = prop["Descripción"] || prop["Descripcion"] || "";
  document.getElementById('propDescripcion').innerHTML =
    descripcion.trim() ? marked.parse(descripcion) : "<p>Sin descripción disponible.</p>";

  const estado = prop["Estado"] || "";
  const pVenta = prop["Precio Venta COP"] || "";
  const pArriendo = prop["Precio Arriendo COP"] || "";

  if (estado.includes("Venta") && pVenta) {
    document.getElementById('propPrecioVenta').textContent = pVenta;
    document.getElementById('propEstadoVenta').textContent = "Precio de venta";
  } else if (estado.includes("Arriendo") && pArriendo) {
    document.getElementById('propPrecioVenta').textContent = pArriendo;
    document.getElementById('propEstadoVenta').textContent = "Precio de arriendo";
  } else {
    document.getElementById('propPrecioVenta').textContent = "Consultar";
    document.getElementById('propEstadoVenta').textContent = "";
  }

  document.getElementById('propEstrato').textContent = prop["Estrato"] || "-";
  document.getElementById('propAdministracion').textContent = prop["Administración"] || "-";
  document.getElementById('propClasificacion').textContent = prop["Residencial / Comercial"] || "-";

  cargarGaleria(prop);

  document.getElementById('btnWhatsapp').onclick = () => {
    const codProp = prop["CÓDIGO"] || "";
    const mensaje = `Hola! Estoy interesado en la propiedad *${codProp}*: ${titulo}`;

    window.open(
      `https://wa.me/${PORTAL33_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
      '_blank'
    );
  };
}

// ===== GALERÍA =====
function cargarGaleria(prop) {
  const fotosArray = [];

  for (let i = 1; i <= 9; i++) {
    const url = prop[`Foto ${i}`];
    if (!url || url.trim() === '') continue;

    const normalizada = normalizarFoto(url);
    if (normalizada) fotosArray.push(normalizada);
  }

  if (fotosArray.length === 0) {
    fotosArray.push('img/sin-imagen.png');
  }

  const imgPrincipal = document.getElementById('imgPrincipal');
  imgPrincipal.src = fotosArray[0];
  imgPrincipal.alt = generarAlt(prop, 0);


  /*

  imgPrincipal.onerror = function () {
    this.src = 'img/sin-imagen.png';
  };

  */


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

    // ✔ CORRECTO: cargar imagen visible
    img.src = foto;

    // ALT automático
    img.alt = generarAlt(prop, index);
    img.loading = 'lazy';



    /*

    img.onerror = function () {
      this.src = 'img/sin-imagen.png';
    };

    */


    img.onerror = function () {
      this.src = 'img/sin-imagen.png';
      this.alt = 'Imagen no disponible';
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