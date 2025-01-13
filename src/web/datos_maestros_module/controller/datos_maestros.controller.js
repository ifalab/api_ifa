const { dmClientes } = require("./hana.controller")

const dmClientesController = async (req, res) => {
    try {
        const SucName = req.query.SucName
        const listaDmClientes = await dmClientes()
        let listaClientes = []
        for (const element of listaDmClientes) {
            if (element.U_SucName == SucName) {
                listaClientes.push(element)
            }
        }
        return res.json(listaClientes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'error en el controlador'
        })
    }
}

module.exports = {
    dmClientesController,
}