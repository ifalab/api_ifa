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
    pedidoLayout,
    pedidosPorVendedorHoy,
    precioArticuloCadena,
    listaPrecioCadenas,
    clientesPorSucursal,
    getAllArticulos,
    articuloDiccionario,
    stockInstitucionPorArticulo
} = require("./hana.controller");
const { postOrden, postQuotations, patchQuotations, getQuotation } = require("../../../movil/ventas_module/controller/sld.controller");
const { findClientesByVendedor, grabarLog } = require("../../shared/controller/hana.controller");
const QRCode = require('qrcode');
const path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf');
const { detalleOfertaCadena } = require("../../ventas_module/controller/hana.controller");

const clientesVendedorController = async (req, res) => {
    try {

        const { name } = req.body;
        const response = await findClientesByVendedor(name);
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

const clientesFacturadorController = async (req, res) => {
    try {

        const { sucCodeList } = req.body;
        let clientes = [];

        for (const code of sucCodeList) {
            const response = await findClientesByVendedor(code);
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
        const cardCode = req.query.cardCode
        const articulos = await findDescuentosArticulos(cardCode)
        return res.json({ articulos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador: ${error.message}` })
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
        const cardCode = req.query.cardCode
        const listaPrecioResponse = await listaPrecioOficial(cardCode)
        return res.json({ listaPrecio: listaPrecioResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || 'Nodefinido'}` })
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
        // console.log({ sugeridos })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ user })
        grabarLog(user.USERCODE, user.USERNAME, "Pedidos sugeridos", "Datos obtenidos con exito", `${sugeridos.query || ''}`, "pedido/sugerido-cliente", process.env.PRD)

        return res.json({ sugeridos: sugeridos.sugeridos })
    } catch (error) {
        console.log({ error })

        const query = error.query || 'No disponible'
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ usuario })
        let mensaje = 'Error en el controlador: sugeridosXClienteController'
        if (error.message) {
            mensaje = error.message
        }
        // Registrar el error en los logs
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedidos sugeridos", mensaje, query, "pedido/sugerido-cliente", process.env.PRD)

        return res.status(500).json({ mensaje })
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
        const alprazolamCode = '102-004-028'
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const docLine = body.DocumentLines
        let alprazolamContains = false
        let otherContains = false
        docLine.map((item) => {
            if (item.ItemCode == alprazolamCode) {
                alprazolamContains = true
            } else {
                otherContains = true
            }
        })
        // return
        if (alprazolamContains && otherContains) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `Error no se puede MEZCLAR ALPRAZOLAM con otros articulos.`, '', "pedido/crear-orden", process.env.PRD)
            return res.status(400).json({ message: `Error no se puede MEZCLAR ALPRAZOLAM con otros articulos.` })
        }
        console.log(JSON.stringify({ docLine, alprazolamContains, otherContains }, null, 2))
        // return
        const ordenResponse = await postOrden(body)

        console.log('crear orden /6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6')
        console.log(JSON.stringify(ordenResponse, null, 2))
        console.log('crear orden /6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6')
        if (ordenResponse.status == 400) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `Error en el proceso postOrden. ${ordenResponse.errorMessage.value || ordenResponse.errorMessage || ordenResponse.message || ''}`, 'https://srvhana:50000/b1s/v1/Orders', "pedido/crear-orden", process.env.PRD)
            return res.status(400).json({ message: `Error en el proceso postOrden. ${ordenResponse.errorMessage.value || ordenResponse.errorMessage || ordenResponse.message || ''}` })
        }


        console.log({ usuario })
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", "Orden creada con exito", 'https://srvhana:50000/b1s/v1/Orders', "pedido/crear-orden", process.env.PRD)

        return res.json({ ...ordenResponse })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ usuario })
        const message = `Error en el controlador crearOrderController: ${error.message || ''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `${message || ''}`, '', "pedido/crear-orden", process.env.PRD)

        return res.status(500).json({ message })
    }
}

const crearOrderCadenaController = async (req, res) => {
    const body = req.body
    // console.log(JSON.stringify({ body }, null, 2))
    // return 
    try {
        const alprazolamCode = '102-004-028'
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const docLine = body.DocumentLines
        const docEntry = body.DocEntry

        let alprazolamContains = false
        let otherContains = false
        docLine.map((item) => {
            if (item.ItemCode == alprazolamCode) {
                alprazolamContains = true
            } else {
                otherContains = true
            }
        })
        // return
        if (alprazolamContains && otherContains) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `Error no se puede MEZCLAR ALPRAZOLAM con otros articulos.`, '', "pedido/crear-orden", process.env.PRD)
            return res.status(400).json({ message: `Error no se puede MEZCLAR ALPRAZOLAM con otros articulos.` })

        }
        console.log("body de llegada: =====================================");
        console.log(JSON.stringify({ body }, null, 2))
        // return
        const DocumentLines = []
        let grossTotal = 0
        docLine.map((item) => {
            if (item.BaseLine == -2) {
                const { BaseLine, GrossTotal, BaseEntry, BaseType, ...rest } = item
                DocumentLines.push({ ...rest, LineNum: null, Currency: 'BS' })
                grossTotal += GrossTotal
            }
        })
        // return res.json({ DocumentLines })
        if (!docEntry) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden CAD", `Error no existe el doc entry en la peticion.`, '', "pedido/crear-orden-cad", process.env.PRD)
            return res.status(400).json({ message: `Error no existe el doc entry en la peticion.` })
        } else if (DocumentLines != []) {
            const detalle = await detalleOfertaCadena(+docEntry)
            let newDocTotal = grossTotal
            detalle.data.map((item) => {
                const { subTotal } = item
                const total = parseFloat(subTotal) || 0
                newDocTotal += total
            })
            console.log({ newDocTotal })

            console.log(JSON.stringify({ DocumentLines, docEntry }, null, 2))
            const sapResponse = await patchQuotations(+docEntry, { DocumentLines })
            if (sapResponse.status == 400) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden CAD", `Error del SAP. ${sapResponse.errorMessage.value || 'No definido'}`, '', "pedido/crear-orden-cad", process.env.PRD)
                return res.status(400).json({ message: `Error del SAP. ${sapResponse.errorMessage.value || 'No definido'}` })
            }
            console.log(JSON.stringify({ repsonse: sapResponse.response }, null, 2))
            //---------

            const sapResponse2 = await patchQuotations(+docEntry, { DocTotal: newDocTotal })
            if (sapResponse2.status == 400) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden CAD", `Error del SAP. ${sapResponse2.errorMessage.value || 'No definido'}`, '', "pedido/crear-orden-cad", process.env.PRD)
                return res.status(400).json({ message: `Error del SAP. ${sapResponse2.errorMessage.value || 'No definido'}` })
            }
            console.log(JSON.stringify({ repsonse2: sapResponse2.response }, null, 2))

            // return res.json({ok: '200'})
        }

        // await new Promise(resolve => setTimeout(resolve, 1000));
        const detalle = await detalleOfertaCadena(+docEntry)
        const {
            Series,
            CardCode,
            FederalTaxID,
            DocDate,
            DocDueDate,
            DocEntry,
            JournalMemo,
            PaymentGroupCode,
            U_NIT,
            U_RAZSOC,
            DocTotal,
            SalesPersonCode,
            U_OSLP_ID,
            U_UserCode,
        } = body
        const ordenBody = {
            Series,
            CardCode,
            FederalTaxID,
            DocDate,
            DocDueDate,
            JournalMemo,
            PaymentGroupCode,
            U_NIT,
            U_RAZSOC,
            DocTotal,
            SalesPersonCode,
            U_OSLP_ID,
            U_UserCode,
        }
        // let DocTotal = 0
        if (!detalle) {
            return res.status(400).json({ mensaje: 'Hubo un error al intentar obtener el detalle de la orden.' })
        }
        // detalle.data.map((item) => {
        //     const subTotal = Number(item.subTotal)
        //     DocTotal += Number(subTotal.toFixed(2))
        // })
        // ordenBody.DocTotal = DocTotal
        const DocumentLinesToBody = []
        let idx = 0
        docLine.map((item) => {
            const {
                GrossTotal,
                MeasureUnit,
                Quantity,
                ItemCode,
                GrossPrice,
                WhsCode,
            } = item
            let data = detalle.data.find((item2)=> item2.ItemCode == ItemCode)
            let baseLine = data.LineNum
            const qty = Quantity>data.Quantity? Number(data.Quantity) : Number(Quantity)
            const prcMax = Number(GrossPrice)
            const subTot = Number(GrossTotal)
            const descLin = (prcMax * qty) - subTot
            DocumentLinesToBody.push({
                LineNum: idx,
                ItemCode,
                Currency: 'BS',
                Quantity: qty,
                GrossPrice: prcMax,
                GrossTotal: subTot,
                WarehouseCode: WhsCode,
                AccountCode: '',
                TaxCode: 'IVA',
                MeasureUnit: data.SalUnitMsr || MeasureUnit,
                U_DESCLINEA: Number(descLin.toFixed(2)),
                BaseLine: baseLine,
                BaseEntry: docEntry,
                BaseType: 23,
            })
            idx++
        })

        ordenBody.DocumentLines = DocumentLinesToBody

        // return res.json({ ordenBody, detalle })
        console.log("body de post orden: =====================================");
        console.log(JSON.stringify(ordenBody, null, 2))
        console.log('crear orden /6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6')
        // return res.json({ detalle, DocumentLines, ordenBody })
        const ordenResponse = await postOrden(ordenBody)
        console.log(ordenResponse)
        if (ordenResponse.status == 400) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `Error en el proceso postOrden. ${ordenResponse.errorMessage.value || ordenResponse.errorMessage || ordenResponse.message || ''}`, 'https://srvhana:50000/b1s/v1/Orders', "pedido/crear-orden", process.env.PRD)
            return res.status(400).json({ message: `Error en el proceso postOrden. ${ordenResponse.errorMessage.value || ordenResponse.errorMessage || ordenResponse.message || ''}` })
        }
        console.log({ usuario })
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", "Orden creada con exito", 'https://srvhana:50000/b1s/v1/Orders', "pedido/crear-orden", process.env.PRD)
        return res.json({ ...ordenResponse })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ usuario })
        const message = `Error en el controlador crearOrderController: ${error.message || ''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `${message || ''}`, '', "pedido/crear-orden", process.env.PRD)

        return res.status(500).json({ message })
    }
}

const crearOfertaVentaController = async (req, res) => {
    const body = req.body
    try {
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        // console.log('crear orden /6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6')
        // console.log(JSON.stringify(body, null, 2))
        // console.log('crear orden /6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6/6')
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear oferta", `${mensaje}, ${body}`, 'https://srvhana:50000/b1s/v1/Orders', "pedido/crear-orden", process.env.PRD)
        const response = await postQuotations(body)
        return res.json({ response })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
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
            return res.status(400).json({ mensaje: pedidos.value })
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
            return res.status(400).json({ mensaje: pedidos.value })
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
            return res.status(400).json({ mensaje: pedidos.value })
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
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        // return res.json({response})
        if (response.result.length == 0) {
            grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", 'Error de SAP al crear la nota de Pedido', `${response.query || ''}`, "pedido/pedido-layout", process.env.PRD)
            return res.status(400).json({ mensaje: 'Error de SAP al crear la nota de Pedido' });
        }
        console.log({ response })

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
        docTimeFormatted = `${DocTime}`
        time = `${docTimeFormatted[0] || 0}${docTimeFormatted[1] || 0}:${docTimeFormatted[2] || 0}${docTimeFormatted[3] || 0}`
        console.log({ time })
        console.log({ doctime: docTimeFormatted[1] })
        console.log({ doctime: docTimeFormatted })
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
                grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", `Error al generar el PDF. ${err.message || ''}`, `${response.query || ''}`, "pedido/pedido-layout", process.env.PRD)
                return res.status(500).json({ mensaje: 'Error al generar el PDF' });
            }

            grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", `PDF generado con exito`, `${response.query || ''}`, "pedido/pedido-layout", process.env.PRD)
            // Enviar el PDF en la respuesta
            res.setHeader('Content-Type', 'application/pdf');
            stream.pipe(res);
        });
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const query = error.query || ''
        let mensaje = `Error en el controlador pedidoLayoutController: ${error.message || ''}`;
        if (mensaje.length > 255) {
            grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", 'Error en el controlador: pedidoLayoutController', query, "pedido/pedido-layout", process.env.PRD)
        } else
            grabarLog(user.USERCODE, user.USERNAME, "Ventas Pedidos layout", mensaje, query, "pedido/pedido-layout", process.env.PRD)

        return res.status(500).json({ mensaje })
    }
}

const pedidosPorVendedorHoyController = async (req, res) => {
    try {
        const id_vendedor = req.query.id
        const fecha = req.query.fecha
        console.log(id_vendedor)
        const pedidos = await pedidosPorVendedorHoy(id_vendedor, fecha)

        return res.json({ pedidos })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador:pedidosPorVendedorHoyController' })
    }
}

const pedidoCadenaController = async (req, res) => {
    try {
        const body = req.body
        console.log(JSON.stringify({ body }, null, 2))

        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        body.Series = 343;
        let num = 0
        let sumaDetalle = 0

        body.DocumentLines.forEach((line) => {
            line.LineNum = num
            line.GrossPrice = Number(line.GrossPrice.toFixed(2))
            line.GrossTotal = Number(line.GrossTotal.toFixed(2))
            line.AccountCode = "4110101";
            line.TaxCode = "IVA";
            const totalNoDiscount = line.GrossPrice * line.Quantity
            const descLinea = Number((totalNoDiscount) - line.GrossTotal)
            console.log({ totalNoDiscount })
            line.U_DESCLINEA = Number(descLinea.toFixed(2));
            num++;

            sumaDetalle += Number(line.GrossTotal.toFixed(2))
        })
        console.log({ body })

        body.DocTotal = Number(body.DocTotal.toFixed(2))
        console.log({ body: JSON.stringify(body, 2) })
        sumaDetalle = Number(sumaDetalle.toFixed(2))
        if (body.DocTotal != sumaDetalle) {
            const mensaje = 'El Total no es igual a la suma del detalle'
            grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", mensaje + ` DocTotal: ${body.DocTotal || 0}, SumDetalle: ${sumaDetalle}`, '', "pedido/crear-oferta-venta", process.env.PRD)
            return res.status(400).json({ mensaje })
        }

        const response = await postQuotations(body)
        if (response.status != 200) {
            let mensaje = `${response.message || 'Error en postQuotations'}`
            if (response.errorMessage.value) {
                mensaje += `: ${response.errorMessage.value}`
            } else if (response.errorMessage) {
                mensaje += `: ${response.errorMessage}`
            }
            grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", mensaje, 'https://srvhana:50000/b1s/v1/Quotations', "pedido/crear-oferta-venta", process.env.PRD)
            return res.status(400).json({ mensaje })
        }

        grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", `Oferta de Venta creada con exito`, 'https://srvhana:50000/b1s/v1/Quotations', "pedido/crear-oferta-venta", process.env.PRD)
        return res.json({ mensaje: response.message })
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let mensaje = `Error en controlador pedidoCadenaController ${error.message || ''}`
        if (mensaje.length > 255) mensaje = 'Error en controlador pedidoCadenaController'
        grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", mensaje, '', "pedido/crear-oferta-venta", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const precioArticuloCadenaController = async (req, res) => {
    try {
        const nroLista = req.query.nroLista
        const itemArticulo = req.query.itemArticulo
        const response = await precioArticuloCadena(nroLista, itemArticulo)
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let mensaje = `Error en controlador precioArticuloCadenaController ${error.message || ''}`
        if (mensaje.length > 255) mensaje = 'Error en controlador precioArticuloCadenaController'
        grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", mensaje, '', "pedido/precio-articulo-cadena", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const listaPrecioCadenasController = async (req, res) => {
    try {
        const listaPrecio = await listaPrecioCadenas()
        return res.json(listaPrecio)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'error al traer la lista precios'
        })
    }
}

const clientesSucursalController = async (req, res) => {
    try {
        const { idSucursales } = req.body;
        let clientes = [];
        let response = [];
        for (const id_suc of idSucursales) {
            const clientessucursal = await clientesPorSucursal(id_suc)
            // console.log({ clientessucursal })
            if (clientessucursal.statusCode != 200) {
                return res.status(clientessucursal.statusCode).json({ mensaje: clientessucursal.message || 'Error en clientesPorSucursal' })
            }
            response.push(...clientessucursal.data)
        }
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

const pedidoInstitucionController = async (req, res) => {
    try {
        const {BaseEntry, ...body} = req.body
        console.log({body})
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        
        const oferta = await getQuotation(BaseEntry)
        return res.json(oferta.response)
        
        body.Series = 319;
        let num = 0
        body.DocumentLines.forEach((line) => {
            line.LineNum = num
            line.GrossPrice = Number(line.GrossPrice.toFixed(2))
            line.GrossTotal = Number(line.GrossTotal.toFixed(2))
            line.AccountCode = "4110101";
            line.TaxCode = "IVA";
            const totalNoDiscount = line.GrossPrice * line.Quantity
            const descLinea = Number((totalNoDiscount) - line.GrossTotal)
            console.log({ totalNoDiscount })
            line.U_DESCLINEA = Number(descLinea.toFixed(2));
            num++;
        })
        console.log({ body })
        let sumaDetalle = 0
        body.DocumentLines.forEach((line) => {
            sumaDetalle += Number(line.GrossTotal.toFixed(2))
        })
        body.DocTotal = Number(body.DocTotal.toFixed(2))
        console.log({ body: JSON.stringify(body, 2) })
        sumaDetalle = Number(sumaDetalle.toFixed(2))
        if (body.DocTotal != sumaDetalle) {
            const mensaje = 'El Total no es igual a la suma del detalle'
            grabarLog(user.USERCODE, user.USERNAME, "Pedido Institucion", mensaje + ` DocTotal: ${body.DocTotal || 0}, SumDetalle: ${sumaDetalle}`, '', "pedido/pedido-institucion", process.env.PRD)
            return res.status(400).json({ mensaje })
        }

        console.log({ body })
        const response = await postOrden(body)
        console.log({ response })
        if (response.status != 200 && response.status != 204) {
            let mensaje = `${response.message || 'Error en postOrden'}`
            if (response.errorMessage) {
                mensaje += `: ${response.errorMessage}`
            }
            grabarLog(user.USERCODE, user.USERNAME, "Pedido Institucion", mensaje, 'https://srvhana:50000/b1s/v1/Orders', "pedido/pedido-institucion", process.env.PRD)
            return res.status(400).json({ mensaje })
        }

        grabarLog(user.USERCODE, user.USERNAME, "Pedido Institucion", `Oferta de Venta creada con exito`, 'https://srvhana:50000/b1s/v1/Orders', "pedido/pedido-institucion", process.env.PRD)
        return res.json({ mensaje: response.message, orderNumber: response.orderNumber })
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let mensaje = `Error en controlador pedidoInstitucionController ${error.message || ''}`
        if (mensaje.length > 255) mensaje = 'Error en controlador pedidoInstitucionController'
        grabarLog(user.USERCODE, user.USERNAME, "Pedido Institucion", mensaje, '', "pedido/pedido-institucion", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const getAllArticulosController = async (req, res) => {
    try {
        const itemName = req.query.itemName
        const upercase = itemName.toUpperCase()
        console.log({ upercase }, { itemName })
        const articulos = await getAllArticulos(upercase)
        return res.json(articulos)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador getAllArticulosController: ${error.message}` })
    }
}

const articuloDiccionarioController = async (req, res) => {
    try {
        const cod = req.body.cod
        const codCliente = req.body.codCliente
        console.log({ cod })
        const response = await articuloDiccionario(cod)
        // console.log({response})
        console.log({ response })
        if (codCliente != "C000487" && response.length > 0) {
            console.log("No es igual")
            const responseFiltrado = response.filter(item => {
                const { ItemEq } = item
                return !ItemEq.includes('Y');
            });
            return res.status(200).json(responseFiltrado)
        }

        return res.status(200).json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en el articuloDiccionarioController: ${error.message}`,
            error
        })

    }
}

const stockInstitucionPorArticuloController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const response = await stockInstitucionPorArticulo(itemCode)
        if (response.length > 0) {
            const responseDict = {}
            response.forEach((value) => {
                responseDict[value.WhsCode] = value.Stock
            })
            return res.json(responseDict)
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador stockInstitucionPorArticuloController: ${error.message}` })
    }
}

const pedidoOfertaInstitucionesController = async (req, res) => {
    try {
        const body = req.body
        console.log(JSON.stringify({ body }, null, 2))
        // return res.json({body})
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        body.Series = 343;
        let num = 0
        let sumaDetalle = 0

        body.DocumentLines.forEach((line) => {
            line.LineNum = num
            line.GrossPrice = Number(line.GrossPrice.toFixed(2))
            line.GrossTotal = Number(line.GrossTotal.toFixed(2))
            line.AccountCode = "4110101";
            line.TaxCode = "IVA";
            
            const totalNoDiscount = line.GrossPrice * line.Quantity
            const descLinea = Number((totalNoDiscount) - line.GrossTotal)
            console.log({ totalNoDiscount })
            line.U_DESCLINEA = Number(descLinea.toFixed(2));
            num++;
            sumaDetalle += Number(line.GrossTotal.toFixed(2))
        })
        console.log({ body })

        body.DocTotal = Number(body.DocTotal.toFixed(2))
        console.log({ body: JSON.stringify(body, 2) })
        sumaDetalle = Number(sumaDetalle.toFixed(2))
        if (body.DocTotal != sumaDetalle) {
            const mensaje = 'El Total no es igual a la suma del detalle'
            grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", mensaje + ` DocTotal: ${body.DocTotal || 0}, SumDetalle: ${sumaDetalle}`, '', "pedido/crear-oferta-venta", process.env.PRD)
            return res.status(400).json({ mensaje })
        }
        // return res.json(body)
        const response = await postQuotations(body)
        if (response.status != 200) {
            let mensaje = `${response.message || 'Error en postQuotations'}`
            if (response.errorMessage.value) {
                mensaje += `: ${response.errorMessage.value}`
            } else if (response.errorMessage) {
                mensaje += `: ${response.errorMessage}`
            }
            grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", mensaje, 'https://srvhana:50000/b1s/v1/Quotations', "pedido/crear-oferta-venta", process.env.PRD)
            return res.status(400).json({ mensaje })
        }

        const docEntry = response.orderNumber
        const detalle = await detalleOfertaCadena(+docEntry)
        return res.json({response,detalle,body})

        // grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", `Oferta de Venta creada con exito`, 'https://srvhana:50000/b1s/v1/Quotations', "pedido/crear-oferta-venta", process.env.PRD)
        // return res.json({ mensaje: response.message })
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let mensaje = `Error en controlador pedidoCadenaController ${error.message || ''}`
        if (mensaje.length > 255) mensaje = 'Error en controlador pedidoCadenaController'
        grabarLog(user.USERCODE, user.USERNAME, "Oferta Ventas", mensaje, '', "pedido/crear-oferta-venta", process.env.PRD)
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
    crearOfertaVentaController,
    clientesFacturadorController,
    pedidosPorVendedorHoyController,
    pedidoCadenaController,
    precioArticuloCadenaController,
    listaPrecioCadenasController,
    clientesSucursalController,
    pedidoInstitucionController,
    crearOrderCadenaController,
    getAllArticulosController,
    articuloDiccionarioController,
    stockInstitucionPorArticuloController,
    pedidoOfertaInstitucionesController,
}