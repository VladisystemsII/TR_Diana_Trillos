// ════════════════════════════════════════════════════════
//  js/blog/blog-actualizar.js
//  PROPÓSITO : Módulo 03 — Actualizar Post de Blog.
//              Carga la tabla, permite buscar por código,
//              abre el formulario editable pre-cargado con
//              los datos actuales y envía al Form Modificar
//              de Google Forms.
//  DEPENDE DE: admin-config.js (BLOG_CONFIG)
//              admin-auth.js  (toast, activarVista)
// ════════════════════════════════════════════════════════

// ── ESTADO INTERNO ────────────────────────────────────────
let _blogActDatos    = [];   // registros cargados
let _blogActFiltrado = [];   // subconjunto tras búsqueda
let _blogActPost     = null; // post actualmente en edición

// ── INIT ──────────────────────────────────────────────────
function initBlogActualizar() {
  if (_blogActDatos.length === 0) cargarTablaBlogActualizar();
  setTimeout(() => {
    const inp = document.getElementById('blog-act-search');
    if (inp) inp.focus();
  }, 150);
}

// ── CARGAR DATOS ──────────────────────────────────────────
async function cargarTablaBlogActualizar() {
  const tbody   = document.getElementById('blog-act-tbody');
  const sk      = document.getElementById('blog-act-skeleton');
  const tabWrap = document.getElementById('blog-act-tabla-wrap');

  if (sk)      sk.style.display      = 'flex';
  if (tabWrap) tabWrap.style.display = 'none';

  try {
    const res  = await fetch(BLOG_CONFIG.API_URL);
    const json = await res.json();
    _blogActDatos    = json.data || json.registros || json || [];
    _blogActFiltrado = [..._blogActDatos];
    _renderTablaBlogAct(_blogActFiltrado);
  } catch (err) {
    toast('Error al cargar posts: ' + err.message, 'error');
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="empty-row">Error de conexión — intenta de nuevo.</td></tr>`;
  } finally {
    if (sk)      sk.style.display      = 'none';
    if (tabWrap) tabWrap.style.display = 'block';
  }
}

// ── RENDER TABLA ──────────────────────────────────────────
function _renderTablaBlogAct(registros) {
  const tbody = document.getElementById('blog-act-tbody');
  if (!tbody) return;

  if (!registros || registros.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-row">No se encontraron posts.</td></tr>`;
    return;
  }

  tbody.innerHTML = registros.map((r, idx) => {
    const codigo  = r['CÓDIGO']           || '—';
    const fecha   = r['Fecha']            || '—';
    const titulo  = r['Título']           || '—';
    const activo  = (r['Activo (si/no)'] || 'no').toLowerCase() === 'si';
    return `
      <tr>
        <td class="col-codigo">${codigo}</td>
        <td>${fecha}</td>
        <td>${titulo}</td>
        <td><span class="${activo ? 'badge-on' : 'badge-off'}">${activo ? 'Sí' : 'No'}</span></td>
        <td>
          <div class="table-actions">
            <button onclick="abrirFormBlogActualizar(${idx})">Modificar</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ── FILTRAR ───────────────────────────────────────────────
function filtrarBlogActualizar() {
  const q = (document.getElementById('blog-act-search')?.value || '').trim().toLowerCase();
  _blogActFiltrado = q
    ? _blogActDatos.filter(r => (r['CÓDIGO'] || '').toLowerCase().includes(q))
    : [..._blogActDatos];
  _renderTablaBlogAct(_blogActFiltrado);
  // Coincidencia exacta → abrir directamente
  if (_blogActFiltrado.length === 1 && (_blogActFiltrado[0]['CÓDIGO'] || '').toLowerCase() === q) {
    abrirFormBlogActualizar(0);
  }
}

// ── ABRIR FORMULARIO DE EDICIÓN ───────────────────────────
function abrirFormBlogActualizar(idxEnFiltrado) {
  const r = _blogActFiltrado[idxEnFiltrado];
  if (!r) return;
  _blogActPost = r;

  const s = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  // Código (solo lectura)
  const codEl = document.getElementById('blog-act-codigo-display');
  if (codEl) codEl.textContent = r['CÓDIGO'] || '—';

  // Fecha: el campo es tipo date — convertir si viene como ISO
  const fechaRaw = r['Fecha'] || '';
  let fechaVal = '';
  if (fechaRaw) {
    try {
      const d = new Date(fechaRaw);
      if (!isNaN(d)) {
        fechaVal = d.toISOString().split('T')[0]; // yyyy-mm-dd
      } else {
        fechaVal = fechaRaw;
      }
    } catch { fechaVal = fechaRaw; }
  }
  s('blog-act-fecha',     fechaVal);
  s('blog-act-titulo',    r['Título']);
  s('blog-act-resumen',   r['Resumen']);
  s('blog-act-contenido', r['Contenido']);

  const activo = (r['Activo (si/no)'] || 'no').toLowerCase() === 'si';
  const chk    = document.getElementById('blog-act-activo');
  if (chk) {
    chk.checked = activo;
    const lbl = document.getElementById('blog-act-activo-label');
    if (lbl) lbl.textContent = activo ? 'Sí' : 'No';
  }

  document.getElementById('blog-act-vista-tabla').style.display = 'none';
  document.getElementById('blog-act-vista-form').style.display  = 'block';
  document.getElementById('bc-view').textContent = 'Actualizar · Editar';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── GUARDAR CAMBIOS ───────────────────────────────────────
async function guardarBlogActualizacion() {
  if (!_blogActPost) return;

  const g = id => {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked ? 'Si' : 'No';
    return (el.value || '').trim();
  };

  const codigo = _blogActPost['CÓDIGO'] || '';
  if (!codigo) { toast('Error: no hay código del post', 'error'); return; }

  // Descomponer fecha en year/month/day para el Form
  const fechaStr = g('blog-act-fecha'); // yyyy-mm-dd
  let year = '', month = '', day = '';
  if (fechaStr) {
    const parts = fechaStr.split('-');
    year  = parts[0] || '';
    month = parts[1] || '';
    day   = parts[2] || '';
  }

  const btn = document.getElementById('blog-btn-actualizar');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
  toast('Enviando cambios al sistema…', 'info', 2500);

  // Patrón idéntico al MVP — objeto plano con entry IDs literales
  const merged = Object.assign({ fvv: '1', pageHistory: '0' }, {
    [BLOG_CONFIG.ENTRY_MODIFICAR.CODIGO]:      codigo,
    [BLOG_CONFIG.ENTRY_MODIFICAR.FECHA_YEAR]:  year,
    [BLOG_CONFIG.ENTRY_MODIFICAR.FECHA_MONTH]: month,
    [BLOG_CONFIG.ENTRY_MODIFICAR.FECHA_DAY]:   day,
    [BLOG_CONFIG.ENTRY_MODIFICAR.TITULO]:      g('blog-act-titulo'),
    [BLOG_CONFIG.ENTRY_MODIFICAR.RESUMEN]:     g('blog-act-resumen'),
    [BLOG_CONFIG.ENTRY_MODIFICAR.CONTENIDO]:   g('blog-act-contenido'),
    [BLOG_CONFIG.ENTRY_MODIFICAR.ACTIVO]:      g('blog-act-activo'),
  });

  // Sentinels
  BLOG_CONFIG.SENTINELS_MODIFICAR.forEach(s => {
    merged[`${s}_sentinel`] = '';
  });

  const payload = new URLSearchParams(merged).toString();

  try {
    await fetch(BLOG_CONFIG.FORM_MODIFICAR_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    payload
    });

    _blogActDatos    = [];
    _blogActFiltrado = [];

    // Countdown 8s mientras el trigger de Apps Script procesa
    let seg = 8;
    const intervalo = setInterval(() => {
      seg--;
      if (btn) btn.textContent = `Actualizando… ${seg}s`;
      if (seg <= 0) {
        clearInterval(intervalo);
        blogActVolverListado();
      }
    }, 1000);

    toast(`✓ Post "${codigo}" actualizado. Recargando en 8s…`, 'success', 8500);

  } catch (e) {
    toast(`Error al actualizar: ${e.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar Cambios'; }
  }
}

// ── VOLVER AL LISTADO ─────────────────────────────────────
function blogActVolverListado() {
  _blogActDatos    = [];
  _blogActFiltrado = [];
  _blogActPost     = null;
  const inp = document.getElementById('blog-act-search');
  if (inp) inp.value = '';
  document.getElementById('blog-act-vista-form').style.display  = 'none';
  document.getElementById('blog-act-vista-tabla').style.display = 'block';
  document.getElementById('bc-view').textContent = 'Actualizar';
  cargarTablaBlogActualizar();
}

// ── HOOK NAVEGACIÓN ───────────────────────────────────────
(function () {
  const _orig = window.activarVista;
  window.activarVista = function (viewId, section, viewName, btn) {
    _orig(viewId, section, viewName, btn);
    if (viewId === 'blog-actualizar') {
      const vf = document.getElementById('blog-act-vista-form');
      const vt = document.getElementById('blog-act-vista-tabla');
      if (vf) vf.style.display = 'none';
      if (vt) vt.style.display = 'block';
      initBlogActualizar();
    }
  };
})();
