const { Router } = require('express')
const { clientePorDimensionUnoController, almacenesPorDimensionUnoController, postHabilitacionController, inventarioValoradoController, descripcionArticuloController, createQuotationController } = require('../controller/inventario.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.get('/cliente-dimension',[validarToken, validarCampos], clientePorDimensionUnoController)
router.post('/almacen-dimension',[validarToken, validarCampos], almacenesPorDimensionUnoController)
router.post('/habilitacion',[validarToken, validarCampos], postHabilitacionController)
router.get('/inventario-valorado',[validarToken, validarCampos], inventarioValoradoController)
router.post('/descripcion-articulo',[validarToken, validarCampos], descripcionArticuloController)
router.post('/quotation',[validarToken, validarCampos], createQuotationController)


module.exports = router