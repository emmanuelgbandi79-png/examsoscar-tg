const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Dossier pour stocker les PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'files/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static('.'));

// Endpoint pour upload PDF
app.post('/upload', upload.single('pdf'), (req, res) => {
  res.json({ success: true, filename: req.file.originalname });
});

// Endpoint pour lister les PDFs
app.get('/files', (req, res) => {
  fs.readdir('files/', (err, files) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.json(files);
  });
});

// Servir les fichiers PDF
app.use('/files', express.static(path.join(__dirname, 'files')));

app.listen(port, () => console.log(`Server running on port ${port}`));
