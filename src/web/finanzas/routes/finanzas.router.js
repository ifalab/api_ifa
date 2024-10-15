const { Router } = require('express')
const { parteDiaroController, abastecimientoController, abastecimientoMesActualController, parteDiaroMesActualController } = require('../controller/finanzas.controller')
const router = Router()

router.post('/parte-diaria', parteDiaroController)
router.post('/abastecimiento', abastecimientoController)
router.get('/abastecimiento-mes-actual', abastecimientoMesActualController)
router.get('/parte-diario-mes-actual', parteDiaroMesActualController)

module.exports = router