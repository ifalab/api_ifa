const { Router } = require('express')
const { authLoginPost } = require('../controllers/auth.controller')

const router = Router()

router.post('/login', authLoginPost)

module.exports = router