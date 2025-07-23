const jwt = require('jsonwebtoken')

const generarToken = (UserCode = '', expiresInDuration = '24h') => {
    return new Promise((resolve, reject) => {
        const payload = { UserCode }

        jwt.sign(payload, process.env.SECRETORPRIVATEKEY, { expiresIn: expiresInDuration },
            (err, token) => {
                if (err) {
                    console.log(err)
                    reject('no se pudo generar el token')
                } else {
                    resolve(token)
                }
            })
    })
}

module.exports = { generarToken }