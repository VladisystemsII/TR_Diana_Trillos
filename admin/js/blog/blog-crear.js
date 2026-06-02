// ════════════════════════════════════════════════════════
//  js/blog/blog-crear.js
//  PROPÓSITO : Módulo 01 — Crear Post de Blog.
//  DEPENDE DE: admin-config.js (BLOG_CONFIG)
//              admin-auth.js  (toast, submitForm)
// ════════════════════════════════════════════════════════

function getBlogFormData() {
  const g = id => {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked ? 'Si' : 'No';
    return (el.value || '').trim();
  };

  const fechaRaw = g('bf-fecha');
  let fechaYear = '', fechaMonth = '', fechaDay = '';
  if (fechaRaw) {
    const [y, m, d] = fechaRaw.split('-');
    fechaYear  = y || '';
    fechaMonth = m || '';
    fechaDay   = d || '';
  }

  return {
    fechaYear,
    fechaMonth,
    fechaDay,
    titulo:    g('bf-titulo'),
    resumen:   g('bf-resumen'),
    contenido: g('bf-contenido'),
    activo:    g('bf-activo')
  };
}

function validarBlogForm(data) {
  if (!data.fechaYear || !data.fechaMonth || !data.fechaDay)
    return 'El campo Fecha es obligatorio.';
  if (!data.titulo)
    return 'El campo Título es obligatorio.';
  if (!data.resumen)
    return 'El campo Resumen es obligatorio.';
  if (!data.contenido)
    return 'El campo Contenido es obligatorio.';
  return null;
}

async function crearBlogPost() {
  const data  = getBlogFormData();
  const error = validarBlogForm(data);
  if (error) { toast(error, 'error'); return; }

  const btn = document.getElementById('btn-blog-crear');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  toast('Registrando post en el sistema…', 'info', 2500);

  const E      = BLOG_CONFIG.ENTRY_CREAR;
  const params = new URLSearchParams();

  params.append(E.FECHA_YEAR,  data.fechaYear);
  params.append(E.FECHA_MONTH, data.fechaMonth);
  params.append(E.FECHA_DAY,   data.fechaDay);
  params.append(E.TITULO,      data.titulo);
  params.append(E.RESUMEN,     data.resumen);
  params.append(E.CONTENIDO,   data.contenido);
  params.append(E.ACTIVO,      data.activo);

  try {
    await submitForm(BLOG_CONFIG.FORM_CREAR_URL, params);
    toast(`✓ Post "${data.titulo}" registrado correctamente.`, 'success', 5000);
    limpiarBlogFormCrear();
  } catch (e) {
    toast(`Error al registrar: ${e.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar Post'; }
  }
}

function limpiarBlogFormCrear() {
  ['bf-fecha', 'bf-titulo', 'bf-resumen', 'bf-contenido'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const chk = document.getElementById('bf-activo');
  if (chk) {
    chk.checked = true;
    const lbl = document.getElementById('bf-activo-label');
    if (lbl) lbl.textContent = 'Sí';
  }
}
