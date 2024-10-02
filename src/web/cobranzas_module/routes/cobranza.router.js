const { Router } = require('express')
const { cobranzaGeneralController, cobranzaPorSucursalController, cobranzaNormalesController, cobranzaCadenaController, cobranzaIfavetController, cobranzaIfavetMesAnteriorController, cobranzaCadenaMesAnteriorController, cobranzaNormalesMesAnteriorController, cobranzaPorSucursalMesAnteriorController, cobranzaMasivosController, cobranzaInstitucionesController, cobranzaMasivosMesAnteriorController, cobranzaInstitucionesMesAnteriorController } = require('../controller/cobranzas.controller')
const router = Router()

router.get('/generales',cobranzaGeneralController)
router.get('/sucursales',cobranzaPorSucursalController)
router.get('/normales',cobranzaNormalesController)
router.get('/cadenas',cobranzaCadenaController)
router.get('/ifavet',cobranzaIfavetController)
router.get('/masivos',cobranzaMasivosController)
router.get('/instituciones',cobranzaInstitucionesController)

router.get('/sucursales-mes-anterior',cobranzaPorSucursalMesAnteriorController)
router.get('/normales-mes-anterior',cobranzaNormalesMesAnteriorController)
router.get('/cadenas-mes-anterior',cobranzaCadenaMesAnteriorController)
router.get('/ifavet-mes-anterior',cobranzaIfavetMesAnteriorController)
router.get('/masivos-mes-anterior',cobranzaMasivosMesAnteriorController)
router.get('/instituciones-mes-anterior',cobranzaInstitucionesMesAnteriorController)


module.exports = router