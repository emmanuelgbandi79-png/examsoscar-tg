import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// --- FONCTION AJOUTER ---
document.getElementById('add-btn').addEventListener('click', async () => {
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    const year = document.getElementById('year').value;

    if (subject && className) {
        try {
            await addDoc(collection(db, "epreuves"), {
                matiere: subject.toLowerCase(), // On stocke en minuscule pour faciliter la recherche
                classe: className.toLowerCase(),
                annee: year,
                date: serverTimestamp()
            });
            alert("Épreuve ajoutée !");
            location.reload();
        } catch (e) { alert("Erreur : " + e.message); }
    } else { alert("Remplissez les champs !"); }
});

// --- FONCTION RECHERCHE ---
document.getElementById('search').addEventListener('input', async (e) => {
    const searchText = e.target.value.toLowerCase();
    const listElement = document.getElementById('list');
    listElement.innerHTML = ""; // On vide la liste actuelle

    const q = query(collection(db, "epreuves"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Si la matière ou la classe contient le texte recherché
        if (data.matiere.includes(searchText) || data.classe.includes(searchText)) {
            const li = document.createElement('li');
            li.textContent = `${data.matiere.toUpperCase()} - ${data.classe.toUpperCase()} (${data.annee})`;
            listElement.appendChild(li);
        }
    });
});
