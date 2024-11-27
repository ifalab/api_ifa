const { findClientePorVendedor, findDescuentosArticulos, findDescuentosArticulosCatalogo, findDescuentosCondicion, findDescuentosLineas, moraCliente, clientesMora } = require("./hana.controller")

const sync = async (req, res) => {
    try {
        const { name } = req.body
        const clientesVendedor = await findClientePorVendedor(name)
        if (clientesVendedor.length == 0) return res.status(400).json({ mensaje: 'el vendedor no tiene clientes' })
        let clientes = []

        clientesVendedor.map(async(item)=>{
            const mora = await tieneMora(item.CardCode)
            clientes.push({
                ...item,
                mora
            })
        })
        
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

const moraClienteController = async (req, res) => {
    try {
        const { cardCode } = req.body
        const mora = await tieneMora(cardCode)
        return res.json({ mora, })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en moraClienteController' })
    }
}

const tieneMora = async (cardCode) => {
    const response = await moraCliente(cardCode)
    const clientes = await clientesMora()
    let listCardCode = []

    clientes.map((item) => {
        listCardCode.push(item.CardCode)
    })

    let mora = false
    if (response.length > 0) {
        mora = true

        if (listCardCode.includes(cardCode)) {
            mora = false
        }
    }
    return mora
}

module.exports = {
    sync,
    moraClienteController,
}