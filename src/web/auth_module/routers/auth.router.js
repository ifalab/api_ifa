const { Router } = require('express')
const { authLoginPost, createUserController, findAllUserController, findUserByIdController, updateUserController, desactiveUserController, findDimensionController, authLoginV2, findAllDimensionUnoByUserController, findAllDimensionDosByUserController, findAllDimensionTresByUserController, activeUserController } = require('../controllers/auth.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const router = Router()

router.post('/login', authLoginPost)
router.post('/login-v2', authLoginV2)
router.post('/create-user',[validarToken, validarCampos], createUserController)
router.get('/find-all-user',[validarToken, validarCampos], findAllUserController)
router.post('/find-by-id-user',[validarToken, validarCampos], findUserByIdController)
router.patch('/update-user',[validarToken, validarCampos], updateUserController)
router.patch('/desactive-user',[validarToken, validarCampos], desactiveUserController)
router.patch('/active-user',[validarToken, validarCampos], activeUserController)
router.get('/dimension/:dim',[validarToken, validarCampos],findDimensionController)
router.get('/find-dimension-uno-by-user/:id',[validarToken, validarCampos],findAllDimensionUnoByUserController)
router.get('/find-dimension-dos-by-user/:id',[validarToken, validarCampos],findAllDimensionDosByUserController)
router.get('/find-dimension-tres-by-user/:id',[validarToken, validarCampos],findAllDimensionTresByUserController)

module.exports = router