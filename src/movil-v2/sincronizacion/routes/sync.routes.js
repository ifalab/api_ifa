const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { sync, moraClienteController } = require('../controller/sync.controller')
const router = Router()

router.post('', [validarToken, validarCampos], sync)
router.post('/mora', [validarToken, validarCampos], moraClienteController)

module.exports = router