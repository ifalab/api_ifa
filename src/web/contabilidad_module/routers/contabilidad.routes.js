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
    getCuentasController,
    getMaestrosMayoresController,
    getBalanceAccountPrevController,
    getBankingByDateController,
    createAsientoContableInventarioController,
    getBeneficiarioController,
    patchNoBeneficiarioController,
    patchYesBeneficiarioController
} = require('../controllers/contabilidad.controller')

const router = Router()

router.post('/asiento-contable', [validarToken, validarCampos], asientoContableController)
router.get('/find-asiento-by-id/:id', [validarToken, validarCampos], findByIdAsientoController)
router.post('/asiento-contable-cc', [validarToken, validarCampos], asientoContableCC_Controller)
router.post('/create-asiento-contable', [validarToken, validarCampos], createAsientoContableController)
router.post('/create-asiento-contable-inventario', [validarToken, validarCampos], createAsientoContableInventarioController)
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
router.get('/find-cuentas-by-param', [validarToken, validarCampos], getCuentasController);
router.post('/get-maestros-mayores-data', [validarToken, validarCampos], getMaestrosMayoresController);
router.post('/get-cuenta-saldo-prev', [validarToken, validarCampos], getBalanceAccountPrevController);
router.post('/get-bancarizacion', [validarToken, validarCampos], getBankingByDateController);
router.patch('/update-estado/cc/:id', actualizarEstadoCCController);
router.get('/beneficiarios', [validarToken, validarCampos], getBeneficiarioController);

router.get('/patch-no-beneficiario', [validarToken, validarCampos], patchNoBeneficiarioController);
router.get('/patch-yes-beneficiario', [validarToken, validarCampos], patchYesBeneficiarioController);

router.get('/cutomer-debtor', [validarCampos, validarToken], getCustomerDebtorController);
router.post('/realizar-pagos-proveedores', [validarToken, validarCampos], realizarPagosProveedoresController)

module.exports = router