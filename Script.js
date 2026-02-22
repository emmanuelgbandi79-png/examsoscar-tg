let exams = JSON.parse(localStorage.getItem('exams')) || [];

function addExam() {
    const subject = document.getElementById('subject').value;
    const className = document.getElementById('class').value;
    const year = document.getElementById('year').value;
    const fileInput = document.getElementById('file');

    if (!subject || !className || !year || !fileInput.files[0]) {
        alert('Veuillez remplir tous les champs et choisir un fichier.');
        return;
    }

    const file = fileInput.files[0];
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
            <strong>${exam.subject}</strong> - ${exam.className} - ${exam.year} 
            <button onclick="downloadExam(${index})">Télécharger</button>
        `;
        ul.appendChild(li);
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
    const term = document.getElementById('search').value.toLowerCase();
    const filtered = exams.filter(exam => 
        exam.subject.toLowerCase().includes(term) ||
        exam.className.toLowerCase().includes(term)
    );
    displayExams(filtered);
}

// Afficher les examens au chargement
displayExams();
