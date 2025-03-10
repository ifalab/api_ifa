const { Router } = require('express')
const { clientePorDimensionUnoController, almacenesPorDimensionUnoController, postHabilitacionController, inventarioValoradoController, descripcionArticuloController, fechaVenLoteController, stockDisponibleController, habilitacionDiccionarioController, stockDisponibleIfavetController, facturasClienteLoteItemCodeController,
    detalleVentasController, devolucionCompletaController, pruebaController,
    getAllAlmacenesController,
    devolucionExcepcionalController,
    devolucionNotaDebitoCreditoController,
    searchArticulosController,
    devolucionDebitoCreditoCompletaController,
    devolucionNDCGenesisController,
    facturasClienteLoteItemCodeGenesisController
 } = require('../controller/inventario.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { grabarLog } = require('../../shared/controller/hana.controller');
const checkToken = require('../../../middleware/authMiddleware');
const router = Router()

router.get('/cliente-dimension', [validarToken, validarCampos], clientePorDimensionUnoController)
router.post('/almacen-dimension', [validarToken, validarCampos], almacenesPorDimensionUnoController)
router.post('/habilitacion', [validarToken, validarCampos], postHabilitacionController)
router.get('/inventario-valorado', [validarToken, validarCampos], inventarioValoradoController)
router.post('/descripcion-articulo', [validarToken, validarCampos], descripcionArticuloController)
router.get('/fecha-prueba', fechaVenLoteController)
router.post('/habilitacion-diccionario', [validarToken, validarCampos], habilitacionDiccionarioController)
router.get('/stock-disponible', [validarToken, validarCampos], stockDisponibleController)
router.get('/stock-disponible-ifa', [checkToken, validarCampos], stockDisponibleController)
router.get('/stock-disponible-ifavet', [validarToken, validarCampos], stockDisponibleIfavetController)
router.get('/facturas-cliente-lote-itemcode', [validarToken, validarCampos], facturasClienteLoteItemCodeController)
router.get('/detalle-ventas', [validarToken, validarCampos], detalleVentasController)
router.post('/devolucion-completa', [validarToken, validarCampos], devolucionCompletaController)
router.post('/devolucion-excepcional', [validarToken, validarCampos], devolucionExcepcionalController)
router.post('/devolucion-ndc', [validarToken, validarCampos], devolucionNotaDebitoCreditoController)
router.get('/prueba', [validarToken, validarCampos], pruebaController)
router.get('/all-almacenes', [validarToken, validarCampos],getAllAlmacenesController)
router.post('/search-articulos', [validarToken, validarCampos],searchArticulosController)
router.post('/devolucion-ndc-completa', [validarToken, validarCampos], devolucionDebitoCreditoCompletaController)
router.post('/devolucion-ndc-genesis', [validarToken, validarCampos], devolucionNDCGenesisController)
router.get('/facturas-cliente-lote-itemcode-genesis', [validarToken, validarCampos], facturasClienteLoteItemCodeGenesisController)

module.exports = router