const { Router } = require('express')
const { clientePorDimensionUnoController, almacenesPorDimensionUnoController, postHabilitacionController, inventarioValoradoController, descripcionArticuloController, fechaVenLoteController, stockDisponibleController, habilitacionDiccionarioController, stockDisponibleIfavetController, facturasClienteLoteItemCodeController,
    detalleVentasController, devolucionCompletaController, detalleParaDevolucionController, pruebaController
 } = require('../controller/inventario.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.get('/cliente-dimension', [validarToken, validarCampos], clientePorDimensionUnoController)
router.post('/almacen-dimension', [validarToken, validarCampos], almacenesPorDimensionUnoController)
router.post('/habilitacion', [validarToken, validarCampos], postHabilitacionController)
router.get('/inventario-valorado', [validarToken, validarCampos], inventarioValoradoController)
router.post('/descripcion-articulo', [validarToken, validarCampos], descripcionArticuloController)
router.get('/fecha-prueba', fechaVenLoteController)
router.post('/habilitacion-diccionario', [validarToken, validarCampos], habilitacionDiccionarioController)
router.get('/stock-disponible', [validarToken, validarCampos], stockDisponibleController)
router.get('/stock-disponible-ifavet', [validarToken, validarCampos], stockDisponibleIfavetController)
router.get('/facturas-cliente-lote-itemcode', [validarToken, validarCampos], facturasClienteLoteItemCodeController)
router.get('/detalle-ventas', [validarToken, validarCampos], detalleVentasController)
router.post('/devolucion-completa', [validarToken, validarCampos], devolucionCompletaController)
router.get('/detalle-dev', [validarToken, validarCampos], detalleParaDevolucionController)
router.get('/prueba', [validarToken, validarCampos], pruebaController)

module.exports = router