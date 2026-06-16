// config.js — Configuración central de <img src="https://res.cloudinary.com/diifewvvs/image/upload/Logo_TR_1_ihwkcs" alt="Team Realty History" width="120" height="120">
// Centraliza endpoints y constantes compartidas entre módulos.
// Cargar SIEMPRE antes que propiedades.js, blog.js, articulo.js y detalle-propiedad.js


function optimizarImagen(url, ancho = 800) {
  if (!url) return "";
  return url.replace("/upload/", `/upload/w_${ancho},f_auto,q_auto/`);
}




const TEAM_REALTY_HISTORY_CONFIG = {
  BLOG_ENDPOINT: "https://script.google.com/macros/s/AKfycbwkbqpfrWBdcaU8P5p65pvCcx5lD0osca_d_Pl1YlBo8tqbf6FA-9-xkN0NjpMVcAuUAg/exec",
  PROPIEDADES_ENDPOINT: "https://script.google.com/macros/s/AKfycbyQ6k06QgekJlRkR7vxwO9-m2hdLaB_cxvaO6NPj0McKB6TYuz-3cI9RquEj6YOJzeO/exec",
  WHATSAPP_NUMBER: "573164624872" // ⚠️ Actualizar con número real
};
