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

const CLOUD_NAME = "dajzki7n0"; 
const UPLOAD_PRESET = "exam-preset";

// --- CHARGER ET RECHERCHER ---
async function chargerListe(recherche = "") {
    const listElement = document.getElementById('list');
    try {
        const q = query(collection(db, "epreuves"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        listElement.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            const combo = (data.matiere + " " + data.classe).toLowerCase();
            if (combo.includes(recherche.toLowerCase())) {
                const li = document.createElement('li');
                li.style.background = "#f9f9f9";
                li.style.padding = "15px";
                li.style.margin = "10px 0";
                li.style.borderRadius = "8px";
                li.innerHTML = `
                    <strong>${data.matiere.toUpperCase()}</strong> - ${data.classe} (${data.annee})<br>
                    <a href="${data.urlPdf}" target="_blank" style="display:inline-block; margin-top:10px; color:white; background:#007bff; padding:8px 12px; text-decoration:none; border-radius:5px;">
                        📥 Télécharger le PDF
                    </a>`;
                listElement.appendChild(li);
            }
        });
    } catch (e) { console.log("Erreur de chargement"); }
}

// --- AJOUTER ---
document.getElementById('add-btn').addEventListener('click', async () => {
    const file = document.getElementById('file').files[0];
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    const year = document.getElementById('year').value;

    if (!file || !subject) return alert("Veuillez choisir un PDF et entrer la matière.");

    const btn = document.getElementById('add-btn');
    btn.innerText = "Patientez... Envoi en cours";
    btn.disabled = true;

    try {
        // Envoi vers Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
            method: 'POST',
            body: formData
        });
        const uploadData = await res.json();

        // Enregistrement dans Firebase
        await addDoc(collection(db, "epreuves"), {
            matiere: subject,
            classe: className,
            annee: year,
            urlPdf: uploadData.secure_url,
            date: serverTimestamp()
        });

        alert("Succès ! L'épreuve est ajoutée.");
        location.reload();
    } catch (err) {
        alert("Erreur d'envoi. Vérifie tes règles Firebase.");
        btn.innerText = "Ajouter";
        btn.disabled = false;
    }
});

document.getElementById('search').addEventListener('input', (e) => chargerListe(e.target.value));
chargerListe();
