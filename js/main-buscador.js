import { buscarEnZeldaApi, adaptarEntidad, debounce } from "./api.js";
import { obtenerFavoritos, agregarFavorito, eliminarFavorito } from "./firebase.js";

// Elementos específicos de index.html
const filtro = document.getElementById("filtro");
const buscador_principal = document.getElementById("buscador_principal");
const estadoBusqueda = document.getElementById("estadoBusqueda");
const resultados = document.getElementById("resultados");

let favoritos = [];

window.addEventListener("load", async () => {
    favoritos = await obtenerFavoritos();
});

buscador_principal.addEventListener("input", debounce(async () => {
    await realizarBusqueda();
}, 600));

filtro.addEventListener("change", async () => {
    await realizarBusqueda();
});

async function realizarBusqueda() {
    const tipo = filtro.value;
    const texto = buscador_principal.value.trim();
    resultados.replaceChildren();

    if (texto === "") {
        estadoBusqueda.textContent = "Escribe algo para buscar.";
        return;
    }

    try {
        estadoBusqueda.textContent = "Buscando en Hyrule...";
        const datos = await buscarEnZeldaApi(tipo, texto);

        if (datos.length === 0) {
            estadoBusqueda.textContent = "No se encontraron resultados.";
            return;
        }

        estadoBusqueda.textContent = `Resultados: ${datos.length}`;
        const entidades = datos.map(item => adaptarEntidad(item, tipo));
        mostrarResultados(entidades);
    } catch (error) {
        estadoBusqueda.textContent = error.message;
    }
}

function mostrarResultados(entidades) {
    resultados.replaceChildren();
    entidades.forEach(entidad => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        const favoritoExistente = favoritos.find(f => f.apiId === entidad.apiId);
        const textoBoton = favoritoExistente ? "Eliminar de favoritos" : "Agregar a favoritos";

        tarjeta.innerHTML =`
            <span class="tipo">${entidad.tipo}</span>
            <h3>${entidad.nombre}</h3>
            <p>${entidad.descripcion}</p>
            <p>${entidad.detalle1}</p>
            <p>${entidad.detalle2}</p>
            <button class="${favoritoExistente ? 'eliminar' : ''}">${textoBoton}</button> `;



        tarjeta.querySelector("button").addEventListener("click", async (e) => {
            if (favoritoExistente) {
                await eliminarFavorito(favoritoExistente.documentoId);
            } else {
                await agregarFavorito(entidad);
            }
            // Recargar datos para actualizar estado visual
            favoritos = await obtenerFavoritos();
            await realizarBusqueda();
        });

        resultados.appendChild(tarjeta);
    });
}