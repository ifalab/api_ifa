const multer = require('multer');

// Configuración de almacenamiento (opcional)
const storage = multer.memoryStorage(); // Guarda en memoria, o puedes usar diskStorage

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan archivos Excel (.xlsx)'));
    }
  }
});

module.exports = upload;
