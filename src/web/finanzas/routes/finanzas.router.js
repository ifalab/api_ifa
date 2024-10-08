const { Router } = require('express')
const { parteDiaroController, abastecimientoController } = require('../controller/finanzas.controller')
const router = Router()

router.post('/parte-diaria', parteDiaroController)
router.post('/abastecimiento', abastecimientoController)

module.exports = router