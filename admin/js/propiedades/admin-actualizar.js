// ════════════════════════════════════════════════════════
//  js/propiedades/admin-actualizar.js
//  PROPÓSITO : Módulo 03 — Actualizar Propiedad.
//              Carga la tabla, permite buscar por código,
//              abre el formulario editable pre-cargado con
//              los datos actuales y envía al Form 2 de
//              Google Forms. Reutiliza _comprimirImagen()
//              de admin-crear.js para el manejo de fotos.
//  DEPENDE DE: admin-config.js (ADMIN_CONFIG)
//              admin-auth.js  (toast)
//              admin-crear.js (_comprimirImagen)
// ════════════════════════════════════════════════════════

// ── ESTADO INTERNO ────────────────────────────────────────
let _actDatos    = [];   // registros cargados
let _actFiltrado = [];   // subconjunto tras búsqueda
let _actProp     = null; // propiedad actualmente en edición
let _actFotos    = {};   // URLs de fotos: {1:'url',...,9:'url'}

// ── Entry IDs Form 2 ──────────────────────────────────────
const E2 = {
  CODIGO:          "entry.1956649995",
  TITULO:          "entry.1721921262",
  DIRECCION:       "entry.416854513",
  TIPO:            "entry.886418945",
  CIUDAD:          "entry.1460693908",
  BARRIO:          "entry.2097141267",
  ESTRATO:         "entry.1116338612",
  AREA:            "entry.2007895918",
  HABITACIONES:    "entry.812049067",
  BANOS:           "entry.1289161291",
  PARQUEADEROS:    "entry.1159190441",
  RES_COMERCIAL:   "entry.1053143876",
  TIPO_NEGOCIO:    "entry.2066810155",
  ESTADO:          "entry.1909317832",
  PRECIO_VENTA:    "entry.1614455692",
  PRECIO_ARRIENDO: "entry.618220164",
  ADMINISTRACION:  "entry.1791769337",
  DESCRIPCION:     "entry.247912537",
  INFORMACION:     "entry.220950822",
  AGENTE:          "entry.358256629",
  FOTO1:           "entry.961793523",
  FOTO2:           "entry.1529417314",
  FOTO3:           "entry.1448316317",
  FOTO4:           "entry.377000207",
  FOTO5:           "entry.1293523259",
  FOTO6:           "entry.44154851",
  FOTO7:           "entry.1607363062",
  FOTO8:           "entry.222299510",
  FOTO9:           "entry.1853138135",
  ACTIVO:          "entry.1414317293"
};

// Sentinels del Form 2
const SENTINELS_F2 = [
  "entry.886418945",
  "entry.1116338612",
  "entry.812049067",
  "entry.1159190441",
  "entry.2066810155",
  "entry.1909317832",
  "entry.1414317293"
];

// URL Form 2
const FORM_ACTUALIZAR_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdaAmhSRYew8veXas8654Vmi8PE07yMKdO7UAJ8lbdtCdsmaQ/formResponse";

// ── INIT ──────────────────────────────────────────────────
function initActualizar() {
  if (_actDatos.length === 0) cargarTablaActualizar();
  setTimeout(() => {
    const inp = document.getElementById('act-search');
    if (inp) inp.focus();
  }, 150);
}

// ── CARGAR DATOS ──────────────────────────────────────────
async function cargarTablaActualizar() {
  const tbody   = document.getElementById('act-tbody');
  const sk      = document.getElementById('act-skeleton');
  const tabWrap = document.getElementById('act-tabla-wrap');

  if (sk) sk.style.display = 'flex';
  if (tabWrap) tabWrap.style.display = 'none';

  try {
    const res  = await fetch(ADMIN_CONFIG.ENDPOINT);
    const json = await res.json();
    _actDatos    = json.data || json.registros || json || [];
    _actFiltrado = [..._actDatos];
    _renderTablaAct(_actFiltrado);
  } catch(err) {
    toast('Error al cargar propiedades: ' + err.message, 'error');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Error de conexión.</td></tr>`;
  } finally {
    if (sk) sk.style.display = 'none';
    if (tabWrap) tabWrap.style.display = 'block';
  }
}

// ── RENDER TABLA ──────────────────────────────────────────
function _renderTablaAct(registros) {
  const tbody = document.getElementById('act-tbody');
  if (!tbody) return;

  if (!registros || registros.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No se encontraron propiedades.</td></tr>`;
    return;
  }

  tbody.innerHTML = registros.map((r, idx) => {
    const codigo = r['CÓDIGO']              || '—';
    const tipo   = r['Tipo']                || '—';
    const barrio = r['Barrio/Sector']       || '—';
    const dir    = r['Dirección exacta only admin'] || '—';
    const activo = (r['Activo (si/no)'] || 'no').toLowerCase() === 'si';
    return `
      <tr>
        <td class="col-codigo">${codigo}</td>
        <td>${tipo}</td>
        <td>${barrio}</td>
        <td class="col-dir">${dir}</td>
        <td><span class="${activo ? 'badge-on' : 'badge-off'}">${activo ? 'Sí' : 'No'}</span></td>
        <td>
          <button class="btn-ver" onclick="abrirFormActualizar(${idx})">Modificar</button>
        </td>
      </tr>`;
  }).join('');
}

// ── FILTRAR ───────────────────────────────────────────────
function filtrarActualizar() {
  const q = (document.getElementById('act-search')?.value || '').trim().toLowerCase();
  _actFiltrado = q
    ? _actDatos.filter(r => (r['CÓDIGO'] || '').toLowerCase().includes(q))
    : [..._actDatos];
  _renderTablaAct(_actFiltrado);
  // Coincidencia exacta → abrir directamente
  if (_actFiltrado.length === 1 && (_actFiltrado[0]['CÓDIGO'] || '').toLowerCase() === q) {
    abrirFormActualizar(0);
  }
}

// ── ABRIR FORMULARIO DE EDICIÓN ───────────────────────────
function abrirFormActualizar(idxEnFiltrado) {
  const r = _actFiltrado[idxEnFiltrado];
  if (!r) return;
  _actProp = r;

  for (let n = 1; n <= 9; n++) {
    _actFotos[n] = r[`Foto ${n}`] || '';
  }

  const s = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  //const sel = (id, val) => {
  //  const el = document.getElementById(id);
  //  if (!el) return;
  //  const opt = [...el.options].find(o => o.value === val);
  //  el.value = opt ? val : '';
  //};


  // DESPUÉS
const sel = (id, val) => {
  const el = document.getElementById(id);
  if (!el || val == null) return;
  const v = String(val).trim();  // convierte 5 → "5"
  const byVal = [...el.options].find(o => o.value === v);
  if (byVal) { el.value = byVal.value; return; }
  const byTxt = [...el.options].find(o => o.text.trim() === v);
  if (byTxt) { el.value = byTxt.value; return; }
  el.value = '';
};





  const codEl = document.getElementById('act-codigo-display');
  if (codEl) codEl.textContent = r['CÓDIGO'] || '—';

  const ts   = r['Marca temporal'];
  const tsEl = document.getElementById('act-timestamp');
  if (tsEl) tsEl.textContent = ts ? _fmtTimestamp(ts) : '—';

  s('act-titulo',           r['Título']);
  s('act-direccion',        r['Dirección exacta only admin']);
  sel('act-tipo',           r['Tipo']);
  s('act-ciudad',           r['Ciudad']);
  s('act-barrio',           r['Barrio/Sector']);
  sel('act-estrato',        r['Estrato']);
  s('act-area',             r['Área m2']);
  sel('act-hab',            r['Habitaciones']);
  s('act-ban',              r['Baños']);
  sel('act-park',           r['Parqueaderos']);
  s('act-res-com',          r['Uso del suelo']);
  sel('act-tipo-negocio',   r['Tipo de Negocio']);
  sel('act-estado',         r['Estado']);
  s('act-precio-venta',     r['Precio Venta COP']);
  s('act-precio-arriendo',  r['Precio Arriendo COP']);
  s('act-admin',            r['Administración']);
  s('act-descripcion',      r['Descripción']);
  s('act-informacion',      r['Información adicional']);
  sel('act-agente',         r['Agente']);

  const activo = (r['Activo (si/no)'] || 'no').toLowerCase() === 'si';
  const chk    = document.getElementById('act-activo');
  if (chk) {
    chk.checked = activo;
    const lbl = document.getElementById('act-activo-label');
    if (lbl) lbl.textContent = activo ? 'Sí' : 'No';
  }

  for (let n = 1; n <= 9; n++) {
    _renderSlotActualizar(n, _actFotos[n]);
  }

  document.getElementById('act-vista-tabla').style.display = 'none';
  document.getElementById('act-vista-form').style.display  = 'block';
  document.getElementById('bc-view').textContent = 'Actualizar · Editar';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── RENDER SLOT DE FOTO ───────────────────────────────────
function _renderSlotActualizar(n, url) {
  const prev  = document.getElementById(`act-prev-${n}`);
  const ph    = document.getElementById(`act-ph-${n}`);
  const clear = document.getElementById(`act-clear-${n}`);
  const inp   = document.getElementById(`act-foto${n}-hidden`);

  if (inp) inp.value = url || '';

  if (url) {
    if (prev)  { prev.src = url; prev.style.display = 'block'; }
    if (ph)    ph.style.display = 'none';
    if (clear) clear.style.display = 'block';
  } else {
    if (prev)  prev.style.display = 'none';
    if (ph)    ph.style.display = 'flex';
    if (clear) clear.style.display = 'none';
  }
}

// ── PROCESAR FOTO (igual que Crear pero con prefijo act-) ─
async function procesarFotoAct(n, input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const CLD  = ADMIN_CONFIG.CLOUDINARY;

  document.getElementById(`act-ph-${n}`).style.display   = 'none';
  document.getElementById(`act-prog-${n}`).style.display = 'block';
  _setBarAct(n, 10);

  try {
    const comprimida = await _comprimirImagen(file, CLD.MAX_W, CLD.MAX_H, CLD.QUALITY);
    _setBarAct(n, 40);

    const formData = new FormData();
    formData.append('file',          comprimida);
    formData.append('upload_preset', CLD.UPLOAD_PRESET);
    formData.append('folder',        'team_realty');
    _setBarAct(n, 60);

    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLD.CLOUD_NAME}/image/upload`, {
      method: 'POST', body: formData
    });
    const data = await res.json();
    _setBarAct(n, 90);

    if (data.secure_url) {
      _actFotos[n] = data.secure_url;
      _renderSlotActualizar(n, data.secure_url);
      _setBarAct(n, 100);
      setTimeout(() => {
        document.getElementById(`act-prog-${n}`).style.display = 'none';
        _setBarAct(n, 0);
      }, 600);
      toast(`Foto ${n} actualizada`, 'success', 2500);
    } else {
      throw new Error(data.error?.message || 'Cloudinary no devolvió URL');
    }
  } catch(err) {
    document.getElementById(`act-ph-${n}`).style.display   = 'flex';
    document.getElementById(`act-prog-${n}`).style.display = 'none';
    _setBarAct(n, 0);
    toast(`Error en Foto ${n}: ${err.message}`, 'error');
  }
}

function limpiarFotoAct(n) {
  _actFotos[n] = '';
  const inp = document.getElementById(`act-file-${n}`);
  if (inp) inp.value = '';
  _renderSlotActualizar(n, '');
  const prog = document.getElementById(`act-prog-${n}`);
  if (prog) { prog.style.display = 'none'; _setBarAct(n, 0); }
}

function triggerFotoAct(n) {
  document.getElementById(`act-file-${n}`).click();
}

function _setBarAct(n, pct) {
  const bar = document.getElementById(`act-bar-${n}`);
  if (bar) bar.style.width = pct + '%';
}

// ── ENVIAR AL FORM 2 ──────────────────────────────────────
async function guardarActualizacion() {
  if (!_actProp) return;

  const g = id => {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked ? 'Si' : 'No';
    return (el.value || '').trim();
  };

  const codigo = _actProp['CÓDIGO'] || '';
  if (!codigo) { toast('Error: no hay código de propiedad', 'error'); return; }

  const btn = document.getElementById('btn-actualizar');
  if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
  toast('Enviando cambios al sistema…', 'info', 2500);

  // Patrón idéntico al MVP — objeto plano con strings literales
  const merged = Object.assign({ fvv: '1', pageHistory: '0' }, {
    'entry.1956649995': codigo,
    'entry.1721921262': g('act-titulo'),
    'entry.416854513':  g('act-direccion'),
    'entry.886418945':  g('act-tipo'),
    'entry.1460693908': g('act-ciudad'),
    'entry.2097141267': g('act-barrio'),
    'entry.1116338612': g('act-estrato'),
    'entry.2007895918': g('act-area'),
    'entry.812049067':  g('act-hab'),
    'entry.1289161291': g('act-ban'),
    'entry.1159190441': g('act-park'),
    'entry.1053143876': g('act-res-com'),
    'entry.2066810155': g('act-tipo-negocio'),
    'entry.1909317832': g('act-estado'),
    'entry.1614455692': g('act-precio-venta'),
    'entry.618220164':  g('act-precio-arriendo'),
    'entry.1791769337': g('act-admin'),
    'entry.247912537':  g('act-descripcion'),
    'entry.220950822':  g('act-informacion'),
    'entry.358256629':  g('act-agente'),
    'entry.961793523':  _actFotos[1] || '',
    'entry.1529417314': _actFotos[2] || '',
    'entry.1448316317': _actFotos[3] || '',
    'entry.377000207':  _actFotos[4] || '',
    'entry.1293523259': _actFotos[5] || '',
    'entry.44154851':   _actFotos[6] || '',
    'entry.1607363062': _actFotos[7] || '',
    'entry.222299510':  _actFotos[8] || '',
    'entry.1853138135': _actFotos[9] || '',
    'entry.1414317293': g('act-activo'),
    'entry.886418945_sentinel':  '',
    'entry.1116338612_sentinel': '',
    'entry.812049067_sentinel':  '',
    'entry.1159190441_sentinel': '',
    'entry.2066810155_sentinel': '',
    'entry.1909317832_sentinel': '',
    'entry.1414317293_sentinel': ''
  });

  const payload = new URLSearchParams(merged).toString();

  try {
    await fetch(FORM_ACTUALIZAR_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    payload
    });
    _actDatos = []; _actFiltrado = [];
    // Countdown visible mientras el trigger de Apps Script procesa
    let seg = 8;
    const btnEl    = document.getElementById('btn-actualizar');
    const intervalo = setInterval(() => {
      seg--;
      if (btnEl) btnEl.textContent = `Actualizando… ${seg}s`;
      if (seg <= 0) {
        clearInterval(intervalo);
        actVolverListado();
      }
    }, 1000);
    toast(`✓ Propiedad "${codigo}" actualizada. Recargando en 8s…`, 'success', 8500);
  } catch(e) {
    toast(`Error al actualizar: ${e.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar Cambios'; }
  }
}

// ── VOLVER AL LISTADO ─────────────────────────────────────
function actVolverListado() {
  _actDatos    = [];
  _actFiltrado = [];
  const inp = document.getElementById('act-search');
  if (inp) inp.value = '';
  document.getElementById('act-vista-form').style.display  = 'none';
  document.getElementById('act-vista-tabla').style.display = 'block';
  document.getElementById('bc-view').textContent = 'Actualizar';
  _actProp = null;
  cargarTablaActualizar();
}

// ── TOGGLE ACTIVO ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('act-activo')?.addEventListener('change', function() {
    const lbl = document.getElementById('act-activo-label');
    if (lbl) lbl.textContent = this.checked ? 'Sí' : 'No';
  });
});

// ── HOOK NAVEGACIÓN ───────────────────────────────────────
// Extiende activarVista sin romper su comportamiento original
(function() {
  const _orig = window.activarVista;
  window.activarVista = function(viewId, section, viewName, btn) {
    _orig(viewId, section, viewName, btn);
    if (viewId === 'actualizar') {
      const vf = document.getElementById('act-vista-form');
      const vt = document.getElementById('act-vista-tabla');
      if (vf) vf.style.display = 'none';
      if (vt) vt.style.display = 'block';
      initActualizar();
    }
  };
})();

// ── UTILIDAD: formato timestamp ───────────────────────────
function _fmtTimestamp(ts) {
  try {
    const d = new Date(ts);
    if (isNaN(d)) return String(ts);
    return d.toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'2-digit' })
      + ' ' + d.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', hour12:true });
  } catch { return String(ts); }
}

// ── SUBMIT PATRÓN MVP ─────────────────────────────────────
// Mismo patrón del MVP original — sin popup de Chrome
function _submitMVP(url, paramsObj) {
  const merged  = Object.assign({ fvv: '1', pageHistory: '0' }, paramsObj);
  const payload = new URLSearchParams(merged).toString();
  return fetch(url, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    payload
  });
}
