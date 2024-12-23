const { response } = require("express")
const { findClientePorVendedor,
    clientesMora,
    moraCliente,
    findDescuentosArticulosCatalogo,
    findDescuentosArticulos,
    listaPrecioOficial,
    findDescuentosLineas,
    findDescuentosCondicion,
    pedidoSugeridoXZona,
    pedidoSugeridoXCliente,
    findZonasXVendedor,
} = require("./hana.controller");
const { postOrden } = require("../../../movil/ventas_module/controller/sld.controller");
const { findClientesByVendedor } = require("../../shared/controller/hana.controller");

const clientesVendedorController = async (req, res) => {
    try {

        const { name } = req.body;
        const response = await findClientesByVendedor(name);

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

const descuentoCondicionController = async (req, res) => {
    try {
        const condicion = await findDescuentosCondicion()
        return res.json({ condicion })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const listaPreciosOficilaController = async (req, res) => {
    try {
        const noDiscount = req.query.noDiscount
        const listaPrecioResponse = await listaPrecioOficial()
        let descuentosLinea = []
        descuentosLinea = await findDescuentosLineas()
        // return res.json({descuentosLinea})
        listaDescLinea = procesarListaCodigo(descuentosLinea)
        let listaPrecio = []
        // return res.json({listaPrecioResponse})
        listaPrecioResponse.map((item) => {
            const desc = descuentosLinea.find(itemLinea => itemLinea.LineItemName === item.LineItemName)
            if (noDiscount == 'Y') {
                if (desc) {
                    listaPrecio.push({ ...item, descEsp: +desc.Desc})
                } else {
                    listaPrecio.push({ ...item, descEsp: 0 })
                }
            } else {
                listaPrecio.push({ ...item, descEsp: 0 })
            }
        })
        // return res.json({ listaDescLinea})
        return res.json({ listaPrecio })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const procesarListaCodigo = (descuentos) => {
    let lista = []
    descuentos.map((item) => {
        lista.push(item.LineItemCode)
    })
    return lista
}

const sugeridosXZonaController = async (req, res) => {
    try {
        const zoneCode = req.query.zoneCode
        const sugeridos = await pedidoSugeridoXZona(zoneCode)
        return res.json({ sugeridos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: sugeridosXZonaController' })
    }
}

const sugeridosXClienteController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const sugeridos = await pedidoSugeridoXCliente(cardCode)
        return res.json({ sugeridos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador:sugeridosXClienteController' })
    }
}

const findZonasXVendedorController = async (req, res) => {
    try {
        const idVendedorSap = req.query.idVendedorSap
        const zonas = await findZonasXVendedor(idVendedorSap)
        return res.json({ ...zonas })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador:findZonasXVendedorController' })
    }
}

const crearOrderController = async (req, res) => {
    try {
        const body = req.body
        console.log(body)
        const ordenResponse = await postOrden(body)
        if(ordenResponse.lang)
            return res.status(400).json({ ...ordenResponse })
        return res.json({ ...ordenResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador:crearOrderController' })
    }
    
}

module.exports = {
    clientesVendedorController,
    clientesMoraController,
    moraController,
    catalogoController,
    descuentoArticuloController,
    listaPreciosOficilaController,
    descuentoCondicionController,
    sugeridosXZonaController,
    sugeridosXClienteController,
    findZonasXVendedorController,
    crearOrderController,
}