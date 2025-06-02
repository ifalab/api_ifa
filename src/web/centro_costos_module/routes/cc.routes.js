const { Router } = require('express')
const { postInventoryEntriesController, actualizarAsientoContablePreliminarCCController, getPDFAsientoContableCC, getCuentasCC, getLibroMayor, excelLibroMayor, docFuentes, cargarPlantillaDimensiones, recuperarPlantillaDimensiones, clasificacionGastos, saveDocFuentes, getAsientoContableCCById, cargarPlantillaMasivaDimensiones, reservarAsientoId, beneficiarios, getLibroMayorFiltrado, asientosContadoSAP } = require('../controller/cc.controller')
const checkToken = require('../../../middleware/authMiddleware')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const router = Router()

router.post('/inventory-entries',[checkToken],postInventoryEntriesController)
router.patch('/preliminar/actualizar-asiento-contable-centro-costo/:id', [validarToken, validarCampos], actualizarAsientoContablePreliminarCCController);

router.post('/pdf/asiento-contable-cc', [validarToken, validarCampos], getPDFAsientoContableCC);
router.get('/cuentas', [validarToken, validarCampos], getCuentasCC);
router.get('/libro-mayor', [validarToken, validarCampos], getLibroMayor);
router.post('/libro-mayor-filtrado', [validarToken, validarCampos], getLibroMayorFiltrado);
router.post('/excel/libro-mayor', [validarToken, validarCampos], excelLibroMayor);
router.get('/documentos-fuentes', [validarToken, validarCampos], docFuentes);

router.post('/plantilla-dimensiones', [validarToken, validarCampos], cargarPlantillaDimensiones);
router.post('/plantilla-dimensiones-masivas', [validarToken, validarCampos], cargarPlantillaMasivaDimensiones);
router.get('/plantilla-dimensiones', [validarToken, validarCampos], recuperarPlantillaDimensiones);
router.get('/clasificacion-gastos', [validarToken, validarCampos],clasificacionGastos)
router.post('/documentos-fuentes', [validarToken, validarCampos], saveDocFuentes)
router.get('/as-by-id', [validarToken, validarCampos], getAsientoContableCCById)

router.get('/reservar/cc/id', [validarToken, validarCampos], reservarAsientoId)
router.get('/beneficiarios', [validarToken, validarCampos], beneficiarios)
router.get('/asientos/sap', [validarToken, validarCampos], asientosContadoSAP)

module.exports = router