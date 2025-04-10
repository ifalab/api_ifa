const { 
    vendedoresPorSucCode, getVendedor, getClientesDelVendedor,
    getCicloVendedor,
} = require("./hana.controller")

const vendedoresPorSucCodeController = async (req, res) => {
    try {
        const { sucCode } = req.query
        let response = await vendedoresPorSucCode(sucCode)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador vendedoresPorSucCodeController: ${error.message}` })
    }
}
const getVendedorController = async (req, res) => {
    try {
        const { id } = req.query
        let response = await getVendedor(id)
        if(response.length==0){
            return res.status(400).json({
                mensaje:`No se encontro el usuario con ese id`
            })
        }
        if(response.length==1){
            return res.json(response[0])
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getVendedorController: ${error.message}` })
    }
}
const getClientesDelVendedorController = async (req, res) => {
    try {
        const { id } = req.query
        let response = await getClientesDelVendedor(id)
        
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getClientesDelVendedorController: ${error.message}` })
    }
}

const getCicloVendedorController = async (req, res) => {
    try {
        const { idVendedor, mes, año } = req.body
        return res.json({ idVendedor, mes, año })
        let response = await getCicloVendedor(idVendedor, mes, año)
        
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getCicloVendedorController: ${error.message}` })
    }
}

module.exports = {
    vendedoresPorSucCodeController, getVendedorController, getClientesDelVendedorController,
    getCicloVendedorController
}