const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const {
     importacionStatusController
} = require('../controller/importacion.controller')
const router = Router()

router.get('/importacion-status', [validarToken, validarCampos], importacionStatusController)

module.exports = router