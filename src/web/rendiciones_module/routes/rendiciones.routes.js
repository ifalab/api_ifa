const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { findAllAperturaController, findAllCajasEmpleadoController, rendicionDetalladaController, rendicionByTransacController, crearRendicionController, crearActualizarGastoController, gastosEnRevisionController } = require('../controller/rendiciones.controller')
const router = Router()

router.get('/find-all-aperturas', [validarToken, validarCampos], findAllAperturaController)
router.get('/find-all-cajas-empleado/:codEmp', [validarToken, validarCampos], findAllCajasEmpleadoController)
router.get('/rendicion-detalle/:id', [validarToken, validarCampos], rendicionDetalladaController)
router.get('/rendicion-by-transac/:transacId', [validarToken, validarCampos], rendicionByTransacController)
router.post('/crear-rendicion', [validarToken, validarCampos], crearRendicionController)
router.patch('/crear-actualizar-gastos', [validarToken, validarCampos], crearActualizarGastoController)
router.patch('/en-revision-gastos', [validarToken, validarCampos], gastosEnRevisionController)

module.exports = router