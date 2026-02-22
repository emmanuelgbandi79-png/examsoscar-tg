import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// CONFIGURATION FIREBASE
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

// CONFIGURATION SUPABASE
const SUPABASE_URL = "https://nkxabvsjswaadfcnggsb.supabase.co";
const SUPABASE_KEY = "sb_publishable_PFFj1CPjtHBQTgQ9f2fdkg_18kYP4WG";

// 1. CHARGER LA LISTE
async function chargerListe(recherche = "") {
    const listElement = document.getElementById('list');
    const q = query(collection(db, "epreuves"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    listElement.innerHTML = "";
    snapshot.forEach(doc => {
        const data = doc.data();
        if ((data.matiere + data.classe).toLowerCase().includes(recherche.toLowerCase())) {
            const li = document.createElement('li');
            li.style.cssText = "background:white; padding:15px; margin:10px 0; border-radius:12px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.1);";
            li.innerHTML = `<div><strong>${data.matiere.toUpperCase()}</strong><br><small>${data.classe}</small></div>
                            <a href="${data.urlPdf}" target="_blank" style="background:#28a745; color:white; padding:10px; text-decoration:none; border-radius:8px;">📥 Télécharger</a>`;
            listElement.appendChild(li);
        }
    });
}

// 2. AJOUTER UNE ÉPREUVE
document.getElementById('add-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;

    if (!file || !subject) return alert("Veuillez remplir les champs.");

    const btn = document.getElementById('add-btn');
    btn.innerText = "Envoi..."; btn.disabled = true;

    try {
        const fileName = `${Date.now()}_${file.name}`;
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/public/epreuves/${fileName}`;

        // Envoi à Supabase
        const res = await fetch(uploadUrl, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${SUPABASE_KEY}`, 
                'apikey': SUPABASE_KEY,
                'Content-Type': file.type
            },
            body: file
        });

        if (res.ok) {
            // Sauvegarde dans Firebase
            await addDoc(collection(db, "epreuves"), {
                matiere: subject,
                classe: className,
                urlPdf: uploadUrl,
                date: serverTimestamp()
            });
            alert("Épreuve ajoutée !");
            location.reload();
        } else {
            alert("Erreur lors de l'envoi au stockage.");
        }
    } catch (e) {
        alert("Une erreur est survenue.");
    }
    btn.disabled = false; btn.innerText = "Ajouter";
});

chargerListe();
