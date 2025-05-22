const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const { asientoContableController,
    findByIdAsientoController,
    asientoContableCC_Controller,
    createAsientoContableController,
    empleadosController,
    empleadosByCodeController,
    findAllBancoController,
    findAllAccountController,
    cerrarCajaChicaController,
    createAsientoContableSAPController,
    createAsientoContableCCController,
    getCuentasCC,
    getAsientosContablesCC,
    getSucursalesCC,
    getLineasCC,
    getSublineasCC,
    getTipoClienteCC,
    rendicionesPorCajaController,
    getJournalPreliminarCC,
    getJournalPreliminarCCIds,
    getSociosNegocio,
    actualizarEstadoCCController,
    guardarAsientoContablePreliminarCCController,
    actualizarAsientoContablePreliminarCCController,
} = require('../controllers/contabilidad.controller')

const router = Router()

router.post('/asiento-contable', [validarToken, validarCampos], asientoContableController)
router.get('/find-asiento-by-id/:id', [validarToken, validarCampos], findByIdAsientoController)
router.post('/asiento-contable-cc', [validarToken, validarCampos], asientoContableCC_Controller)
router.post('/create-asiento-contable', [validarToken, validarCampos], createAsientoContableController)
router.post('/create-asiento-contable-sap', [validarToken, validarCampos], createAsientoContableSAPController)
router.get('/empleados', [validarToken, validarCampos], empleadosController)
router.get('/empleado-by-code/:code', [validarToken, validarCampos], empleadosByCodeController)
router.get('/find-all-bancos', [validarToken, validarCampos],findAllBancoController)
router.get('/find-all-account', [validarToken, validarCampos],findAllAccountController)
router.patch('/cierre-caja-chica', [validarToken, validarCampos],cerrarCajaChicaController)
router.post('/create-asiento-contable-centro-costo', [validarToken, validarCampos], createAsientoContableCCController)
router.get('/cuentas', [validarToken, validarCampos], getCuentasCC)
router.get('/asientos-contables-cc', [validarToken, validarCampos], getAsientosContablesCC)
router.get('/asientos-contables-preliminares-cc', [validarToken, validarCampos], getJournalPreliminarCC)
router.get('/asientos-contables-preliminares-cc-ids', [validarToken, validarCampos], getJournalPreliminarCCIds)

router.get('/sucursales', [validarToken, validarCampos], getSucursalesCC);
router.get('/lineas', [validarToken, validarCampos], getLineasCC);
router.get('/tipo-cliente', [validarToken, validarCampos], getTipoClienteCC);
router.get('/sublineas', [validarToken, validarCampos], getSublineasCC);
router.get('/rendiciones-por-caja', [validarToken, validarCampos], rendicionesPorCajaController);
router.get('/socios-negocio', [validarToken, validarCampos], getSociosNegocio);

router.patch('/update-estado/cc/:id', actualizarEstadoCCController);

module.exports = router