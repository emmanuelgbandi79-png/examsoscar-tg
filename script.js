import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Afficher la liste avec liens de téléchargement
async function chargerEpreuves() {
    const listElement = document.getElementById('list');
    listElement.innerHTML = "Chargement...";
    const querySnapshot = await getDocs(collection(db, "epreuves"));
    listElement.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const li = document.createElement('li');
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #ccc";
        li.innerHTML = `
            <strong>${data.matiere}</strong> - ${data.classe} (${data.annee})<br>
            <a href="${data.lienPdf}" target="_blank" style="color: blue; font-weight: bold; text-decoration: underline;">
                📥 Télécharger l'épreuve
            </a>
        `;
        listElement.appendChild(li);
    });
}

// Bouton Ajouter
document.getElementById('add-btn').addEventListener('click', async () => {
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    // Note : Pour l'instant on met un lien de test car ton Storage est bloqué
    const testLink = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

    try {
        await addDoc(collection(db, "epreuves"), {
            matiere: subject,
            classe: className,
            annee: document.getElementById('year').value,
            lienPdf: testLink, 
            date: serverTimestamp()
        });
        alert("Ajouté avec succès !");
        chargerEpreuves();
    } catch (e) {
        alert("Erreur de permissions ! Vérifie tes Règles Firebase.");
    }
});

chargerEpreuves();
