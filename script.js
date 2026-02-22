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

async function chargerListe(recherche = "") {
    const listElement = document.getElementById('list');
    const q = query(collection(db, "epreuves"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    listElement.innerHTML = "";
    snapshot.forEach(doc => {
        const data = doc.data();
        const texte = (data.matiere + " " + data.classe).toLowerCase();
        if (texte.includes(recherche.toLowerCase())) {
            const li = document.createElement('li');
            li.style.background = "white"; li.style.padding = "15px"; li.style.margin = "10px 0"; li.style.borderRadius = "12px";
            li.innerHTML = `
                <strong>${data.matiere.toUpperCase()}</strong> - ${data.classe}<br>
                <a href="${data.urlPdf}" target="_blank" style="display:block; text-align:center; margin-top:10px; background:#007bff; color:white; padding:10px; text-decoration:none; border-radius:8px;">
                    📥 Télécharger le PDF
                </a>`;
            listElement.appendChild(li);
        }
    });
}

document.getElementById('add-btn').addEventListener('click', async () => {
    const file = document.getElementById('file').files[0];
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    if (!file || !subject) return alert("Remplis tout !");

    const btn = document.getElementById('add-btn');
    btn.innerText = "Envoi..."; btn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: 'POST', body: formData });
        const uploadData = await res.json();

        // L'ERREUR ÉTAIT ICI : ON UTILISE SECURE_URL
        await addDoc(collection(db, "epreuves"), {
            matiere: subject,
            classe: className,
            urlPdf: uploadData.secure_url, 
            date: serverTimestamp()
        });

        alert("Succès !");
        location.reload();
    } catch (err) { alert("Erreur d'envoi"); btn.innerText = "Ajouter"; btn.disabled = false; }
});

document.getElementById('search').addEventListener('input', (e) => chargerListe(e.target.value));
chargerListe();
