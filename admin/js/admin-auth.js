// ════════════════════════════════════════════════════════
//  js/admin-auth.js
//  PROPÓSITO : Autenticación (login/logout), navegación
//              entre vistas, sidebar, toast, modal de
//              confirmación y utilidades globales (submitForm,
//              showSkeleton, hideSkeleton).
//  CARGADO   : Segundo, después de admin-config.js
//  DEPENDE DE: admin-config.js (ADMIN_CONFIG)
// ════════════════════════════════════════════════════════

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Si ya autenticado en esta sesión, ir directo al panel
  if (sessionStorage.getItem('admin_auth') === 'true') {
    mostrarPanel();
  }

  // Enter en usuario → foco en contraseña
  document.getElementById('login-user')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('login-pass').focus();
  });
  // Enter en contraseña → intento de login
  document.getElementById('login-pass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkLogin();
  });

  // Modal: botón Cancelar
  document.getElementById('modal-cancelar')
    ?.addEventListener('click', cerrarModal);

  // Sidebar: colapsar / expandir
  document.getElementById('sidebar-toggle')
    ?.addEventListener('click', toggleSidebar);


    // PROPIEDADES PROPIEDADES PROPIEDADES //

  // Sidebar: abrir / cerrar submenu Propiedades
  document.getElementById('btn-sec-propiedades')
    ?.addEventListener('click', function () {
      toggleSbSubmenu('propiedades', this);
    });

// BLOG BLOG BLOG //

    // Sidebar: abrir / cerrar submenu Blog
  document.getElementById('btn-sec-blog')
    ?.addEventListener('click', function () {
      toggleSbSubmenu('blog', this);
    });

  // Toggle "Activo" → actualizar label (módulo Crear)
  document.getElementById('f-activo')?.addEventListener('change', function () {
    document.getElementById('activo-label').textContent = this.checked ? 'Sí' : 'No';
  });
});

// ── AUTENTICACIÓN ─────────────────────────────────────────
//function checkLogin() {
async function checkLogin() {
  const user = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;
  const err  = document.getElementById('login-error');

  //if (ADMIN_CONFIG.CREDENTIALS[user] && ADMIN_CONFIG.CREDENTIALS[user] === pass) {
    //sessionStorage.setItem('admin_auth', 'true');
    //sessionStorage.setItem('admin_user', user);
    //sessionStorage.setItem('admin_login_time', new Date().toLocaleString('es-CO', {
      //hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
    //}));
    //mostrarPanel();
  //} else {
    //err.style.display = 'block';
    //document.getElementById('login-pass').value = '';
    //setTimeout(() => { err.style.display = 'none'; }, 3000);
  //}



  try {

const res = await fetch(`${ADMIN_CONFIG.ENDPOINT}?accion=login&usuario=${encodeURIComponent(user)}&clave=${encodeURIComponent(pass)}`);
const json = await res.json();

  if (json.ok) {

    sessionStorage.setItem('admin_auth', 'true');
    sessionStorage.setItem('admin_user', user);
    sessionStorage.setItem('admin_login_time',
      new Date().toLocaleString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short'
      })
    );

    mostrarPanel();

  } else {

    err.style.display = 'block';
    document.getElementById('login-pass').value = '';

    setTimeout(() => {
      err.style.display = 'none';
    }, 3000);
  }

} catch (e) {

  toast("Error de conexión", "error");

}

}

function mostrarPanel() {
  document.getElementById('login-screen').style.display  = 'none';
  document.getElementById('admin-panel').style.display   = 'flex';
  const t  = sessionStorage.getItem('admin_login_time') || '—';
  const el = document.getElementById('sb-last-access');
  if (el) el.textContent = `Último acceso: ${t}`;
  // Cargar módulo de propiedades por defecto al entrar
  cargarModulo('propiedades');
  cargarContador();
}

function logout() {
  sessionStorage.clear();
  document.getElementById('admin-panel').style.display   = 'none';
  document.getElementById('login-screen').style.display  = 'flex';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

// ── SIDEBAR ───────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('admin-panel').classList.toggle('collapsed');
  document.getElementById('admin-sidebar').classList.toggle('collapsed');
}

function toggleSbSubmenu(name, btn) {
  const sub = document.getElementById(`sbsub-${name}`);
  if (!sub) return;
  const isOpen = sub.classList.contains('open');
  document.querySelectorAll('.sb-submenu').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('.sb-menu-btn').forEach(b => b.classList.remove('open'));
  if (!isOpen) {
    sub.classList.add('open');
    btn.classList.add('open', 'active');
  }
}

// ── NAVEGACIÓN ────────────────────────────────────────────
//  activarVista() — muestra la sección correcta dentro del
//  módulo ya cargado en #view-container y actualiza breadcrumb.
//  Si el módulo no está cargado aún, llama a cargarModulo()
//  que al terminar vuelve a llamar activarVista().
function activarVista(viewId, section, viewName, btn) {


  
  const TITULOS = {
    'crear'          : 'Nueva Propiedad',
    'leer'           : 'Generar fichas',
    'actualizar'     : 'Actualizar Propiedad',
    'activar'        : 'Activar / Desactivar Propiedades',
    'blog-crear'     : 'Nuevo Artículo',
    'blog-leer'      : 'Consultar Artículos',
    'blog-actualizar': 'Actualizar Artículo'
  };





  // ── BLOG ──────────────────────────────────────────────
  if (viewId.startsWith('blog-')) {
    if (!document.getElementById(`view-${viewId}`)) {
      cargarModulo('blog', viewId, section, viewName, btn);
      return;
    }
    document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');

    document.getElementById('bc-section').textContent = section;
    document.getElementById('bc-view').textContent    = viewName;


    const bcTitulo = document.getElementById('bc-titulo');
if (bcTitulo) {
  bcTitulo.textContent = TITULOS[viewId] || viewName;
}




    if (btn) {
      document.querySelectorAll('.sb-sub').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    const sub     = document.getElementById('sbsub-blog');
    const menuBtn = document.getElementById('btn-sec-blog');
    if (sub)     sub.classList.add('open');
    if (menuBtn) menuBtn.classList.add('active', 'open');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // ── PROPIEDADES ───────────────────────────────────────
  if (!document.getElementById(`view-${viewId}`)) {
    cargarModulo('propiedades', viewId, section, viewName, btn);
    return;
  }

  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');

  document.getElementById('bc-section').textContent = section;
  document.getElementById('bc-view').textContent    = viewName;


 const bcTitulo = document.getElementById('bc-titulo');
if (bcTitulo) {
  bcTitulo.textContent = TITULOS[viewId] || viewName;
}
  




  if (btn) {
    document.querySelectorAll('.sb-sub').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  const sub     = document.getElementById('sbsub-propiedades');
  const menuBtn = document.getElementById('btn-sec-propiedades');
  if (sub)     sub.classList.add('open');
  if (menuBtn) menuBtn.classList.add('active', 'open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}



// ── CONTADOR ──────────────────────────────────────────────
async function cargarContador() {
  try {
    const res  = await fetch(ADMIN_CONFIG.ENDPOINT);
    const json = await res.json();
    const registros = json.data || json.registros || json || [];
    const activas = registros.filter(r =>
      (r['Activo (si/no)'] || 'no').toLowerCase() === 'si'
    ).length;
    const el = document.getElementById('counter-num');
    if (el) el.textContent = activas;
  } catch {
    const el = document.getElementById('counter-num');
    if (el) el.textContent = '—';
  }
}

// ── TOAST ─────────────────────────────────────────────────
function toast(msg, tipo = 'info', duracion = 4000) {
  const icons = { success: '✓', error: '✕', info: '●' };
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.innerHTML = `<span class="toast-icon">${icons[tipo] || '●'}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('hiding');
    setTimeout(() => t.remove(), 320);
  }, duracion);
}

// ── MODAL CONFIRMACIÓN ───────────────────────────────────
let _confirmCallback = null;

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

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});

// ── UTILIDADES GLOBALES ──────────────────────────────────
/**
 * submitForm()
 * Envía POST a un Google Form via no-cors.
 * Incluye fvv, pageHistory y los sentinels de campos
 * de selección múltiple definidos en ADMIN_CONFIG.SENTINELS.
 */
function submitForm(url, params) {
  params.append('fvv', '1');
  params.append('pageHistory', '0');
  ADMIN_CONFIG.SENTINELS.forEach(s => {
    params.append(`${s}_sentinel`, '');
  });
  return fetch(url, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    params.toString()
  });
}

function showSkeleton(id) { const el = document.getElementById(id); if (el) el.style.display = 'flex'; }
function hideSkeleton(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
