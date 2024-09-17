const { Router } = require('express')
const { ventasPorSucursalController } = require('../controller/venta.controller')
const router = Router()

router.get('/sucursales',ventasPorSucursalController)

module.exports = router