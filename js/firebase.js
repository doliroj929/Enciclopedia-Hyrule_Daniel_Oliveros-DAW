import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


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
        await addDoc(favRef, {
            ...entidad,
            fechaAgregado: new Date().toLocaleString()
        });
    } catch (e) {
        throw new Error("No se pudo guardar en Firebase: " + e.message);
    }
}

export async function obtenerFavoritos() {
    try {
        const q = query(favRef, orderBy("nombre", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ documentoId: d.id, ...d.data() }));
    } catch (e) {
        throw new Error("Error al leer de Firebase: " + e.message);
    }
}


export async function eliminarFavorito(id) {
    try {
        const documento = doc(db, "favoritos", id);
        await deleteDoc(documento);
    } catch (e) {
        throw new Error("No se pudo eliminar de Firebase.");
    }
}


export async function vaciarFavoritos() {
    const snapshot = await getDocs(favRef);
    const promesas = snapshot.docs.map(d => deleteDoc(doc(db, "favoritos", d.id)));
    await Promise.all(promesas);
}