const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const { asientoContableController,
    findByIdAsientoController,
    asientoContableCC_Controller,
} = require('../controllers/contabilidad.controller')

const router = Router()

router.post('/asiento-contable', [validarToken, validarCampos], asientoContableController)
router.get('/find-asiento-by-id/:id', [validarToken, validarCampos], findByIdAsientoController)
router.post('/asiento-contable-cc', [validarToken, validarCampos], asientoContableCC_Controller)
module.exports = router