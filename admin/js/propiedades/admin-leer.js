// ════════════════════════════════════════════════════════
//  js/propiedades/admin-leer.js
//  PROPÓSITO : Módulo 02 — Leer / Consultar propiedades.
//              Carga la tabla completa desde el endpoint,
//              permite búsqueda por código en tiempo real
//              y muestra la ficha de detalle completo.
//  DEPENDE DE: admin-config.js (ADMIN_CONFIG.ENDPOINT)
//              admin-auth.js  (toast, activarVista)
// ════════════════════════════════════════════════════════

// ── ESTADO INTERNO ────────────────────────────────────────
let _leerDatos    = [];   // todos los registros cargados
let _leerFiltrado = [];   // subconjunto tras búsqueda

// ── INICIALIZAR MÓDULO ────────────────────────────────────
// Se llama desde el hook de activarVista cuando el usuario
// pincha "Leer" en el sidebar
function initLeer() {
  if (_leerDatos.length === 0) {
    cargarTablaLeer();
  }
  setTimeout(() => {
    const inp = document.getElementById('leer-search');
    if (inp) inp.focus();
  }, 150);
}

// ── CARGAR DATOS DESDE EL ENDPOINT ───────────────────────
async function cargarTablaLeer() {
  const tbody   = document.getElementById('leer-tbody');
  const skWrap  = document.getElementById('leer-skeleton');
  const tabWrap = document.getElementById('leer-tabla-wrap');

  if (skWrap)  skWrap.style.display  = 'flex';
  if (tabWrap) tabWrap.style.display = 'none';

  try {
    const res  = await fetch(ADMIN_CONFIG.ENDPOINT);
    const json = await res.json();
    _leerDatos    = json.data || json.registros || json || [];
    _leerFiltrado = [..._leerDatos];
    _renderTabla(_leerFiltrado);
  } catch (err) {
    toast('Error al cargar propiedades: ' + err.message, 'error');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Error de conexión — intenta de nuevo.</td></tr>`;
  } finally {
    if (skWrap)  skWrap.style.display  = 'none';
    if (tabWrap) tabWrap.style.display = 'block';
  }
}

// ── RENDERIZAR TABLA ──────────────────────────────────────
function _renderTabla(registros) {
  const tbody = document.getElementById('leer-tbody');
  if (!tbody) return;

  if (!registros || registros.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No se encontraron propiedades.</td></tr>`;
    return;
  }

  tbody.innerHTML = registros.map((r, idx) => {
    const codigo    = r['CÓDIGO']              || '—';
    const tipo      = r['Tipo']                || '—';
    const negocio   = r['Tipo de Negocio'] || '—';   // <-- AQUÍ
    const barrio    = r['Barrio/Sector']        || '—';
    const direccion = r['Dirección exacta only admin'] || '—';
    const activo    = (r['Activo (si/no)'] || 'no').toLowerCase();
    const badgeActivo = activo === 'si'
      ? `<span class="badge-on">Sí</span>`
      : `<span class="badge-off">No</span>`;
    return `
      <tr>
        <td class="col-codigo">${codigo}</td>
        <td>${tipo}</td>
        <td>${negocio}</td>
        <td>${barrio}</td>
        <td class="col-dir">${direccion}</td>
        <td>${badgeActivo}</td>
        <td>
          <div class="table-actions">
            <button onclick="verPropiedadLeer(${idx})" title="Ver detalle completo">Ver</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── BÚSQUEDA EN TIEMPO REAL ───────────────────────────────
function filtrarLeer() {
  const q = (document.getElementById('leer-search')?.value || '').trim().toLowerCase();

  if (!q) {
    _leerFiltrado = [..._leerDatos];
  } else {
    _leerFiltrado = _leerDatos.filter(r => {
      const codigo = (r['CÓDIGO'] || '').toLowerCase();
      return codigo.includes(q);
    });
  }
  _renderTabla(_leerFiltrado);

  // Si hay exactamente 1 resultado y coincide el código exacto → mostrar detalle
  if (_leerFiltrado.length === 1) {
    const codigo = (_leerFiltrado[0]['CÓDIGO'] || '').toLowerCase();
    if (codigo === q) verPropiedadLeer(0);
  }
}

// ── VER PROPIEDAD: mostrar ficha completa ─────────────────
function verPropiedadLeer(idxEnFiltrado) {
  const r = _leerFiltrado[idxEnFiltrado];
  if (!r) return;

  const v = (key, fallback = '—') => {
    const val = r[key];
    return (val !== undefined && val !== null && val !== '') ? val : fallback;
  };
  const fmtPrecio = val => {
    if (!val || val === '—') return '—';
    //const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    const num = parseFloat(String(val).replace(/\./g, '').replace(/[^0-9]/g, ''));
    if (isNaN(num)) return val;
    return '$ ' + num.toLocaleString('es-CO');
  };
  const activo = (r['Activo (si/no)'] || 'no').toLowerCase() === 'si';

  const fotoKeys = ['Foto 1','Foto 2','Foto 3','Foto 4','Foto 5','Foto 6','Foto 7','Foto 8','Foto 9'];
  const fotosHTML = fotoKeys
    .map(k => r[k] || '')
    .filter(url => url && url.trim() !== '')
    .map(url => `<a href="${url}" target="_blank" rel="noopener">
        <img src="${url}" alt="Foto propiedad" loading="lazy">
      </a>`)
    .join('');

  const ficha = document.getElementById('leer-ficha');
  if (!ficha) return;

  const nombreAgente = codigo => {
  switch (codigo) {
    case '01': return 'Diana Trillos';
    case '02': return 'Vladimir Alba';
    default:   return '—';
  }
};

  ficha.innerHTML = `
    <div class="ficha-section">
      <h3 class="section-label">Información Principal</h3>
      <div class="ficha-grid">
        <div class="ficha-row full">
          <span class="dc-label">Título</span>
          <span class="dc-val ficha-titulo">${v('Título')}</span>
        </div>
        <div class="ficha-row"><span class="dc-label">Código</span><span class="dc-val">${v('CÓDIGO')}</span></div>
        <div class="ficha-row"><span class="dc-label">Tipo de Inmueble</span><span class="dc-val">${v('Tipo')}</span></div>
        <div class="ficha-row"><span class="dc-label">Ciudad</span><span class="dc-val">${v('Ciudad')}</span></div>
        <div class="ficha-row"><span class="dc-label">Barrio / Sector</span><span class="dc-val">${v('Barrio/Sector')}</span></div>
        <div class="ficha-row"><span class="dc-label">Estrato</span><span class="dc-val">${v('Estrato')}</span></div>
        <div class="ficha-row"><span class="dc-label">Área m²</span><span class="dc-val">${v('Área m2')} m²</span></div>
        <div class="ficha-row"><span class="dc-label">Uso del Suelo</span><span class="dc-val">${v('Uso del suelo')}</span></div>
      </div>
    </div>
    <div class="ficha-section">
      <h3 class="section-label">Características</h3>
      <div class="ficha-grid">
        <div class="ficha-row"><span class="dc-label">Habitaciones</span><span class="dc-val">${v('Habitaciones')}</span></div>
        <div class="ficha-row"><span class="dc-label">Baños</span><span class="dc-val">${v('Baños')}</span></div>
        <div class="ficha-row"><span class="dc-label">Parqueaderos</span><span class="dc-val">${v('Parqueaderos')}</span></div>
        <div class="ficha-row"><span class="dc-label">Tipo de Negocio</span><span class="dc-val">${v('Tipo de Negocio')}</span></div>
        <div class="ficha-row"><span class="dc-label">Estado del Inmueble</span><span class="dc-val">${v('Estado')}</span></div>
      </div>
    </div>
    <div class="ficha-section">
      <h3 class="section-label">Precios</h3>
      <div class="ficha-grid">
        <div class="ficha-row"><span class="dc-label">Precio Venta</span><span class="dc-val ficha-precio">${fmtPrecio(v('Precio Venta COP'))}</span></div>
        <div class="ficha-row"><span class="dc-label">Precio Arriendo</span><span class="dc-val ficha-precio">${fmtPrecio(v('Precio Arriendo COP'))}</span></div>
        <div class="ficha-row"><span class="dc-label">Administración</span><span class="dc-val ficha-precio">${fmtPrecio(v('Administración'))}</span></div>
      </div>
    </div>
    <div class="ficha-section">
      <h3 class="section-label">Donde Comenzó Su Historia</h3>
      <p class="ficha-desc">${v('Descripción')}</p>
    </div>
    <div class="ficha-section">
  <h3 class="section-label">Un Recorrido por Cada Espacio</h3>
  <p class="ficha-desc">${v('Info')}</p>
</div>

<div class="ficha-section">
  <h3 class="section-label">Agente</h3>
  <div class="ficha-grid">
    <div class="ficha-row full">
      <span class="dc-label">Agente</span>
      <span class="dc-val">${nombreAgente(v('Agente'))}</span>
    </div>
  </div>
</div>
    <div class="ficha-section">
      <h3 class="section-label">Dirección Exacta</h3>
      <div class="ficha-grid">
        <div class="ficha-row full">
          <span class="dc-label">Dirección</span>
          <span class="dc-val">${v('Dirección exacta only admin')}</span>
        </div>
      </div>
    </div>
    <div class="ficha-section">
      <h3 class="section-label">Fotos</h3>
      ${fotosHTML
        ? `<div class="ficha-fotos">${fotosHTML}</div>`
        : `<p class="ficha-sin-fotos">Sin fotos registradas.</p>`}
    </div>
    <div class="ficha-section ficha-section-activo">
      <h3 class="section-label">Estado de Publicación</h3>
      <span class="${activo ? 'badge-on' : 'badge-off'} badge-lg">
        ${activo ? '● Activo' : '● Inactivo'}
      </span>
    </div>

    ${compartirFichaHTML(v('CÓDIGO'))}
  `;

  document.getElementById('leer-vista-tabla').style.display = 'none';
  document.getElementById('leer-vista-ficha').style.display = 'block';
  document.getElementById('bc-view').textContent = 'Leer · Detalle';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── VOLVER AL LISTADO ─────────────────────────────────────
function leerVolverListado() {
  document.getElementById('leer-vista-ficha').style.display = 'none';
  document.getElementById('leer-vista-tabla').style.display = 'block';
  document.getElementById('bc-view').textContent = 'Leer';
}

// ── RECARGAR DATOS ────────────────────────────────────────
function recargarLeer() {
  _leerDatos    = [];
  _leerFiltrado = [];
  const inp = document.getElementById('leer-search');
  if (inp) inp.value = '';
  cargarTablaLeer();
}

// ── HOOK: interceptar activarVista para inicializar ───────
// Extiende el comportamiento original sin romperlo
(function() {
  const _orig = window.activarVista;
  window.activarVista = function(viewId, section, viewName, btn) {
    _orig(viewId, section, viewName, btn);
    if (viewId === 'leer') {
      const ft = document.getElementById('leer-vista-ficha');
      const tt = document.getElementById('leer-vista-tabla');
      if (ft) ft.style.display = 'none';
      if (tt) tt.style.display = 'block';
      initLeer();
    }
  };
})();
