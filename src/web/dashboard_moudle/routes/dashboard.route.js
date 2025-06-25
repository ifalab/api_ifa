const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const { overdueClientsByBranch,
} = require('../controllers/dashboard.controller')

const router = Router()

router.get('/clientes-morosos', [validarToken, validarCampos], overdueClientsByBranch)

module.exports = router