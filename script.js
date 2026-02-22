import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// --- CONFIGURATION FIREBASE ---
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

// --- CONFIGURATION CLOUDINARY ---
const CLOUD_NAME = "dajzki7n0"; 
const UPLOAD_PRESET = "exam-preset";

// --- 1. FONCTION POUR AFFICHER ET FILTRER LA LISTE ---
async function chargerListe(recherche = "") {
    const listElement = document.getElementById('list');
    try {
        // Récupère les épreuves triées par date
        const q = query(collection(db, "epreuves"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        listElement.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            const texteAComparer = (data.matiere + " " + data.classe).toLowerCase();
            
            // Filtre pour la recherche
            if (texteAComparer.includes(recherche.toLowerCase())) {
                const li = document.createElement('li');
                li.style.background = "white";
                li.style.padding = "15px";
                li.style.margin = "10px 0";
                li.style.borderRadius = "12px";
                li.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
                
                li.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">📄</span>
                        <div>
                            <strong style="color: #333;">${data.matiere.toUpperCase()}</strong><br>
                            <small style="color: #666;">Classe: ${data.classe} | Année: ${data.annee || 'N/A'}</small>
                        </div>
                    </div>
                    <a href="${data.urlPdf}" target="_blank" style="display: block; text-align: center; margin-top: 10px; background: #007bff; color: white; padding: 10px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        📥 Télécharger le PDF
                    </a>
                `;
                listElement.appendChild(li);
            }
        });
    } catch (e) {
        console.error("Erreur de chargement:", e);
    }
}

// --- 2. GÉRER LA BARRE DE RECHERCHE ---
document.getElementById('search').addEventListener('input', (e) => {
    chargerListe(e.target.value);
});

// --- 3. BOUTON AJOUTER (ENVOI CLOUDINARY + FIREBASE) ---
document.getElementById('add-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('file');
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    const year = document.getElementById('year').value;
    const file = fileInput.files[0];

    if (!file || !subject || !className) {
        return alert("Veuillez remplir les champs et choisir un PDF !");
    }

    const btn = document.getElementById('add-btn');
    btn.innerText = "⏳ Envoi en cours...";
    btn.disabled = true;

    try {
        // A. ENVOI DU FICHIER VERS CLOUDINARY
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Erreur Cloudinary : Vérifiez le mode Unsigned.");
        
        const uploadData = await response.json();

        // B. ENREGISTREMENT DU LIEN SECURE_URL DANS FIREBASE
        await addDoc(collection(db, "epreuves"), {
            matiere: subject,
            classe: className,
            annee: year,
            urlPdf: uploadData.secure_url, // Le lien magique sans erreur 404
            date: serverTimestamp()
        });

        alert("Bravo ! L'épreuve est en ligne.");
        location.reload(); // Rafraîchit pour voir la nouvelle épreuve

    } catch (err) {
        alert("Erreur : " + err.message);
        btn.innerText = "Ajouter";
        btn.disabled = false;
    }
});

// Lancer le chargement au démarrage
chargerListe();
