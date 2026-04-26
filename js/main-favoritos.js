import { obtenerFavoritos, eliminarFavorito, vaciarFavoritos } from "./firebase.js";

// 1. CAPTURA DE ELEMENTOS (IDs de tu HTML)
const listaFavoritos = document.getElementById("listaFavoritos");
const estadoFavoritos = document.getElementById("estadoFavoritos");
const filtroTipo = document.getElementById("filtroTipoFavorito");
const orden = document.getElementById("ordenFavoritos");
const btnVaciar = document.getElementById("btnVaciarFavoritos");

// 2. VARIABLE GLOBAL
let datosFavoritos = [];

// 3. LA FUNCIÓN QUE TE FALTABA (O que no encontraba)
async function cargarDatos() {
    try {
        estadoFavoritos.textContent = "Abriendo el cofre de tesoros...";
        // Llamamos a Firebase
        datosFavoritos = await obtenerFavoritos();

        if (datosFavoritos.length === 0) {
            estadoFavoritos.textContent = "El cofre está vacío. ¡Busca algo en el inicio!";
        } else {
            estadoFavoritos.textContent = `Tienes ${datosFavoritos.length} elementos guardados.`;
        }

        mostrarEnPantalla();
    } catch (error) {
        estadoFavoritos.textContent = "Error al conectar con la Gran Fuente de las Hadas.";
        console.error(error);
    }
}

// 4. FUNCIÓN PARA PINTAR EN PANTALLA
function mostrarEnPantalla() {
    listaFavoritos.replaceChildren(); // Limpiamos la sección

    let listaFiltrada = [...datosFavoritos];

    // Aplicar Filtro
    const tipo = filtroTipo.value;
    if (tipo !== "todos") {
        listaFiltrada = listaFiltrada.filter(f => f.tipo === tipo);
    }

    // Aplicar Ordenación
    const criterio = orden.value;
    listaFiltrada.sort((a, b) => {
        if (criterio === "az") return a.nombre.localeCompare(b.nombre);
        if (criterio === "za") return b.nombre.localeCompare(a.nombre);
        if (criterio === "recientes") return new Date(b.fechaAgregado) - new Date(a.fechaAgregado);
        if (criterio === "antiguos") return new Date(a.fechaAgregado) - new Date(b.fechaAgregado);
        return 0;
    });

    // Renderizado Semántico
    listaFiltrada.forEach(fav => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";
        tarjeta.innerHTML = `
            <span class="tipo">${fav.tipo}</span>
            <h3>${fav.nombre}</h3>
            <p>${fav.descripcion}</p>
            <footer class="tarjeta__footer">
                <button class="boton-peligro btn-borrar" data-id="${fav.documentoId}">Eliminar</button>
            </footer>
        `;

        tarjeta.querySelector(".btn-borrar").addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            estadoFavoritos.textContent = "Borrando elemento...";
            await eliminarFavorito(id);
            await cargarDatos(); // Recargar de Firebase
        });

        listaFavoritos.appendChild(tarjeta);
    });
}

// 5. CONFIGURACIÓN DE EVENTOS (Ponlos siempre al final)
window.addEventListener("load", cargarDatos);
filtroTipo.addEventListener("change", mostrarEnPantalla);
orden.addEventListener("change", mostrarEnPantalla);

btnVaciar.addEventListener("click", async () => {
    // Usamos el texto de estado en lugar de ventana emergente como pediste
    estadoFavoritos.textContent = "Vaciando toda la colección...";
    await vaciarFavoritos();
    await cargarDatos();
    estadoFavoritos.textContent = "Colección vaciada con éxito.";
});