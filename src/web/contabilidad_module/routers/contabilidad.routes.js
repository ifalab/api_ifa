const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const { asientoContableController,
    findByIdAsientoController,
    asientoContableCC_Controller,
    createAsientoContableController,
    empleadosController,
    empleadosByCodeController,
    findAllBancoController,
    findAllAccountController,
    cerrarCajaChicaController,
} = require('../controllers/contabilidad.controller')

const router = Router()

router.post('/asiento-contable', [validarToken, validarCampos], asientoContableController)
router.get('/find-asiento-by-id/:id', [validarToken, validarCampos], findByIdAsientoController)
router.post('/asiento-contable-cc', [validarToken, validarCampos], asientoContableCC_Controller)
router.post('/create-asiento-contable', [validarToken, validarCampos], createAsientoContableController)
router.get('/empleados', [validarToken, validarCampos], empleadosController)
router.get('/empleado-by-code/:code', [validarToken, validarCampos], empleadosByCodeController)
router.get('/find-all-bancos', [validarToken, validarCampos],findAllBancoController)
router.get('/find-all-account', [validarToken, validarCampos],findAllAccountController)
router.patch('/cierre-caja-chica', [validarToken, validarCampos],cerrarCajaChicaController)

module.exports = router