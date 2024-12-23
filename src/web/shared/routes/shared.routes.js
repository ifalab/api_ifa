const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { findClientesByVendedorController, } = require('../controller/shared.controller')
const router = Router()

router.get('/clientes-vendedor', [validarToken, validarCampos], findClientesByVendedorController)

module.exports = router