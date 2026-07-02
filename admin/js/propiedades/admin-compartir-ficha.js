// ════════════════════════════════════════════════════════
//  js/propiedades/admin-compartir-ficha.js
// ════════════════════════════════════════════════════════

function compartirFichaHTML(codigo) {
  return `
    <div class="ficha-section" id="compartir-ficha-bloque">
      <h3 class="section-label">Generar Ficha</h3>
      <div class="ficha-grid">
        <div class="ficha-row full">
          <span class="dc-label">Seleccionar Agente</span>
          <select id="cf-agente" style="margin-top:6px; padding:10px 14px; font-size:0.85rem; border:1px solid #e2ded5; background:#fcfaf7; width:100%; max-width:320px;">
            <option value="">— Seleccionar agente —</option>
            <option value="01">01 — Diana Trillos</option>
            <option value="02">02 — Vladimir Alba</option>
          </select>
        </div>
      </div>
      <div style="display:flex; gap:12px; margin-top:20px; flex-wrap:wrap;">
        <button onclick="generarFicha('${codigo}', 'pdf')"
          style="display:flex; align-items:center; gap:8px; padding:12px 24px; background:#D10000; color:#fff; border:none; font-size:0.75rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer;">
          📄 Ficha PDF
        </button>
        <button onclick="generarFicha('${codigo}', 'png')"
          style="display:flex; align-items:center; gap:8px; padding:12px 24px; background:#2d2d2d; color:#fff; border:none; font-size:0.75rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer;">
          🖼️ Ficha PNG
        </button>
        <button onclick="generarFicha('${codigo}', 'wa')"
          style="display:flex; align-items:center; gap:8px; padding:12px 24px; background:#25D366; color:#fff; border:none; font-size:0.75rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer;">
          📲 WhatsApp
        </button>
      </div>
    </div>
  `;
}

function generarFicha(codigo, tipo) {
  const agente = document.getElementById('cf-agente')?.value;

  if (!agente) {
    toast('Selecciona un agente antes de generar la ficha.', 'error');
    return;
  }

  const AGENTE     = agente === "02" ? "Vladimir Alba"    : "Diana Trillos";
  const AGENTE_TEL = agente === "02" ? "+57 311 483 1846" : "+57 316 462 4872";

  if (tipo === 'wa') {
    const titulo = document.querySelector('.ficha-titulo')?.textContent.trim() || codigo;
    const link   = "https://teamrealtyhistory.com/fichasws/" + codigo + ".html";

    const mensaje =
      "*" + titulo + "*\n\n" +
      "Para descubrir la historia completa de esta propiedad, visita:\n" +
      link + "\n\n" +
      AGENTE + "  |  Team Realty History\n" +
      AGENTE_TEL;

    window.open("https://wa.me/?text=" + encodeURIComponent(mensaje), "_blank");
    return;
  }

  window.open("ficha-" + tipo + ".html?codigo=" + encodeURIComponent(codigo) + "&agente=" + agente, "_blank");
}
