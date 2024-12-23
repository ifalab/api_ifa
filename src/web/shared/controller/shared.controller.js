const { response } = require("express")
const { findClientesByVendedor,
} = require("./hana.controller")

const findClientesByVendedorController = async (req, res) => {
    try {
        const idVendedorSap = req.query.idVendedorSap
        const clientes = await findClientesByVendedor(idVendedorSap)
        return res.json({ clientes })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: findClientesByVendedorController' })
    }
}

module.exports = {
    findClientesByVendedorController,
}