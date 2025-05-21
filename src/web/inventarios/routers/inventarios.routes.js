const { Router } = require('express')
const { clientePorDimensionUnoController, almacenesPorDimensionUnoController, postHabilitacionController, inventarioValoradoController, descripcionArticuloController, fechaVenLoteController, stockDisponibleController, habilitacionDiccionarioController, stockDisponibleIfavetController, facturasClienteLoteItemCodeController,
    detalleVentasController, devolucionCompletaController, pruebaController,
    getAllAlmacenesController,
    devolucionExcepcionalController,
    devolucionNotaDebitoCreditoController,
    searchArticulosController,
    devolucionDebitoCreditoCompletaController,
    getCreditNoteController,
    devolucionNDCGenesisController,
    facturasClienteLoteItemCodeGenesisController,
    stockDisponiblePorSucursalController,
    getAllCreditNotesController,
    devolucionMalEstadoController,
    clientesDevMalEstado,
    getClienteByCardCodeController,
    devolucionPorValoradoController,
    detalleFacturasController,
    stockDisponibleIfaController,
    imprimibleDevolucionController, imprimibleSalidaController,
    devolucionPorValoradoDifArticulosController,
    findClienteController, findClienteInstitucionesController,
    getAlmacenesSucursalController, getStockdeItemAlmacenController, 
    getStockVariosItemsAlmacenController,
    facturacionCambioValoradoController, entregaCambioValoradoController,
    detalleFacturasGenesisController, getLineaArticuloController,
    relacionArticuloController,
    articuloDiccionarioController,
    articulosController,
    saveArticuloDiccionario,
    solicitudTrasladoController, devoluccionInstitucionesController,
    tipoSolicitudController,
    costoComercialItemcodeController,
    tipoClientesController,
    solicitudesTrasladoController,
    detalleSolicitudTrasladoController,
    reporteDevolucionValoradosController,
    searchClienteController, reporteDevolucionCambiosController, reporteDevolucionRefacturacionController,
    cancelarDevolucionController, cancelarEntregaController, getDevolucionesParaCancelarController, getEntregasParaCancelarController,
    generarTrasladoController,
    actualizarTrasladoController,
    crearTrasladoController,
    detalleTrasladoController,
    selectionBatchPlazoController
 } = require('../controller/inventario.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { grabarLog } = require('../../shared/controller/hana.controller');
const checkToken = require('../../../middleware/authMiddleware');
const checkBearerToken = require('../../../middleware/authMiddleware');
const router = Router()

router.get('/cliente-dimension', [validarToken, validarCampos], clientePorDimensionUnoController)
router.post('/almacen-dimension', [validarToken, validarCampos], almacenesPorDimensionUnoController)
router.post('/habilitacion', [validarToken, validarCampos], postHabilitacionController)
router.get('/inventario-valorado', [validarToken, validarCampos], inventarioValoradoController)
router.post('/descripcion-articulo', [validarToken, validarCampos], descripcionArticuloController)
router.get('/fecha-prueba', fechaVenLoteController)
router.post('/habilitacion-diccionario', [validarToken, validarCampos], habilitacionDiccionarioController)
router.get('/stock-disponible', [validarToken, validarCampos], stockDisponibleController)
router.get('/stock-disponible-ifa', [checkBearerToken, validarCampos], stockDisponibleIfaController)
router.get('/stock-disponible-ifavet', [validarToken, validarCampos], stockDisponibleIfavetController)
router.get('/facturas-cliente-lote-itemcode', [validarToken, validarCampos], facturasClienteLoteItemCodeController)
router.get('/detalle-ventas', [validarToken, validarCampos], detalleVentasController)
router.post('/devolucion-completa', [validarToken, validarCampos], devolucionCompletaController)
router.post('/devolucion-excepcional', [validarToken, validarCampos], devolucionExcepcionalController)
router.post('/devolucion-ndc', [validarToken, validarCampos], devolucionNotaDebitoCreditoController)
router.post('/prueba', [validarToken, validarCampos], pruebaController)
router.get('/all-almacenes', [validarToken, validarCampos],getAllAlmacenesController)
router.post('/search-articulos', [validarToken, validarCampos],searchArticulosController)
router.post('/devolucion-ndc-completa', [validarToken, validarCampos], devolucionDebitoCreditoCompletaController)
router.post('/devolucion-ndc-genesis', [validarToken, validarCampos], devolucionNDCGenesisController)
router.get('/facturas-cliente-lote-itemcode-genesis', [validarToken, validarCampos], facturasClienteLoteItemCodeGenesisController)
router.get('/credit-note', [validarToken, validarCampos], getCreditNoteController)
router.post('/stock-disponible-sucursal', [validarToken, validarCampos], stockDisponiblePorSucursalController)
router.get('/credit-notes', [validarToken, validarCampos], getAllCreditNotesController)
router.post('/dev-mal-estado', [validarToken, validarCampos], devolucionMalEstadoController)
router.post('/clientes-dev-mal-estado', [validarToken, validarCampos], clientesDevMalEstado)
router.get('/get-cliente', [validarToken, validarCampos], getClienteByCardCodeController)
router.post('/dev-valorado', [validarToken, validarCampos], devolucionPorValoradoController)
router.post('/detalle-facturas', [validarToken, validarCampos], detalleFacturasController)
router.post('/imprimible-devolucion', [validarToken, validarCampos], imprimibleDevolucionController)
router.post('/dev-valorado-dif-art', [validarToken, validarCampos], devolucionPorValoradoDifArticulosController)
router.post('/imprimible-salida', [validarToken, validarCampos], imprimibleSalidaController)
router.post('/buscar-cliente', [validarToken, validarCampos], findClienteController)
router.post('/buscar-cliente-institucion', [validarToken, validarCampos], findClienteInstitucionesController)
router.post('/dev-instituciones', [validarToken, validarCampos], devoluccionInstitucionesController)

router.post('/almacenes-sucursal', [validarToken, validarCampos], getAlmacenesSucursalController)
router.post('/get-stock', [validarToken, validarCampos], getStockdeItemAlmacenController)
router.post('/get-stock-varios', [validarToken, validarCampos], getStockVariosItemsAlmacenController)
router.post('/facturacion-cambio', [validarToken, validarCampos], facturacionCambioValoradoController)
router.post('/entrega-cambio-valorado', [validarToken, validarCampos], entregaCambioValoradoController)
router.post('/detalle-fact-genesis', [validarToken, validarCampos], detalleFacturasGenesisController)
router.get('/linea-articulo', [validarToken, validarCampos], getLineaArticuloController)
router.get('/articulos-diccionario', [validarToken, validarCampos], articuloDiccionarioController)
router.get('/relacion-articulos-diccionario', [validarToken, validarCampos], relacionArticuloController)
router.get('/articulos', [validarToken, validarCampos], articulosController)

router.post('/articulos-diccionario', [validarToken, validarCampos], saveArticuloDiccionario)
router.post('/solicitud-traslado', [validarToken, validarCampos], solicitudTrasladoController)
router.get('/tipo-solicitud', [validarToken, validarCampos], tipoSolicitudController)
router.get('/tipo-clientes', [validarToken, validarCampos], tipoClientesController)
router.get('/costo-comercial-itemcode', [validarToken, validarCampos], costoComercialItemcodeController)
router.post('/solicitudes-traslado', [validarToken, validarCampos], solicitudesTrasladoController)
router.get('/detalle-solicitud-traslado', [validarToken, validarCampos], detalleSolicitudTrasladoController)
router.patch('/actualizar-traslado', [validarToken, validarCampos], actualizarTrasladoController)
//!------------------------ reporte devoluciones
router.get('/reporte-devolucion-valorados', [validarToken, validarCampos], reporteDevolucionValoradosController)
router.get('/reporte-devolucion-cambios', [validarToken, validarCampos], reporteDevolucionCambiosController)
router.get('/reporte-devolucion-refacturacion', [validarToken, validarCampos], reporteDevolucionRefacturacionController)
router.post('/search-clientes', [validarToken, validarCampos],searchClienteController)

router.get('/cancelar-devolucion', [validarToken, validarCampos], cancelarDevolucionController)
router.get('/get-devoluciones', [validarToken, validarCampos], getDevolucionesParaCancelarController)
router.get('/get-entregas', [validarToken, validarCampos], getEntregasParaCancelarController)
router.get('/cancelar-entrega', [validarToken, validarCampos], cancelarEntregaController)
router.post('/crear-traslado', [validarToken, validarCampos], crearTrasladoController)
router.get('/detalle-traslado', [validarToken, validarCampos], detalleTrasladoController)
router.get('/selection-batch-plazo', [validarToken, validarCampos], selectionBatchPlazoController)
module.exports = router