# Proyecto_Final_zelda

### Realizado por: Daniel Felipe Oliveros Rojas
### Curso Daw 1 mañana 


## ****Descripción del proyecto****:
Este proyecto es una aplicación web pensada para que cualquier fan de _The Legend of Zelda_ pueda explorar el universo de Hyrule. No es solo un buscador; es una herramienta que combina datos de una API externa, almacenamiento en la nube y conversión de archivos antiguos xml a json

funciones de la web

La aplicación sirve como una enciclopedia centralizada donde los usuarios pueden:

-   **Buscar** información detallada sobre del juego .

-   **Gestionar favoritos** persistentes mediante una base de datos en la nube.

-   **Consultar un catálogo** de juegos clásicos importado desde un formato XML.

-   **Exportar datos** del catálogo a formato CSV para su uso en hojas de cálculo.
-----------

## Tecnologías y herramientas

-   **HTML5 y CSS3:** Estructura y diseño responsivo.

-   **JavaScript (ES6+):** Lógica de la aplicación con módulos asíncronos (`async/await`).

-   **Zelda API:** Fuente de datos externa para la enciclopedia.

-   **Firebase Firestore:** Almacenamiento en la nube para favoritos.

-   **localStorage:** Sistema de caché local para optimizar el rendimiento.

##  La Zelda API

He utilizado la API oficial de Zelda ([zelda.fan](https://www.google.com/search?q=https://docs.zelda.fan/)).

-   **Endpoints usados**: `/characters`, `/monsters` y `/games`.

-   **Integración**: Uso `fetch` para pedir los datos y un "buscador" que filtra por el nombre que escribe el usuario.


**Ejemplo de respuesta real (JSON):**

JSON

```
{
  "success": true,
  "data": {
    "name": "Link",
    "description": "El héroe del tiempo...",
    "id": "557112..."
  }
}

```

**Campos que uso**: Principalmente el `name` (para el título), `description` (para el texto de la tarjeta) e `id` (para identificarlo al guardarlo en favoritos).

##  Formatos de datos

En clase hemos visto tres formatos y aquí los uso todos:

1.  **JSON**: Es el "idioma" de las APIs. Es ligero y fácil de leer para JavaScript. Lo uso para la búsqueda principal.

2.  **XML**: Es más ordenado y estricto. Lo uso para el catálogo de juegos local (`juegos.xml`) porque permite estructurar mucho mejor la información compleja.

3.  **CSV**: Es como una hoja de Excel pero en texto. Lo uso para la exportación, porque es el formato que cualquier programa de oficina puede abrir fácilmente.


##  Esquemas y Validación

Para asegurar que los datos no contengan errores, he trabajado con:

-   **XSD (XML Schema Definition)**: Define qué etiquetas son obligatorias en mi `juegos.xml` (por ejemplo, que cada juego tenga un ID único y un año numérico).

-   **JSON Schema**: Valida que la respuesta de la API de Zelda traiga los campos necesarios antes de intentar pintarlos en el HTML, evitando que la web "rompa" si falta una descripción. _(Evidencia: Los archivos se validan correctamente en el IDE y no presentan errores de estructura en la consola del navegador)._

He tomado decisiones distintas según la necesidad:

-   **localStorage (Caché)**: Lo uso para guardar las búsquedas recientes. Es muy rápido porque está en el navegador, pero si cambias de ordenador, esos datos no están allí.

-   **Firestore (Favoritos)**: Lo uso para los favoritos porque se guarda en la nube de Google. Da igual desde dónde entres, tus favoritos siempre aparecerán.


**Limitaciones de localStorage**: No sirve para favoritos porque es volátil (si borras datos de navegación se va) y solo guarda texto simple, no es una base de datos real con la que se pueda trabajar en serio.

**Reglas de seguridad de Firestore**: Ahora mismo lo tengo en "Modo de prueba" (abierto a todos). En una aplicación real (Producción), pondría reglas para que solo tú pudieras borrar tus propios favoritos usando un sistema de login.

**Otras alternativas**: Existe `IndexedDB` (para guardar muchos datos en el navegador) o `SessionStorage` (que se borra al cerrar la pestaña). He elegido las mías por ser el equilibrio perfecto entre facilidad y potencia.

##  Decisiones técnicas


**Conversión de tipos**: Al leer el XML, fuerzo que el año y la puntuación sean `Number`. Si no lo hiciera, JavaScript los trataría como texto y no podría ordenarlos correctamente de mayor a menor.


##  Instrucciones de uso

1.  Descarga el proyecto y ábrelo con **Live Server** en VS Code (es necesario para que los módulos funcionen).

2.  **Configurar Firebase**:

    -   Crea un proyecto en la consola de Firebase.

    -   Crea una base de datos Firestore en "Modo de prueba".

    -   Copia tus credenciales (`apiKey`, `projectId`, etc.) y pégalas en el archivo `js/firebase.js` dentro del objeto `firebaseConfig`.
