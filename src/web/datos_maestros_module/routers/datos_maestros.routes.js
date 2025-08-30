const { Router } = require('express')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
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
    getZonasController, getAllTiposController, getZonasTiposPorVendedorController, asignarZonasYTiposAVendedoresController,
    deleteZonasYTiposAVendedoresController, getDescuentosEspecialesLineaController, deleteDescuentosEspecialesLineaController,
    cargarPreciosExcelController,
    setDescuentoOfertasPorCortoVencimientoController,
    getIdDescuentosCantidadCortoController,
    getDescuentosCantidadCortoController,
    lineasByLineCodeController,
    sucursalBySucCodeController,
    tipoByGroupCodeController,
    dmTodosClientesController,
    dmSearchClientesController,
    findAllArticulosController,
    searchArticulosController,
    getItemsByLineController,
    getAllSublineasController,
    patchItemsController,
    getDiscountController,
    getListaPreciosCostoComercialCadenasController,
    setPrecioCostoComercialController,
    cargarPreciosCostoComercialExcelController,
    almacenesBySucCodeController,
    getCurrentRate,
    getWarehouseBySuc
} = require('../controller/datos_maestros.controller')
const { getSucursales } = require('../controller/hana.controller');
const { validarArchivoExcel } = require('../../../middleware/validarExcel.middleware');
const router = Router()

router.get('/clientes', [validarToken, validarCampos], dmClientesController)
router.get('/search-cliente', [validarToken, validarCampos], dmSearchClientesController)

router.get('/clientes-cardcode', [validarToken, validarCampos], dmClientesPorCardCodeController)
router.patch('/update-cliente', [validarToken, validarCampos], dmUpdateClienteController)
router.get('/tipo-documentos', [validarToken, validarCampos], dmTipoDocumentosController)
router.get('/precios-oficiales', [validarToken, validarCampos], getListaPreciosOficialesController)
router.post('/set-precio-item', [validarToken, validarCampos], setPrecioOficialController)

router.get('/sucursales', [validarToken, validarCampos], getSucursalesController)
router.get('/sucursales-by-succode', [validarToken, validarCampos], sucursalBySucCodeController)

router.get('/areas-por-sucursal', [validarToken, validarCampos], getAreasPorSucursalController)
router.get('/zonas-por-area', [validarToken, validarCampos], getZonasPorAreaController)
router.get('/precios-cadena-id', [validarToken, validarCampos], getListaPreciosByIdCadenasController)
router.post('/set-precio-cadena', [validarToken, validarCampos], setPrecioCadenaController)
router.get('/zonas-por-sucursal', [validarToken, validarCampos], getZonasPorSucursalController)
router.patch('/actualizar-cliente', [validarToken, validarCampos], actualizarDatosClienteController)
router.post('/descuento-linea', [validarToken, validarCampos], descuentoOfertasPorLineaController)

router.get('/lineas', [validarToken, validarCampos], getAllLineasController)
router.get('/lineas-by-linecode', [validarToken, validarCampos], lineasByLineCodeController)

router.post('/descuento-cantidad', [validarToken, validarCampos], setDescuentoOfertasPorCantidadController)
router.post('/descuento-corto-vencimiento', [validarToken, validarCampos], setDescuentoOfertasPorCortoVencimientoController)

router.get('/articulos', [validarToken, validarCampos], getArticulosController)
router.get('/search-articulos', [validarToken, validarCampos], searchArticulosController)

router.get('/find-all-articulos', [validarToken, validarCampos], findAllArticulosController)
router.post('/find-cliente', [validarToken, validarCampos], findClienteController)
router.get('/get-id-desc', [validarToken, validarCampos], getIdDescuentosCantidadController)
router.get('/get-id-desc-corto', [validarToken, validarCampos], getIdDescuentosCantidadCortoController)
router.post('/get-desc-cant', [validarToken, validarCampos], getDescuentosCantidadController)
router.post('/get-desc-cant-corto', [validarToken, validarCampos], getDescuentosCantidadCortoController)

router.get('/get-item', [validarToken, validarCampos], getArticuloByCodeController)
router.post('/descuento-especial', [validarToken, validarCampos], setDescuentoEspecialController)
router.get('/get-desc-linea', [validarToken, validarCampos], getAllDescuentosLineaController)
router.post('/delete-desc-linea', [validarToken, validarCampos], deleteDescuentoLineaController)
router.post('/desc-especial-articulo', [validarToken, validarCampos], setDescuentoEspecialPorArticuloController)
router.get('/tipos', [validarToken, validarCampos], obtenerTiposController)
router.get('/tipos-by-groupcode', [validarToken, validarCampos], tipoByGroupCodeController)

router.get('/descuentos-especiales', [validarToken, validarCampos], obtenerDescuetosEspecialesController)
router.get('/ids-especiales', [validarToken, validarCampos], getIdsDescuentoEspecialController)
router.post('/especiales-by-id', [validarToken, validarCampos], getDescuentosEspecialesByIdController)
router.get('/all-vendedores', [validarToken, validarCampos], getVendedoresController)
router.get('/zonas', [validarToken, validarCampos], getZonasController)
router.get('/all-tipos', [validarToken, validarCampos], getAllTiposController)
router.get('/zonasytipos-vendedor', [validarToken, validarCampos], getZonasTiposPorVendedorController)
router.post('/zonasytipos-vendedor', [validarToken, validarCampos], asignarZonasYTiposAVendedoresController)
router.post('/delete-zonaytipo', [validarToken, validarCampos], deleteZonasYTiposAVendedoresController)
router.get('/get-espc-linea', [validarToken, validarCampos], getDescuentosEspecialesLineaController)
router.get('/delete-espc-linea', [validarToken, validarCampos], deleteDescuentosEspecialesLineaController)

router.get('/sublineas', [validarToken, validarCampos], getAllSublineasController)
router.get('/get-items-by-line', [validarToken, validarCampos], getItemsByLineController)

router.post('/actualizar-articulo', [validarToken, validarCampos], patchItemsController)
router.post('/cargar-xsl-precios', [validarToken, validarCampos, upload.any(), validarArchivoExcel,], cargarPreciosExcelController)

router.get('/get-discount', [validarToken, validarCampos], getDiscountController)

router.get('/precios-costo-comercial-cadena', [validarToken, validarCampos], getListaPreciosCostoComercialCadenasController)

router.post('/set-precio-item-costo-comercial', [validarToken, validarCampos], setPrecioCostoComercialController)

router.post('/cargar-xsl-precios-cc', [validarToken, validarCampos, upload.any(), validarArchivoExcel,], cargarPreciosCostoComercialExcelController)
router.get('/get-rate', getCurrentRate)
router.get('/warehouse-by-suc', getWarehouseBySuc)router.get('/almacenes-by-succode', [validarToken, validarCampos], almacenesBySucCodeController)


module.exports = router