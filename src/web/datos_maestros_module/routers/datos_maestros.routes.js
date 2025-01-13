const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { dmClientesController } = require('../controller/datos_maestros.controller')
const router = Router()

router.get('/clientes', [validarToken, validarCampos], dmClientesController)

module.exports = router