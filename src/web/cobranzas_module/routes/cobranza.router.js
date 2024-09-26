const { Router } = require('express')
const { cobranzaGeneralController, cobranzaPorSucursalController, cobranzaNormalesController, cobranzaCadenaController, cobranzaIfavetController } = require('../controller/cobranzas.controller')
const router = Router()

router.get('/generales',cobranzaGeneralController)
router.get('/sucursales',cobranzaPorSucursalController)
router.get('/normales',cobranzaNormalesController)
router.get('/cadenas',cobranzaCadenaController)
router.get('/ifavet',cobranzaIfavetController)


module.exports = router