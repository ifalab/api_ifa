const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { findAllAperturaController, findAllCajasEmpleadoController, rendicionDetalladaController, rendicionByTransacController, crearRendicionController, crearActualizarGastoController, gastosEnRevisionController, cambiarEstadoRendicionController, verRendicionesEnRevisionController, sendToSapController, eliminarGastoController, costoComercialAreasController, costoComercialTipoClienteController, costoComercialLineasController, costoComercialEspecialidadesController, costoComercialClasificacionesController, costoComercialConceptosController, costoComercialCuentaController, filtroCCController, actualizarGlosaRendController, actualizarFechaContRendController,
    getProveedorController,
    searchBeneficiariosController,
    findAllCajasController,
    conceptoComercialByIdController,
    actualizarCCRendController,
    actualizarGlosaPRDGastoController,
    buscarCuentaProdController,
    proveedoresController,
 } = require('../controller/rendiciones.controller')
const router = Router()

router.get('/find-all-aperturas', [validarToken, validarCampos], findAllAperturaController)
router.get('/find-all-cajas-empleado/:codEmp', [validarToken, validarCampos], findAllCajasEmpleadoController)
router.get('/find-all-cajas', [validarToken, validarCampos], findAllCajasController)
router.get('/rendicion-detalle/:id', [validarToken, validarCampos], rendicionDetalladaController)
router.get('/rendicion-by-transac/:transacId', [validarToken, validarCampos], rendicionByTransacController)
router.post('/crear-rendicion', [validarToken, validarCampos], crearRendicionController)
router.patch('/crear-actualizar-gastos', [validarToken, validarCampos], crearActualizarGastoController)
router.patch('/en-revision-gastos', [validarToken, validarCampos], gastosEnRevisionController)
router.patch('/cambiar-estado-rendicion', [validarToken, validarCampos], cambiarEstadoRendicionController)
router.get('/ver-rendiciones-revision', [validarToken, validarCampos], verRendicionesEnRevisionController)
router.post('/send-to-sap', [validarToken, validarCampos], sendToSapController)
router.delete('/eliminar-gasto/:id', [validarToken, validarCampos], eliminarGastoController)
router.get('/cc-areas', [validarToken, validarCampos], costoComercialAreasController)
router.get('/cc-tipo', [validarToken, validarCampos], costoComercialTipoClienteController)
router.get('/cc-lineas', [validarToken, validarCampos], costoComercialLineasController)
router.get('/cc-especialidades', [validarToken, validarCampos], costoComercialEspecialidadesController)
router.get('/cc-clasificaciones', [validarToken, validarCampos], costoComercialClasificacionesController)
router.get('/cc-conceptos', [validarToken, validarCampos], costoComercialConceptosController)
router.get('/cc-cuenta', [validarToken, validarCampos], costoComercialCuentaController)
router.post('/cc-filtro', [validarToken, validarCampos], filtroCCController)
router.patch('/actualizar-glosa-rend', [validarToken, validarCampos], actualizarGlosaRendController)
router.patch('/actualizar-fecha-rend', [validarToken, validarCampos], actualizarFechaContRendController)
router.patch('/actualizar-glosa-prd', [validarToken, validarCampos], actualizarGlosaPRDGastoController)
router.patch('/actualizar-cc-rend', [validarToken, validarCampos], actualizarCCRendController)
router.patch('/actualizar-cc', [validarToken, validarCampos], )
router.get('/proveedor', [validarToken, validarCampos], getProveedorController)
router.post('/search-beneficiarios', [validarToken, validarCampos], searchBeneficiariosController)
router.get('/cc-by-id/:id', [validarToken, validarCampos], conceptoComercialByIdController)
router.get('/buscar-cuenta-prod', [validarToken, validarCampos], buscarCuentaProdController)
router.get('/proveedores', [validarToken, validarCampos], proveedoresController)



module.exports = router