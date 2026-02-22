import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDeRMiR2fAe-5La98F4J_E-1cyDHceyCsw",
  authDomain: "exam-73707.firebaseapp.com",
  projectId: "exam-73707",
  storageBucket: "exam-73707.firebasestorage.app",
  messagingSenderId: "219139072155",
  appId: "1:219139072155:web:dba75c1f67de400f70263e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- AJOUTER UNE ÉPREUVE AVEC PDF ---
document.getElementById('add-btn').addEventListener('click', async () => {
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    const file = document.getElementById('file').files[0]; // Le fichier PDF

    if (subject && className && file) {
        try {
            alert("Téléchargement du PDF en cours... patientez.");
            
            // 1. Envoyer le fichier au Storage
            const storageRef = ref(storage, 'epreuves/' + file.name);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // 2. Enregistrer les infos dans la base de données
            await addDoc(collection(db, "epreuves"), {
                matiere: subject,
                classe: className,
                lienPdf: url, // C'est ce lien qui permet de télécharger !
                date: serverTimestamp()
            });

            alert("Succès ! L'épreuve est en ligne.");
            location.reload();
        } catch (e) { alert("Erreur : " + e.message); }
    } else { alert("Remplissez tout et choisissez un PDF !"); }
});

// --- AFFICHER LA LISTE AVEC BOUTONS DE TÉLÉCHARGEMENT ---
async function afficherListe() {
    const listElement = document.getElementById('list');
    const querySnapshot = await getDocs(collection(db, "epreuves"));
    listElement.innerHTML = ""; 

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement('li');
        li.style.marginBottom = "10px";
        li.innerHTML = `
            <strong>${data.matiere} (${data.classe})</strong> 
            <br>
            <a href="${data.lienPdf}" target="_blank" style="color: blue; text-decoration: underline;">
               📥 Télécharger le PDF
            </a>
        `;
        listElement.appendChild(li);
    });
}

afficherListe(); // Lance l'affichage au démarrage
