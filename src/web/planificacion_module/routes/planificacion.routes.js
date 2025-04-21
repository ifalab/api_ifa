const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const {
    vendedoresPorSucCodeController, getVendedorController, getClientesDelVendedorController,
    getCicloVendedorController, getDetalleCicloVendedorController,
    insertarVisitaController, insertarDetalleVisitaController, insertarCabeceraVisitaController,
    actualizarDetalleVisitaController, cambiarEstadoCicloController, cambiarEstadoVisitasController,
    eliminarDetalleVisitaController, getVisitasParaHoyController
} = require('../controller/planificacion.controller')
const router = Router()

router.get('/vendedores-suc', [validarToken, validarCampos], vendedoresPorSucCodeController)
router.get('/vendedor', [validarToken, validarCampos], getVendedorController)
router.get('/clientes-vendedor', [validarToken, validarCampos], getClientesDelVendedorController)
router.post('/ciclo-vendedor', [validarToken, validarCampos], getCicloVendedorController)
router.get('/detalle-ciclo-vendedor', [validarToken, validarCampos], getDetalleCicloVendedorController)
router.post('/insertar-visita', [validarToken, validarCampos], insertarVisitaController)
router.post('/detalle-visita', [validarToken, validarCampos], insertarDetalleVisitaController)
router.post('/cabecera-visita', [validarToken, validarCampos], insertarCabeceraVisitaController)
router.post('/actualizar-visita', [validarToken, validarCampos], actualizarDetalleVisitaController)
router.post('/estado-ciclo', [validarToken, validarCampos], cambiarEstadoCicloController)
router.post('/estado-visita', [validarToken, validarCampos], cambiarEstadoVisitasController)
router.get('/eliminar-visita', [validarToken, validarCampos], eliminarDetalleVisitaController)
router.post('/visitas-fecha', [validarToken, validarCampos], getVisitasParaHoyController)

module.exports = router