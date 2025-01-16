const { Router } = require('express')
const { authLoginPost, createUserController, findAllUserController, findUserByIdController, updateUserController, desactiveUserController, findDimensionController, authLoginV2, findAllDimensionUnoByUserController, findAllDimensionDosByUserController, findAllDimensionTresByUserController, activeUserController, roleByUserController, addRoleUserController, deleteAllRoleController, deleteOneRoleController, updateRolesByUserController, findAllRolesController, createUsertxt, userVendedorController, userInsertVendedorController,
    getDmUsersController,
    getAllAlmacenesController,
    getDmUserByIdController,
    getAlmacenesByUserController,
    addAlmacenUsuarioController,
    deleteAlmacenUsuarioController
 } = require('../controllers/auth.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const router = Router()

router.post('/login', authLoginPost)
router.post('/login-v2', authLoginV2)
router.post('/create-user',[validarToken, validarCampos], createUserController)
router.get('/find-all-user', findAllUserController)
router.post('/find-by-id-user',[validarToken, validarCampos], findUserByIdController)
router.patch('/update-user',[validarToken, validarCampos], updateUserController)
router.patch('/desactive-user',[validarToken, validarCampos], desactiveUserController)
router.patch('/active-user',[validarToken, validarCampos], activeUserController)
router.get('/dimension/:dim',[validarToken, validarCampos],findDimensionController)
router.get('/find-dimension-uno-by-user/:id',[validarToken, validarCampos],findAllDimensionUnoByUserController)
router.get('/find-dimension-dos-by-user/:id',[validarToken, validarCampos],findAllDimensionDosByUserController)
router.get('/find-dimension-tres-by-user/:id',[validarToken, validarCampos],findAllDimensionTresByUserController)
router.get('/role-by-user/:id',[validarToken, validarCampos],roleByUserController)
router.post('/add-role-user',[validarToken, validarCampos],addRoleUserController)
router.delete('/delete-all-role-user/:id',[validarToken, validarCampos],deleteAllRoleController)
router.post('/delete-one-role-user',[validarToken, validarCampos],deleteOneRoleController)
router.patch('/update-role-user',[validarToken, validarCampos],updateRolesByUserController)
router.get('/find-all-rol',[validarToken, validarCampos],findAllRolesController)
router.get('/get-users',[validarToken, validarCampos],getDmUsersController)
router.get('/get-almacenes',[validarToken, validarCampos],getAllAlmacenesController)
router.get('/get-user-by-id',[validarToken, validarCampos],getDmUserByIdController)
router.get('/get-almacenes-by-user',[validarToken, validarCampos],getAlmacenesByUserController)
router.post('/add-almacen-user',[validarToken, validarCampos],addAlmacenUsuarioController)
router.post('/delete-almacen-user',[validarToken, validarCampos], deleteAlmacenUsuarioController)

module.exports = router