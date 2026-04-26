import {
    buscarEnZeldaApi,
    adaptarEntidad,
    debounce
} from "./api.js";

import {
    obtenerFavoritos,
    agregarFavorito,
    eliminarFavorito,
    vaciarFavoritos
} from "./firebase.js";

import {
    cargarXml,
    convertirXmlAJson,
    convertirJsonACsv,
    descargarCsv
} from "./transform.js";

const filtro = document.getElementById("filtro");
const buscador_principal = document.getElementById("buscador_principal");
const estadoBusqueda = document.getElementById("estadoBusqueda");
const resultados = document.getElementById("resultados");

const ordenFavoritos = document.getElementById("ordenFavoritos");
const filtroTipoFavorito = document.getElementById("filtroTipoFavorito");
const estadoFavoritos = document.getElementById("estadoFavoritos");
const listaFavoritos = document.getElementById("listaFavoritos");
const btnVaciarFavoritos = document.getElementById("btnVaciarFavoritos");

const btnCargarXml = document.getElementById("btnCargarXml");
const catalogoXml = document.getElementById("catalogoXml");
const jsonXml = document.getElementById("jsonXml");
const btnExportarCsv = document.getElementById("btnExportarCsv");

let favoritos = [];
let catalogoJuegos = [];

window.addEventListener("load", async function () {
    await cargarFavoritosEnPantalla();
});

buscador_principal.addEventListener("input", debounce(async function () {
    await realizarBusqueda();
}, 600));

filtro.addEventListener("change", async function () {
    await realizarBusqueda();
});

ordenFavoritos.addEventListener("change", function () {
    mostrarFavoritos();
});

filtroTipoFavorito.addEventListener("change", function () {
    mostrarFavoritos();
});

btnVaciarFavoritos.addEventListener("click", async function () {
    await vaciarListaFavoritos();
});

btnCargarXml.addEventListener("click", async function () {
    await cargarCatalogoXml();
});

btnExportarCsv.addEventListener("click", function () {
    exportarCatalogoCsv();
});

async function realizarBusqueda() {
    const tipo = filtro.value;
    const texto = buscador_principal.value.trim();

    resultados.replaceChildren();
    estadoBusqueda.className = "mensaje";

    if (texto === "") {
        estadoBusqueda.textContent = "Escribe algo para buscar.";
        return;
    }

    try {
        estadoBusqueda.textContent = "Cargando datos...";

        const datos = await buscarEnZeldaApi(tipo, texto);

        if (datos.length === 0) {
            estadoBusqueda.textContent = "No se encontraron resultados.";
            return;
        }

        estadoBusqueda.textContent = "Resultados encontrados: " + datos.length;

        const entidades = datos.map(function (item) {
            return adaptarEntidad(item, tipo);
        });

        mostrarResultados(entidades);
    } catch (error) {
        estadoBusqueda.className = "mensaje error";
        estadoBusqueda.textContent = error.message;
    }
}

function mostrarResultados(entidades) {
    resultados.replaceChildren();

    entidades.forEach(function (entidad) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        const tipo = document.createElement("span");
        tipo.className = "tipo";
        tipo.textContent = entidad.tipo;

        const titulo = document.createElement("h3");
        titulo.textContent = entidad.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = entidad.descripcion;

        const detalle1 = document.createElement("p");
        detalle1.textContent = entidad.detalle1;

        const detalle2 = document.createElement("p");
        detalle2.textContent = entidad.detalle2;

        const boton = document.createElement("button");

        const favoritoExistente = buscarFavorito(entidad);

        if (favoritoExistente) {
            boton.textContent = "Eliminar de favoritos";
            boton.className = "eliminar";
        } else {
            boton.textContent = "Agregar a favoritos";
        }

        boton.addEventListener("click", async function () {
            await cambiarEstadoFavorito(entidad);
        });

        tarjeta.appendChild(tipo);
        tarjeta.appendChild(titulo);
        tarjeta.appendChild(descripcion);
        tarjeta.appendChild(detalle1);
        tarjeta.appendChild(detalle2);
        tarjeta.appendChild(boton);

        resultados.appendChild(tarjeta);
    });
}

async function cambiarEstadoFavorito(entidad) {
    try {
        const favoritoExistente = buscarFavorito(entidad);

        if (favoritoExistente) {
            await eliminarFavorito(favoritoExistente.documentoId);
            estadoBusqueda.textContent = "Favorito eliminado.";
        } else {
            await agregarFavorito(entidad);
            estadoBusqueda.textContent = "Favorito agregado.";
        }

        await cargarFavoritosEnPantalla();
        await realizarBusqueda();
    } catch (error) {
        estadoBusqueda.className = "mensaje error";
        estadoBusqueda.textContent = error.message;
    }
}

function buscarFavorito(entidad) {
    return favoritos.find(function (favorito) {
        return favorito.apiId === entidad.apiId && favorito.tipo === entidad.tipo;
    });
}

async function cargarFavoritosEnPantalla() {
    try {
        estadoFavoritos.className = "mensaje";
        estadoFavoritos.textContent = "Cargando favoritos...";

        favoritos = await obtenerFavoritos();

        estadoFavoritos.textContent = "Favoritos cargados: " + favoritos.length;

        mostrarFavoritos();
    } catch (error) {
        estadoFavoritos.className = "mensaje error";
        estadoFavoritos.textContent = error.message;
    }
}

function mostrarFavoritos() {
    listaFavoritos.replaceChildren();

    let lista = [...favoritos];

    const filtro = filtroTipoFavorito.value;

    if (filtro !== "todos") {
        lista = lista.filter(function (favorito) {
            return favorito.tipo === filtro;
        });
    }

    const orden = ordenFavoritos.value;

    if (orden === "az") {
        lista.sort(function (a, b) {
            return a.nombre.localeCompare(b.nombre);
        });
    }

    if (orden === "za") {
        lista.sort(function (a, b) {
            return b.nombre.localeCompare(a.nombre);
        });
    }

    if (orden === "recientes") {
        lista.sort(function (a, b) {
            return new Date(b.fechaAgregado) - new Date(a.fechaAgregado);
        });
    }

    if (orden === "antiguos") {
        lista.sort(function (a, b) {
            return new Date(a.fechaAgregado) - new Date(b.fechaAgregado);
        });
    }

    if (lista.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.textContent = "No hay favoritos para mostrar.";
        listaFavoritos.appendChild(mensaje);
        return;
    }

    lista.forEach(function (favorito) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        const tipo = document.createElement("span");
        tipo.className = "tipo";
        tipo.textContent = favorito.tipo;

        const titulo = document.createElement("h3");
        titulo.textContent = favorito.nombre;

        const descripcion = document.createElement("p");
        descripcion.textContent = favorito.descripcion;

        const detalle1 = document.createElement("p");
        detalle1.textContent = favorito.detalle1 || "";

        const detalle2 = document.createElement("p");
        detalle2.textContent = favorito.detalle2 || "";

        const fecha = document.createElement("p");
        fecha.textContent = "Agregado: " + favorito.fechaAgregado;

        const boton = document.createElement("button");
        boton.className = "eliminar";
        boton.textContent = "Eliminar";

        boton.addEventListener("click", async function () {
            await eliminarFavoritoIndividual(favorito.documentoId);
        });

        tarjeta.appendChild(tipo);
        tarjeta.appendChild(titulo);
        tarjeta.appendChild(descripcion);
        tarjeta.appendChild(detalle1);
        tarjeta.appendChild(detalle2);
        tarjeta.appendChild(fecha);
        tarjeta.appendChild(boton);

        listaFavoritos.appendChild(tarjeta);
    });
}

async function eliminarFavoritoIndividual(documentoId) {
    try {
        await eliminarFavorito(documentoId);
        await cargarFavoritosEnPantalla();
    } catch (error) {
        estadoFavoritos.className = "mensaje error";
        estadoFavoritos.textContent = error.message;
    }
}

async function vaciarListaFavoritos() {
    try {
        await vaciarFavoritos();
        await cargarFavoritosEnPantalla();
        estadoFavoritos.textContent = "Se vaciaron todos los favoritos.";
    } catch (error) {
        estadoFavoritos.className = "mensaje error";
        estadoFavoritos.textContent = error.message;
    }
}

async function cargarCatalogoXml() {
    try {
        const xmlTexto = await cargarXml();
        catalogoJuegos = convertirXmlAJson(xmlTexto);

        mostrarCatalogo(catalogoJuegos);

        jsonXml.textContent = JSON.stringify(catalogoJuegos, null, 4);
    } catch (error) {
        catalogoXml.replaceChildren();

        const mensajeError = document.createElement("p");
        mensajeError.className = "error";
        mensajeError.textContent = error.message;

        catalogoXml.appendChild(mensajeError);
    }
}

function mostrarCatalogo(juegos) {
    catalogoXml.replaceChildren();

    const tabla = document.createElement("table");

    const thead = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");

    const encabezados = [
        "ID",
        "Título",
        "Desarrolladora",
        "Publicadora",
        "Plataforma",
        "Año",
        "Puntuación"
    ];

    encabezados.forEach(function (texto) {
        const th = document.createElement("th");
        th.textContent = texto;
        filaEncabezado.appendChild(th);
    });

    thead.appendChild(filaEncabezado);

    const tbody = document.createElement("tbody");

    juegos.forEach(function (juego) {
        const fila = document.createElement("tr");

        const datos = [
            juego.id,
            juego.titulo,
            juego.desarrolladora,
            juego.publicadora,
            juego.plataforma,
            juego.anio,
            juego.puntuacion
        ];

        datos.forEach(function (valor) {
            const td = document.createElement("td");
            td.textContent = valor;
            fila.appendChild(td);
        });

        tbody.appendChild(fila);
    });

    tabla.appendChild(thead);
    tabla.appendChild(tbody);

    catalogoXml.appendChild(tabla);
}

function exportarCatalogoCsv() {
    if (catalogoJuegos.length === 0) {
        jsonXml.textContent = "Primero debes cargar el XML.";
        return;
    }

    const csv = convertirJsonACsv(catalogoJuegos);
    descargarCsv("catalogo_zelda.csv", csv);
}