import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

document.getElementById('add-btn').addEventListener('click', async (e) => {
    e.preventDefault(); // Empêche la page de se recharger par erreur
    
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    const year = document.getElementById('year').value;

    if (!subject || !className) {
        alert("Merci de remplir Matière et Classe !");
        return;
    }

    try {
        await addDoc(collection(db, "epreuves"), {
            matiere: subject,
            classe: className,
            annee: year,
            date: serverTimestamp()
        });
        alert("Succès ! L'épreuve est dans la base de données.");
        // Vide les cases
        document.getElementById('subject').value = "";
        document.getElementById('class').value = "";
        document.getElementById('year').value = "";
    } catch (error) {
        alert("Erreur de connexion : " + error.message);
    }
});
