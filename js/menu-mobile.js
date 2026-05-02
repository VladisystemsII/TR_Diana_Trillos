/* =======================================
   MENÚ HAMBURGUESA MÓVIL - Portal 33
   Escucha el evento "headerListo" emitido
   por header-loader.js para garantizar que
   .nav y .menu existen antes de ejecutarse.
   ======================================= */

document.addEventListener('headerListo', function () {
  console.log('🍔 Menú hamburguesa inicializado');

  crearBotonHamburguesa();
  configurarMenuMobile();
  cerrarMenuAlNavegar();
  cerrarMenuAlRedimensionar();
});

// ===== CREAR BOTÓN HAMBURGUESA =====
function crearBotonHamburguesa() {
  const nav  = document.querySelector('.nav');
  const menu = document.querySelector('.menu');

  if (!nav || !menu) {
    console.error('❌ No se encontró .nav o .menu');
    return;
  }

  // Evitar duplicados si ya existe el botón
  if (document.querySelector('.menu-toggle')) return;

  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  nav.appendChild(menuToggle);
  console.log('✅ Botón hamburguesa creado');
}

// ===== CONFIGURAR EVENT LISTENERS =====
function configurarMenuMobile() {
  const menuToggle = document.querySelector('.menu-toggle');
  const menu       = document.querySelector('.menu');

  if (!menuToggle || !menu) {
    console.error('❌ No se encontró el botón o menú');
    return;
  }

  menuToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function (e) {
    const isClickInsideMenu = menu.contains(e.target);
    const isClickOnToggle   = menuToggle.contains(e.target);

    if (!isClickInsideMenu && !isClickOnToggle && menu.classList.contains('mobile-open')) {
      cerrarMenu();
    }
  });

  console.log('✅ Event listeners configurados');
}

// ===== TOGGLE MENU =====
function toggleMenu() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  menu.classList.contains('mobile-open') ? cerrarMenu() : abrirMenu();
}

// ===== ABRIR MENU =====
function abrirMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const menu       = document.querySelector('.menu');

  if (!menuToggle || !menu) return;

  menu.classList.add('mobile-open');
  menuToggle.classList.add('active');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';

  console.log('📂 Menú abierto');
}

// ===== CERRAR MENU =====
function cerrarMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const menu       = document.querySelector('.menu');

  if (!menuToggle || !menu) return;

  menu.classList.remove('mobile-open');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';

  console.log('📁 Menú cerrado');
}

// ===== CERRAR AL NAVEGAR =====
function cerrarMenuAlNavegar() {
  const menu = document.querySelector('.menu');
  if (!menu) return;

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      cerrarMenu();
      console.log('🔗 Navegando, menú cerrado');
    });
  });
}

// ===== CERRAR AL REDIMENSIONAR =====
function cerrarMenuAlRedimensionar() {
  let resizeTimer;

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
      if (window.innerWidth > 768) {
        cerrarMenu();
        console.log('🖥️ Desktop mode - menú cerrado');
      }
    }, 250);
  });
}

// ===== UTILIDADES =====
function isMobile() {
  return window.innerWidth <= 768;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { abrirMenu, cerrarMenu, toggleMenu, isMobile };
}
