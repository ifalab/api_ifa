const { findClientePorVendedor, findDescuentosArticulos, findDescuentosArticulosCatalogo, findDescuentosCondicion, findDescuentosLineas } = require("./hana.controller")

const sync = async (req, res) => {
    try {
        const { name } = req.body
        const clientes = await findClientePorVendedor(name)
        const descuentosArticulos = await findDescuentosArticulos()
        const descuentosCondicion = await findDescuentosCondicion()
        const descuentosLineas = await findDescuentosLineas()
        const catalogo = await findDescuentosArticulosCatalogo()
        return res.json({ clientes, catalogo, descuentosArticulos, descuentosCondicion, descuentosLineas })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en la sincronizacion' })
    }
}
module.exports ={ sync }