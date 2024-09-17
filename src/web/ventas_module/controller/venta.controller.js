const { ventaPorSucursal } = require("./hana.controller")

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


module.exports = {
    ventasPorSucursalController,
}