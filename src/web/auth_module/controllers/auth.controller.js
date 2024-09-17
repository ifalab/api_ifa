
const { loginUser, ventaGeneral } = require("./hana.controller")

const authLoginPost = async (req, res) => {
    try {
        const { username, password } = req.body

        const responseHana = await loginUser(username, password)
        console.log({username,password})
        if (responseHana.length == 0) return res.status(404).json({ mensaje: 'el usuario no existe' })
        const user = responseHana[0]
        console.log('login ejecutado con exito')
        
        return res.status(200).json({ ...user })
        

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en auth/login',
            error
        })
    }
}


module.exports = { authLoginPost }