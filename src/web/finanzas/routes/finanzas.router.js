const { Router } = require('express')
const { parteDiaroController, abastecimientoController, abastecimientoMesActualController, parteDiaroMesActualController, abastecimientoMesAnteriorController, findAllRegionsController, findAllLineController, findAllSublineController } = require('../controller/finanzas.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.post('/parte-diaria', [validarToken, validarCampos], parteDiaroController)
router.post('/abastecimiento', [validarToken, validarCampos], abastecimientoController)
router.get('/abastecimiento-mes-anterior', [validarToken, validarCampos], abastecimientoMesAnteriorController)
router.get('/abastecimiento-mes-actual', [validarToken, validarCampos], abastecimientoMesActualController)
router.get('/parte-diario-mes-actual', [validarToken, validarCampos], parteDiaroMesActualController)
router.get('/find-all-regions', [validarToken, validarCampos], findAllRegionsController)
router.get('/find-all-line', [validarToken, validarCampos], findAllLineController)
router.get('/find-all-subline', [validarToken, validarCampos], findAllSublineController)

module.exports = router