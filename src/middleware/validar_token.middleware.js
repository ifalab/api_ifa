const jwt = require('jsonwebtoken')
const { userById } = require('../controllers/hanaController')

const validarToken = async (req, res, next) => {
    const token = req.header('token')
    if (!token) {
        return res.status(401).json({
            mensaje: 'Usuario no autorizado, se requiere un token en el header (token)'
        })

    }
    const { UserCode } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
    const user = await userById(UserCode)
    if (user == undefined) {
        return res.status(404).json({
            mensaje: 'Usuario no encontrado'
        })
    }
    if (user.Active !== 'Y') return res.status(401).json({ mensaje: 'el usuario no esta autorizado a entrar en el sistema' })
    req.usuarioAutorizado = user
    next()

}

module.exports = { validarToken }