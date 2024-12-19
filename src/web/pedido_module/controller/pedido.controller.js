const { response } = require("express")
const { findClientePorVendedor,
    clientesMora,
    moraCliente,
    findDescuentosArticulosCatalogo,
    findDescuentosArticulos,
    listaPrecioOficial,
} = require("./hana.controller")

const clientesVendedorController = async (req, res) => {
    try {

        const { name } = req.body;
        const response = await findClientePorVendedor(name);

        let clientes = [];

        for (const item of response) {
            const { CreditLine, AmountDue, ...restCliente } = item;
            const saldoDisponible = (+CreditLine) - (+AmountDue);
            const mora = await tieneMora(item.CardCode);
            const newData = {
                ...restCliente,
                CreditLine,
                AmountDue,
                mora,
                saldoDisponible,
            };
            clientes.push({ ...newData });
        }

        return res.json({ clientes });

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const clientesMoraController = async (req, res) => {
    try {
        const clientes = await clientesMora()
        return res.json({ clientes })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const moraController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const mora = await moraCliente(cardCode)
        return res.json({ mora })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
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

const catalogoController = async (req, res) => {
    try {
        const catalogo = await findDescuentosArticulosCatalogo()
        return res.json({ catalogo })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const descuentoArticuloController = async (req, res) => {
    try {
        const articulos = await findDescuentosArticulos()
        return res.json({ articulos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const listaPreciosOficilaController = async (req, res) => {
    try {

        const cardCode = req.query.cardCode
        const noDiscount = req.query.noDiscount
        const listaPrecio = await listaPrecioOficial()
        return res.json({ cardCode, noDiscount, listaPrecio })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

module.exports = {
    clientesVendedorController,
    clientesMoraController,
    moraController,
    catalogoController,
    descuentoArticuloController,
    listaPreciosOficilaController
}