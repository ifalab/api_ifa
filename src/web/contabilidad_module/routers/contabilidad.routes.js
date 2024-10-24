const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { asientoContableController } = require('../controllers/contabilidad.controller')
const router = Router()

router.post('/asiento-contable', [validarToken, validarCampos], asientoContableController)
module.exports = router