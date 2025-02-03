const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { dmClientesController, dmClientesPorCardCodeController, dmUpdateClienteController, 
    dmTipoDocumentosController, getListaPreciosOficialesController, setPrecioOficialController, 
    getSucursalesController, getAreasPorSucursalController, getZonasPorAreaController,
    getListaPreciosByIdCadenasController, setPrecioCadenaController, getZonasPorSucursalController,
    actualizarDatosClienteController, descuentoOfertasPorLineaController, getAllLineasController, 
    setDescuentoOfertasPorCantidadController, getArticulosController, findClienteController
 } = require('../controller/datos_maestros.controller')
const { getSucursales } = require('../controller/hana.controller')
const router = Router()

router.get('/clientes', [validarToken, validarCampos], dmClientesController)
router.get('/clientes-cardcode', [validarToken, validarCampos], dmClientesPorCardCodeController)
router.patch('/update-cliente', [validarToken, validarCampos], dmUpdateClienteController)
router.get('/tipo-documentos', [validarToken, validarCampos], dmTipoDocumentosController)
router.get('/precios-oficiales', [validarToken, validarCampos], getListaPreciosOficialesController)
router.post('/set-precio-item', [validarToken, validarCampos], setPrecioOficialController)
router.get('/sucursales', [validarToken, validarCampos], getSucursalesController)
router.get('/areas-por-sucursal', [validarToken, validarCampos], getAreasPorSucursalController)
router.get('/zonas-por-area', [validarToken, validarCampos], getZonasPorAreaController)
router.get('/precios-cadena-id', [validarToken, validarCampos], getListaPreciosByIdCadenasController)
router.post('/set-precio-cadena', [validarToken, validarCampos], setPrecioCadenaController)
router.get('/zonas-por-sucursal', [validarToken, validarCampos], getZonasPorSucursalController)
router.patch('/actualizar-cliente', [validarToken, validarCampos], actualizarDatosClienteController)
router.post('/descuento-linea', [validarToken, validarCampos], descuentoOfertasPorLineaController)
router.get('/lineas', [validarToken, validarCampos], getAllLineasController)
router.post('/descuento-cantidad', [validarToken, validarCampos], setDescuentoOfertasPorCantidadController)
router.get('/articulos', [validarToken, validarCampos], getArticulosController)
router.post('/find-cliente', [validarToken, validarCampos], findClienteController)

module.exports = router