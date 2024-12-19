const { findClientePorVendedor } = require("./hana.controller")

const clientesVendedorController = async (req, res) => {
    try {

        const { name } = req.body
        const clientes = await findClientePorVendedor(name)
        return res.json({ clientes })

    } catch (error) {
        
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })

    }
}

module.exports = {
    clientesVendedorController,
}