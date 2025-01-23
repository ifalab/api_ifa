const jwt = require('jsonwebtoken')
const { findUserByUsercode } = require('../web/auth_module/controllers/hana.controller')

const validarToken = async (req, res, next) => {
    const token = req.header('token')
    if (!token) {
        return res.status(401).json({
            mensaje: 'Usuario no autorizado, se requiere un token en el header (token)'
        })
    }
    try {
        const { UserCode } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
        console.log({UserCode})
        const response = await findUserByUsercode(UserCode)
        const user = response[0]
        console.log({user})
        if (user == undefined || !user) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            })
        }
        if (!user.ISACTIVE) return res.status(401).json({ mensaje: 'el usuario no esta autorizado a entrar en el sistema' })
        req.usuarioAutorizado = user
        next()
    } catch (error) {
        return res.status(401).json({
            mensaje: 'token invalido o manipulado, intente iniciar sesion nuevamente'
        })
    }

}

module.exports = { validarToken }