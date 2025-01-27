const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { facturacionController, facturacionStatusController, noteEntregaController, obtenerCuf, 
    obtenerEntregasPorFacturaController, obtenerInvoicesCancel, listaFacturasAnular, infoFacturaController, 
    cancelToProsinController, pedidosFacturadosController, obtenerEntregasController, obtenerEntregaDetalleController, 
    facturacionEntregaController, facturacionStatusListController, facturasPedidoCadenasController,
    facturasAnuladasController,
    entregasSinFacturasController
 } = require('../controller/facturacion.controller')
const router = Router()

router.post('/facturar', [validarToken, validarCampos], facturacionController)
router.get('/facturacion-pedido', [validarToken, validarCampos], facturacionStatusController)
router.post('/facturacion-pedido-list', [validarToken, validarCampos], facturacionStatusListController)
router.get('/nota-entrega', [validarToken, validarCampos], noteEntregaController)
router.get('/obtener-cuf', [validarToken, validarCampos], obtenerCuf)
router.post('/obtener-entregas-factura', [validarToken, validarCampos], obtenerEntregasPorFacturaController)
router.post('/obtener-invoices-cancel', [validarToken, validarCampos], obtenerInvoicesCancel)
router.post('/facturas-anular', [validarToken, validarCampos], listaFacturasAnular)
router.get('/info-factura', [validarToken, validarCampos], infoFacturaController)
router.post('/cancel-to-prosin', [validarToken, validarCampos], cancelToProsinController)
router.post('/pedidos-facturados', [validarToken, validarCampos], pedidosFacturadosController)
router.get('/obtener-entregas', [validarToken, validarCampos], obtenerEntregasController)
router.get('/obtener-entrega-detalle', [validarToken, validarCampos], obtenerEntregaDetalleController)
router.post('/facturar-entrega', [validarToken, validarCampos], facturacionEntregaController)
router.post('/facturas-pedido-cadena',[validarToken,validarCampos],facturasPedidoCadenasController)

router.post('/facturar-oferta-venta',[validarToken,validarCampos])
router.post('/facturas-anuladas', [validarToken, validarCampos], facturasAnuladasController)
router.post('/entregas-sin-facturas', [validarToken, validarCampos], entregasSinFacturasController)

module.exports = router