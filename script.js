import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// --- CONFIGURATION ---
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

const SUPABASE_URL = "https://nkxabvsjswaadfcnggsb.supabase.co";
const SUPABASE_KEY = "sb_publishable_PFFj1CPjtHBQTgQ9f2fdkg_18kYP4WG";

// --- CHARGER LA LISTE ---
async function chargerListe() {
    const listElement = document.getElementById('list');
    try {
        const q = query(collection(db, "epreuves"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        listElement.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = "epreuve-card";
            item.innerHTML = `
                <strong>${data.matiere}</strong> (${data.classe})<br>
                <a href="${data.urlPdf}" target="_blank">📥 Télécharger</a>
            `;
            listElement.appendChild(item);
        });
    } catch (e) {
        listElement.innerHTML = "Erreur de chargement.";
    }
}

// --- AJOUTER UNE ÉPREUVE ---
document.getElementById('add-btn').onclick = async function() {
    const file = document.getElementById('file').files[0];
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;

    if (!file || !subject) return alert("Veuillez remplir les champs.");

    const btn = document.getElementById('add-btn');
    btn.innerText = "⏳ Envoi...";
    btn.disabled = true;

    try {
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        // On vise le bucket 'epreuves' en minuscules
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/public/epreuves/${fileName}`;

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
            await addDoc(collection(db, "epreuves"), {
                matiere: subject,
                classe: className,
                urlPdf: uploadUrl,
                date: serverTimestamp()
            });
            alert("✅ Réussi !");
            location.reload();
        } else {
            const err = await res.json();
            alert("Erreur Supabase: " + err.message);
        }
    } catch (e) {
        alert("Erreur de connexion.");
    } finally {
        btn.innerText = "Ajouter l'épreuve";
        btn.disabled = false;
    }
};

chargerListe();
