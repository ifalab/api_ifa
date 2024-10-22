const { Router } = require('express')
const { authLoginPost, createUserController, findAllUserController, findUserByIdController, updateUserController, desactiveUserController, findDimensionController } = require('../controllers/auth.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const router = Router()

router.post('/login', authLoginPost)
router.post('/create-user',[validarToken, validarCampos], createUserController)
router.get('/find-all-user',[validarToken, validarCampos], findAllUserController)
router.post('/find-by-id-user',[validarToken, validarCampos], findUserByIdController)
router.patch('/update-user',[validarToken, validarCampos], updateUserController)
router.patch('/desactive-user',[validarToken, validarCampos], desactiveUserController)
router.get('/dimension/:dim',[validarToken, validarCampos],findDimensionController)

module.exports = router