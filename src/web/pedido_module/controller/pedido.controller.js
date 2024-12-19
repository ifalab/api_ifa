const { response } = require("express")
const { findClientePorVendedor } = require("./hana.controller")

const clientesVendedorController = async (req, res) => {
    try {
        
        const { name } = req.body
        const response = await findClientePorVendedor(name)
        
        let clientes = []

        response.map((item) => {
            const { CreditLine, AmountDue, ...restCliente } = item
            const saldoDisponible = (+CreditLine) - (+AmountDue)
            const newData = {
                ...restCliente,
                CreditLine,
                AmountDue,
                saldoDisponible
            }
            clientes.push({...newData})
        })
        return res.json({ clientes })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

module.exports = {
    clientesVendedorController,
}