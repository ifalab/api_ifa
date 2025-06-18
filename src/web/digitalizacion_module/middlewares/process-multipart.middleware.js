const multer = require('multer');

// Configurar multer para almacenar en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
    },
    fileFilter: (req, file, cb) => {
        // Aceptar solo imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen.'));
        }
    }
});

// Middleware que procesa un solo archivo nombrado 'file'
const processMultipartSingleFile = upload.single('file');

module.exports = {
    processMultipartSingleFile
};