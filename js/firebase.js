import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyC6eN8jgxlSwktrFPAJvbZ3Ogrxr_-wNp0",
    authDomain: "zelda-enciclopedia-df-or.firebaseapp.com",
    projectId: "zelda-enciclopedia-df-or",
    storageBucket: "zelda-enciclopedia-df-or.firebasestorage.app",
    messagingSenderId: "491270784755",
    appId: "1:491270784755:web:ddd88a288cc557eece5986"
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const favRef = collection(db, "favoritos");


export async function agregarFavorito(entidad) {
    try {
        const docRef = await addDoc(favRef, {
            ...entidad,
            fechaAgregado: new Date().toISOString() // Importante para ordenar después
        });
        return docRef.id;
    } catch (e) {
        throw new Error("Error al guardar en la nube: " + e.message);
    }
}


export async function obtenerFavoritos() {
    try {

        const q = query(favRef, orderBy("nombre", "asc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(documento => ({
            documentoId: documento.id,
            ...documento.data()
        }));
    } catch (e) {
        throw new Error("No se pudieron cargar los favoritos.");
    }
}


export async function eliminarFavorito(documentoId) {
    try {
        const docADestruir = doc(db, "favoritos", documentoId);
        await deleteDoc(docADestruir);
    } catch (e) {
        throw new Error("No se pudo eliminar el favorito.");
    }
}

export async function vaciarFavoritos() {
    try {
        const snapshot = await getDocs(favRef);
        // Borramos todos los documentos uno por uno
        const promesas = snapshot.docs.map(documento =>
            deleteDoc(doc(db, "favoritos", documento.id))
        );
        await Promise.all(promesas);
    } catch (e) {
        throw new Error("Error al vaciar la colección.");
    }
}