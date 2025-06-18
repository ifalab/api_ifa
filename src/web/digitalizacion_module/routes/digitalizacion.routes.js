const { Router } = require('express');
const { validarToken } = require('../../../middleware/validar_token.middleware');
const { validarCampos } = require('../../../middleware/validar_campos.middleware');
const { processMultipartSingleFile } = require('../middlewares/process-multipart.middleware');
const {
    searchImagesController,
    getCabeceraImageController,
    getDetalleImageController,
    compressCabeceraController,
    compressDetalleController,
    updateCabeceraImageController,
    updateDetalleImageController,
    deleteCabeceraImageController,
    deleteDetalleImageController,
    getDeliveryDigitalizedController,
    excelEntregasDigitalizadas
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

router.put('/update/cabecera/:id',
    [validarToken, processMultipartSingleFile, validarCampos],
    updateCabeceraImageController
);

router.put('/update/detalle/:id',
    [validarToken, processMultipartSingleFile, validarCampos],
    updateDetalleImageController
);

// Rutas para eliminar imágenes
router.delete('/delete/cabecera/image/:id',
    [validarToken, validarCampos],
    deleteCabeceraImageController
);

router.delete('/delete/detalle/image/:id',
    [validarToken, validarCampos],
    deleteDetalleImageController
);


router.get('/reporte/entregas-realizadas',
    [validarToken, validarCampos],
    getDeliveryDigitalizedController
);

router.post('/reporte/excel-entregas', 
    [validarToken, validarCampos], 
    excelEntregasDigitalizadas
);


module.exports = router;