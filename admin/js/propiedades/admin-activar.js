// ════════════════════════════════════════════════════════
//  js/propiedades/admin-activar.js
//  PROPÓSITO : Módulo 04 — Activar / Desactivar propiedad.
//              Clic en SI/NO → guarda → actualiza cuadrito.
//              Sin pantalla adicional.
//  DEPENDE DE: admin-config.js, admin-auth.js, admin-actualizar.js
// ════════════════════════════════════════════════════════

let _act2Datos    = [];
let _act2Filtrado = [];

// ── INIT ──────────────────────────────────────────────────
function initActivar() {
  if (_act2Datos.length === 0) cargarTablaActivar();
  setTimeout(() => {
    const inp = document.getElementById('act2-search');
    if (inp) inp.focus();
  }, 150);
}

// ── CARGAR DATOS ──────────────────────────────────────────
async function cargarTablaActivar() {
  const sk      = document.getElementById('act2-skeleton');
  const tabWrap = document.getElementById('act2-tabla-wrap');
  const tbody   = document.getElementById('act2-tbody');

  if (sk)      sk.style.display      = 'flex';
  if (tabWrap) tabWrap.style.display = 'none';

  try {
    const res  = await fetch(ADMIN_CONFIG.ENDPOINT);
    const json = await res.json();
    _act2Datos    = json.data || json.registros || json || [];
    _act2Filtrado = [..._act2Datos];
    _renderTablaAct2(_act2Filtrado);
  } catch (err) {
    toast('Error al cargar propiedades: ' + err.message, 'error');
    if (tbody) tbody.innerHTML = `<p style="color:var(--muted)">Error de conexión.</p>`;
  } finally {
    if (sk)      sk.style.display      = 'none';
    if (tabWrap) tabWrap.style.display = 'block';
  }
}

// ── RENDER ────────────────────────────────────────────────
function _renderTablaAct2(registros) {
  const wrap = document.getElementById('act2-tbody');
  if (!wrap) return;

  if (!registros || registros.length === 0) {
    wrap.innerHTML = `<p style="color:var(--muted);font-size:14px;">No se encontraron propiedades.</p>`;
    return;
  }

  wrap.innerHTML = registros.map((r, idx) => {
    const codigo  = r['CÓDIGO']                     || '—';
    const titulo  = r['Título']                      || '—';
    const tipo    = r['Tipo']                        || '—';
    const dir     = r['Dirección exacta only admin'] || '—';
    const negocio = r['Tipo de Negocio']             || '—';
    const activo  = (r['Activo (si/no)'] || 'no').toLowerCase() === 'si';
    const pv      = _fmtPAct2(r['Precio Venta COP']    || '');
    const pa      = _fmtPAct2(r['Precio Arriendo COP'] || '');

    return `
      <div class="act2-registro${activo ? '' : ' inactivo'}" id="act2-reg-${idx}">

        <div class="act2-fila-label">
          <span class="act2-lbl">Código</span>
          <span class="act2-lbl">Título</span>
          <span class="act2-lbl">Tipo de Inmueble</span>
          <span class="act2-lbl">Dirección</span>
        </div>
        <div class="act2-fila-valor">
          <span class="act2-val">${codigo}</span>
          <span class="act2-val">${titulo}</span>
          <span class="act2-val">${tipo}</span>
          <span class="act2-val">${dir}</span>
        </div>

        <div class="act2-fila-label2">
          <span class="act2-lbl">Precio Venta</span>
          <span class="act2-lbl">Precio Arriendo</span>
          <span class="act2-lbl">Tipo de Negocio</span>
          <span class="act2-lbl lbl-activo">Activo</span>
        </div>
        <div class="act2-fila-valor2">
          <span class="act2-val">${pv || '—'}</span>
          <span class="act2-val">${pa || '—'}</span>
          <span class="act2-val">${negocio}</span>
          <div class="act2-estado-celda">
            <button class="act2-badge act2-badge-si ${activo ? 'on' : 'off'}"
              id="act2-si-${idx}"
              onclick="_act2Cambiar(${idx}, true)">SI</button>
            <button class="act2-badge act2-badge-no ${activo ? 'off' : 'on'}"
              id="act2-no-${idx}"
              onclick="_act2Cambiar(${idx}, false)">NO</button>
          </div>
        </div>

      </div>`;
  }).join('');
}

// ── CAMBIAR ESTADO — clic directo en SI / NO ──────────────
async function _act2Cambiar(idx, nuevoActivo) {
  const r = _act2Filtrado[idx];
  if (!r) return;

  const estadoActual = (r['Activo (si/no)'] || 'no').toLowerCase() === 'si';
  if (estadoActual === nuevoActivo) return; // ya está en ese estado

  const nuevoEstado = nuevoActivo ? 'Si' : 'No';
  const codigo      = r['CÓDIGO'] || '';

  // Deshabilitar botones mientras guarda
  const btnSi = document.getElementById(`act2-si-${idx}`);
  const btnNo = document.getElementById(`act2-no-${idx}`);
  if (btnSi) btnSi.disabled = true;
  if (btnNo) btnNo.disabled = true;

  // Precargar campos del módulo actualizar para el envío
  const s = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  const sel = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    const opt = [...el.options].find(o => o.value === val);
    el.value = opt ? val : '';
  };
  s('act-titulo',          r['Título']);
  s('act-direccion',       r['Dirección exacta only admin']);
  sel('act-tipo',          r['Tipo']);
  s('act-ciudad',          r['Ciudad']);
  s('act-barrio',          r['Barrio/Sector']);
  sel('act-estrato',       r['Estrato']);
  s('act-area',            r['Área m2']);
  sel('act-hab',           r['Habitaciones']);
  s('act-ban',             r['Baños']);
  sel('act-park',          r['Parqueaderos']);
  s('act-res-com',         r['Uso del suelo']);
  sel('act-tipo-negocio',  r['Tipo de Negocio']);
  sel('act-estado',        r['Estado']);
  s('act-precio-venta',    r['Precio Venta COP']);
  s('act-precio-arriendo', r['Precio Arriendo COP']);
  s('act-admin',           r['Administración']);
  s('act-descripcion',     r['Descripción']);
  for (let n = 1; n <= 9; n++) _actFotos[n] = r[`Foto ${n}`] || '';

  const g = id => { const el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };

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
    'entry.961793523':  _actFotos[1] || '',
    'entry.1529417314': _actFotos[2] || '',
    'entry.1448316317': _actFotos[3] || '',
    'entry.377000207':  _actFotos[4] || '',
    'entry.1293523259': _actFotos[5] || '',
    'entry.44154851':   _actFotos[6] || '',
    'entry.1607363062': _actFotos[7] || '',
    'entry.222299510':  _actFotos[8] || '',
    'entry.1853138135': _actFotos[9] || '',
    'entry.1414317293': nuevoEstado,
    'entry.886418945_sentinel':  '',
    'entry.1116338612_sentinel': '',
    'entry.812049067_sentinel':  '',
    'entry.1159190441_sentinel': '',
    'entry.2066810155_sentinel': '',
    'entry.1909317832_sentinel': '',
    'entry.1414317293_sentinel': ''
  });

  try {
    await fetch(FORM_ACTUALIZAR_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams(merged).toString()
    });

    // Actualizar dato local
    r['Activo (si/no)'] = nuevoActivo ? 'si' : 'no';

    // Esperar 2s y actualizar cuadritos en pantalla
    setTimeout(() => {
      if (btnSi) {
        btnSi.className = `act2-badge act2-badge-si ${nuevoActivo ? 'on' : 'off'}`;
        btnSi.disabled  = false;
      }
      if (btnNo) {
        btnNo.className = `act2-badge act2-badge-no ${nuevoActivo ? 'off' : 'on'}`;
        btnNo.disabled  = false;
      }
      // Actualizar opacidad del registro
      const reg = document.getElementById(`act2-reg-${idx}`);
      if (reg) {
        reg.classList.toggle('inactivo', !nuevoActivo);
      }
      toast(`✓ "${codigo}" ${nuevoActivo ? 'activada' : 'desactivada'}.`, 'success', 3000);
      cargarContador();
    }, 2000);

  } catch (e) {
    toast(`Error: ${e.message}`, 'error');
    if (btnSi) btnSi.disabled = false;
    if (btnNo) btnNo.disabled = false;
  }
}

// ── FILTRAR ───────────────────────────────────────────────
function filtrarActivar() {
  const q = (document.getElementById('act2-search')?.value || '').trim().toLowerCase();
  _act2Filtrado = q
    ? _act2Datos.filter(r => (r['CÓDIGO'] || '').toLowerCase().includes(q))
    : [..._act2Datos];
  _renderTablaAct2(_act2Filtrado);
}

// ── RECARGAR ──────────────────────────────────────────────
function recargarActivar() {
  _act2Datos    = [];
  _act2Filtrado = [];
  const inp = document.getElementById('act2-search');
  if (inp) inp.value = '';
  cargarTablaActivar();
}

// ── HOOK NAVEGACIÓN ───────────────────────────────────────
(function () {
  const _orig = window.activarVista;
  window.activarVista = function (viewId, section, viewName, btn) {
    _orig(viewId, section, viewName, btn);
    if (viewId === 'activar') initActivar();
    if (viewId === 'actualizar') {
      const btnAct = document.getElementById('btn-actualizar');
      if (btnAct) { btnAct.disabled = false; btnAct.textContent = 'Guardar Cambios'; }
    }
  };
})();

// ── UTILIDADES ────────────────────────────────────────────
function _fmtPAct2(val) {
  if (!val || val === '—') return '';
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return val;
  return '$ ' + num.toLocaleString('es-CO');
}
