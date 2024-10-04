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
} = require('../controller/venta.controller')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.get('/sucursales',  ventasPorSucursalController)
router.get('/normales', ventasNormalesController)
router.get('/cadenas', ventasCadenasController)
router.get('/instituciones', ventasInstitucionesController)
router.get('/ifavet', ventasIFAVETController)
router.get('/masivo', ventasMasivoController)
router.post('/supervisor', ventasPorSupervisorController)

router.get('/sucursales-mes-anterior', [validarToken, validarCampos], ventasPorSucursalControllerMesAnterior)
router.get('/normales-mes-anterior', ventasNormalesControllerMesAnterior)
router.get('/cadenas-mes-anterior', ventasCadenasControllerMesAnterior)
router.get('/instituciones-mes-anterior', ventasInstitucionesControllerMesAnterior)
router.get('/ifavet-mes-anterior', ventasIFAVETControllerMesAnterior)
router.get('/masivo-mes-anterior', ventasMasivoControllerMesAnterior)


router.post('/usuario', [validarToken, validarCampos], ventasUsuarioController)

module.exports = router