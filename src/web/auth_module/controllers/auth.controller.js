
const bcrypt = require('bcryptjs')
const { generarToken } = require("../../../helpers/generar_token.helper");
const { loginUser, createUser, findAllUser, findUserById, updateUser, desactiveUser, findDimension, addUsuarioDimensionUno, addUsuarioDimensionDos, addUsuarioDimensionTres, findUserByUsercode, dimensionUnoByUser, dimensionDosByUser, dimensionTresByUser, roleByUser, updatePasswordByUser, rollBackDimensionUnoByUser, rollBackDimensionDosByUser, rollBackDimensionTresByUser, activeUser } = require("./hana.controller")

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
        if (!user.ISACTIVE) return res.status(401).json({ mensaje: 'el usuario no esta autorizado a entrar en el sistema' })
        const token = await generarToken(user.UserCode)
        return res.status(200).json({ ...user, token })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en auth/login',
            error
        })
    }
}

const authLoginV2 = async (req, res) => {
    try {
        const { usercode, password } = req.body
        const response = await findUserByUsercode(usercode)
        // return res.json({ response })
        console.log({response})
        if(response.length == 0)return res.status(401).json({ mensaje: 'Por favor revise sus credenciales' })
        const user = response[0]
        const validarPassword = bcrypt.compareSync(password, user.PASSWORD)
        if (!validarPassword) return res.status(401).json({ mensaje: 'No autorizado, la contraseña es distinta' })
        if (!user.ISACTIVE) return res.status(401).json({ mensaje: 'Usted no esta autorizado para entrar al sistema' })
        const token = await generarToken(user.USERCODE)
        const rol = await roleByUser(user.ID)
        const valueRol = rol[0]
        const dimensionUno = await dimensionUnoByUser(user.ID)
        const dimensionDos = await dimensionDosByUser(user.ID)
        const dimensionTres = await dimensionTresByUser(user.ID)
        // return res.json({ UserCode:user.USERCODE })
        return res.json({ user, rol, dimensionUno, dimensionDos, dimensionTres, token })
    } catch (error) {
        console.log({ error })
    }
}

const createUserController = async (req, res) => {
    try {
        const {
            usercode,
            username,
            pass,
            confirm_pass,
            superuser,
            etiqueta,
            dimensionUno,
            dimensionDos,
            dimensionTres
        } = req.body

        console.log({
            usercode,
            username,
            pass,
            confirm_pass,
            superuser,
            etiqueta,
            dimensionUno: [...dimensionUno],
            dimensionDos: [...dimensionDos],
            dimensionTres: [...dimensionTres]
        })

        if (pass !== confirm_pass) {
            return res.status(400).json({ mensaje: 'las contraseñas son distintas' })
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
        const id = response["id"]

        if (value == 409) {
            return res.status(409).json({ mensaje: `el usuario con el usercode: ${usercode}, ya existe` })
        } else {
            if (value == 200) {

                dimensionUno.map(async (item) => {
                    const id_dim = item.ID
                    const responseDim = await addUsuarioDimensionUno(id, id_dim)
                    const valueDim = responseDim["response"]
                    console.log({ valueDim })
                    if (valueDim == 409) {
                        console.log({ mensaje: 'conflicto ya existe dim1 y usuario' })
                    } else {
                        console.log({ mensaje: 'ok' })
                    }
                })

                dimensionDos.map(async (item) => {
                    const id_dim = item.ID
                    const responseDim = await addUsuarioDimensionDos(id, id_dim)
                    const valueDim = responseDim["response"]
                    console.log({ valueDim })
                    if (valueDim == 409) {
                        console.log({ mensaje: 'conflicto ya existe dim1 y usuario' })
                    } else {
                        console.log({ mensaje: 'ok' })
                    }
                })

                dimensionTres.map(async (item) => {
                    const id_dim = item.ID
                    const responseDim = await addUsuarioDimensionTres(id, id_dim)
                    const valueDim = responseDim["response"]
                    console.log({ valueDim })
                    if (valueDim == 409) {
                        console.log({ mensaje: 'conflicto ya existe dim1 y usuario' })
                    } else {
                        console.log({ mensaje: 'ok' })
                    }
                })

                return res.status(200).json({ mensaje: 'el usuario se creo con exito' })
            } else {
                return res.status(500).json({ mensaje: 'error no controlado' })
            }
        }
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: "error en create user controller",
            error
        })
    }
}

const findAllUserController = async (req, res) => {
    try {

        const result = await findAllUser()
        let listUser = []
        result.map((value) => {
            const user = {
                ID: value.ID,
                USERCODE: value.USERCODE,
                USERNAME: value.USERNAME,
                PASSWORD: value.PASSWORD,
                SUPERUSER: value.SUPERUSER,
                ISACTIVE: value.ISACTIVE,
                CREATED_AT: value.CREATED_AT,
                ETIQUETA: value.ETIQUETA,
            }
            listUser.push(user)
        })
        return res.json({ listUser })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: "error en findAllUserController controller",
            error
        })
    }
}

const findUserByIdController = async (req, res) => {
    try {
        const { id } = req.body
        const response = await findUserById(id)
        if (response.length == 0) {
            return res.status(404).json({ mensaje: 'usuario no encontrado' })
        }
        const value = response[0]
        const user = {

            ID: value.ID,
            USERCODE: value.USERCODE,
            USERNAME: value.USERNAME,
            PASSWORD: value.PASSWORD,
            SUPERUSER: value.SUPERUSER,
            ISACTIVE: value.ISACTIVE,
            CREATED_AT: value.CREATED_AT,
            ETIQUETA: value.ETIQUETA,

        }
        return res.json({ ...user })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: "error en findUserByIdController controller",
            error
        })
    }
}

const updateUserController = async (req, res) => {
    try {
        const {
            id_user,
            new_usercode,
            new_username,
            new_pass,
            confirm_pass,
            new_superuser,
            new_isactive,
            new_etiqueta,
            dimensionUno,
            dimensionDos,
            dimensionTres
        } = req.body


        const response = await updateUser(
            id_user,
            new_usercode,
            new_username,
            new_superuser,
            new_isactive,
            new_etiqueta)
        console.log('controller .............................')
        console.log({ response })
        const value = response[0]
        const status = value["response"]

        // const valuePass = responsePass[0]
        // const statusPass = valuePass["response"]
        if (status == 404) return res.status(404).json({ mensaje: 'No se encontro al usuario' })
        if (new_pass) {
            if (new_pass !== confirm_pass) return res.status(400).json({ mensaje: 'las contraseñas son distintas' })
            const salt = bcrypt.genSaltSync()
            const encryptPassword = bcrypt.hashSync(new_pass, salt)
            const responsePass = await updatePasswordByUser(id_user, encryptPassword)
            console.log({ responsePass })
        }



        const rollBackDim1 = await rollBackDimensionUnoByUser(id_user)
        const rollBackDim2 = await rollBackDimensionDosByUser(id_user)
        const rollBackDim3 = await rollBackDimensionTresByUser(id_user)

        console.log({ rollBackDim1 })
        console.log({ rollBackDim2 })
        console.log({ rollBackDim3 })

        dimensionUno.map(async (item) => {
            const id_dim = item.ID
            const responseDim = await addUsuarioDimensionUno(id_user, id_dim)
            const valueDim = responseDim["response"]
            console.log({ valueDim })
            if (valueDim == 409) {
                console.log({ mensaje: 'conflicto ya existe dim1 y usuario' })
            } else {
                console.log({ mensaje: 'ok' })
            }
        })

        dimensionDos.map(async (item) => {
            const id_dim = item.ID
            const responseDim = await addUsuarioDimensionDos(id_user, id_dim)
            const valueDim = responseDim["response"]
            console.log({ valueDim })
            if (valueDim == 409) {
                console.log({ mensaje: 'conflicto ya existe dim1 y usuario' })
            } else {
                console.log({ mensaje: 'ok' })
            }
        })

        dimensionTres.map(async (item) => {
            const id_dim = item.ID
            const responseDim = await addUsuarioDimensionTres(id_user, id_dim)
            const valueDim = responseDim["response"]
            console.log({ valueDim })
            if (valueDim == 409) {
                console.log({ mensaje: 'conflicto ya existe dim1 y usuario' })
            } else {
                console.log({ mensaje: 'ok' })
            }
        })

        return res.json({ status })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en update',
            error
        })
    }
}

const desactiveUserController = async (req, res) => {
    try {
        const { id_user, } = req.body

        const response = await desactiveUser(id_user)
        const value = response[0]
        const status = value["response"]
        if (status == 404) return res.status(404).json({ mensaje: 'No se encontro al usuario' })
        return res.json({ status })
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Error en desactiveUserController',
            error
        })
    }
}

const activeUserController = async (req, res) => {
    try {
        const { id_user, } = req.body

        const response = await activeUser(id_user)
        const value = response[0]
        const status = value["response"]
        if (status == 404) return res.status(404).json({ mensaje: 'No se encontro al usuario' })
        return res.json({ status })
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Error en activeUserController',
            error
        })
    }
}

const findDimensionController = async (req, res) => {
    try {

        const dim = req.params.dim
        const response = await findDimension(dim)
        return res.json({ response })
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Error en findDimensionController',
            error
        })
    }
}

const findAllDimensionUnoByUserController = async (req, res) => {
    try {
        const id = req.params.id
        const dimensionUno = await dimensionUnoByUser(id)
        return res.json({ dimensionUno })
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Error en findDimensionController',
            error
        })
    }
}

const findAllDimensionDosByUserController = async (req, res) => {
    try {
        const id = req.params.id
        const dimensionDos = await dimensionDosByUser(id)
        return res.json({ dimensionDos })
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Error en findDimensionController',
            error
        })
    }
}

const findAllDimensionTresByUserController = async (req, res) => {
    try {
        const id = req.params.id
        const dimensionTres = await dimensionTresByUser(id)
        return res.json({ dimensionTres })
    } catch (error) {
        return res.status(500).json({
            mensaje: 'Error en findDimensionController',
            error
        })
    }
}

module.exports = {
    authLoginPost,
    createUserController,
    findAllUserController,
    findUserByIdController,
    updateUserController,
    desactiveUserController,
    findDimensionController,
    authLoginV2,
    findAllDimensionUnoByUserController,
    findAllDimensionDosByUserController,
    findAllDimensionTresByUserController,
    activeUserController,
}