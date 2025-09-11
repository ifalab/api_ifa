const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const { getPersonasController, patchPersonController, getAsistenciaVisitadoresController
    ,getAsistenciaVendedoresController
} = require('../controllers/personas.controller')

const router = Router()

router.get('/get-personas', [validarToken, validarCampos], getPersonasController)

router.post('/patch-persona', [validarToken, validarCampos], patchPersonController)

router.get('/get-asistencias-visitadores', [validarToken, validarCampos], getAsistenciaVisitadoresController)
router.get('/get-asistencias-vendedores', [validarToken, validarCampos], getAsistenciaVendedoresController)


module.exports = router