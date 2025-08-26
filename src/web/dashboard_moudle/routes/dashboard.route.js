const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const { overdueClientsByBranch,
    efectividadVentasNormales,
    efectividadVentasNormalesMesAnterior
} = require('../controllers/dashboard.controller')

const router = Router()

router.get('/clientes-morosos', [validarToken, validarCampos], overdueClientsByBranch)

router.get('/efectividad-ventas-normales', [validarToken, validarCampos], efectividadVentasNormales)
router.get('/efectividad-ventas-normales-mes-anterior', [validarToken, validarCampos], efectividadVentasNormalesMesAnterior)


module.exports = router