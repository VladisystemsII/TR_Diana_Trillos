// ════════════════════════════════════════════════════════
//  js/admin-config.js
//  PROPÓSITO : Configuración global del panel + cargador
//              dinámico de módulos HTML (propiedades / blog).
//  CARGADO   : Primero, antes que cualquier otro script.
//  EXPONE    : ADMIN_CONFIG (objeto global), cargarModulo()
//  DEPENDE DE: nada — es la base de todo
// ════════════════════════════════════════════════════════

const ADMIN_CONFIG = {

  // ── Credenciales de acceso ─────────────────────────────
  CREDENTIALS: {
    "diana": "Genio",
    "admin": "teamrealty33"
  },

  // ── Cloudinary ─────────────────────────────────────────
  CLOUDINARY: {
    CLOUD_NAME:    "dq2osuxac",
    UPLOAD_PRESET: "diadmiclou",
    MAX_SIZE_MB:   1.5,
    QUALITY:       0.78,
    MAX_W:         1600,
    MAX_H:         1200
  },

  // ── Web App URL (doGet — JSON) ─────────────────────────
  ENDPOINT: "https://script.google.com/macros/s/AKfycbwNMuIV9-mCqqMxUgb4FrJElHGNSmoIy38yYL-BCsmoxkS4Vf709_kEY4rdk1JVEsPt/exec",

  // ── Form 1 — Crear propiedad ───────────────────────────
  FORM_CREAR_URL: "https://docs.google.com/forms/d/e/1FAIpQLSfYVZChBT5xAXfNIDre9AKVLVGjfT7GR-VMMR1jus_wxQ5Buw/formResponse",

  // ── Entry IDs Form 1 ───────────────────────────────────
  ENTRY: {
    TITULO:          "entry.1699706084",
    DIRECCION:       "entry.1337236259",
    TIPO:            "entry.2096117089",
    CIUDAD:          "entry.585419397",
    BARRIO:          "entry.1947662059",
    ESTRATO:         "entry.567738076",
    AREA:            "entry.676151136",
    HABITACIONES:    "entry.435817126",
    BANOS:           "entry.780113606",
    PARQUEADEROS:    "entry.1365930281",
    RES_COMERCIAL:   "entry.296736527",
    TIPO_NEGOCIO:    "entry.1910036077",
    ESTADO:          "entry.124825591",
    PRECIO_VENTA:    "entry.1923829294",
    PRECIO_ARRIENDO: "entry.964941654",
    ADMINISTRACION:  "entry.1194298416",
    DESCRIPCION:     "entry.1752731594",
    FOTO1:           "entry.87654233",
    FOTO2:           "entry.459158562",
    FOTO3:           "entry.998849546",
    FOTO4:           "entry.355246951",
    FOTO5:           "entry.2012934627",
    FOTO6:           "entry.430056998",
    FOTO7:           "entry.1530203383",
    FOTO8:           "entry.612456693",
    FOTO9:           "entry.1491080789",
    ACTIVO_CREAR:    "entry.1295948975"
  },

  // ── Sentinels Form 1 ───────────────────────────────────
  SENTINELS: [
    "entry.2096117089",
    "entry.567738076",
    "entry.435817126",
    "entry.1365930281",
    "entry.1910036077",
    "entry.124825591",
    "entry.1295948975"
  ]
};






// ════════════════════════════════════════════════════════
//  BLOG CONFIG
// ════════════════════════════════════════════════════════

const BLOG_CONFIG = {

  FORM_CREAR_URL:     'https://docs.google.com/forms/d/e/1FAIpQLSdy7RauAPHiKnEfEv_j_WTr3KKiMC-J9qFidADRDwJsiX7qIg/formResponse',
  FORM_MODIFICAR_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSeTVLGIgjWyo6i3cr8rZBLsi6YboiAm7qMSYZuwPwHcN1Jy9A/formResponse',
  API_URL: 'https://script.google.com/macros/s/AKfycbwkbqpfrWBdcaU8P5p65pvCcx5lD0osca_d_Pl1YlBo8tqbf6FA-9-xkN0NjpMVcAuUAg/exec',

  ENTRY_CREAR: {
    FECHA_YEAR:  'entry.986466135_year',
    FECHA_MONTH: 'entry.986466135_month',
    FECHA_DAY:   'entry.986466135_day',
    TITULO:      'entry.1499185813',
    RESUMEN:     'entry.1020293648',
    CONTENIDO:   'entry.1525865495',
    IMAGEN:      'entry.2091584793',
    ACTIVO:      'entry.1253123361'
  },

  SENTINELS_CREAR: ['entry.1253123361'],

  ENTRY_MODIFICAR: {
    CODIGO:      'entry.1803008517',
    FECHA_YEAR:  'entry.1469905646_year',
    FECHA_MONTH: 'entry.1469905646_month',
    FECHA_DAY:   'entry.1469905646_day',
    TITULO:      'entry.1911901743',
    RESUMEN:     'entry.667480293',
    CONTENIDO:   'entry.153504690',
    IMAGEN:      'entry.174248761',
    ACTIVO:      'entry.345300605'
  },

  SENTINELS_MODIFICAR: ['entry.345300605']

};

// ════════════════════════════════════════════════════════
//  CARGADOR DE MÓDULOS







// ════════════════════════════════════════════════════════
//  CARGADOR DE MÓDULOS
//  cargarModulo(nombre)
//  - nombre: 'propiedades' | 'blog'
//  - Hace fetch() del archivo HTML correspondiente
//  - Lo inyecta en <div id="view-container">
//  - Una vez inyectado activa la primera vista del módulo
//  - Usa caché: si el módulo ya fue cargado no vuelve a
//    hacer fetch, solo activa la vista
// ════════════════════════════════════════════════════════

// Registro de módulos ya cargados para no repetir fetch
const _modulosCargados = {};

async function cargarModulo(nombre, viewId, section, viewName, btn) {
  const container = document.getElementById('view-container');
  if (!container) return;

  if (_modulosCargados[nombre]) {
    _activarPrimerVista(nombre, viewId, section, viewName, btn);
    return;
  }

  try {
    const ruta = nombre === 'blog' ? 'blog.html' : 'propiedades.html';
    const res  = await fetch(ruta);
    if (!res.ok) throw new Error(`No se pudo cargar ${ruta}`);
    const html = await res.text();
    container.insertAdjacentHTML('beforeend', html); 
    _modulosCargados[nombre] = true;
    _activarPrimerVista(nombre, viewId, section, viewName, btn);
  } catch (err) {
    container.innerHTML = `<div class="coming-soon"><p>Error al cargar módulo: ${err.message}</p></div>`;
  }
}


// Activa la primera sección visible del módulo recién cargado
//function _activarPrimerVista(nombre, viewId, section, viewName, btn) {
//  if (nombre === 'blog') {
    // Si venía con viewId específico (blog-crear, blog-leer, blog-actualizar) úsalo
    // Si no, por defecto blog-crear
//    const vid  = viewId  || 'blog-crear';
//    const sec  = section || 'Blog';
//    const vn   = viewName|| 'Crear';
//    activarVista(vid, sec, vn, btn);
//  } else {
//    const vid  = viewId  || 'crear';
//    const sec  = section || 'Propiedades';
//    const vn   = viewName|| 'Crear';
//    activarVista(vid, sec, vn, btn);
//  }
//}



function _activarPrimerVista(nombre, viewId, section, viewName, btn) {
  if (nombre === 'blog') {
    const vid  = viewId  || 'blog-crear';
    const sec  = section || 'Blog';
    const vn   = viewName|| 'Crear';
    setTimeout(() => activarVista(vid, sec, vn, btn), 0);
  } else {
    const vid  = viewId  || 'crear';
    const sec  = section || 'Propiedades';
    const vn   = viewName|| 'Crear';
    setTimeout(() => activarVista(vid, sec, vn, btn), 0);
  }
}
