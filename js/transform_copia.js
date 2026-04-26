const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// --- CONFIGURACIÓN DE RUTAS ---
// __dirname es la carpeta donde vive este archivo (es decir, .../js)
// Usamos path.join para "navegar" por las carpetas de forma segura
const rutaXML = path.join(__dirname, '..', 'data', 'juegos.xml');
const rutaSalidaJSON = path.join(__dirname, '..', 'data', 'juegos.json');

/**
 * Función principal para transformar el catálogo
 */
const transformarCatalogo = () => {
    console.log("Leyendo archivo en:", rutaXML);

    try {
        // 1. Leer el archivo XML
        const xmlData = fs.readFileSync(rutaXML, 'utf-8');

        // 2. Configurar el parser de xml2js
        // explicitArray: false -> evita que cada campo sea un array de un solo elemento
        // mergeAttrs: true -> mete los atributos (como el id) dentro del objeto principal
        const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true
        });

        // 3. Procesar el XML
        parser.parseString(xmlData, (err, result) => {
            if (err) {
                console.error("❌ Error al parsear el XML:", err);
                return;
            }

            // Accedemos a la lista de juegos
            // Verificamos si es un array (por si solo hay un juego)
            const juegosOriginales = Array.isArray(result.saga.juego)
                ? result.saga.juego
                : [result.saga.juego];

            // 4. Limpiar y transformar los datos (RA5e)
            const juegosLimpios = juegosOriginales.map(j => ({
                id: j.id, // El id ya está aquí gracias a mergeAttrs: true
                titulo: j.titulo,
                desarrolladora: j.desarrolladora,
                publicadora: j.publicadora,
                plataforma: j.plataforma,
                anio: Number(j.anio),         // Obligatorio convertir a número para la rúbrica
                puntuacion: Number(j.puntuacion) // Obligatorio convertir a número para la rúbrica
            }));

            // 5. Guardar el resultado en un nuevo archivo JSON
            fs.writeFileSync(rutaSalidaJSON, JSON.stringify(juegosLimpios, null, 2));

            console.log("--------------------------------------------------");
            console.log("✅ ¡TRANSFORMACIÓN COMPLETADA CON ÉXITO!");
            console.log(`📂 Archivo generado: data/juegos.json`);
            console.log(`🎮 Total de juegos procesados: ${juegosLimpios.length}`);
            console.log("--------------------------------------------------");
        });

    } catch (error) {
        console.error("❌ ERROR CRÍTICO:");
        if (error.code === 'ENOENT') {
            console.error(`No se encontró el archivo juegos.xml en la ruta: ${rutaXML}`);
        } else {
            console.error(error.message);
        }
    }
};

// Ejecutar la función
transformarCatalogo();


/**
 * REQUISITOS:
 * - Incluir atributo 'id'
 * - Convertir 'anio' y 'puntuacion' a número
 */
export async function xmlToJson(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const juegosNodos = xmlDoc.querySelectorAll("juego");

    return Array.from(juegosNodos).map(juego => {
        return {
            id: juego.getAttribute("id"), // ✅ ID incluido
            titulo: juego.querySelector("titulo").textContent,
            desarrolladora: juego.querySelector("desarrolladora").textContent,
            plataforma: juego.querySelector("plataforma").textContent,
            anio: Number(juego.querySelector("anio").textContent), // ✅ Convertido a número
            puntuacion: Number(juego.querySelector("puntuacion").textContent) // ✅ Convertido a número
        };
    });
}

/**
 * REQUISITO: Exportar a CSV descargable
 */
export function descargarCSV(datos) {
    const encabezados = ["ID", "Titulo", "Desarrolladora", "Plataforma", "Anio", "Puntuacion"];
    const filas = datos.map(j =>
        `${j.id},"${j.titulo}","${j.desarrolladora}","${j.plataforma}",${j.anio},${j.puntuacion}`
    );

    const contenidoCSV = [encabezados.join(","), ...filas].join("\n");
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "catalogo_hyrule.csv";
    link.click();
    URL.revokeObjectURL(url); // Limpieza de memoria
}