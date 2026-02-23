import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 1. CONFIGURATION FIREBASE (Inchangée)
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

// 2. CONFIGURATION SUPABASE (Tes clés vérifiées)
const SUPABASE_URL = "https://nkxabvsjswaadfcnggsb.supabase.co";
const SUPABASE_KEY = "sb_publishable_PFFj1CPjtHBQTgQ9f2fdkg_18kYP4WG";

// 3. FONCTION POUR CHARGER LA LISTE
async function chargerListe() {
    try {
        const listElement = document.getElementById('list');
        const q = query(collection(db, "epreuves"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        listElement.innerHTML = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.style.cssText = "background:white; padding:15px; margin:10px 0; border-radius:12px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.1);";
            li.innerHTML = `<div><strong>${data.matiere.toUpperCase()}</strong><br>${data.classe}</div>
                            <a href="${data.urlPdf}" target="_blank" style="background:#28a745; color:white; padding:10px; text-decoration:none; border-radius:8px;">📥 Télécharger</a>`;
            listElement.appendChild(li);
        });
    } catch (e) { console.error("Erreur liste:", e); }
}

// 4. FONCTION POUR AJOUTER UNE ÉPREUVE
document.getElementById('add-btn').onclick = async function() {
    const file = document.getElementById('file').files[0];
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;

    if (!file || !subject) {
        alert("Veuillez choisir un fichier et une matière !");
        return;
    }

    const btn = document.getElementById('add-btn');
    btn.innerText = "⏳ Envoi...";
    btn.disabled = true;

    try {
        // Nettoyage du nom de fichier (pas d'espaces ni d'accents)
        const fileName = Date.now() + "_" + file.name.replace(/[^a-z0-9.]/gi, '_');
        
        // --- NOTE IMPORTANTE : Utilisation de "EPREUVES" en MAJUSCULES ---
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/public/EPREUVES/${fileName}`;

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
            // Sauvegarde du lien dans Firebase
            await addDoc(collection(db, "epreuves"), {
                matiere: subject,
                classe: className,
                urlPdf: uploadUrl,
                date: serverTimestamp()
            });
            alert("✅ Succès ! L'épreuve a été ajoutée.");
            location.reload();
        } else {
            const errorData = await res.json();
            alert("❌ Erreur de stockage : " + errorData.message);
        }
    } catch (e) {
        alert("❌ Erreur de connexion au serveur.");
        console.error(e);
    } finally {
        btn.innerText = "Ajouter l'épreuve";
        btn.disabled = false;
    }
};

chargerListe();
