const { Router } = require('express')
const {
    todasLasRegionesController,
    medicosPorRegionController
} = require('../controller/visitasMedicas.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const router = Router()

router.get('/todas-las-regiones',[validarToken, validarCampos], todasLasRegionesController)
router.post('/medicos-por-region',[validarToken, validarCampos], medicosPorRegionController)

module.exports = router