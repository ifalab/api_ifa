const { Router } = require('express')
const { parteDiaroController, abastecimientoController, abastecimientoMesActualController, parteDiaroMesActualController, abastecimientoMesAnteriorController, findAllRegionsController, findAllLineController, findAllSublineController, findAllGroupAlmacenController, abastecimientoPorFechaController, abastecimientoFechaAnualController, abastecimientoFecha24MesesController, findAllGastosController, findAllSimpleGastosController, findXAgenciaSimpleGastosController, gastosGestionAgenciaController, reporteArticulosPendientesController, reporteMargenComercialController, getCommercialMarginByProducts, getMonthlyCommercialMarginController, getReportBankMajorController, getCommercialBankAccountsController, excelBankMajorController } = require('../controller/finanzas.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.post('/parte-diaria', [validarToken, validarCampos], parteDiaroController)
router.post('/abastecimiento', [validarToken, validarCampos], abastecimientoController)
router.get('/abastecimiento-mes-anterior', [validarToken, validarCampos], abastecimientoMesAnteriorController)
router.get('/abastecimiento-mes-actual', [validarToken, validarCampos], abastecimientoMesActualController)
router.get('/abastecimiento-por-fecha', [validarToken, validarCampos], abastecimientoPorFechaController)
router.get('/abastecimiento-anual', [validarToken, validarCampos], abastecimientoFechaAnualController)
router.get('/abastecimiento-24-meses', [validarToken, validarCampos], abastecimientoFecha24MesesController)
router.get('/parte-diario-mes-actual', [validarToken, validarCampos], parteDiaroMesActualController)
router.get('/find-all-regions', [validarToken, validarCampos], findAllRegionsController)
router.get('/find-all-line', [validarToken, validarCampos], findAllLineController)
router.get('/find-all-subline', [validarToken, validarCampos], findAllSublineController)
router.get('/find-all-group-almacen', [validarToken, validarCampos], findAllGroupAlmacenController)
router.get('/find-all-gastos', [validarToken, validarCampos], findAllGastosController)
router.get('/find-all-simple-gastos', [validarToken, validarCampos], findAllSimpleGastosController)
router.get('/find-xagencia-simple-gastos', [validarToken, validarCampos], findXAgenciaSimpleGastosController)
router.get('/find-gastos-gestion-agencia', [validarToken, validarCampos], gastosGestionAgenciaController)
router.get('/reporte-articulos-pendientes', [validarToken, validarCampos], reporteArticulosPendientesController)

router.get('/margen-comercial', [validarToken, validarCampos], reporteMargenComercialController)
router.get('/margen-comercial-mensual', [validarToken, validarCampos], getMonthlyCommercialMarginController)
router.get('/margen-comercial-articulos', [validarToken, validarCampos], getCommercialMarginByProducts)
router.get('/mayor-banco', [validarCampos], getReportBankMajorController)
router.get('/commercial-bank-accounts', [validarToken, validarCampos], getCommercialBankAccountsController)
router.post('/reporte/excel-mayor-banco', [validarToken, validarCampos], excelBankMajorController);


module.exports = router