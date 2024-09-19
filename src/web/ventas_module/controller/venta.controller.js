const { ventaPorSucursal, ventasNormales, ventasCadena, ventasInstitucion, ventasUsuario } = require("./hana.controller")

const ventasPorSucursalController = async (req, res) => {
    try {
        const response = await ventaPorSucursal()
        return res.status(200).json(response)
    } catch (error) {
        console.log('error en ventasPorSucursalController')
        console.log({error})
        return res.status(500).json({mensaje:'Error al procesar la solicitud'})
    }
}

const ventasNormalesController = async (req, res) => {
    try {
        const response = await ventasNormales()
        return res.status(200).json(response)
    } catch (error) {
        console.log('error en ventasNormalesController')
        console.log({error})
        return res.status(500).json({mensaje:'Error al procesar la solicitud'})
    }
}

const ventasCadenasController = async (req, res) => {
    try {
        
        const response = await ventasCadena()
        return res.status(200).json(response)
    } catch (error) {
        console.log('error en ventasCadenasController')
        console.log({error})
        return res.status(500).json({mensaje:'Error al procesar la solicitud'})
    }
}

const ventasInstitucionesController = async (req, res) => {
    try {
        const response = await ventasInstitucion()
        return res.status(200).json(response)
    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({error})
        return res.status(500).json({mensaje:'Error al procesar la solicitud'})
    }
}

const ventasUsuarioController = async(req,res)=>{
    try {
        const {userCode, dim1, dim2, dim3, groupBy}=req.body
        const response = await ventasUsuario(
            userCode,
            dim1,
            dim2,
            dim3,
            groupBy,
        )
        return res.status(200).json(response)
    } catch (error) {
        console.log('error en ventasUsuarioController')
        console.log({error})
        return res.status(500).json({mensaje:'Error al procesar la solicitud'})
    }
}

module.exports = {
    ventasPorSucursalController,
    ventasNormalesController,
    ventasCadenasController,
    ventasInstitucionesController,
    ventasUsuarioController,
}