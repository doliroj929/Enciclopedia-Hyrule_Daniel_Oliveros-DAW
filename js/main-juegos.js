import { juegosCargarXml } from "./transform.js";

// Capturamos los elementos de TU nuevo HTML
const btnCargar = document.getElementById("btnCargarXml");
const btnExportar = document.getElementById("btnExportarCsv");
const contenedorTabla = document.getElementById("contenedorTabla");
const estado = document.getElementById("estadoXml");

let listaJuegosLocal = [];

// Evento para Cargar
btnCargar.addEventListener("click", async () => {
    try {
        estado.textContent = "Buscando pergaminos en la biblioteca...";

        // Usamos tu función juegosCargarXml()
        listaJuegosLocal = await juegosCargarXml();

        if (listaJuegosLocal.length > 0) {
            pintarTabla(listaJuegosLocal);
            estado.textContent = `¡Carga completa! ${listaJuegosLocal.length} juegos encontrados.`;
        } else {
            estado.textContent = "El archivo XML está vacío.";
        }
    } catch (error) {
        estado.textContent = "Error: No se pudo cargar el archivo XML.";
        console.error("Error detallado:", error);
    }
});

// Evento para Exportar (Bloque 3)
btnExportar.addEventListener("click", () => {
    if (listaJuegosLocal.length === 0) {
        estado.textContent = "⚠️ Primero carga los juegos para poder exportar.";
        return;
    }

    const cabecera = "ID,Titulo,Desarrolladora,Plataforma,Anio,Puntuacion\n";
    const filas = listaJuegosLocal.map(j =>
        `${j.id},"${j.titulo}","${j.desarrolladora}","${j.plataforma}",${j.anio},${j.puntuacion}`
    ).join("\n");

    const blob = new Blob([cabecera + filas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "catalogo_zelda_daniel.csv";
    link.click();
});

// Función para pintar la tabla
function pintarTabla(juegos) {
    contenedorTabla.replaceChildren(); // Limpiar antes de pintar

    const tabla = document.createElement("table");
    tabla.className = "tabla-zelda";

    tabla.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Desarrolladora</th>
                <th>Plataforma</th>
                <th>Año</th>
                <th>Puntuación</th>
            </tr>
        </thead>
        <tbody>
            ${juegos.map(j => `
                <tr>
                    <td>${j.id}</td>
                    <td class="resaltado">${j.titulo}</td>
                    <td>${j.desarrolladora}</td>
                    <td>${j.plataforma}</td>
                    <td>${j.anio}</td>
                    <td><span class="puntos">${j.puntuacion}</span></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    contenedorTabla.appendChild(tabla);
}