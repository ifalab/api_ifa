const { Router } = require('express')
const { parteDiaroController } = require('../controller/finanzas.controller')
const router = Router()

router.post('/parte-diaria', parteDiaroController)

module.exports = router