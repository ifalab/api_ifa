const { Router } = require('express')
const { clientePorDimensionUnoController, almacenesPorDimensionUnoController, postHabilitacionController, inventarioValoradoController } = require('../controller/inventario.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.post('/cliente-dimension',[validarToken, validarCampos], clientePorDimensionUnoController)
router.post('/almacen-dimension',[validarToken, validarCampos], almacenesPorDimensionUnoController)
router.post('/habilitacion',[validarToken, validarCampos], postHabilitacionController)
router.get('/inventario-valorado',[validarToken, validarCampos], inventarioValoradoController)


module.exports = router