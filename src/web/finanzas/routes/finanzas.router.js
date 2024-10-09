const { Router } = require('express')
const { parteDiaroController, abastecimientoController, abastecimientoMesActualController } = require('../controller/finanzas.controller')
const router = Router()

router.post('/parte-diaria', parteDiaroController)
router.post('/abastecimiento', abastecimientoController)
router.get('/abastecimiento-mes-actual', abastecimientoMesActualController)

module.exports = router