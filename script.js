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

// CONFIGURATION CLOUDINARY
const CLOUD_NAME = "dajzki7n0"; 
const UPLOAD_PRESET = "exam-preset";

// 1. FONCTION POUR AFFICHER LA LISTE
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
            li.style.background = "white"; 
            li.style.padding = "15px"; 
            li.style.margin = "10px 0"; 
            li.style.borderRadius = "12px";
            li.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
            
            // On utilise secure_url avec l'option de téléchargement forcé
            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${data.matiere.toUpperCase()}</strong><br>
                        <small style="color: #666;">Classe: ${data.classe}</small>
                    </div>
                    <a href="${data.urlPdf}" download target="_blank" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 8px; font-size: 14px;">
                        📥 Télécharger
                    </a>
                </div>`;
            listElement.appendChild(li);
        }
    });
}

// 2. FONCTION POUR AJOUTER UNE ÉPREUVE
document.getElementById('add-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;

    if (!file || !subject || !className) {
        return alert("Veuillez remplir tous les champs et choisir un fichier.");
    }

    const btn = document.getElementById('add-btn');
    btn.innerText = "Envoi en cours..."; 
    btn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        // Envoi vers Cloudinary
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const uploadData = await res.json();

        if (uploadData.secure_url) {
            // FORCE LE TÉLÉCHARGEMENT : on ajoute 'fl_attachment' dans l'URL
            const downloadUrl = uploadData.secure_url.replace("/upload/", "/upload/fl_attachment/");

            // Enregistrement dans Firebase
            await addDoc(collection(db, "epreuves"), {
                matiere: subject,
                classe: className,
                urlPdf: downloadUrl, 
                date: serverTimestamp()
            });

            alert("Épreuve ajoutée avec succès !");
            location.reload();
        } else {
            throw new Error("Cloudinary");
        }
    } catch (err) {
        console.error(err);
        alert("Erreur lors de l'ajout. Vérifiez votre connexion.");
        btn.innerText = "Ajouter l'épreuve";
        btn.disabled = false;
    }
});

// 3. BARRE DE RECHERCHE
document.getElementById('search').addEventListener('input', (e) => {
    chargerListe(e.target.value);
});

// CHARGEMENT INITIAL
chargerListe();
