const { Router } = require('express')
const { postInventoryEntriesController, actualizarAsientoContablePreliminarCCController, getPDFAsientoContableCC, getCuentasCC, getLibroMayor, excelLibroMayor, docFuentes, cargarPlantillaDimensiones } = require('../controller/cc.controller')
const checkToken = require('../../../middleware/authMiddleware')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const router = Router()

router.post('/inventory-entries',[checkToken],postInventoryEntriesController)
router.patch('/preliminar/actualizar-asiento-contable-centro-costo/:id', [validarToken, validarCampos], actualizarAsientoContablePreliminarCCController);

router.post('/pdf/asiento-contable-cc', [validarToken, validarCampos], getPDFAsientoContableCC);
router.get('/cuentas', [validarToken, validarCampos], getCuentasCC);
router.get('/libro-mayor', [validarToken, validarCampos], getLibroMayor);
router.post('/excel/libro-mayor', [validarToken, validarCampos], excelLibroMayor);
router.get('/documentos-fuentes', [validarToken, validarCampos], docFuentes);

router.post('/plantilla-dimensiones', [validarToken, validarCampos], cargarPlantillaDimensiones)

module.exports = router