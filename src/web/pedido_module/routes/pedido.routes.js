const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { clientesVendedorController, clientesMoraController, moraController, catalogoController, descuentoArticuloController, listaPreciosOficilaController, descuentoCondicionController, sugeridosXZonaController, sugeridosXClienteController } = require('../controller/pedido.controller')
const router = Router()

router.post('/cliente-vendedor', [validarToken, validarCampos], clientesVendedorController)
router.get('/cliente-mora', [validarToken, validarCampos], clientesMoraController)
router.get('/mora', [validarToken, validarCampos], moraController)
router.get('/catalogo', [validarToken, validarCampos], catalogoController)
router.get('/regla-articulo', [validarToken, validarCampos], descuentoArticuloController)
router.get('/regla-condicion', [validarToken, validarCampos], descuentoCondicionController)
router.get('/lista-precio', [validarToken, validarCampos],listaPreciosOficilaController)
router.get('/sugerido-zona', [validarToken, validarCampos],sugeridosXZonaController)
router.get('/sugerido-cliente', [validarToken, validarCampos],sugeridosXClienteController)

module.exports = router