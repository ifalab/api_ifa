const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const {
    vendedoresPorSucCodeController, getVendedorController, getClientesDelVendedorController,
    getCicloVendedorController
} = require('../controller/planificacion.controller')
const router = Router()

router.get('/vendedores-suc', [validarToken, validarCampos], vendedoresPorSucCodeController)
router.get('/vendedor', [validarToken, validarCampos], getVendedorController)
router.get('/clientes-vendedor', [validarToken, validarCampos], getClientesDelVendedorController)
router.post('/ciclo-vendedor', [validarToken, validarCampos], getCicloVendedorController)

module.exports = router