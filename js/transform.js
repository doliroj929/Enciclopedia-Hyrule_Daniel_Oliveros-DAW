async function juegosCargarXml(){
    /*fetch:buscar*/
    const praticaResouesta = await fetch("data/juegos.xml");
    /*await :esperar la respuesta  */
    const textoXml = await praticaResouesta.text();

    const parser = new DOMParser();
    /*textoXml : texto xml*/

    /*application/xml: se usa para convertir en un xml*/
    const xmlDoc = parser.parseFromString(textoXml, "application/xml");

    const juegos = xmlDoc.querySelectorAll("juego");
    let obj = {};
    let listaJuegos = [];

    for ( let juego of juegos) {
        obj = {id : juego.getAttribute("id"),
            titulo : juego.querySelector("titulo").textContent,
            desarrolladora     : juego.querySelector("desarrolladora").textContent,
            publicadora : juego.querySelector("publicadora").textContent,
            plataforma : juego.querySelector("plataforma").textContent,
            anio : juego.querySelector("anio").textContent,
            puntuacion : juego.querySelector("puntuacion").textContent
        };

        listaJuegos.push(obj);
    }
    return listaJuegos
}

async function main(){



    const juegos= await juegosCargarXml();
    console.log(juegos);

}

main()











