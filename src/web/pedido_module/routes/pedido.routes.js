const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { clientesVendedorController, clientesMoraController, moraController, catalogoController, descuentoArticuloController, listaPreciosOficilaController } = require('../controller/pedido.controller')
const router = Router()

router.post('/cliente-vendedor', [validarToken, validarCampos], clientesVendedorController)
router.get('/cliente-mora', [validarToken, validarCampos], clientesMoraController)
router.get('/mora', [validarToken, validarCampos], moraController)
router.get('/catalogo', [validarToken, validarCampos], catalogoController)
router.get('/descuento-articulo', [validarToken, validarCampos], descuentoArticuloController)
router.get('/lista-precio', [validarToken, validarCampos],listaPreciosOficilaController)

module.exports = router