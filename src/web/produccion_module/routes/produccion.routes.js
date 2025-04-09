const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { getLotesController, cambiarEstadoLoteController} = require('../controller/produccion.controller')
const checkToken = require('../../../middleware/authMiddleware')
const router = Router()

router.get('/lotes', [validarToken, validarCampos], getLotesController)
router.post('/cambiar-estado-lote', [validarToken, validarCampos], cambiarEstadoLoteController)

module.exports = router