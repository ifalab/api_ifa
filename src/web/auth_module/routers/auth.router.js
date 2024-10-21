const { Router } = require('express')
const { authLoginPost, createUserController, findAllUserController, findUserByIdController } = require('../controllers/auth.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const router = Router()

router.post('/login', authLoginPost)
router.post('/create-user',[validarToken, validarCampos], createUserController)
router.get('/find-all-user',[validarToken, validarCampos], findAllUserController)
router.post('/find-by-id-user',[validarToken, validarCampos], findUserByIdController)

module.exports = router