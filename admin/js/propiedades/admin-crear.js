// ════════════════════════════════════════════════════════
//  js/propiedades/admin-crear.js
//  PROPÓSITO : Módulo 01 — Crear Propiedad.
//              Maneja el formulario de creación: sube fotos
//              a Cloudinary (comprime → CDN → guarda URL)
//              y envía los datos al Form 1 de Google Forms.
//  DEPENDE DE: admin-config.js (ADMIN_CONFIG, ENTRY, SENTINELS)
//              admin-auth.js  (toast, submitForm, cargarContador)
// ════════════════════════════════════════════════════════

// ── FOTOS: estado interno ─────────────────────────────────
// fotoUrls[n] = URL de Cloudinary una vez subida, o '' si no hay foto
const fotoUrls = {};
for (let i = 1; i <= 9; i++) fotoUrls[i] = '';

// ── DISPARAR INPUT FILE ───────────────────────────────────
function triggerFoto(n) {
  document.getElementById(`file-${n}`).click();
}

// ── LIMPIAR SLOT ──────────────────────────────────────────
function limpiarFoto(n) {
  fotoUrls[n] = '';
  document.getElementById(`file-${n}`).value          = '';
  document.getElementById(`f-foto${n}`).value         = '';
  document.getElementById(`prev-${n}`).style.display  = 'none';
  document.getElementById(`ph-${n}`).style.display    = 'flex';
  document.getElementById(`clear-${n}`).style.display = 'none';
  document.getElementById(`prog-${n}`).style.display  = 'none';
  document.getElementById(`bar-${n}`).style.width     = '0%';
}

// ── PROCESAR FOTO: comprimir → subir a Cloudinary ─────────
async function procesarFoto(n, input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const CLD  = ADMIN_CONFIG.CLOUDINARY;

  document.getElementById(`ph-${n}`).style.display   = 'none';
  document.getElementById(`prog-${n}`).style.display = 'block';
  _setBar(n, 10);

  try {
    const comprimida = await _comprimirImagen(file, CLD.MAX_W, CLD.MAX_H, CLD.QUALITY);
    _setBar(n, 40);

    const formData = new FormData();
    formData.append('file',           comprimida);
    formData.append('upload_preset',  CLD.UPLOAD_PRESET);
    formData.append('folder',         'team_realty');
    _setBar(n, 60);

    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLD.CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body:   formData
    });
    const data = await res.json();
    _setBar(n, 90);

    if (data.secure_url) {
      fotoUrls[n] = data.secure_url;
      document.getElementById(`f-foto${n}`).value        = data.secure_url;
      document.getElementById(`prev-${n}`).src           = data.secure_url;
      document.getElementById(`prev-${n}`).style.display = 'block';
      document.getElementById(`clear-${n}`).style.display = 'block';
      _setBar(n, 100);
      setTimeout(() => {
        document.getElementById(`prog-${n}`).style.display = 'none';
        _setBar(n, 0);
      }, 600);
      toast(`Foto ${n} subida correctamente`, 'success', 2500);
    } else {
      throw new Error(data.error?.message || 'Cloudinary no devolvió URL');
    }
  } catch (err) {
    document.getElementById(`ph-${n}`).style.display   = 'flex';
    document.getElementById(`prog-${n}`).style.display = 'none';
    _setBar(n, 0);
    toast(`Error en Foto ${n}: ${err.message}`, 'error');
  }
}

/** Redimensiona y comprime una imagen usando canvas */
function _comprimirImagen(file, maxW, maxH, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('No se pudo comprimir')); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => reject(new Error('No se pudo leer la imagen'));
    img.src = url;
  });
}

function _setBar(n, pct) {
  document.getElementById(`bar-${n}`).style.width = pct + '%';
}

// ── RECOLECTAR DATOS DEL FORMULARIO ──────────────────────
function getFormData() {
  const g = id => {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked ? 'Si' : 'No';
    return (el.value || '').trim();
  };
  return {
    titulo:         g('f-titulo'),
    direccion:      g('f-direccion'),
    tipo:           g('f-tipo'),
    ciudad:         g('f-ciudad'),
    barrio:         g('f-barrio'),
    estrato:        g('f-estrato'),
    area:           g('f-area'),
    habitaciones:   g('f-hab'),
    banos:          g('f-ban'),
    parqueaderos:   g('f-park'),
    resComercial:   g('f-res-com'),
    tipoNegocio:    g('f-tipo-negocio'),
    estado:         g('f-estado'),
    precioVenta:    g('f-precio-venta'),
    precioArriendo: g('f-precio-arriendo'),
    administracion: g('f-admin'),
    descripcion:    g('f-descripcion'),
    informacion:    g('f-informacion'),
    agente:         g('f-agente'),
    foto1:          fotoUrls[1],
    foto2:          fotoUrls[2],
    foto3:          fotoUrls[3],
    foto4:          fotoUrls[4],
    foto5:          fotoUrls[5],
    foto6:          fotoUrls[6],
    foto7:          fotoUrls[7],
    foto8:          fotoUrls[8],
    foto9:          fotoUrls[9],
    activo:         g('f-activo')
  };
}

// ── VALIDACIÓN ────────────────────────────────────────────
function validarForm(data) {
  if (!data.titulo) return 'El campo Título es obligatorio.';
  if (!data.foto1)  return 'Foto 1 es obligatoria — sube al menos una imagen.';
  return null;
}

// ── ENVIAR A GOOGLE FORMS ─────────────────────────────────
async function crearPropiedad() {
  const data  = getFormData();
  const error = validarForm(data);
  if (error) { toast(error, 'error'); return; }

  const btn = document.getElementById('btn-crear');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
  toast('Registrando en el sistema…', 'info', 2500);

  const E = ADMIN_CONFIG.ENTRY;
  const params = new URLSearchParams();

  params.append(E.TITULO,          data.titulo);
  params.append(E.DIRECCION,       data.direccion);
  params.append(E.TIPO,            data.tipo);
  params.append(E.CIUDAD,          data.ciudad);
  params.append(E.BARRIO,          data.barrio);
  params.append(E.ESTRATO,         data.estrato);
  params.append(E.AREA,            data.area);
  params.append(E.HABITACIONES,    data.habitaciones);
  params.append(E.BANOS,           data.banos);
  params.append(E.PARQUEADEROS,    data.parqueaderos);
  params.append(E.RES_COMERCIAL,   data.resComercial);
  params.append(E.TIPO_NEGOCIO,    data.tipoNegocio);
  params.append(E.ESTADO,          data.estado);
  params.append(E.PRECIO_VENTA,    data.precioVenta);
  params.append(E.PRECIO_ARRIENDO, data.precioArriendo);
  params.append(E.ADMINISTRACION,  data.administracion);
  params.append(E.DESCRIPCION,     data.descripcion);
  params.append(E.INFORMACION,     data.informacion);
  params.append(E.AGENTE,          data.agente);
  params.append(E.FOTO1,           data.foto1);
  params.append(E.FOTO2,           data.foto2);
  params.append(E.FOTO3,           data.foto3);
  params.append(E.FOTO4,           data.foto4);
  params.append(E.FOTO5,           data.foto5);
  params.append(E.FOTO6,           data.foto6);
  params.append(E.FOTO7,           data.foto7);
  params.append(E.FOTO8,           data.foto8);
  params.append(E.FOTO9,           data.foto9);
  params.append(E.ACTIVO_CREAR,    data.activo);

  try {
    // submitForm (en admin-auth.js) agrega fvv, pageHistory y sentinels
    await submitForm(ADMIN_CONFIG.FORM_CREAR_URL, params);
    toast(`✓ Propiedad "${data.titulo}" registrada correctamente.`, 'success', 5000);
    limpiarFormCrear();
    cargarContador();
  } catch (e) {
    toast(`Error al registrar: ${e.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Guardar Propiedad'; }
  }
}

// ── LIMPIAR FORMULARIO COMPLETO ───────────────────────────



function limpiarFormCrear() {
  [
    'f-titulo','f-direccion','f-ciudad','f-barrio','f-area','f-res-com',
    'f-hab','f-ban','f-park','f-precio-venta','f-precio-arriendo','f-admin','f-descripcion','f-informacion',
'f-agente'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  ['f-tipo','f-estrato','f-tipo-negocio','f-estado'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });

  for (let n = 1; n <= 9; n++) limpiarFoto(n);

  const chk = document.getElementById('f-activo');
  if (chk) {
    chk.checked = true;
    document.getElementById('activo-label').textContent = 'Sí';
  }
}
