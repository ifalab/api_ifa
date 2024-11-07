const { Router } = require('express')
const { cobranzaGeneralController, cobranzaPorSucursalController, cobranzaNormalesController, cobranzaCadenaController, cobranzaIfavetController, cobranzaIfavetMesAnteriorController, cobranzaCadenaMesAnteriorController, cobranzaNormalesMesAnteriorController, cobranzaPorSucursalMesAnteriorController, cobranzaMasivosController, cobranzaInstitucionesController, cobranzaMasivosMesAnteriorController, cobranzaInstitucionesMesAnteriorController, cobranzaPorSupervisorController, cobranzasPorZonasController } = require('../controller/cobranzas.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.get('/generales',[validarToken, validarCampos],cobranzaGeneralController)
router.get('/sucursales',[validarToken, validarCampos],cobranzaPorSucursalController)
router.get('/normales',[validarToken, validarCampos],cobranzaNormalesController)
router.get('/cadenas',[validarToken, validarCampos],cobranzaCadenaController)
router.get('/ifavet',[validarToken, validarCampos],cobranzaIfavetController)
router.get('/masivos',[validarToken, validarCampos],cobranzaMasivosController)
router.get('/instituciones',[validarToken, validarCampos],cobranzaInstitucionesController)
router.post('/supervisor',[validarToken, validarCampos],cobranzaPorSupervisorController)

router.get('/sucursales-mes-anterior',[validarToken, validarCampos],cobranzaPorSucursalMesAnteriorController)
router.get('/normales-mes-anterior',[validarToken, validarCampos],cobranzaNormalesMesAnteriorController)
router.get('/cadenas-mes-anterior',[validarToken, validarCampos],cobranzaCadenaMesAnteriorController)
router.get('/ifavet-mes-anterior',[validarToken, validarCampos],cobranzaIfavetMesAnteriorController)
router.get('/masivos-mes-anterior',[validarToken, validarCampos],cobranzaMasivosMesAnteriorController)
router.get('/instituciones-mes-anterior',[validarToken, validarCampos],cobranzaInstitucionesMesAnteriorController)

router.get('/cobranzas-zona',[validarToken], cobranzasPorZonasController)

module.exports = router