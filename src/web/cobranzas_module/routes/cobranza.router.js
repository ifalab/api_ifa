const { Router } = require('express')
const { cobranzaGeneralController, cobranzaPorSucursalController } = require('../controller/cobranzas.controller')
const router = Router()

router.get('/generales',cobranzaGeneralController)
router.get('/sucursales',cobranzaPorSucursalController)


module.exports = router