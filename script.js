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

// --- FONCTION POUR CHARGER ET RECHERCHER ---
async function chargerEpreuves(filtre = "") {
    const listElement = document.getElementById('list');
    listElement.innerHTML = "<li>Chargement...</li>";
    
    try {
        const q = query(collection(db, "epreuves"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        listElement.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const texte = (data.matiere + " " + data.classe).toLowerCase();
            
            if (texte.includes(filtre.toLowerCase())) {
                const li = document.createElement('li');
                li.style.background = "white";
                li.style.margin = "10px 0";
                li.style.padding = "15px";
                li.style.borderRadius = "8px";
                li.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                
                li.innerHTML = `
                    <strong>${data.matiere.toUpperCase()}</strong> - ${data.classe}<br>
                    <small>Année: ${data.annee || 'N/A'}</small><br>
                    <a href="${data.lienPdf}" target="_blank" style="display:inline-block; margin-top:10px; color:white; background:#0056b3; padding:5px 10px; text-decoration:none; border-radius:4px;">
                        📥 Télécharger le PDF
                    </a>
                `;
                listElement.appendChild(li);
            }
        });
    } catch (e) {
        listElement.innerHTML = "<li>Erreur de chargement.</li>";
    }
}

// --- BARRE DE RECHERCHE ---
document.getElementById('search').addEventListener('input', (e) => {
    chargerEpreuves(e.target.value);
});

// --- BOUTON AJOUTER ---
document.getElementById('add-btn').addEventListener('click', async () => {
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    const year = document.getElementById('year').value;
    
    // Pour l'instant on demande un lien direct (Google Drive ou autre) car Storage est bloqué
    const lienDoc = prompt("Collez ici le lien de téléchargement (Google Drive, Dropbox, etc.) :");

    if (subject && className && lienDoc) {
        try {
            await addDoc(collection(db, "epreuves"), {
                matiere: subject,
                classe: className,
                annee: year,
                lienPdf: lienDoc,
                date: serverTimestamp()
            });
            alert("Épreuve ajoutée avec succès !");
            location.reload();
        } catch (e) {
            alert("Erreur permission : " + e.message);
        }
    } else {
        alert("Remplissez tout (Matière, Classe et le lien du fichier) !");
    }
});

// Lancer au démarrage
chargerEpreuves();
