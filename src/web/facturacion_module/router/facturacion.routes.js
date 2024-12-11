const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { facturacionController, facturacionStatusController } = require('../controller/facturacion.controller')
const router = Router()

router.post('/facturar', [validarToken, validarCampos], facturacionController)
router.get('/facturacion-pedido', [validarToken, validarCampos], facturacionStatusController)


module.exports = router