import { obtenerFavoritos, eliminarFavorito, vaciarFavoritos } from "./firebase.js";

const ordenFavoritos = document.getElementById("ordenFavoritos");
const filtroTipoFavorito = document.getElementById("filtroTipoFavorito");
const estadoFavoritos = document.getElementById("estadoFavoritos");
const listaFavoritos = document.getElementById("listaFavoritos");
const btnVaciarFavoritos = document.getElementById("btnVaciarFavoritos");

let favoritos = [];

window.addEventListener("load", cargarFavoritosEnPantalla);
ordenFavoritos.addEventListener("change", mostrarFavoritos);
filtroTipoFavorito.addEventListener("change", mostrarFavoritos);
btnVaciarFavoritos.addEventListener("click", async () => {
    if(confirm("¿Seguro que quieres vaciar toda la lista?")) {
        await vaciarFavoritos();
        await cargarFavoritosEnPantalla();
    }
});

async function cargarFavoritosEnPantalla() {
    try {
        estadoFavoritos.textContent = "Cargando tus favoritos...";
        favoritos = await obtenerFavoritos();
        mostrarFavoritos();
    } catch (error) {
        estadoFavoritos.textContent = error.message;
    }
}

function mostrarFavoritos() {
    listaFavoritos.replaceChildren();
    let lista = [...favoritos];

    // Lógica de filtrado y ordenación (puedes copiar la que ya tenías en ui.js)
    // ... [Tu código de filtrado y sort aquí] ...

    lista.forEach(fav => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";
        tarjeta.innerHTML = `
            <h3>${fav.nombre}</h3>
            <p>${fav.descripcion}</p>
            <button class="eliminar">Eliminar</button>
        `;
        tarjeta.querySelector("button").addEventListener("click", async () => {
            await eliminarFavorito(fav.documentoId);
            await cargarFavoritosEnPantalla();
        });
        listaFavoritos.appendChild(tarjeta);
    });
}