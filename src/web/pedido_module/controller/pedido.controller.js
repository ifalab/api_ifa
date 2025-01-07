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
    pedidosPorVendedorPendientes,
    pedidosPorVendedorFacturados,
    pedidosPorVendedorAnulados,
    pedidoLayout
} = require("./hana.controller");
const { postOrden } = require("../../../movil/ventas_module/controller/sld.controller");
const { findClientesByVendedor, grabarLog } = require("../../shared/controller/hana.controller");
const QRCode = require('qrcode');
const path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf');

const clientesVendedorController = async (req, res) => {
    try {

        const { name } = req.body;
        const response = await findClientesByVendedor(name);
        // const clientesWitheList = await clientesMora()
        // let listCardCode = []

        // clientesWitheList.map((item) => {
        //     listCardCode.push(item.CardCode)
        // })
        // return res.json({ response, clientesWitheList })
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
        const cardCode = req.query.cardCode
        const listaPrecioResponse = await listaPrecioOficial(cardCode)
        // return res.json({listaPrecioResponse})
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
                    listaPrecio.push({ ...item, descEsp: +desc.Desc })
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
        const cardCode = req.query.cardCode

        const sugeridos = await pedidoSugeridoXZona(zoneCode, cardCode)
        return res.json({ sugeridos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: sugeridosXZonaController' })
    }
}

const sugeridosXClienteController = async (req, res, next) => {
    try {
        const cardCode = req.query.cardCode
        
        const sugeridos = await pedidoSugeridoXCliente(cardCode)
        console.log({sugeridos})
        const user= req.usuarioAutorizado
        console.log({user})
        grabarLog(user.USERCODE, user.USERNAME, "Pedidos sugeridos", "Datos obtenidos con exito", sugeridos.query, "pedido/sugerido-cliente", process.env.PRD )

        return res.json({ sugeridos: sugeridos.sugeridos })
    } catch (error) {
        console.log({ error })

        const query = error.query || 'No disponible'
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({usuario})
        let mensaje = 'Error en el controlador: sugeridosXClienteController'
        if (error.message) {
            mensaje = error.message
        }
        // Registrar el error en los logs
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedidos sugeridos", mensaje, query, "pedido/sugerido-cliente", process.env.PRD)

        return res.status(500).json(mensaje)
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
    const body = req.body
    try {
        const ordenResponse = await postOrden(body)
        console.log({ ordenResponse })
        const usuario= req.usuarioAutorizado
        console.log({usuario})
        if (ordenResponse.status == 400) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `${ordenResponse.errorMessage.value}, ${body}`, 'https://srvhana:50000/b1s/v1/Orders', "pedido/crear-orden", process.env.PRD)
            return res.status(400).json({ mensaje: ordenResponse.errorMessage.value })
        }
        
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `Orden creada con exito, ${body}`, 'https://srvhana:50000/b1s/v1/Orders', "pedido/crear-orden", process.env.PRD)

        return res.json({ ...ordenResponse })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({usuario})
        let mensaje = 'Error en el controlador: crearOrderController'
        if (error.message) {
            mensaje = error.message
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `${mensaje}, ${body}`, 'https://srvhana:50000/b1s/v1/Orders', "pedido/crear-orden", process.env.PRD)

        return res.status(500).json({ mensaje })
    }
}

const whiteListController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const clientes = await clientesMora()
        let listCardCode = []

        clientes.map((item) => {
            listCardCode.push(item.CardCode)
        })

        let mora = true
        if (listCardCode.includes(cardCode)) {
            mora = false
        }
        return res.json({ mora })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const pedidosPorVendedorPendientesController = async (req, res) => {
    try {
        const id = req.query.id
        console.log(id)

        const pedidos = await pedidosPorVendedorPendientes(id)
        if (pedidos.lang)
            return res.status(400).json({ message: pedidos.value })
        return res.json({ pedidos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador:pedidosPorVendedorPendientesController' })
    }
}

const pedidosPorVendedorFacturadosController = async (req, res) => {
    try {
        const id = req.query.id
        console.log(id)

        const pedidos = await pedidosPorVendedorFacturados(id)
        if (pedidos.lang)
            return res.status(400).json({ message: pedidos.value })
        return res.json({ pedidos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador:pedidosPorVendedorFacturadosController' })
    }
}

const pedidosPorVendedorAnuladosController = async (req, res) => {
    try {
        const id = req.query.id
        console.log(id)
        const pedidos = await pedidosPorVendedorAnulados(id)
        if (pedidos.lang)
            return res.status(400).json({ message: pedidos.value })
        return res.json({ pedidos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador:pedidosPorVendedorFacturadosController' })
    }
}

const pedidoLayoutController = async (req, res) => {
    try {
        const delivery = req.query.delivery;
        console.log({ delivery })
        const response = await pedidoLayout(delivery)
        const user= req.usuarioAutorizado

        if (response.result.length == 0) {
            grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", 'Error de SAP al crear la nota de Pedido', response.query , "pedido/pedido-layout", process.env.PRD )
            return res.status(400).json({ mensaje: 'Error de SAP al crear la nota de Pedido' });
        }
        console.log({ response })

        // return res.json({ response })

        const detailsList = [];
        const {
            BarCode,
            DocNum,
            USER_CODE,
            U_NAME,
            WhsCode,
            WhsName,
            DocDate,
            DocDueDate,
            CardCode,
            CardName,
            PymntGroup,
            DocTotal,
            DocTime,
            Phone1,
            Address2,
            U_Zona,
            U_Comentario,
            ...restData
        } = response.result[0];

        response.result.map((item) => {
            const { ...restData } = item;
            detailsList.push({ ...restData });
        });
        const docDueDate = DocDueDate;
        console.log("Fecha completa:", docDueDate);
        let time
        // Extraer la hora usando una expresión regular
        const timeMatch = docDueDate.match(/(\d{2}:\d{2})/);
        if (timeMatch) {
            time = timeMatch[0];
            console.log("Hora extraída:", time);
        }

        const data = {
            time,
            DocNum,
            BarCode,
            USER_CODE,
            U_NAME,
            U_N: ``,
            WhsCode,
            WhsName,
            DocDate,
            DocDueDate,
            CardCode,
            CardName,
            PymntGroup,
            DocTotal,
            DocTime,
            Phone1,
            Address2,
            U_Zona,
            U_Comentario,
            detailsList,
        };
        // return res.json({data})
        //! EJS
        const filePath = path.join(__dirname, `nota_pedido_${data.DocNum}.pdf`);
        // Generar el QR Code
        const qrCode = await QRCode.toDataURL(data.BarCode.toString());

        // Renderizar la plantilla EJS a HTML
        const html = await ejs.renderFile(path.join(__dirname, 'notaPedido', 'template.ejs'), { data, qrCode });

        // Configuración para html-pdf
        const options = { format: 'A4', orientation: 'portrait' };

        // Generar el PDF
        pdf.create(html, options).toStream((err, stream) => {
            if (err) {
                console.error('Error al generar el PDF:', err);
                grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", `Error al generar el PDF. ${err.message}`, response.query , "pedido/pedido-layout", process.env.PRD )
                return res.status(500).json({ mensaje: 'Error al generar el PDF' });
            }

            grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", `PDF generado con exito`, response.query , "pedido/pedido-layout", process.env.PRD )
            // Enviar el PDF en la respuesta
            res.setHeader('Content-Type', 'application/pdf');
            stream.pipe(res);
        });
    } catch (error) {
        console.log({ error })
        const user= req.usuarioAutorizado
        let mensaje= error.message||'error en el controlador: pedidoLayoutController';
        if(mensaje.length >5000){
            mensaje= 'Error en el controlador: pedidoLayoutController'
        }
        const query = error.query || 'No disponible'
        grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", mensaje, query , "pedido/pedido-layout", process.env.PRD )
        
        return res.status(500).json({ mensaje })
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
    whiteListController,
    pedidosPorVendedorPendientesController,
    pedidosPorVendedorFacturadosController,
    pedidosPorVendedorAnuladosController,
    pedidoLayoutController,
}