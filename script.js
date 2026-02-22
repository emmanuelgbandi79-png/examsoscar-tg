let exams = JSON.parse(localStorage.getItem('exams')) || [];

const addBtn = document.getElementById('add-btn');
const searchInput = document.getElementById('search');

addBtn.addEventListener('click', addExam);
searchInput.addEventListener('input', searchExam);

function updateOscarCount() {
    const countElem = document.getElementById('oscar-count');
    countElem.textContent = `🎖️ Oscar : ${exams.length}`;
}

function addExam() {
    const subject = document.getElementById('subject').value.trim();
    const className = document.getElementById('class').value.trim();
    const year = document.getElementById('year').value.trim();
    const fileInput = document.getElementById('file');

    if (!subject || !className || !year || !fileInput.files[0]) {
        alert("Remplis tous les champs et choisis un fichier PDF !");
        return;
    }

    const file = fileInput.files[0];
    if(file.type !== "application/pdf") {
        alert("Seuls les fichiers PDF sont autorisés !");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        exams.push({
            subject,
            className,
            year,
            fileName: file.name,
            fileData: e.target.result
        });
        localStorage.setItem('exams', JSON.stringify(exams));
        displayExams();
        updateOscarCount(); // Mise à jour du compteur
        document.getElementById('subject').value = '';
        document.getElementById('class').value = '';
        document.getElementById('year').value = '';
        fileInput.value = '';
    }

    reader.readAsDataURL(file);
}

function displayExams(list = exams) {
    const ul = document.getElementById('list');
    ul.innerHTML = '';
    list.forEach((exam, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${exam.subject}</strong> - ${exam.className} - ${exam.year} <br>
                ${exam.fileName}
            </div>
            <button data-index="${index}" class="download-btn">Télécharger</button>
        `;
        ul.appendChild(li);
    });

    // Ajouter événements téléchargement
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = this.getAttribute('data-index');
            downloadExam(idx);
        });
    });
}

function downloadExam(index) {
    const exam = exams[index];
    const a = document.createElement('a');
    a.href = exam.fileData;
    a.download = exam.fileName;
    a.click();
}

function searchExam() {
    const term = searchInput.value.toLowerCase();
    const filtered = exams.filter(exam => 
        exam.subject.toLowerCase().includes(term) ||
        exam.className.toLowerCase().includes(term)
    );
    displayExams(filtered);
}

// Afficher les examens et compteur au chargement
displayExams();
updateOscarCount();
