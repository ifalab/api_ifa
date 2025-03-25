const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { facturacionController, facturacionStatusController, noteEntregaController, obtenerCuf,
    obtenerEntregasPorFacturaController, obtenerInvoicesCancel, listaFacturasAnular, infoFacturaController,
    cancelToProsinController, pedidosFacturadosController, obtenerEntregasController, obtenerEntregaDetalleController,
    facturacionEntregaController, facturacionStatusListController, facturasPedidoCadenasController,
    facturasAnuladasController,
    entregasSinFacturasController,
    cancelarOrdenController,
    pedidosInstitucionesController,
    facturacionInstitucionesController,
    facturacionVehiculo,
    cancelarParaRefacturarController,
    obtenerDevolucionesController,
    obtenerDevolucionDetallerController,
    clientesByCardNameController,
    ofertaDelPedidoController,
    reporteFacturasSiatController,
    clientesExportacionController,
    almacenesController,
    articulosExportacionController
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
router.post('/facturas-pedido-cadena', [validarToken, validarCampos], facturasPedidoCadenasController)

router.post('/facturar-oferta-venta', [validarToken, validarCampos])
router.post('/facturas-anuladas', [validarToken, validarCampos], facturasAnuladasController)
router.post('/entregas-sin-facturas', [validarToken, validarCampos], entregasSinFacturasController)

router.get('/cancelar-orden', [validarToken, validarCampos], cancelarOrdenController)
router.post('/pedidos-instituciones', [validarToken, validarCampos], pedidosInstitucionesController)
router.post('/facturar', [validarToken, validarCampos], facturacionController)
router.post('/facturar/vehiculo', [validarToken, validarCampos], facturacionVehiculo)
router.post('/cancel-refacturar', [validarToken, validarCampos], cancelarParaRefacturarController)
router.get('/devoluciones', [validarToken, validarCampos], obtenerDevolucionesController)
router.get('/devolucion-detalle', [validarToken, validarCampos], obtenerDevolucionDetallerController)
router.get('/cliente-by-cardname', [validarToken, validarCampos], clientesByCardNameController)
router.get('/prueba', [validarToken, validarCampos], ofertaDelPedidoController)

router.get('/reporte-factura-siat', [validarToken, validarCampos], reporteFacturasSiatController)
router.get('/clientes-exportacion', [validarToken, validarCampos], clientesExportacionController)
router.get('/almacenes', [validarToken, validarCampos], almacenesController)
router.get('/articulos-exportacion', [validarToken, validarCampos], articulosExportacionController)

module.exports = router