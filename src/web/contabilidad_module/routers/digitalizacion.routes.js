const { Router } = require('express');
const { validarToken } = require('../../../middleware/validar_token.middleware');
const { validarCampos } = require('../../../middleware/validar_campos.middleware');
const { processMultipartSingleFile } = require('../middlewares/process-multipart.middleware');
const {
    searchImagesController,
    getCabeceraImageController,
    getDetalleImageController,
    compressCabeceraController,
    compressDetalleController
} = require('../controllers/digitalizacion.controller');

const router = Router();

// Rutas para búsqueda y visualización de imágenes
router.get('/search/images', [validarToken, validarCampos], searchImagesController);
router.get('/preview/cabecera/:id', [validarToken], getCabeceraImageController);
router.get('/preview/detalle/:id', [validarToken], getDetalleImageController);

// Rutas para cargar y comprimir imágenes
// Primero procesamos el multipart/form-data con multer y luego llamamos al controlador
router.post('/compress-cabecera-transaccion',
    [validarToken, processMultipartSingleFile, validarCampos],
    compressCabeceraController
);

router.post('/compress-detalle-transaccion',
    [validarToken, processMultipartSingleFile, validarCampos],
    compressDetalleController
);

module.exports = router;