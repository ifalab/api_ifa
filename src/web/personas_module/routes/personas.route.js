const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const { getPersonasController, patchPersonController
} = require('../controllers/personas.controller')

const router = Router()

router.get('/get-personas', [validarToken, validarCampos], getPersonasController)

router.post('/patch-persona', [validarToken, validarCampos], patchPersonController)



module.exports = router