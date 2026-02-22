import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// REMPLACE CECI PAR TES INFOS CLOUDINARY
const CLOUD_NAME = "TON_CLOUD_NAME"; 
const UPLOAD_PRESET = "exam-preset";

// --- CHARGER LA LISTE ---
async function chargerListe(recherche = "") {
    const listElement = document.getElementById('list');
    const q = query(collection(db, "epreuves"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    listElement.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();
        const info = (data.matiere + " " + data.classe).toLowerCase();
        if (info.includes(recherche.toLowerCase())) {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="background:white; margin:10px; padding:15px; border-radius:10px; border:1px solid #ddd">
                    <strong>${data.matiere.toUpperCase()}</strong> - ${data.classe}<br>
                    <a href="${data.urlPdf}" target="_blank" style="display:inline-block; margin-top:10px; color:white; background:#007bff; padding:8px 15px; text-decoration:none; border-radius:5px;">
                        📥 Télécharger le PDF
                    </a>
                </div>`;
            listElement.appendChild(li);
        }
    });
}

// --- BOUTON AJOUTER ---
document.getElementById('add-btn').addEventListener('click', async () => {
    const file = document.getElementById('file').files[0];
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;

    if (!file || !subject) return alert("Choisis un PDF et remplis la matière !");

    const btn = document.getElementById('add-btn');
    btn.innerText = "Envoi en cours...";
    btn.disabled = true;

    try {
        // 1. Envoi automatique vers Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
            method: 'POST',
            body: formData
        });
        const uploadData = await response.json();

        // 2. Enregistrement du lien dans Firebase
        await addDoc(collection(db, "epreuves"), {
            matiere: subject,
            classe: className,
            urlPdf: uploadData.secure_url,
            date: serverTimestamp()
        });

        alert("Terminé ! L'épreuve est en ligne.");
        location.reload();
    } catch (err) {
        alert("Erreur. Vérifie ton Cloud Name !");
        btn.innerText = "Ajouter";
        btn.disabled = false;
    }
});

// --- RECHERCHE ---
document.getElementById('search').addEventListener('input', (e) => chargerListe(e.target.value));

chargerListe();
