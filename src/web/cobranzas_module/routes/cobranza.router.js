const { Router } = require('express')
const { cobranzaGeneralController, cobranzaPorSucursalController, cobranzaNormalesController, cobranzaCadenaController, cobranzaIfavetController, cobranzaIfavetMesAnteriorController, cobranzaCadenaMesAnteriorController, cobranzaNormalesMesAnteriorController, cobranzaPorSucursalMesAnteriorController, cobranzaMasivosController, cobranzaInstitucionesController, cobranzaMasivosMesAnteriorController, cobranzaInstitucionesMesAnteriorController, cobranzaPorSupervisorController, cobranzasPorZonasController, cobranzaHistoricoNacionalController, cobranzaHistoricoNormalesController, cobranzaHistoricoCadenasController, cobranzaHistoricoIfavetController, cobranzaHistoricoInstitucionesController, cobranzaHistoricoMasivosController, cobranzasPorZonasMesAntController, cobranzaClientePorVendedorController, cobranzaFacturaPorClienteController, clientesInstitucionesSaldoDeudorController, saldoDeudorInstitucionesController, realizarCobroController, comprobanteController } = require('../controller/cobranzas.controller')
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

router.get('/cobranzas-zona',[validarToken, validarCampos], cobranzasPorZonasController)
router.get('/cobranzas-zona-mes-ant',[validarToken, validarCampos], cobranzasPorZonasMesAntController)

router.get('/historico-nacional',[validarToken, validarCampos], cobranzaHistoricoNacionalController)
router.get('/historico-normales',[validarToken, validarCampos], cobranzaHistoricoNormalesController)
router.get('/historico-cadenas',[validarToken, validarCampos], cobranzaHistoricoCadenasController)
router.get('/historico-ifavet',[validarToken, validarCampos], cobranzaHistoricoIfavetController)
router.get('/historico-instituciones',[validarToken, validarCampos], cobranzaHistoricoInstitucionesController)
router.get('/historico-masivos',[validarToken, validarCampos], cobranzaHistoricoMasivosController)
router.get('/clientes-vendedor',[validarToken, validarCampos], cobranzaClientePorVendedorController)
router.get('/facturas-cliente',[validarToken, validarCampos], cobranzaFacturaPorClienteController)

router.get('/cliente-instituciones',[validarToken, validarCampos], clientesInstitucionesSaldoDeudorController)
router.get('/saldo-deudor-instituciones',[validarToken, validarCampos], saldoDeudorInstitucionesController)
router.post('/realizar-cobro',[validarToken, validarCampos],realizarCobroController)
router.get('/comprobante',[validarToken, validarCampos],comprobanteController)


module.exports = router