const { response } = require("express")
const { findClientesByVendedor, 
    grabarLog
} = require("./hana.controller")

const findClientesByVendedorController = async (req, res) => {
    try {
        const idVendedorSap = req.query.idVendedorSap
        const response = await findClientesByVendedor(idVendedorSap)
        let clientes = [];
        for (const item of response) {
            const { HvMora, CreditLine, AmountDue, ...restCliente } = item;
            const saldoDisponible = (+CreditLine) - (+AmountDue);
            const newData = {
                ...restCliente,
                CreditLine,
                AmountDue,
                mora: HvMora,
                saldoDisponible,
            };
            clientes.push({ ...newData });
        }
        return res.json({ clientes })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: findClientesByVendedorController' })
    }
}

module.exports = {
    findClientesByVendedorController,
}