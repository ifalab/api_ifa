
const bcrypt = require('bcryptjs')
const { generarToken } = require("../../../helpers/generar_token.helper");
const { loginUser, createUser } = require("./hana.controller")

const authLoginPost = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ mensaje: 'Faltan credenciales' });
        }

        const responseHana = await loginUser(username, password)
        if (responseHana.mensaje) return res.status(404).json({ mensaje: responseHana.mensaje })
        const user = responseHana
        console.log('login ejecutado con exito')
        if (user.Active !== 'Y') return res.status(401).json({ mensaje: 'el usuario no esta autorizado a entrar en el sistema' })
        const token = await generarToken(user.UserCode)
        return res.status(200).json({...user,token})

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en auth/login',
            error
        })
    }
}

const authLoginV2=async(req,res)=>{
    try {
        
    } catch (error) {
        console.log({error})
    }
}

const createUserController =async(req,res)=>{
    try {
        const {
            usercode,
            username,
            pass,
            confirm_pass,
            superuser,
            etiqueta,
        } = req.body

        if(pass !== confirm_pass){
            return res.status(400).json({mensaje:'las contraseñas son distintas'})
        }
        const salt = bcrypt.genSaltSync()
        const encryptPassword = bcrypt.hashSync(pass, salt)
        const result = await createUser(
            usercode,
            username,
            encryptPassword,
            superuser,
            etiqueta,)
        const response = result[0]
        const value = response["response"]
        console.log({response})
        console.log({value})
        if(value == 409){
            return res.status(409).json({mensaje:'el usuario ya existe'})
        }else{
            if(value == 200){
                return res.status(200).json({mensaje:'el usuario se creo con exito'})
            }else{
                return res.status(500).json({mensaje:'error no controlado'})
            }
        }
    } catch (error) {
        console.log({error})
        return res.json({
            mensaje:"error en create user controller",
            error
        })
    }
}


module.exports = { 
    authLoginPost,
    createUserController
 }