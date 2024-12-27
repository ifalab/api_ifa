const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { facturacionController, facturacionStatusController, noteEntregaController, obtenerCuf, obtenerEntregasPorFacturaController, obtenerInvoicesCancel, listaFacturasAnular, infoFacturaController, cancelToProsinController } = require('../controller/facturacion.controller')
const router = Router()

router.post('/facturar', [validarToken, validarCampos], facturacionController)
router.get('/facturacion-pedido', [validarToken, validarCampos], facturacionStatusController)
router.get('/nota-entrega', [validarToken, validarCampos], noteEntregaController)
router.get('/obtener-cuf', [validarToken, validarCampos], obtenerCuf)
router.post('/obtener-entregas-factura', [validarToken, validarCampos], obtenerEntregasPorFacturaController)
router.post('/obtener-invoices-cancel', [validarToken, validarCampos], obtenerInvoicesCancel)
router.get('/facturas-anular', [validarToken, validarCampos], listaFacturasAnular)
router.get('/info-factura', [validarToken, validarCampos], infoFacturaController)
router.post('/cancel-to-prosin', [validarToken, validarCampos], cancelToProsinController)

module.exports = router