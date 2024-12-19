const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { clientesVendedorController } = require('../controller/pedido.controller')
const router = Router()

router.post('/cliente-vendedor', [validarToken, validarCampos], clientesVendedorController)

module.exports = router