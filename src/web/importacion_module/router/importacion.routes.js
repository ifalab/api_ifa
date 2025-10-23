const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const {
     importacionStatusController,
     createReserveInvoiceController,
     createPedidoController,
     patchLiberarInvoiceController
} = require('../controller/importacion.controller')
const router = Router()

router.get('/importacion-status', [validarToken, validarCampos], importacionStatusController)
router.post('/create-reserve-invoice', [validarToken, validarCampos], createReserveInvoiceController)
router.post('/crear-pedido', [validarToken, validarCampos], createPedidoController)
router.post('/invoice-reserve-liberar', [validarToken, validarCampos], patchLiberarInvoiceController)



module.exports = router