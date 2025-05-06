const { Router } = require('express')
const { postInventoryEntriesController, actualizarAsientoContablePreliminarCCController, getPDFAsientoContableCC } = require('../controller/cc.controller')
const checkToken = require('../../../middleware/authMiddleware')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const router = Router()

router.post('/inventory-entries',[checkToken],postInventoryEntriesController)
router.patch('/preliminar/actualizar-asiento-contable-centro-costo/:id', [validarToken, validarCampos], actualizarAsientoContablePreliminarCCController);

router.post('/pdf/asiento-contable-cc', [validarToken, validarCampos], getPDFAsientoContableCC);

module.exports = router