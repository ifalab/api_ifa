const { Router } = require('express')
const { parteDiaroController, abastecimientoController, abastecimientoMesActualController, parteDiaroMesActualController } = require('../controller/finanzas.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.post('/parte-diaria', [validarToken, validarCampos],parteDiaroController)
router.post('/abastecimiento',[validarToken, validarCampos], abastecimientoController)
router.get('/abastecimiento-mes-actual',[validarToken, validarCampos], abastecimientoMesActualController)
router.get('/parte-diario-mes-actual',[validarToken, validarCampos], parteDiaroMesActualController)

module.exports = router