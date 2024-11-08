const { Router } = require('express')
const { postInventoryEntriesController } = require('../controller/cc.controller')
const checkToken = require('../../../middleware/authMiddleware')

const router = Router()

router.post('/inventory-entries',[checkToken],postInventoryEntriesController)

module.exports = router