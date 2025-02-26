const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { dmClientesController, dmClientesPorCardCodeController, dmUpdateClienteController, 
    dmTipoDocumentosController, getListaPreciosOficialesController, setPrecioOficialController, 
    getSucursalesController, getAreasPorSucursalController, getZonasPorAreaController,
    getListaPreciosByIdCadenasController, setPrecioCadenaController, getZonasPorSucursalController,
    actualizarDatosClienteController, descuentoOfertasPorLineaController, getAllLineasController, 
    setDescuentoOfertasPorCantidadController, getArticulosController, findClienteController,
    getDescuentosCantidadController, getIdDescuentosCantidadController, getArticuloByCodeController,
    setDescuentoEspecialController, getAllDescuentosLineaController, deleteDescuentoLineaController,
    setDescuentoEspecialPorArticuloController, obtenerTiposController, obtenerDescuetosEspecialesController, 
    getIdsDescuentoEspecialController, getDescuentosEspecialesByIdController, getVendedoresController,
    getZonasController, getAllTiposController, getZonasTiposPorVendedorController, asignarZonasYTiposAVendedoresController
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
router.get('/get-id-desc', [validarToken, validarCampos], getIdDescuentosCantidadController)
router.post('/get-desc-cant', [validarToken, validarCampos], getDescuentosCantidadController)
router.get('/get-item', [validarToken, validarCampos], getArticuloByCodeController)
router.post('/descuento-especial', [validarToken, validarCampos], setDescuentoEspecialController)
router.get('/get-desc-linea', [validarToken, validarCampos], getAllDescuentosLineaController)
router.post('/delete-desc-linea', [validarToken, validarCampos], deleteDescuentoLineaController)
router.post('/desc-especial-articulo', [validarToken, validarCampos], setDescuentoEspecialPorArticuloController)
router.get('/tipos', [validarToken, validarCampos], obtenerTiposController)
router.get('/descuentos-especiales', [validarToken, validarCampos], obtenerDescuetosEspecialesController)
router.get('/ids-especiales', [validarToken, validarCampos], getIdsDescuentoEspecialController)
router.post('/especiales-by-id', [validarToken, validarCampos], getDescuentosEspecialesByIdController)
router.get('/all-vendedores', [validarToken, validarCampos], getVendedoresController)
router.get('/zonas', [validarToken, validarCampos], getZonasController)
router.get('/all-tipos', [validarToken, validarCampos], getAllTiposController)
router.get('/zonasytipos-vendedor', [validarToken, validarCampos], getZonasTiposPorVendedorController)
router.post('/zonasytipos-vendedor', [validarToken, validarCampos], asignarZonasYTiposAVendedoresController)

module.exports = router