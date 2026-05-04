// config.js — Configuración central de Portal33
// Centraliza endpoints y constantes compartidas entre módulos.
// Cargar SIEMPRE antes que propiedades.js, blog.js, articulo.js y detalle-propiedad.js


function optimizarImagen(url, ancho = 800) {
  if (!url) return "";
  return url.replace("/upload/", `/upload/w_${ancho},f_auto,q_auto/`);
}




const PORTAL33_CONFIG = {
  BLOG_ENDPOINT: "https://script.google.com/macros/s/AKfycbz8IamMmWTHZpeCBrp_4LoOfciihQJnThGFyDPkCotBo7waK38VJz167lHsIrB1eV79mw/exec",
  PROPIEDADES_ENDPOINT: "https://script.google.com/macros/s/AKfycbyQ6k06QgekJlRkR7vxwO9-m2hdLaB_cxvaO6NPj0McKB6TYuz-3cI9RquEj6YOJzeO/exec",
  WHATSAPP_NUMBER: "573001234567" // ⚠️ Actualizar con número real
};
