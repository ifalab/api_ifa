const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { facturacionController, facturacionStatusController, noteEntregaController, obtenerCuf, listaFacturasAnular } = require('../controller/facturacion.controller')
const router = Router()

router.post('/facturar', [validarToken, validarCampos], facturacionController)
router.get('/facturacion-pedido', [validarToken, validarCampos], facturacionStatusController)
router.get('/nota-entrega', [validarToken, validarCampos],noteEntregaController)
router.get('/obtener-cuf', [validarToken, validarCampos],obtenerCuf)
router.get('/facturas-anular', [validarToken, validarCampos],listaFacturasAnular)

module.exports = router