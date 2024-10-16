const { Router } = require('express')
const { clientePorDimensionUnoController, almacenesPorDimensionUnoController } = require('../controller/inventario.controller')
const router = Router()

router.post('/cliente-dimension', clientePorDimensionUnoController)
router.post('/almacen-dimension', almacenesPorDimensionUnoController)


module.exports = router