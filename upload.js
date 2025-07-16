const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Crée ce dossier si ce n’est pas déjà fait
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Exemple : 1720231321321.jpg
  }
});

const upload = multer({ storage });

module.exports = upload;
