const { Router } = require('express')
const { authLoginPost, createUserController } = require('../controllers/auth.controller')

const router = Router()

router.post('/login', authLoginPost)
router.post('/create-user', createUserController)

module.exports = router