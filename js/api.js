const urlApiPersonaje="https://zelda.fanapis.com/api/characters?name="
const urlJuegos = "https://zelda.fanapis.com/api/games?name="


/*------Para solicitar json a api-------------*/

async function obtenerPersonaje(letra){
    const respuestaPersonaje = await fetch(urlApiPersonaje+letra)
    const data = await respuestaPersonaje.json()
}

async function obtenerJuegos(letra){
    const respuestaDeJuego = await fetch(urlJuegos + letra)
    const data = await respuestaDeJuego.json()
}

const selectFiltro = document.getElementById("filtro")
const inputBuscador = document.getElementById("input__buscador")
const resultadoBuscador = document.getElementById("resultado__buscador")


async function buscar(){
    const selecionFiltro = selectFiltro.value
    const textoBuscador = inputBuscador.value
    try{
        let respuestaApi;
        if (selecionFiltro == "characters"){
            respuestaApi = await obtenerJuegos()
        }
    }
        catch(e){
    }
}


function mostarResultado(){

}