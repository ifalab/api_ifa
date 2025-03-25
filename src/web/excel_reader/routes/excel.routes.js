const express = require('express');
const multer = require('multer');
const { processExcel, compareExcel, obtenerCodigos, leerEmpleados, leerInventarioEntrada } = require('../controllers/excel.controller');

const router = express.Router();

// Configurar multer para subir archivos
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.get('/codigos', obtenerCodigos);
router.get('/empleados', leerEmpleados);
router.get('/inventario/entrada', leerInventarioEntrada);
// Ruta para cargar el archivo Excel
router.post('/upload', upload.single('file'), processExcel);
router.post('/merge', upload.fields([{name: 'excel1'}, {name: 'excel2'}]), compareExcel);

module.exports = router;
