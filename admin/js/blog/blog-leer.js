// ════════════════════════════════════════════════════════
//  js/blog/blog-leer.js
//  PROPÓSITO : Módulo 02 — Leer / Consultar posts de blog.
//              Carga la tabla completa desde el endpoint,
//              permite búsqueda por código en tiempo real
//              y muestra la ficha de detalle completo.
//  DEPENDE DE: admin-config.js (BLOG_CONFIG.API_URL)
//              admin-auth.js  (toast, activarVista)
// ════════════════════════════════════════════════════════

// ── ESTADO INTERNO ────────────────────────────────────────
let _blogLeerDatos    = [];
let _blogLeerFiltrado = [];

// ── INICIALIZAR MÓDULO ────────────────────────────────────
function initBlogLeer() {
  if (_blogLeerDatos.length === 0) {
    cargarTablaBlogLeer();
  }
  setTimeout(() => {
    const inp = document.getElementById('blog-leer-search');
    if (inp) inp.focus();
  }, 150);
}

// ── CARGAR DATOS DESDE EL ENDPOINT ───────────────────────
async function cargarTablaBlogLeer() {
  const tbody   = document.getElementById('blog-leer-tbody');
  const skWrap  = document.getElementById('blog-leer-skeleton');
  const tabWrap = document.getElementById('blog-leer-tabla-wrap');

  if (skWrap)  skWrap.style.display  = 'flex';
  if (tabWrap) tabWrap.style.display = 'none';

  try {
    const res  = await fetch(BLOG_CONFIG.API_URL);
    const json = await res.json();
    _blogLeerDatos    = json.data || json.registros || json || [];
    _blogLeerFiltrado = [..._blogLeerDatos];
    _renderTablaBlog(_blogLeerFiltrado);
  } catch (err) {
    toast('Error al cargar posts: ' + err.message, 'error');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Error de conexión — intenta de nuevo.</td></tr>`;
  } finally {
    if (skWrap)  skWrap.style.display  = 'none';
    if (tabWrap) tabWrap.style.display = 'block';
  }
}

// ── RENDERIZAR TABLA ──────────────────────────────────────
function _renderTablaBlog(registros) {
  const tbody = document.getElementById('blog-leer-tbody');
  if (!tbody) return;

  if (!registros || registros.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No se encontraron posts.</td></tr>`;
    return;
  }

  tbody.innerHTML = registros.map((r, idx) => {
    const codigo  = r['CÓDIGO']           || '—';
    const fecha   = r['Fecha']            || '—';
    const titulo  = r['Título']           || '—';
    const resumen = r['Resumen']          || '—';
    const activo  = (r['Activo (si/no)'] || 'no').toLowerCase();
    const badgeActivo = activo === 'si'
      ? `<span class="badge-on">Sí</span>`
      : `<span class="badge-off">No</span>`;
    return `
      <tr>
        <td class="col-codigo">${codigo}</td>
        <td>${fecha}</td>
        <td>${titulo}</td>
        <td class="col-dir">${resumen}</td>
        <td>${badgeActivo}</td>
        <td>
          <div class="table-actions">
            <button onclick="verBlogPostLeer(${idx})" title="Ver detalle completo">Ver</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── BÚSQUEDA EN TIEMPO REAL ───────────────────────────────
function filtrarBlogLeer() {
  const q = (document.getElementById('blog-leer-search')?.value || '').trim().toLowerCase();

  if (!q) {
    _blogLeerFiltrado = [..._blogLeerDatos];
  } else {
    _blogLeerFiltrado = _blogLeerDatos.filter(r => {
      const codigo = (r['CÓDIGO'] || '').toLowerCase();
      return codigo.includes(q);
    });
  }
  _renderTablaBlog(_blogLeerFiltrado);

  if (_blogLeerFiltrado.length === 1) {
    const codigo = (_blogLeerFiltrado[0]['CÓDIGO'] || '').toLowerCase();
    if (codigo === q) verBlogPostLeer(0);
  }
}

// ── VER POST: mostrar ficha completa ──────────────────────
function verBlogPostLeer(idxEnFiltrado) {
  const r = _blogLeerFiltrado[idxEnFiltrado];
  if (!r) return;

  const v = (key, fallback = '—') => {
    const val = r[key];
    return (val !== undefined && val !== null && val !== '') ? val : fallback;
  };

  const activo = (r['Activo (si/no)'] || 'no').toLowerCase() === 'si';

  const ficha = document.getElementById('blog-leer-ficha');
  if (!ficha) return;

  ficha.innerHTML = `
    <div class="ficha-section">
      <h3 class="section-label">Información del Post</h3>
      <div class="ficha-grid">
        <div class="ficha-row"><span class="dc-label">Código</span><span class="dc-val">${v('CÓDIGO')}</span></div>
        <div class="ficha-row"><span class="dc-label">Fecha</span><span class="dc-val">${v('Fecha')}</span></div>
        <div class="ficha-row full">
          <span class="dc-label">Título</span>
          <span class="dc-val ficha-titulo">${v('Título')}</span>
        </div>
        <div class="ficha-row full">
          <span class="dc-label">Resumen</span>
          <span class="dc-val">${v('Resumen')}</span>
        </div>
      </div>
    </div>
    <div class="ficha-section">
      <h3 class="section-label">Contenido</h3>
      <p class="ficha-desc">${v('Contenido')}</p>
    </div>
    <div class="ficha-section ficha-section-activo">
      <h3 class="section-label">Estado de Publicación</h3>
      <span class="${activo ? 'badge-on' : 'badge-off'} badge-lg">
        ${activo ? '● Activo' : '● Inactivo'}
      </span>
    </div>
  `;

  document.getElementById('blog-leer-vista-tabla').style.display = 'none';
  document.getElementById('blog-leer-vista-ficha').style.display = 'block';
  document.getElementById('bc-view').textContent = 'Leer · Detalle';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── VOLVER AL LISTADO ─────────────────────────────────────
function blogLeerVolverListado() {
  document.getElementById('blog-leer-vista-ficha').style.display = 'none';
  document.getElementById('blog-leer-vista-tabla').style.display = 'block';
  document.getElementById('bc-view').textContent = 'Leer';
}

// ── RECARGAR DATOS ────────────────────────────────────────
function recargarBlogLeer() {
  _blogLeerDatos    = [];
  _blogLeerFiltrado = [];
  const inp = document.getElementById('blog-leer-search');
  if (inp) inp.value = '';
  cargarTablaBlogLeer();
}

// ── HOOK: interceptar activarVista para inicializar ───────
(function() {
  const _orig = window.activarVista;
  window.activarVista = function(viewId, section, viewName, btn) {
    _orig(viewId, section, viewName, btn);
    if (viewId === 'blog-leer') {
      const ft = document.getElementById('blog-leer-vista-ficha');
      const tt = document.getElementById('blog-leer-vista-tabla');
      if (ft) ft.style.display = 'none';
      if (tt) tt.style.display = 'block';
      initBlogLeer();
    }
  };
})();
