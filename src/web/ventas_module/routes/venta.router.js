const { Router } = require('express')
const {
    ventasPorSucursalController,
    ventasNormalesController,
    ventasCadenasController,
    ventasInstitucionesController,
    ventasUsuarioController,
    ventasIFAVETController,
    ventasMasivoController,
    ventasPorSucursalControllerMesAnterior,
    ventasCadenasControllerMesAnterior,
    ventasIFAVETControllerMesAnterior,
    ventasInstitucionesControllerMesAnterior,
    ventasMasivoControllerMesAnterior,
    ventasNormalesControllerMesAnterior,
    ventasPorSupervisorController,
    ventasVendedorPorZona,
    ventasHistoricoSucursalController,
    ventasHistoricoNormalesController,
    ventasHistoricoCadenasController,
    ventasHistoricoIfaVetController,
    ventasHistoricoMasivosController,
    ventasHistoricoInstitucionesController,
    vendedorPorZonaMesAntController,
    facturacionController,
    marcarAsistenciaController,
} = require('../controller/venta.controller')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.get('/sucursales', [validarToken, validarCampos], ventasPorSucursalController)
router.get('/normales', [validarToken, validarCampos], ventasNormalesController)
router.get('/cadenas', [validarToken, validarCampos], ventasCadenasController)
router.get('/instituciones', [validarToken, validarCampos], ventasInstitucionesController)
router.get('/ifavet', [validarToken, validarCampos], ventasIFAVETController)
router.get('/masivo', [validarToken, validarCampos], ventasMasivoController)
router.post('/supervisor', [validarToken, validarCampos], ventasPorSupervisorController)

router.get('/sucursales-mes-anterior', [validarToken, validarCampos], ventasPorSucursalControllerMesAnterior)
router.get('/normales-mes-anterior', [validarToken, validarCampos], ventasNormalesControllerMesAnterior)
router.get('/cadenas-mes-anterior', [validarToken, validarCampos], ventasCadenasControllerMesAnterior)
router.get('/instituciones-mes-anterior', [validarToken, validarCampos], ventasInstitucionesControllerMesAnterior)
router.get('/ifavet-mes-anterior', [validarToken, validarCampos], ventasIFAVETControllerMesAnterior)
router.get('/masivo-mes-anterior', [validarToken, validarCampos], ventasMasivoControllerMesAnterior)

router.get('/historico-sucursales', [validarToken, validarCampos], ventasHistoricoSucursalController)
router.get('/historico-normales', [validarToken, validarCampos], ventasHistoricoNormalesController)
router.get('/historico-cadenas', [validarToken, validarCampos], ventasHistoricoCadenasController)
router.get('/historico-ifavet', [validarToken, validarCampos], ventasHistoricoIfaVetController)
router.get('/historico-masivos', [validarToken, validarCampos], ventasHistoricoMasivosController)
router.get('/historico-instituciones', [validarToken, validarCampos], ventasHistoricoInstitucionesController)

router.get('/ventas-zona', [validarToken, validarCampos], ventasVendedorPorZona)
router.get('/ventas-zona-mes-ant', [validarToken, validarCampos],vendedorPorZonaMesAntController)
router.post('/marcar-asistencia', [validarToken, validarCampos],marcarAsistenciaController)


router.post('/usuario', [validarToken, validarCampos], ventasUsuarioController)

module.exports = router