const { Router } = require('express')
const { ventasPorSucursalController, ventasNormalesController, ventasCadenasController, ventasInstitucionesController, ventasUsuarioController, ventasIFAVETController } = require('../controller/venta.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.get('/sucursales', [validarToken, validarCampos], ventasPorSucursalController)
router.get('/normales', ventasNormalesController)
router.get('/cadenas', ventasCadenasController)
router.get('/instituciones', ventasInstitucionesController)
router.get('/ifavet', ventasIFAVETController)
router.post('/usuario', [validarToken, validarCampos],ventasUsuarioController)

module.exports = router