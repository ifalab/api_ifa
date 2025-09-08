const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const {
    vendedoresPorSucCodeController, getVendedorController, getClientesDelVendedorController,
    getCicloVendedorController, getDetalleCicloVendedorController,
    insertarPlanController, insertarDetalleVisitaController, insertarCabeceraVisitaController,
    actualizarDetalleVisitaController, cambiarEstadoCicloController, cambiarEstadoVisitasController,
    eliminarDetalleVisitaController, getVisitasParaHoyController, getCabeceraVisitasCreadasController,
    marcarVisitaController, aniadirDetalleVisitaController, getDetalleVisitasCreadasController, 
    getCabeceraVisitaCreadaController, insertarDetallesFechasVisitaController,
    getClienteByCodeController, actualizarVisitaController, getUltimaVisitaController, getPlanVendedorController,
    getClientesBySup,
    visitHistoryController,
    visitHistoryBySlpCodeController,
    pendingVisitsController,
    getVisitsExcelController
} = require('../controller/planificacion.controller')
const router = Router()

router.get('/vendedores-suc', [validarToken, validarCampos], vendedoresPorSucCodeController)
router.get('/vendedor', [validarToken, validarCampos], getVendedorController)
router.get('/clientes-vendedor', [validarToken, validarCampos], getClientesDelVendedorController)
router.get('/cliente', [validarToken, validarCampos], getClienteByCodeController)

//Planificacion
router.post('/ciclo-vendedor', [validarToken, validarCampos], getCicloVendedorController)
router.post('/get-plan-vendedor', [validarToken, validarCampos], getPlanVendedorController)
router.get('/detalle-ciclo-vendedor', [validarToken, validarCampos], getDetalleCicloVendedorController)
router.post('/insertar-plan', [validarToken, validarCampos], insertarPlanController)
router.post('/detalle-visita', [validarToken, validarCampos], insertarDetalleVisitaController)

router.post('/detalle-fechas-visita', [validarToken, validarCampos], insertarDetallesFechasVisitaController)

router.post('/cabecera-visita', [validarToken, validarCampos], insertarCabeceraVisitaController)
router.post('/actualizar-visita', [validarToken, validarCampos], actualizarDetalleVisitaController)
router.post('/estado-ciclo', [validarToken, validarCampos], cambiarEstadoCicloController)
router.post('/estado-visita', [validarToken, validarCampos], cambiarEstadoVisitasController)
router.get('/eliminar-visita', [validarToken, validarCampos], eliminarDetalleVisitaController)
router.post('/visitas-fecha', [validarToken, validarCampos], getVisitasParaHoyController)

//Visita
router.get('/cab-visitas-creadas', [validarToken, validarCampos], getCabeceraVisitasCreadasController)
router.get('/cab-visita-creada', [validarToken, validarCampos], getCabeceraVisitaCreadaController)
router.post('/marcar-visita', [validarToken, validarCampos], marcarVisitaController)
router.post('/aniadir-detalle-visita', [validarToken, validarCampos], aniadirDetalleVisitaController)
router.get('/detalle-visitas-creadas', [validarToken, validarCampos], getDetalleVisitasCreadasController)
router.post('/actualizar-visita-creada', [validarToken, validarCampos], actualizarVisitaController)
router.get('/ultima-visita', [validarToken, validarCampos], getUltimaVisitaController)

router.get('/clientes/by/sup', [validarCampos, validarToken], getClientesBySup)

//Reportes
router.get('/visits-historyc-by-month', [validarToken, validarCampos], visitHistoryController);
router.get('/visits-historyc-by-slpcode', [validarToken, validarCampos], visitHistoryBySlpCodeController);
router.get('/pending-visits-by-slpcode', [validarToken, validarCampos], pendingVisitsController);

router.get('/visits-excel', [validarCampos, validarToken], getVisitsExcelController);


module.exports = router