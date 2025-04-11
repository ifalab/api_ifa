const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const {
    vendedoresPorSucCodeController, getVendedorController, getClientesDelVendedorController,
    getCicloVendedorController, getDetalleCicloVendedorController,
    insertarVisitaController, insertarDetalleVisitaController, insertarCabeceraVisitaController
} = require('../controller/planificacion.controller')
const router = Router()

router.get('/vendedores-suc', [validarToken, validarCampos], vendedoresPorSucCodeController)
router.get('/vendedor', [validarToken, validarCampos], getVendedorController)
router.get('/clientes-vendedor', [validarToken, validarCampos], getClientesDelVendedorController)
router.post('/ciclo-vendedor', [validarToken, validarCampos], getCicloVendedorController)
router.get('/detalle-ciclo-vendedor', [validarToken, validarCampos], getDetalleCicloVendedorController)
router.post('/visita', [validarToken, validarCampos], insertarVisitaController)
router.post('/detalle-visita', [validarToken, validarCampos], insertarDetalleVisitaController)
router.post('/cabecera-visita', [validarToken, validarCampos], insertarCabeceraVisitaController)

module.exports = router