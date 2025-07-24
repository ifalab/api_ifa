const { Router } = require('express');
const { validarToken } = require('../../../middleware/validar_token.middleware');
const { validarCampos } = require('../../../middleware/validar_campos.middleware');
const { processMultipartSingleFile, processMultipartMultipleFiles } = require('../middlewares/process-multipart.middleware');
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
    excelEntregasDigitalizadasController,
    compressMultipleImagesController,
    createUserVisitaController,
    previewCabeceraDataController,
    getCabeceraYAnexosPreviewController,
    getAnexoCabeceraImageController,
    updateAnexosImagesController,
    eliminarCabeceraYAnexosController,
    compressMultipleAnexosController
} = require('../controllers/digitalizacion.controller');

const router = Router();

// Rutas para búsqueda y visualización de imágenes
router.get('/search/images', [validarToken, validarCampos], searchImagesController);
router.get('/preview/cabecera/:id', [validarToken], getCabeceraImageController);
router.get('/preview/anexo/:id', [validarToken], getAnexoCabeceraImageController);
router.get('/preview/detalle/:id', [validarToken], getDetalleImageController);

// Rutas para cargar y comprimir imágenes
// Primero procesamos el multipart/form-data con multer y luego llamamos al controlador
router.post('/compress-cabecera-transaccion',
    [validarToken, processMultipartSingleFile, validarCampos],
    compressCabeceraController
);

router.post('/compress-multiple-images',
    [validarToken, processMultipartMultipleFiles, validarCampos],
    compressMultipleImagesController
);

router.post('/compress-multiple-anexos',
    [validarToken, processMultipartMultipleFiles, validarCampos],
    compressMultipleAnexosController
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
    excelEntregasDigitalizadasController
);

// router.post('/create-user-visita',
//     createUserVisitaController
// );

router.get(
    '/cabecera/by-nro-prefijo/:nroAsiento/:prefijo',
    [validarToken, validarCampos],
    previewCabeceraDataController
);

router.get(
    '/cabecera-anexos/:idCabecera',
    [validarToken, validarCampos],
    getCabeceraYAnexosPreviewController
);

router.put('/update/anexos',
    [validarToken, processMultipartMultipleFiles, validarCampos],
    updateAnexosImagesController
);

router.delete('/cabecera-anexos/eliminar-todo/:idCabecera',
    [validarToken, validarCampos],
    eliminarCabeceraYAnexosController
);


module.exports = router;