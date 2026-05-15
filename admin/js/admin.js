// ════════════════════════════════════════════
//  ADMIN.JS — Team Realty Group v1.0.0
//  Sidebar · Skeleton · Toast · Modal · CRUD
// ════════════════════════════════════════════

/* ── CONFIGURACIÓN ────────────────────── */
const ADMIN_CONFIG = {
  CREDENTIALS: {
    "diana": "GenioTotal2026$.",
    "admin": "teamrealty33"
  },
  get ENDPOINT() {
    return (typeof PORTAL33_CONFIG !== 'undefined')
      ? PORTAL33_CONFIG.PROPIEDADES_ENDPOINT
      : "https://script.google.com/macros/s/AKfycbyQ6k06QgekJlRkR7vxwO9-m2hdLaB_cxvaO6NPj0McKB6TYuz-3cI9RquEj6YOJzeO/exec";
  },
  // ⚠️ Reemplazar con entry IDs reales del Google Form
  ENTRIES: {
    codigo:"entry.CODIGO", marcaTemporal:"entry.MARCA",
    titulo:"entry.TITULO", tipo:"entry.TIPO",
    ciudad:"entry.CIUDAD", barrio:"entry.BARRIO",
    estrato:"entry.ESTRATO", area:"entry.AREA",
    habitaciones:"entry.HAB", banos:"entry.BAN",
    parqueaderos:"entry.PARK", resComercial:"entry.RES",
    estado:"entry.ESTADO", precioVenta:"entry.PVENTA",
    precioArriendo:"entry.PARRIENDO", administracion:"entry.ADMIN",
    descripcion:"entry.DESC",
    foto1:"entry.F1",foto2:"entry.F2",foto3:"entry.F3",
    foto4:"entry.F4",foto5:"entry.F5",foto6:"entry.F6",
    foto7:"entry.F7",foto8:"entry.F8",foto9:"entry.F9",
    activo:"entry.ACTIVO"
  },
  // ⚠️ Reemplazar con URL real del Google Form
  FORM_URL: "https://docs.google.com/forms/d/e/TU_FORM_ID/formResponse"
};

/* ── ESTADO GLOBAL ────────────────────── */
let _todosRegistros = [];
let _propActualizar = null;
let _propActivar    = null;
let _confirmCallback = null;

// ════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Sesión activa
  if (sessionStorage.getItem('admin_auth') === 'true') {
    mostrarPanel();
  }
  // Enter en login
  document.getElementById('login-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkLogin();
  });
  document.getElementById('login-user')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-pass').focus();
  });
  // Toggle activo form crear
  document.getElementById('f-activo')?.addEventListener('change', function() {
    document.getElementById('activo-label').textContent = this.checked ? 'Sí' : 'No';
  });
});

// ════════════════════════════════════════════
//  AUTENTICACIÓN
// ════════════════════════════════════════════
function checkLogin() {
  const user = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;
  const err  = document.getElementById('login-error');

  if (ADMIN_CONFIG.CREDENTIALS[user] && ADMIN_CONFIG.CREDENTIALS[user] === pass) {
    sessionStorage.setItem('admin_auth', 'true');
    sessionStorage.setItem('admin_user', user);
    sessionStorage.setItem('admin_login_time', new Date().toLocaleString('es-CO', {
      hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short'
    }));
    mostrarPanel();
  } else {
    err.style.display = 'block';
    document.getElementById('login-pass').value = '';
    setTimeout(() => { err.style.display = 'none'; }, 3000);
  }
}

function mostrarPanel() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display  = 'flex';
  // Último acceso
  const t = sessionStorage.getItem('admin_login_time') || '—';
  const el = document.getElementById('sb-last-access');
  if (el) el.textContent = `Último acceso: ${t}`;
  // Cargar contador
  cargarContador();
}

function logout() {
  sessionStorage.clear();
  document.getElementById('admin-panel').style.display  = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

// ════════════════════════════════════════════
//  SIDEBAR
// ════════════════════════════════════════════
function toggleSidebar() {
  const panel = document.getElementById('admin-panel');
  const sb    = document.getElementById('admin-sidebar');
  panel.classList.toggle('collapsed');
  sb.classList.toggle('collapsed');
}

function toggleSbSubmenu(name, btn) {
  const sub = document.getElementById(`sbsub-${name}`);
  if (!sub) return;
  const isOpen = sub.classList.contains('open');
  // Cerrar todos
  document.querySelectorAll('.sb-submenu').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('.sb-menu-btn').forEach(b => b.classList.remove('open'));
  if (!isOpen) {
    sub.classList.add('open');
    btn.classList.add('open', 'active');
  }
}

// ════════════════════════════════════════════
//  NAVEGACIÓN
// ════════════════════════════════════════════
function activarVista(viewId, section, viewName, btn) {
  // Vistas
  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');

  // Breadcrumb
  document.getElementById('bc-section').textContent = section;
  document.getElementById('bc-view').textContent    = viewName;

  // Submenú activo
  if (btn) {
    document.querySelectorAll('.sb-sub').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // Abrir submenú padre si corresponde
  if (viewId !== 'blog') {
    const sub = document.getElementById('sbsub-propiedades');
    if (sub) sub.classList.add('open');
    const menuBtn = document.getElementById('btn-sec-propiedades');
    if (menuBtn) { menuBtn.classList.add('active', 'open'); }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  const titulos = {
  'crear':'Nueva Propiedad',
  'leer':'Consultar Propiedad',
  'actualizar':'Actualizar Propiedad',
  'activar':'Activar / Desactivar',
  'listado':'Ver Listado',
  'blog':'Blog'
    };
    const t = document.getElementById('bc-titulo');
    if(t) t.textContent = titulos[viewId] || '';
}









// ════════════════════════════════════════════
//  CONTADOR PROPIEDADES ACTIVAS
// ════════════════════════════════════════════
async function cargarContador() {
  try {
    const res  = await fetch(`${ADMIN_CONFIG.ENDPOINT}?action=getAll`);
    const json = await res.json();
    const registros = json.data || json.registros || json || [];
    _todosRegistros = registros;
    const activas = registros.filter(r =>
      (r.activo || r['Activo (si/no)'] || 'no').toLowerCase() === 'si'
    ).length;
    const el = document.getElementById('counter-num');
    if (el) el.textContent = activas;
  } catch {
    const el = document.getElementById('counter-num');
    if (el) el.textContent = '—';
  }
}

// ════════════════════════════════════════════
//  BUSCADOR GLOBAL
// ════════════════════════════════════════════
function busquedaGlobal(query) {
  if (!query.trim() || !_todosRegistros.length) return;
  // Redirigir a listado y filtrar
  activarVista('listado', 'Propiedades', 'Ver Listado',
    document.querySelector('[data-view="listado"]'));
  document.getElementById('listado-filtro').value = query;
  if (_todosRegistros.length) {
    filtrarListado();
  } else {
    cargarListado().then(() => filtrarListado());
  }
}

// ════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ════════════════════════════════════════════
function toast(msg, tipo = 'info', duracion = 4000) {
  const icons = { success: '✓', error: '✕', info: '●' };
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.innerHTML = `<span class="toast-icon">${icons[tipo]||'●'}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('hiding');
    setTimeout(() => t.remove(), 320);
  }, duracion);
}

// ════════════════════════════════════════════
//  MODAL CONFIRMACIÓN
// ════════════════════════════════════════════
function pedirConfirmacion(titulo, msg, callback) {
  document.getElementById('confirm-title').textContent = titulo;
  document.getElementById('confirm-msg').textContent   = msg;
  document.getElementById('confirm-overlay').style.display = 'flex';
  _confirmCallback = callback;
  document.getElementById('confirm-ok').onclick = () => {
    cerrarModal();
    if (_confirmCallback) _confirmCallback();
  };
}

function cerrarModal() {
  document.getElementById('confirm-overlay').style.display = 'none';
  _confirmCallback = null;
}

// Cerrar modal con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});

// ════════════════════════════════════════════
//  SKELETON HELPERS
// ════════════════════════════════════════════
function showSkeleton(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}
function hideSkeleton(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// ════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════
function formatCOP(val) {
  if (!val) return '—';
  return '$ ' + Number(val).toLocaleString('es-CO');
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getVal(p, ...keys) {
  for (const k of keys) { if (p[k] !== undefined && p[k] !== '') return p[k]; }
  return '';
}

// ════════════════════════════════════════════
//  MÓDULO CREAR
// ════════════════════════════════════════════
function getFormData() {
  return {
    codigo:         document.getElementById('f-codigo')?.value.trim()      || '',
    marcaTemporal:  document.getElementById('f-marca')?.value              || new Date().toISOString(),
    titulo:         document.getElementById('f-titulo')?.value.trim()      || '',
    tipo:           document.getElementById('f-tipo')?.value               || '',
    ciudad:         document.getElementById('f-ciudad')?.value.trim()      || '',
    barrio:         document.getElementById('f-barrio')?.value.trim()      || '',
    estrato:        document.getElementById('f-estrato')?.value            || '',
    area:           document.getElementById('f-area')?.value               || '',
    habitaciones:   document.getElementById('f-hab')?.value                || '',
    banos:          document.getElementById('f-ban')?.value                || '',
    parqueaderos:   document.getElementById('f-park')?.value               || '',
    resComercial:   document.getElementById('f-res-com')?.value            || '',
    estado:         document.getElementById('f-estado')?.value             || '',
    precioVenta:    document.getElementById('f-precio-venta')?.value       || '',
    precioArriendo: document.getElementById('f-precio-arriendo')?.value    || '',
    administracion: document.getElementById('f-admin')?.value              || '',
    descripcion:    document.getElementById('f-descripcion')?.value.trim() || '',
    foto1:  document.getElementById('f-foto1')?.value.trim() || '',
    foto2:  document.getElementById('f-foto2')?.value.trim() || '',
    foto3:  document.getElementById('f-foto3')?.value.trim() || '',
    foto4:  document.getElementById('f-foto4')?.value.trim() || '',
    foto5:  document.getElementById('f-foto5')?.value.trim() || '',
    foto6:  document.getElementById('f-foto6')?.value.trim() || '',
    foto7:  document.getElementById('f-foto7')?.value.trim() || '',
    foto8:  document.getElementById('f-foto8')?.value.trim() || '',
    foto9:  document.getElementById('f-foto9')?.value.trim() || '',
    activo: document.getElementById('f-activo')?.checked ? 'si' : 'no'
  };
}

function validarForm(data) {
  if (!data.codigo) return 'El campo CÓDIGO es obligatorio.';
  if (!data.titulo) return 'El campo Título es obligatorio.';
  if (!data.tipo)   return 'El campo Tipo es obligatorio.';
  if (!data.ciudad) return 'El campo Ciudad es obligatorio.';
  return null;
}

async function crearPropiedad() {
  const data  = getFormData();
  const error = validarForm(data);
  if (error) { toast(error, 'error'); return; }

  toast('Enviando al sistema…', 'info', 2000);

  try {
    const params = new URLSearchParams();
    Object.keys(ADMIN_CONFIG.ENTRIES).forEach(key => {
      if (data[key] !== undefined) params.append(ADMIN_CONFIG.ENTRIES[key], data[key]);
    });
    await fetch(`${ADMIN_CONFIG.FORM_URL}?${params.toString()}`, { method:'GET', mode:'no-cors' });
    toast(`✓ Propiedad "${data.titulo}" guardada correctamente.`, 'success');
    limpiarFormCrear();
    cargarContador();
  } catch (e) {
    toast(`Error al enviar: ${e.message}`, 'error');
  }
}

function limpiarFormCrear() {
  ['f-codigo','f-marca','f-titulo','f-ciudad','f-barrio','f-area',
   'f-hab','f-ban','f-park','f-precio-venta','f-precio-arriendo',
   'f-admin','f-descripcion','f-foto1','f-foto2','f-foto3',
   'f-foto4','f-foto5','f-foto6','f-foto7','f-foto8','f-foto9'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['f-tipo','f-estrato','f-res-com','f-estado'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });
  const chk = document.getElementById('f-activo');
  if (chk) { chk.checked = true; document.getElementById('activo-label').textContent = 'Sí'; }
}

// ════════════════════════════════════════════
//  MÓDULO LEER
// ════════════════════════════════════════════
async function leerPropiedad() {
  const codigo = document.getElementById('leer-codigo')?.value.trim();
  if (!codigo) { toast('Ingresa un CÓDIGO para buscar.', 'error'); return; }

  showSkeleton('leer-skeleton');
  document.getElementById('leer-resultado').style.display = 'none';

  try {
    const registros = await fetchTodos();
    hideSkeleton('leer-skeleton');

    const prop = registros.find(r =>
      (getVal(r,'codigo','CÓDIGO')).toString().toLowerCase() === codigo.toLowerCase()
    );

    if (!prop) { toast(`No se encontró la propiedad "${codigo}".`, 'error'); return; }
    renderDataCard(prop);
  } catch (e) {
    hideSkeleton('leer-skeleton');
    toast(`Error al consultar: ${e.message}`, 'error');
  }
}

function renderDataCard(p) {
  const get = (...keys) => escHtml(getVal(p, ...keys)) || '—';
  const fotos = ['foto1','foto2','foto3','foto4','foto5','foto6','foto7','foto8','foto9']
    .map(k => getVal(p, k, k.charAt(0).toUpperCase()+k.slice(1),
      `Foto ${k.replace('foto','')}`)
    ).filter(Boolean);

  const fotosHtml = fotos.length
    ? `<div class="dc-fotos">${fotos.map(u=>`<img src="${u}" alt="foto" onerror="this.style.display='none'">`).join('')}</div>`
    : '—';

  const rows = [
    ['CÓDIGO',              get('codigo','CÓDIGO')],
    ['Marca Temporal',      get('marcaTemporal','Marca temporal')],
    ['Título',              get('titulo','Título')],
    ['Tipo',                get('tipo','Tipo')],
    ['Ciudad',              get('ciudad','Ciudad')],
    ['Barrio / Sector',     get('barrio','Barrio/Sector')],
    ['Estrato',             get('estrato','Estrato')],
    ['Área m²',             get('area','Área m2')],
    ['Habitaciones',        get('habitaciones','Habitaciones')],
    ['Baños',               get('banos','Baños')],
    ['Parqueaderos',        get('parqueaderos','Parqueaderos')],
    ['Residencial/Comercial',get('resComercial','Residencial / Comercial')],
    ['Estado',              get('estado','Estado')],
    ['Precio Venta COP',    formatCOP(getVal(p,'precioVenta','Precio Venta COP'))],
    ['Precio Arriendo COP', formatCOP(getVal(p,'precioArriendo','Precio Arriendo COP'))],
    ['Administración COP',  formatCOP(getVal(p,'administracion','Administración'))],
    ['Descripción',         get('descripcion','Descripción')],
    ['Activo',              get('activo','Activo (si/no)')],
  ];

  const card = document.getElementById('leer-resultado');
  card.innerHTML = rows.map(([label,val]) =>
    `<div class="dc-row"><span class="dc-label">${label}</span><span class="dc-val">${val}</span></div>`
  ).join('') + `<div class="dc-row"><span class="dc-label">Fotos</span><span class="dc-val">${fotosHtml}</span></div>`;
  card.style.display = 'block';
}

// ════════════════════════════════════════════
//  MÓDULO ACTUALIZAR
// ════════════════════════════════════════════
async function cargarParaActualizar() {
  const codigo = document.getElementById('actualizar-codigo')?.value.trim();
  if (!codigo) { toast('Ingresa un CÓDIGO.', 'error'); return; }

  showSkeleton('actualizar-skeleton');

  try {
    const registros = await fetchTodos();
    hideSkeleton('actualizar-skeleton');

    const prop = registros.find(r =>
      (getVal(r,'codigo','CÓDIGO')).toString().toLowerCase() === codigo.toLowerCase()
    );
    if (!prop) { toast(`No se encontró "${codigo}".`, 'error'); return; }

    _propActualizar = prop;
    renderFormActualizar(prop);
  } catch (e) {
    hideSkeleton('actualizar-skeleton');
    toast(`Error: ${e.message}`, 'error');
  }
}

function renderFormActualizar(p) {
  const v = (k,...ks) => escHtml(getVal(p,k,...ks));
  document.getElementById('actualizar-fields').innerHTML = `
    <div class="form-section">
      <h3 class="section-label">Información Principal</h3>
      <div class="fields-row two">
        <div class="field-group"><label>CÓDIGO</label><input type="text" id="u-codigo" value="${v('codigo','CÓDIGO')}"></div>
        <div class="field-group"><label>Título</label><input type="text" id="u-titulo" value="${v('titulo','Título')}"></div>
      </div>
      <div class="fields-row three">
        <div class="field-group"><label>Tipo</label><input type="text" id="u-tipo" value="${v('tipo','Tipo')}"></div>
        <div class="field-group"><label>Ciudad</label><input type="text" id="u-ciudad" value="${v('ciudad','Ciudad')}"></div>
        <div class="field-group"><label>Barrio / Sector</label><input type="text" id="u-barrio" value="${v('barrio','Barrio/Sector')}"></div>
      </div>
    </div>
    <div class="form-section">
      <h3 class="section-label">Características y Precios</h3>
      <div class="fields-row four">
        <div class="field-group"><label>Habitaciones</label><input type="number" id="u-hab" value="${v('habitaciones','Habitaciones')}"></div>
        <div class="field-group"><label>Baños</label><input type="number" id="u-ban" value="${v('banos','Baños')}"></div>
        <div class="field-group"><label>Parqueaderos</label><input type="number" id="u-park" value="${v('parqueaderos','Parqueaderos')}"></div>
        <div class="field-group"><label>Área m²</label><input type="number" id="u-area" value="${v('area','Área m2')}"></div>
      </div>
      <div class="fields-row three">
        <div class="field-group"><label>Precio Venta COP</label><input type="number" id="u-venta" value="${v('precioVenta','Precio Venta COP')}"></div>
        <div class="field-group"><label>Precio Arriendo COP</label><input type="number" id="u-arriendo" value="${v('precioArriendo','Precio Arriendo COP')}"></div>
        <div class="field-group"><label>Administración</label><input type="number" id="u-admin" value="${v('administracion','Administración')}"></div>
      </div>
    </div>
    <div class="form-section">
      <h3 class="section-label">Descripción</h3>
      <div class="field-group full">
        <textarea id="u-descripcion" rows="5">${v('descripcion','Descripción')}</textarea>
      </div>
    </div>
    <div class="form-section">
      <h3 class="section-label">Publicación</h3>
      <div class="field-group toggle-row">
        <label>Activo</label>
        <label class="toggle-switch">
          <input type="checkbox" id="u-activo" ${(getVal(p,'activo','Activo (si/no)')||'').toLowerCase()==='si'?'checked':''}>
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
        </label>
        <span id="u-activo-label">${(getVal(p,'activo','Activo (si/no)')||'').toLowerCase()==='si'?'Sí':'No'}</span>
      </div>
    </div>`;

  document.getElementById('u-activo')?.addEventListener('change', function() {
    document.getElementById('u-activo-label').textContent = this.checked ? 'Sí' : 'No';
  });
  document.getElementById('actualizar-form').style.display = 'block';
}

async function guardarActualizacion() {
  if (!_propActualizar) return;
  const data = {
    codigo:         document.getElementById('u-codigo')?.value.trim()      || '',
    titulo:         document.getElementById('u-titulo')?.value.trim()      || '',
    tipo:           document.getElementById('u-tipo')?.value.trim()        || '',
    ciudad:         document.getElementById('u-ciudad')?.value.trim()      || '',
    barrio:         document.getElementById('u-barrio')?.value.trim()      || '',
    habitaciones:   document.getElementById('u-hab')?.value                || '',
    banos:          document.getElementById('u-ban')?.value                || '',
    parqueaderos:   document.getElementById('u-park')?.value               || '',
    area:           document.getElementById('u-area')?.value               || '',
    precioVenta:    document.getElementById('u-venta')?.value              || '',
    precioArriendo: document.getElementById('u-arriendo')?.value           || '',
    administracion: document.getElementById('u-admin')?.value              || '',
    descripcion:    document.getElementById('u-descripcion')?.value.trim() || '',
    activo:         document.getElementById('u-activo')?.checked ? 'si' : 'no'
  };

  pedirConfirmacion(
    '¿Guardar cambios?',
    `Se actualizará la propiedad "${data.titulo}".`,
    async () => {
      toast('Guardando cambios…', 'info', 2000);
      try {
        const params = new URLSearchParams({ action:'update', ...data });
        await fetch(`${ADMIN_CONFIG.ENDPOINT}?${params.toString()}`, { method:'GET', mode:'no-cors' });
        toast(`✓ Propiedad "${data.titulo}" actualizada.`, 'success');
        document.getElementById('actualizar-form').style.display = 'none';
        document.getElementById('actualizar-codigo').value = '';
        _propActualizar = null;
      } catch (e) {
        toast(`Error: ${e.message}`, 'error');
      }
    }
  );
}

// ════════════════════════════════════════════
//  MÓDULO ACTIVAR / DESACTIVAR
// ════════════════════════════════════════════
async function cargarEstado() {
  const codigo = document.getElementById('activar-codigo')?.value.trim();
  if (!codigo) { toast('Ingresa un CÓDIGO.', 'error'); return; }

  showSkeleton('activar-skeleton');
  document.getElementById('activar-panel').style.display = 'none';

  try {
    const registros = await fetchTodos();
    hideSkeleton('activar-skeleton');

    const prop = registros.find(r =>
      (getVal(r,'codigo','CÓDIGO')).toString().toLowerCase() === codigo.toLowerCase()
    );
    if (!prop) { toast(`No se encontró "${codigo}".`, 'error'); return; }

    _propActivar = prop;
    const activo = (getVal(prop,'activo','Activo (si/no)')||'no').toLowerCase() === 'si';

    document.getElementById('activar-titulo').textContent = getVal(prop,'titulo','Título') || codigo;
    const tag = document.getElementById('activar-estado-tag');
    tag.textContent = activo ? 'ACTIVO' : 'INACTIVO';
    tag.className   = `estado-tag ${activo ? 'activo' : 'inactivo'}`;
    document.getElementById('activar-panel').style.display = 'block';
  } catch (e) {
    hideSkeleton('activar-skeleton');
    toast(`Error: ${e.message}`, 'error');
  }
}

async function cambiarEstado(activar) {
  if (!_propActivar) return;
  const codigo = getVal(_propActivar,'codigo','CÓDIGO');
  const titulo = getVal(_propActivar,'titulo','Título');

  toast(`${activar ? 'Activando' : 'Desactivando'} publicación…`, 'info', 2000);

  try {
    const params = new URLSearchParams({ action:'toggleActivo', codigo, activo: activar ? 'si' : 'no' });
    await fetch(`${ADMIN_CONFIG.ENDPOINT}?${params.toString()}`, { method:'GET', mode:'no-cors' });

    const tag = document.getElementById('activar-estado-tag');
    tag.textContent = activar ? 'ACTIVO' : 'INACTIVO';
    tag.className   = `estado-tag ${activar ? 'activo' : 'inactivo'}`;

    toast(`✓ "${titulo}" ${activar ? 'activada' : 'desactivada'} correctamente.`, 'success');
    cargarContador();
  } catch (e) {
    toast(`Error: ${e.message}`, 'error');
  }
}

// ════════════════════════════════════════════
//  MÓDULO LISTADO
// ════════════════════════════════════════════
async function cargarListado() {
  showSkeleton('listado-skeleton');
  document.getElementById('tabla-body').innerHTML =
    `<tr><td colspan="9" class="empty-row">Cargando…</td></tr>`;

  try {
    _todosRegistros = await fetchTodos();
    hideSkeleton('listado-skeleton');
    renderTabla(_todosRegistros);
    // Actualizar contador aprovechando la carga
    const activas = _todosRegistros.filter(r =>
      (getVal(r,'activo','Activo (si/no)')||'no').toLowerCase() === 'si'
    ).length;
    const el = document.getElementById('counter-num');
    if (el) el.textContent = activas;
  } catch (e) {
    hideSkeleton('listado-skeleton');
    toast(`Error al cargar: ${e.message}`, 'error');
    document.getElementById('tabla-body').innerHTML =
      `<tr><td colspan="9" class="empty-row">Error al cargar datos.</td></tr>`;
  }
}

function renderTabla(registros) {
  const tbody = document.getElementById('tabla-body');
  if (!registros.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty-row">No hay propiedades registradas.</td></tr>`;
    return;
  }
  tbody.innerHTML = registros.map(p => {
    const codigo   = escHtml(getVal(p,'codigo','CÓDIGO')   || '—');
    const titulo   = escHtml(getVal(p,'titulo','Título')   || '—');
    const tipo     = escHtml(getVal(p,'tipo','Tipo')       || '—');
    const ciudad   = escHtml(getVal(p,'ciudad','Ciudad')   || '—');
    const venta    = formatCOP(getVal(p,'precioVenta','Precio Venta COP'));
    const arriendo = formatCOP(getVal(p,'precioArriendo','Precio Arriendo COP'));
    const estado   = escHtml(getVal(p,'estado','Estado')   || '—');
    const activo   = (getVal(p,'activo','Activo (si/no)')||'no').toLowerCase() === 'si';
    const badge    = activo
      ? `<span class="badge-on">Sí</span>`
      : `<span class="badge-off">No</span>`;
    return `<tr>
      <td>${codigo}</td><td>${titulo}</td><td>${tipo}</td><td>${ciudad}</td>
      <td>${venta}</td><td>${arriendo}</td><td>${estado}</td><td>${badge}</td>
      <td><div class="table-actions">
        <button onclick="irALeer('${codigo}')">Ver</button>
        <button onclick="irAActualizar('${codigo}')">Editar</button>
        <button onclick="irAActivar('${codigo}')">Toggle</button>
      </div></td>
    </tr>`;
  }).join('');
}

function filtrarListado() {
  const q = document.getElementById('listado-filtro')?.value.toLowerCase() || '';
  if (!q) { renderTabla(_todosRegistros); return; }
  renderTabla(_todosRegistros.filter(p => JSON.stringify(p).toLowerCase().includes(q)));
}

function irALeer(codigo) {
  activarVista('leer','Propiedades','Leer',
    document.querySelector('[data-view="leer"]'));
  document.getElementById('leer-codigo').value = codigo;
  setTimeout(() => leerPropiedad(), 80);
}
function irAActualizar(codigo) {
  activarVista('actualizar','Propiedades','Actualizar',
    document.querySelector('[data-view="actualizar"]'));
  document.getElementById('actualizar-codigo').value = codigo;
  setTimeout(() => cargarParaActualizar(), 80);
}
function irAActivar(codigo) {
  activarVista('activar','Propiedades','Activar / Desactivar',
    document.querySelector('[data-view="activar"]'));
  document.getElementById('activar-codigo').value = codigo;
  setTimeout(() => cargarEstado(), 80);
}

// ════════════════════════════════════════════
//  FETCH CENTRAL
// ════════════════════════════════════════════
async function fetchTodos() {
  if (_todosRegistros.length) return _todosRegistros;
  const res  = await fetch(`${ADMIN_CONFIG.ENDPOINT}?action=getAll`);
  const json = await res.json();
  _todosRegistros = json.data || json.registros || json || [];
  return _todosRegistros;
}
