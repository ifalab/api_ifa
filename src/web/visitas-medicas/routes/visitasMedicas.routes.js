const { Router } = require('express')
const {
    todasLasRegionesController,
    medicosPorRegionController
} = require('../controller/visitasMedicas.controller')

const router = Router()

router.get('/todas-las-regiones', todasLasRegionesController)
router.post('/medicos-por-region', medicosPorRegionController)

module.exports = router