const { Router } = require('express')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')

const { overdueClientsByBranch,
    efectividadVentasNormales,
    efectividadVentasNormalesMesAnterior,
    obtenerVisitasFueraDeRutaController,
    getVendedoresSucController,
    getClientesPorVendedor,
    insertMetricLaapController
} = require('../controllers/dashboard.controller')

const router = Router()

router.get('/clientes-morosos', [validarToken, validarCampos], overdueClientsByBranch)

router.get('/efectividad-ventas-normales', [validarToken, validarCampos], efectividadVentasNormales)
router.get('/efectividad-ventas-normales-mes-anterior', [validarToken, validarCampos], efectividadVentasNormalesMesAnterior)

router.get('/obtener-visitas-fuera-ruta', [validarToken, validarCampos], obtenerVisitasFueraDeRutaController)

router.get('/get-vendedores', [validarToken, validarCampos], getVendedoresSucController)
router.get('/clientes-by-vendedor', [validarToken, validarCampos], getClientesPorVendedor)

router.post('/metricas', [validarToken, validarCampos], insertMetricLaapController)


module.exports = router