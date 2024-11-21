const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { findAllAperturaController } = require('../controller/rendiciones.controller')
const router = Router()

router.get('/find-all-aperturas', [validarToken, validarCampos],findAllAperturaController)

module.exports = router