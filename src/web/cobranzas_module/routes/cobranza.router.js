const { Router } = require('express')
const { cobranzaGeneralController, cobranzaPorSucursalController, cobranzaNormalesController } = require('../controller/cobranzas.controller')
const router = Router()

router.get('/generales',cobranzaGeneralController)
router.get('/sucursales',cobranzaPorSucursalController)
router.get('/normales',cobranzaNormalesController)


module.exports = router