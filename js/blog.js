// blog.js — Lógica de carga de artículos del Blog de Team Realty History | Inmobiliaria
// Dependencia: config.js debe cargarse antes que este script.
// Dependencia: DOM debe tener #loadingBlogs y #blogTable antes de ejecutarse.

// Sanitiza strings para prevenir XSS al inyectar HTML dinámico
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function loadBlogs() {
  const loading   = document.getElementById("loadingBlogs");
  const tableBody = document.querySelector("#blogTable tbody");

  try {
    loading.style.display = "block";

    const response = await fetch(TEAM_REALTY_HISTORY_CONFIG.BLOG_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const data = await response.json();
    tableBody.innerHTML = "";

    // Filtrar solo artículos activos
    const activos = data.filter(
      post => String(post["Activo (si/no)"]).toLowerCase() === "si"
    );

    if (activos.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding:40px; color:#555;">
            No hay artículos publicados aún.
          </td>
        </tr>
      `;
      return;
    }

    activos.forEach(post => {
      const codigo = post["CÓDIGO"] || "";
      const titulo = post["Título"] || post["Titulo"] || "Sin título";

      const fechaFormateada = new Date(post["Fecha"]).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="Título">
          <a href="articulo.html?codigo=${encodeURIComponent(codigo)}"
             style="color:inherit; text-decoration:none; font-weight:700;">
            ${sanitize(titulo)}
          </a>
        </td>
        <td data-label="Fecha">${sanitize(fechaFormateada)}</td>
        <td data-label="Resumen">${sanitize(post["Resumen"])}</td>
        <td data-label="Leer Más">
          <a href="articulo.html?codigo=${encodeURIComponent(codigo)}"
             class="readMoreBtn">
            Leer Más
          </a>
        </td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("❌ Error cargando blogs:", err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; color:#d32f2f; padding:40px;">
          Error al cargar los blogs. Intenta más tarde.
        </td>
      </tr>
    `;
  } finally {
    loading.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", loadBlogs);
