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
    imprimibleDevolucionController,
    devolucionPorValoradoDifArticulosController,
    imprimibleSalidaController
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

module.exports = router