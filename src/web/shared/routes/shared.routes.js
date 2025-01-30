const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { findClientesByVendedorController, listaEncuestaController, 
    crearEncuestaController, resultadosEncuestaController} = require('../controller/shared.controller')
const router = Router()

router.get('/clientes-vendedor', [validarToken, validarCampos], findClientesByVendedorController)
router.get('/encuestas', [validarToken, validarCampos], listaEncuestaController)
router.post('/crear-encuesta', [validarToken, validarCampos], crearEncuestaController)
router.get('/result-encuestas', [validarToken, validarCampos], resultadosEncuestaController)

module.exports = router