const API_BASE_URL = "https://zelda.fanapis.com/api";

export function crearClaveCache(tipo, termino) {
    return "zelda_" + tipo + "_" + termino.toLowerCase().trim();
}

export function debounce(funcion, tiempoEspera) {
    let temporizador;

    return function () {
        clearTimeout(temporizador);

        temporizador = setTimeout(function () {
            funcion();
        }, tiempoEspera);
    };
}

export async function buscarEnZeldaApi(tipo, termino) {
    const texto = termino.trim();

    if (texto === "") {
        return [];
    }

    const claveCache = crearClaveCache(tipo, texto);
    const datosGuardados = localStorage.getItem(claveCache);

    if (datosGuardados !== null) {
        console.log("Datos cargados desde localStorage");
        return JSON.parse(datosGuardados);
    }

    const url = API_BASE_URL + "/" + tipo + "?name=" + encodeURIComponent(texto) + "&limit=20";

    let respuesta;

    try {
        respuesta = await fetch(url);
    } catch (error) {
        throw new Error("No se pudo conectar con la Zelda API.");
    }

    if (!respuesta.ok) {
        throw new Error("Error HTTP: " + respuesta.status);
    }

    const datos = await respuesta.json();

    if (!datos.data) {
        return [];
    }

    localStorage.setItem(claveCache, JSON.stringify(datos.data));

    return datos.data;
}

export function adaptarEntidad(entidad, tipo) {
    return {
        apiId: entidad.id || "",
        tipo: tipo,
        nombre: entidad.name || "Sin nombre",
        descripcion: entidad.description || "Sin descripción",
        detalle1: obtenerDetalle1(entidad, tipo),
        detalle2: obtenerDetalle2(entidad, tipo)
    };
}

function obtenerDetalle1(entidad, tipo) {
    if (tipo === "characters") {
        return "Raza: " + (entidad.race || "No disponible");
    }

    if (tipo === "items") {
        return "Juegos relacionados: " + contarArray(entidad.games);
    }

    if (tipo === "games") {
        return "Desarrollador: " + (entidad.developer || "No disponible");
    }

    return "";
}

function obtenerDetalle2(entidad, tipo) {
    if (tipo === "characters") {
        return "Género: " + (entidad.gender || "No disponible");
    }

    if (tipo === "items") {
        return "ID: " + (entidad.id || "No disponible");
    }

    if (tipo === "games") {
        return "Fecha de lanzamiento: " + (entidad.released_date || "No disponible");
    }

    return "";
}

function contarArray(valor) {
    if (Array.isArray(valor)) {
        return valor.length;
    }

    return 0;
}