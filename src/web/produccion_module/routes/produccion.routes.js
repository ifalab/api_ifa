const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { 
    getLotesController, cambiarEstadoLoteController, searchLotesController,
    
} = require('../controller/produccion.controller')
const router = Router()

router.get('/lotes', [validarToken, validarCampos], getLotesController)
router.post('/cambiar-estado-lote', [validarToken, validarCampos], cambiarEstadoLoteController)
router.post('/search-lotes', [validarToken, validarCampos], searchLotesController)

module.exports = router