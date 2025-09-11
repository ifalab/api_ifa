const { json } = require("express")
const ejs = require('ejs');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');
const { almacenesPorDimensionUno, clientesPorDimensionUno, inventarioHabilitacion, inventarioValorado,
    descripcionArticulo, fechaVencLote, stockDisponible, inventarioHabilitacionDict, stockDisponibleIfavet,
    facturasClienteLoteItemCode, detalleVentas,
    entregaDetallerFactura, detalleParaDevolucion, obtenerEntregaDetalle: obtenerEntregaDetalleDevolucion,
    obtenerDevolucionDetalle,
    getAllAlmacenes,
    entregaDetalleToProsin,
    searchArticulos,
    facturasClienteLoteItemCodeGenesis,
    stockDisponiblePorSucursal,
    clientesBySucCode, getClienteByCardCode,
    devolucionLayout, getDeudaDelCliente,
    findCliente, findClienteInstituciones,
    getAlmacenesSucursal, getStockdeItemAlmacen, getLineaArticulo,
    articuloDiccionario,
    relacionArticulo,
    articulos,
    saveDiccionario,
    tipoSolicitud,
    costoComercialByItemCode,
    tipoCliente,
    solicitudesPendiente,
    detalleSolicitudPendiente,
    reporteDevolucionValorados,
    searchClientes,
    reporteDevolucionCambios, reporteDevolucionRefacturacion, getDevolucionesParaCancelar, getInvoice,
    getEntregasParaCancelar,
    detalleTraslado,
    insertWorkFlowWithCheck,
    selectionBatchPlazo, getReconciliationIdByCN,
    procesoAbastecimiento,
    datosRecepcionTraslado,
    updateOpenqtyTrasladoSolicitud,
    entregasClienteDespachadorCabecera,
    entregasClienteDespachadorDetalle,
    todasSolicitudesPendiente,
    ndcByDateRange,
    getAllWarehousePlantByParams,
    kardexPlant,
    getAllWarehouseCommercialByParams,
    kardexCommercial,
    habilitacionesPorIduser,
    getValoradosPorIdSap,
    getReturnValuesProcess,
    getLotesExpDate,
    getDetailsDocuments,
    getInvoiceByDocNum
} = require("./hana.controller")
const { postSalidaHabilitacion, postEntradaHabilitacion, postReturn, postCreditNotes, patchReturn,
    getCreditNote, getCreditNotes, postReconciliacion, cancelReturn, cancelEntrega, cancelCreditNotes,
    cancelReconciliacion, cancelInvoice,
    patchBatchNumberDetails, getBatchNumberDetails, getIDEntityLote } = require("./sld.controller")
const { postInvoice, facturacionByIdSld, postEntrega, getEntrega, patchEntrega, } = require("../../facturacion_module/controller/sld.controller")
const { grabarLog } = require("../../shared/controller/hana.controller")
const { obtenerEntregaDetalle, lotesArticuloAlmacenCantidad, notaEntrega, createReferenceCreditNotesAndDelivery } = require("../../facturacion_module/controller/hana.controller")
const { spObtenerCUF, spDetalleNDC } = require("../../facturacion_module/controller/sql_genesis.controller")
const { notaDebitoCredito } = require("../../facturacion_module/service/apiFacturacionProsin")
const path = require('path');
const fs = require('fs');
const { facturacionProsin } = require("../../facturacion_module/service/apiFacturacionProsin")
const { getFacturasParaDevolucion, getDetalleFacturasParaDevolucion } = require("./sql_genesis.controller");
const { postInventoryTransferRequests, patchInventoryTransferRequests, postStockTransfer } = require("../../service/sapService");
const { postIncommingPayments } = require("../../cobranzas_module/controller/sld.controller");
const { Result } = require("express-validator");

const clientePorDimensionUnoController = async (req, res) => {
    try {

       
        const list = await clientesPorDimensionUno()
        return res.status(200).json({ list })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en el clientePorDimensionUnoController',
            error
        })

    }
}

const almacenesPorDimensionUnoController = async (req, res) => {
    try {
        const { dimension } = req.body
        const list = []
        for (const iterator of dimension) {
            const result = await almacenesPorDimensionUno(iterator)
            result.map((itemResult) => {
                list.push(itemResult)
            })
        }
        return res.status(200).json({ list })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en el almacenesPorDimensionUnoController',
            error
        })
    }
}

const postHabilitacionController = async (req, res) => {
    try {
        const { userLocal, formulario } = req.body
        let code = ' '
        let concepto = ''
        let inventario = ''
        let warehouseCode = ''
        const user = req.usuarioAutorizado
        let id = ''
        if (formulario.concepto !== null) concepto = formulario.concepto
        if (formulario.cliente) {
            if (formulario.cliente != null) code = formulario.cliente.CardCode
        }
        if (formulario.inventario !== null) inventario = formulario.inventario

        if (formulario.almacen == null) {
            grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error, el inventario es obligatorio. ${formulario.almacen || 'No definido'}`, ``, "inventario/habilitacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'El almacen es obligatorio' })
        } else {
            if (formulario.almacen.WhsCode) {
                warehouseCode = formulario.almacen.WhsCode
                grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error, el almacen es obligatorio`, ``, "inventario/habilitacion", process.env.PRD)
            } else {
                return res.status(400).json({ mensaje: 'El almacen es obligatorio' })
            }

        }

        if (userLocal.user) {
            if (userLocal.user.ID_SAP) {
                id = userLocal.user.ID_SAP
            } else {
                return res.status(400).json({ mensaje: 'El usuario es obligatorio, no tiene ID SAP' })
            }
        } else {
            return res.status(400).json({ mensaje: 'El usuario es obligatorio' })
        }

        let listItem = []
        let index = 0

        for (const item of inventario) {
            console.log({ item })
            if (!item.articulo || item.articulo == null || item.articulo == '') {
                grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error, El codigo del articulo es obligatorio. ${item.articulo || 'No definido'}`, ``, "inventario/habilitacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'El codigo del articulo es obligatorio' })
            }

            if (!item.articuloDict || item.articuloDict == null || item.articuloDict == '') {
                grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error, El codigo del articulo es obligatorio. ${item.articuloDict || 'No definido'}`, ``, "inventario/habilitacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'El codigo del articulo EQUIVALENTE es obligatorio' })
            }

            if (!item.lote || item.lote == null || item.lote == '') {
                grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error, El codigo del articulo es obligatorio. ${item.lote || 'No definido'}`, ``, "inventario/habilitacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'El lote es obligatorio' })
                break
            }

            if (!item.cantidadIngreso || item.cantidadIngreso == null || item.cantidadIngreso <= 0) {
                return res.status(400).json({ mensaje: 'La cantidad por ingreso debe ser mayor a cero' })
                break
            }

            const itemInventario = {
                "ItemCode": `${item.articulo}`,
                "WarehouseCode": `${warehouseCode}`,
                "Quantity": `${item.cantidadIngreso}`,
                "U_DIM_ARTICULO": `${item.articuloDict}`,
                "AccountCode": "1130201",
                "BatchNumbers": [
                    {
                        "BatchNumber": `${item.lote}`,
                        "Quantity": `${item.cantidadIngreso}`,
                        "BaseLineNumber": index,
                        // "UoMCode": `${item.unidad}`,
                        "ItemCode": `${item.articulo}`
                    }
                ]
            }

            index++
            console.log({ itemInventario })
            itemInventario["BatchNumbers"].map((itemBatch) => {
                console.log({ itemBatch })
            })
            listItem.push(itemInventario)
        }

        const data = {
            "U_CardCode": `${code}`,
            "U_Tipo_salidas": "033",
            "Reference1": null,
            "Reference2": null,
            "Comments": `${concepto}`,
            "JournalMemo": "Salida por Habilitacion",
            "U_UserCode": `${id}`,
            "DocumentLines": listItem
        }


        const response = await postSalidaHabilitacion(data)

        console.log('postSalidaHabilitacion ejecutado')
        console.log({ response })
        if (response.lang) {
            console.log({ response })
            const responseValue = response.value;
            grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error del SAP en postSalidaHabilitacion, ${response.value || 'No definido'}`, `https://srvhana:50000/b1s/v1/InventoryGenExits`, "inventario/habilitacion", process.env.PRD)
            if (responseValue.includes('Batch/serial number') && responseValue.includes('does not exist; specify a valid batch/serial number')) {
                return res.status(400).json({ mensaje: 'Hubo un Lote Incorrecto' });
            }
            // responseValue.includes('Quantity falls into negative inventory')
            if (responseValue.includes('Quantity falls into negative inventory')) {
                return res.status(400).json({ mensaje: 'El inventario es negativo' });
            }

            if (responseValue.includes('No matching records found')) {
                return res.status(400).json({ mensaje: 'Codigo no encontrado' });
            }
            if (response.value === `Update the exchange rate  , 'USD'`) {
                return res.status(400).json({ mensaje: 'Actualizacion USD, vuelva a intentarlo mas tarde' });
            }
            //
            // Si no coincide con ninguno de los mensajes anteriores
            return res.status(400).json({ response });
        }
        //todo PROCESO ENTREGA con id salida:

        const orderNumber = response.orderNumber
        console.log({ orderNumber })
        const responseHana = await inventarioHabilitacion(orderNumber)
        // return res.json({responseHana})
        console.log('inventarioHabilitacion')
        // const lote = await fechaVencLote('1231231313213213')
        // if(lote.length==0){
        //     return res.status(400).json({ mensaje: 'el lote no se encontro' });
        // }
        console.log({ responseHana })
        const cabecera = {
            // DocEntry: responseHana[0].DocEntry,
            Reference2: responseHana[0].Ref2,
            U_CardCode: responseHana[0].U_CardCode,
            U_Tipo_entradas: responseHana[0].U_Tipo_entradas,
            Comments: responseHana[0].Comments,
            U_UserCode: responseHana[0].U_UserCode,
            JrnlMemo: responseHana[0].JrnlMemo,
        }
        const DocumentLines = []

        responseHana.map(async (item) => {
            const BatchNumbers = []
            const batch = {
                BatchNumber: item.BatchNumber,
                Quantity: item.Quantity,
                BaseLineNumber: item.DocLineNum,
                ItemCode: item.ItemCode,
                ExpiryDate: item.ExpiryDate,
            }

            BatchNumbers.push(batch)
            //? item code por articuloDict
            const linea = {
                DocLineNum: item.DocLineNum,
                ItemCode: item.ItemCode,
                Dscription: item.Dscription,
                WarehouseCode: item.WhsCode,
                Quantity: item.Quantity,
                Price: item.Price,
                LineTotal: item.LineTotal,
                AccountCode: item.AccountCode,
                BatchNumbers
            }

            DocumentLines.push(linea)
        })

        const dataFinal = {
            ...cabecera,
            DocumentLines
        }
        console.log({ dataFinal })
        // return res.json({ dataFinal})
        const responseEntradaHabilitacion = await postEntradaHabilitacion(dataFinal)
        console.log('respuesta post entrada habilitacion')
        console.log({ responseEntradaHabilitacion })
        console.log({ value: responseEntradaHabilitacion.value })
        console.log({ lang: responseEntradaHabilitacion.lang })
        const { status } = responseEntradaHabilitacion
        if (status == undefined || status !== 204) {
            grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error. Habilitacion incompleta, entrada no realizada: ${responseEntradaHabilitacion.value || responseEntradaHabilitacion.errorMessage || responseEntradaHabilitacion.errorMessage.value || ''}`, ``, "inventario/habilitacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'Habilitacion incompleta, entrada no realizada' });
        }
        return res.json({ responseEntradaHabilitacion })
    } catch (error) {
        console.error(error)
        const user = req.usuarioAutorizado || { USERCODE: 'No definido', USERNAME: 'No definido' }
        grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error en postSalidaController: ${error.message}`, `catch del controlador`, "inventario/habilitacion", process.env.PRD)
        return res.status(500), json({
            mensaje: `Error en postSalidaController: ${error.message}`,
            error,
        })
    }
}

const inventarioValoradoController = async (req, res) => {
    try {
        const inventario = await inventarioValorado()
        return res.json({ inventario })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en inventarioValoradoController: ${error.message}` })
    }
}

const descripcionArticuloController = async (req, res) => {
    try {
        const { itemCode } = req.body
        const response = await descripcionArticulo(itemCode)
        if (response.length == 0) return res.status(404).json({ mensaje: 'El articulo no fue encontrado' })
        return res.json(response[0])
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en descripcionArticuloController: ${error.message}` })
    }
}

const createQuotationController = async (req, res) => {
    try {
        const { CardCode, DocumentLines } = req.body
        const sapResponse = await createQuotation({ CardCode, DocumentLines })
        console.log({ sapResponse })
        if (sapResponse.value) return res.status(400).json({ messageSap: `${sapResponse.value}` })
        const response = {
            status: sapResponse.status || 200,
            statusText: sapResponse.statusText || ''
        }
        return res.json({ ...response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en createQuotationController' })
    }
}

const fechaVenLoteController = async (req, res) => {
    try {
        const lotep = '22284'
        const lote = await fechaVencLote(lotep)
        return res.json({ lote })
    } catch (error) {
        console.log({ error })

        return res.status(500).json({ mensaje: 'error' })
    }
}

const stockDisponibleController = async (req, res) => {
    try {
        const stock = await stockDisponible();
        const toCamelCase = (str) =>
            str
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
                .replace(/\.$/, '')

        const formattedStock = stock.map(item => {
            const formattedItem = {};
            Object.keys(item).forEach(key => {
                const newKey = toCamelCase(key);
                formattedItem[newKey] = item[key];
            });
            return formattedItem;
        });

        formattedStock.map((item) => {
            const {
                santaCruz,
                sczTransito,
                montero,
                mtroTransito,
                laPaz,
                lpzTransito,
                elAlto,
                altoTransito,
                cochabamba,
                cbbaTransito,
                quillacollo,
                quillTransito,
                tropico,
                tropTransito,
                tarija,
                tjaTransito,
                sucre,
                scrTransito,
                trinidad,
                tddTransito,
                amazonia,
                amazTransito,
                oruro,
                oruTransito,
                potosi,
                ptsTransito,
                pando,
                panTransito,
                plDespacho,
                plTransito,
                productoTerminado,
            } = item

            item.total = Number(santaCruz)
                + Number(sczTransito)
                + Number(montero)
                + Number(laPaz)
                + Number(mtroTransito)
                + Number(lpzTransito)
                + Number(elAlto)
                + Number(altoTransito)
                + Number(cochabamba)
                + Number(cbbaTransito)
                + Number(quillacollo)
                + Number(quillTransito)
                + Number(tropico)
                + Number(tropTransito)
                + Number(tarija)
                + Number(tjaTransito)
                + Number(sucre)
                + Number(scrTransito)
                + Number(trinidad)
                + Number(tddTransito)
                + Number(amazonia)
                + Number(amazTransito)
                + Number(oruro)
                + Number(oruTransito)
                + Number(potosi)
                + Number(ptsTransito)
                + Number(pando)
                + Number(panTransito)
                + Number(plDespacho)
                + Number(plTransito)
                + Number(productoTerminado)
        })
        return res.json({ stock: formattedStock });
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const stockDisponibleIfaController = async (req, res) => {
    try {
        const stockData = await stockDisponible();
        const toCamelCase = (str) =>
            str
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
                .replace(/\.$/, '')

        const formattedStock = stockData.map(item => {
            const formattedItem = {};
            Object.keys(item).forEach(key => {
                const newKey = toCamelCase(key);
                formattedItem[newKey] = item[key];
            });
            return formattedItem;
        });
        let stock = []
        formattedStock.map((item) => {
            if (item.lineitemname != null && item.lineitemname === 'IFA') {
                const {
                    nro,
                    lineitemname,
                    sublineitemname,
                    itemcode,
                    sww,
                    itemname,
                    santaCruz,
                    sczTransito,
                    productoTerminado,
                    total,
                } = item
                stock.push({
                    nro,
                    lineitemname,
                    sublineitemname,
                    itemcode,
                    sww,
                    itemname,
                    santaCruz,
                    sczTransito,
                    productoTerminado,
                    total,
                })
            }
        })
        return res.json({ stock });
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}
const habilitacionDiccionarioController = async (req, res) => {
    try {
        const cod = req.body.cod
        const codCliente = req.body.codCliente
        console.log({ cod })
        const response = await inventarioHabilitacionDict(cod)
        // console.log({response})
        console.log({ response })
        if (codCliente != "C000487") {
            console.log("No es igual")
            const responseFiltrado = response.filter(item => {
                const { ItemEq } = item
                return !ItemEq.includes('Y');
            });

            // for(const item of response){
            //     const {ItemEq} = item
            //     console.log({ItemEq})
            //     if(!ItemEq.includes('Y')){
            //         responseFiltrado
            //     }
            // }
            return res.status(200).json({ response: responseFiltrado })
        }

        return res.status(200).json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en el habilitacionDiccionarioController',
            error
        })

    }
}

const stockDisponibleIfavetController = async (req, res) => {
    try {
        const stock = await stockDisponibleIfavet();
        const toCamelCase = (str) =>
            str
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
                .replace(/\.$/, '')

        const formattedStock = stock.map(item => {
            const formattedItem = {};
            Object.keys(item).forEach(key => {
                const newKey = toCamelCase(key);
                formattedItem[newKey] = item[key];
            });
            return formattedItem;
        });
        const result = []
        formattedStock.map((item) => {
            // if (item.itemcode != '103-012-015' &&
            //     item.itemcode != '103-012-017' &&
            //     item.itemcode != '103-012-016' &&
            //     item.itemcode != '103-005-001' &&
            //     item.itemcode != '103-012-019' &&
            //     item.itemcode != '103-012-018' &&
            //     item.itemcode != '103-011-001' &&
            //     item.itemcode != '103-012-020' &&
            //     item.itemcode != '103-012-022' &&
            //     item.itemcode != '103-012-021' &&
            //     item.itemcode != '103-012-024' &&
            //     item.itemcode != '103-012-023' &&
            //     item.itemcode != '103-012-027' &&
            //     item.itemcode != '103-012-026' &&
            //     item.itemcode != '103-004-003') {
            result.push(item)
            // }
        })
        return res.json({ stock: result });
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const facturasClienteLoteItemCodeController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const cardCode = req.query.cardCode
        const batchNum = req.query.batchNum
        console.log({ itemCode, cardCode, batchNum })
        const response = await facturasClienteLoteItemCode(itemCode, cardCode, batchNum)
        // console.log({ response })
        const responseGenesis = await getFacturasParaDevolucion(cardCode, itemCode, batchNum)
        // console.log({ responseGenesis })
        if (responseGenesis.message) {
            return res.json(response)
        }
        responseGenesis.map(item => {
            item.BatchNum = item.lote
            item.NumAtCard = item.factura
            item.BaseRef = item.nro_cuenta
            item.DocDate = item.fecha_proceso
        })
        // return res.json({ responseGenesis })
        response.push(...responseGenesis)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador facturasClienteLoteItemCodeController: ${error.message || ''}` })
    }
}

const detalleFacturasGenesisController = async (req, res) => {
    try {
        const { nro_cuentas } = req.body
        let responses = {}
        for (const nro_cuenta of nro_cuentas) {
            const response = await getDetalleFacturasParaDevolucion(nro_cuenta)
            // return res.json(response)
            if (response.message) {
                console.log({ response: response.message })
                // return res.json(responses)
            } else {
                response.map(item => {
                    item.DiscPrcnt = item.Porcentaje_Descuento
                    item.ItemCode = item.Articulo
                    item.Dscription = item.NombreArticulo
                    item.Articulo = undefined
                    item.NombreArticulo = undefined
                    item.Quantity = item.Cantidad
                    item.UnitPrice = item.Precio
                    item.DocNum = item.Nro_Cuenta
                    item.Cuf = String(item.cuf).trim()
                    item.cuf = undefined
                    item.NumPerMsr = item.NumInSale
                })
                responses[nro_cuenta] = response
            }
        }
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador detalleFacturasGenesisController: ${error.message || ''}` })
    }
}

const detalleVentasController = async (req, res) => {
    try {
        const id = req.query.id
        let response = await detalleVentas(id)
        if (response.length == 0) {
            response = await getDetalleFacturasParaDevolucion(id)
            // return res.json(response)
            if (response.message) {
                console.log({ response: response.message })
                // return res.json(responses)
            } else {
                response.map(item => {
                    item.DiscPrcnt = item.Porcentaje_Descuento
                    item.ItemCode = item.Articulo
                    item.Dscription = item.NombreArticulo
                    item.Quantity = item.Cantidad
                    item.UnitPrice = item.Precio
                    item.DocNum = item.Nro_Cuenta
                    item.Cuf = String(item.cuf).trim()
                    item.cuf = undefined
                })
            }
        }
        // console.log({ response })
        let cabecera = []
        let detalle = []
        response.forEach((value) => {
            const { DocEntry, BaseEntry, DocNum, DocDate, Cuf, ...rest } = value
            if (cabecera.length == 0) {
                cabecera.push({ DocEntry, BaseEntry, DocNum, DocDate, Cuf })
            }
            detalle.push(rest)
        })
        detalle.sort((a, b) => a.LineNum - b.LineNum);
        const venta = { ...cabecera[0], detalle }


        return res.json(venta)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador detalleVentasController. ${error.message || ''}` })
    }
}

const devolucionCompletaController = async (req, res) => {
    try {
        const startTime = Date.now();
        const { DocEntry: docEntry, Cuf, BaseEntry, id_sap,
            DocDate, Almacen } = req.body
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        if (!docEntry || docEntry <= 0) {
            return res.status(400).json({ mensaje: 'no hay DocEntry en la solicitud' })
        }

        const fechaFormater = new Date(DocDate)
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');
        const formater = `${year}${month}${day}`;
        const entregas = await entregaDetallerFactura(BaseEntry, Cuf, docEntry, formater)
        if (entregas.message) {
            endTime = Date.now()
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${entregas.message || ""}` })
        }
        if (entregas.length == 0) {
            endTime = Date.now()
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Esta factura ${BaseEntry}, no tiene entregas`, entregas })
        }
        const batchEntrega = await obtenerEntregaDetalleDevolucion(docEntry);

        if (batchEntrega.length == 0) {
            return res.status(400).json({ mensaje: 'no hay batchs para el body del portReturn', docEntry, batchEntrega, entregas })
        }
        let batchNumbers = []
        let newDocumentLines = []
        let cabeceraReturn = []
        let numRet = 0
        for (const line of entregas) {

            let newLine = {}
            const {
                ItemCode,
                WarehouseCode,
                Quantity,
                UnitsOfMeasurment,
                LineNum,
                BaseLine: base1,
                BaseType: base2,
                LineStatus,
                BaseEntry: base3,
                TaxCode,
                AccountCode,
                U_B_cuf: U_B_cufEntr,
                U_NIT, U_RAZSOC,
                U_UserCode,
                CardCode: cardCodeEntrega,
                ...restLine
            } = line;

            if (cabeceraReturn.length == 0) {
                cabeceraReturn.push({
                    U_NIT, U_RAZSOC,
                    U_UserCode: id_sap,
                    CardCode: cardCodeEntrega,
                    U_B_cufd: U_B_cufEntr,
                    Series: 352
                })
            }
            const batchData = batchEntrega.filter((item) => item.ItemCode == ItemCode)
            console.log({ batch: batchData })
            if (batchData && batchData.length > 0) {
                // return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}`, batch: batchData ,LineNum});
                let new_quantity = 0
                batchData.map((batch) => {
                    new_quantity = Number(new_quantity) + Number(batch.OutQtyL)
                })
                console.log('------------------------------------------------------------------------------------')
                console.log({ new_quantity, UnitsOfMeasurment })
                console.log('------------------------------------------------------------------------------------')

                //console.log({ batchData })
                batchNumbers = batchData.map(batch => ({
                    BaseLineNumber: numRet,
                    BatchNumber: batch.BatchNum,
                    Quantity: Number(batch.OutQtyL).toFixed(6),
                    ItemCode: batch.ItemCode
                }))

                // const data = {
                //     BaseLine: LineNum,
                //     BaseType: 17,
                //     BaseEntry,
                // }

                newLine = {
                    // ...data,
                    ItemCode,
                    WarehouseCode: Almacen,
                    Quantity: new_quantity / UnitsOfMeasurment,
                    LineNum: numRet,
                    TaxCode: "IVA_GND",
                    AccountCode: "6210103",
                    ...restLine,
                    BatchNumbers: batchNumbers
                };
                newLine = { ...newLine };
                console.log('------newLine-----')
                console.log({ newLine })

                newDocumentLines.push(newLine)
                numRet += 1
            }
        }
        const finalData = {
            // DocDate,
            // DocDueDate,
            ...cabeceraReturn[0],
            DocumentLines: newDocumentLines,
        }

        finalDataEntrega = finalData
        // return res.json(finalDataEntrega)
        const responceReturn = await postReturn(finalDataEntrega)
        // return res.json({responceReturn, finalDataEntrega, newDocumentLines})

        if (responceReturn.status > 300) {
            console.log({ errorMessage: responceReturn.errorMessage })
            let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
            if (mensaje.value)
                mensaje = mensaje.value
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error en postReturn: ${mensaje}`, `postReturn()`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en postReturn: ${mensaje}`, finalDataEntrega })
        }

        const docEntryDev = responceReturn.orderNumber
        const devolucionDetalle = await obtenerDevolucionDetalle(docEntryDev)

        // if(devolucionDetalle.length==0){
        //     return res.status(400).json({mensaje: `No se encontro ninguna devolucion para ${docEntryDev}`,docEntryDev, responceReturn, finalDataEntrega})
        // }

        const cabeceraCN = []
        const DocumentLinesCN = []
        let DocumentAdditionalExpenses = []
        let numDev = 0
        for (const lineDevolucion of devolucionDetalle) {
            const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
                CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
                PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
                ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev,
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev,
                ...restDev
            } = lineDevolucion
            if (cabeceraCN.length == 0) {
                cabeceraCN.push({
                    DocDate: DocDateDev,
                    DocDueDate: DocDueDateDev,
                    CardCode: CardCodeDev,
                    NumAtCard,
                    DocTotal: DocTotalDev,
                    DocCurrency: DocCurrencyDev,
                    Reference1: docEntryDev,// DocEntry de la devolucion
                    Reference2: docEntry ?? '',// DocEntry de la factura
                    Comments: CommentsDev,
                    JournalMemo: JournalMemoDev,
                    PaymentGroupCode,
                    SalesPersonCode,
                    Series: 361,
                    U_UserCode
                })
            }
            if (DocumentAdditionalExpenses.length == 0) {
                DocumentAdditionalExpenses = [
                    { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_GND' },
                    { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_GND' },
                ]
            }

            const newLineDev = {
                LineNum: numDev,
                BaseLine: LineNumDev,
                BaseType: 16,
                BaseEntry: docEntryDev,
                ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev,
                AccountCode: '6210103',
                // AccountCode: AccountCodeDev,
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev,
                TaxCode: 'IVA_GND'
            }

            DocumentLinesCN.push(newLineDev)

            numDev += 1
        }

        const bodyCreditNotes = {
            ...cabeceraCN[0],
            DocumentLines: DocumentLinesCN,
            DocumentAdditionalExpenses
        }
        const responseCreditNote = await postCreditNotes(bodyCreditNotes)

        if (responseCreditNote.status > 299) {
            let mensaje = responseCreditNote.errorMessage
            if (typeof mensaje != 'string' && mensaje.lang) {
                mensaje = mensaje.value
            }

            mensaje = `Error en creditNote: ${mensaje}`

            return res.status(400).json({
                mensaje,
                bodyCreditNotes,
                devolucionDetalle,
                idReturn: responceReturn.orderNumber,
                finalDataEntrega
            })
        }

        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Exito en la devolucion`, ``, "inventario/devolucion-completa", process.env.PRD)
        return res.json({
            idCreditNote: responseCreditNote.orderNumber,
            idReturn: responceReturn.orderNumber,
            bodyCreditNotes,
            finalDataEntrega
        })


    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `${error.message || 'Error en devolucionCompletaController'}`, `Catch controller devolucionCompletaController`, "inventario/devolucion-completa", process.env.PRD)

        return res.status(500).json({ mensaje: `Error en el controlador devolucionCompletaController. ${error.message || ''}` })
    }
}

const pruebaController = async (req, res) => {
    try {
        const body = req.body
        const fechaFormater = new Date()
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');
        const formater = `${year}${month}${day}`;
        const entregaDetalle = await entregaDetallerFactura(body.id, '', 0, formater)
        // const responseReturn = await postReturn(body)
        return res.json({
            entregaDetalle
        })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador pruebaController. ${error.message || ''}` })
    }
}

const getAllAlmacenesController = async (req, res) => {
    try {
        const almacenes = await getAllAlmacenes()
        return res.json(almacenes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en getAllAlmacenesController controller: ${error.message}`
        })
    }
}

const devolucionExcepcionalController = async (req, res) => {
    try {
        const {
            DocEntry,
            BaseEntry,
            Cuf,
            DocDate,
            DocDueDate,
            id_sap,
            Almacen,
            CardCode,
            Detalle
        } = req.body

        console.log({
            DocEntry,
            BaseEntry,
            Cuf,
            DocDate,
            DocDueDate,
            id_sap,
            Almacen,
            Detalle
        })

        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        if (!DocEntry || DocEntry <= 0) {
            return res.status(400).json({ mensaje: 'no hay DocEntry en la solicitud' })
        }

        const fechaFormater = new Date(DocDate)
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');
        const formater = `${year}${month}${day}`;
        const entregas = await entregaDetallerFactura(BaseEntry, Cuf, DocEntry, formater)
        if (entregas.message) {
            endTime = Date.now()
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${entregas.message || ""}` })
        }
        if (entregas.length == 0) {
            endTime = Date.now()
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Esta factura ${BaseEntry}, no tiene entregas`, entregas })
        }
        const batchEntrega = await obtenerEntregaDetalleDevolucion(DocEntry);

        if (batchEntrega.length == 0) {
            return res.status(400).json({ mensaje: 'no hay batchs para el body del portReturn', DocEntry, batchEntrega, entregas })
        }

        let newDocumentLines = []
        let numRet = 0
        // let numBatch = 0
        for (const line of entregas) {
            const detalle = Detalle.find((item) => item.ItemCode == line.ItemCode)
            if (detalle) {
                const { cantidad } = detalle
                const { ItemCode, WarehouseCode, Quantity, UnitsOfMeasurment, LineNum, BaseLine: base1, BaseType: base2, LineStatus, BaseEntry: base3, TaxCode, AccountCode, DocTotal: DocTotalEntr, GrossTotal: GrossTotalEntr, ...restLine } = line;

                const batchData = batchEntrega.filter((item) => item.ItemCode == ItemCode)
                console.log({ batch: batchData })
                if (batchData && batchData.length > 0) {
                    let cantidaUnit = cantidad * Number(UnitsOfMeasurment)
                    let batchNumbers = []
                    for (const batch of batchData) {
                        if (cantidaUnit == 0)
                            break;
                        if (cantidaUnit < Number(batch.OutQtyL)) {
                            batch.new_quantity = cantidaUnit
                        } else {
                            batch.new_quantity = Number(batch.OutQtyL)
                        }
                        cantidaUnit = Number(cantidaUnit) - Number(batch.new_quantity)
                        batchNumbers.push({
                            BaseLineNumber: numRet,
                            BatchNumber: batch.BatchNum,
                            Quantity: batch.new_quantity,
                            ItemCode: batch.ItemCode
                        })
                        // numBatch +=1
                    }
                    console.log('------------------------------------------------------------------------------------')
                    console.log({ UnitsOfMeasurment })
                    console.log('------------------------------------------------------------------------------------')


                    // const data = {
                    //     BaseLine: LineNum,
                    //     BaseType: 17,
                    //     BaseEntry,
                    // }

                    let GrossTotalEntrega = detalle.UnitPriceAfDi * cantidad
                    newLine = {
                        // ...data,
                        ItemCode: detalle.newItemCode,
                        WarehouseCode: Almacen,
                        Quantity: cantidad,
                        LineNum: numRet,
                        TaxCode: "IVA_GND",
                        AccountCode: "6210103",
                        GrossTotal: GrossTotalEntrega,
                        ...restLine,
                        BatchNumbers: batchNumbers
                    };
                    newLine = { ...newLine };
                    console.log('------newLine-----')
                    console.log({ newLine })

                    newDocumentLines.push(newLine)
                    numRet += 1
                }
            }
        }
        const { U_NIT, U_RAZSOC, U_UserCode, CardCode: cardCodeEntrega, U_B_cuf } = entregas[0]

        const finalData = {
            // DocDate,
            // DocDueDate,
            Series: 352,
            CardCode: CardCode || cardCodeEntrega,
            U_NIT,
            U_RAZSOC,
            U_B_cufd: U_B_cuf,
            U_UserCode: id_sap,
            DocumentLines: newDocumentLines,
        }

        finalDataEntrega = finalData
        // return res.json({finalDataEntrega, entregas, batchEntrega})

        const responceReturn = await postReturn(finalDataEntrega)

        if (responceReturn.status > 300) {
            console.log({ errorMessage: responceReturn.errorMessage })
            let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
            if (mensaje.value)
                mensaje = mensaje.value
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error en postReturn: ${mensaje}`, `postReturn()`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en postReturn: ${mensaje}`, finalDataEntrega })
        }

        const docEntryDev = responceReturn.orderNumber
        const devolucionDetalle = await obtenerDevolucionDetalle(docEntryDev)

        // if(devolucionDetalle.length==0){
        //     return res.status(400).json({mensaje: `No se encontro ninguna devolucion para ${docEntryDev}`,docEntryDev, responceReturn, finalDataEntrega})
        // }

        const cabeceraCN = []
        const DocumentLinesCN = []
        let DocumentAdditionalExpenses = []
        let numDev = 0
        for (const lineDevolucion of devolucionDetalle) {
            const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
                CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
                PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
                ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev,
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev,
                ...restDev
            } = lineDevolucion
            if (cabeceraCN.length == 0) {
                cabeceraCN.push({
                    DocDate: DocDateDev,
                    DocDueDate: DocDueDateDev,
                    CardCode: CardCodeDev,
                    NumAtCard,
                    DocTotal: DocTotalDev,
                    DocCurrency: DocCurrencyDev,
                    Reference1: docEntryDev,// DocEntry de la devolucion
                    Reference2: DocEntry ?? '',// DocEntry de la factura
                    Comments: CommentsDev,
                    JournalMemo: JournalMemoDev,
                    PaymentGroupCode,
                    SalesPersonCode,
                    Series: 361,
                    U_UserCode
                })
            }
            if (DocumentAdditionalExpenses.length == 0) {
                DocumentAdditionalExpenses = [
                    { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_GND' },
                    { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_GND' },
                ]
            }

            const newLineDev = {
                LineNum: numDev,
                BaseLine: LineNumDev,
                BaseType: 16,
                BaseEntry: docEntryDev,
                ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev,
                AccountCode: '6210103',
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev,
                TaxCode: 'IVA_GND'
            }

            DocumentLinesCN.push(newLineDev)

            numDev += 1
        }

        const bodyCreditNotes = {
            ...cabeceraCN[0],
            DocumentLines: DocumentLinesCN,
            DocumentAdditionalExpenses
        }
        const responseCreditNote = await postCreditNotes(bodyCreditNotes)

        if (responseCreditNote.status > 299) {
            let mensaje = responseCreditNote.errorMessage
            if (typeof mensaje != 'string' && mensaje.lang) {
                mensaje = mensaje.value
            }

            mensaje = `Error en creditNote: ${mensaje}`

            return res.status(400).json({
                mensaje,
                bodyCreditNotes,
                devolucionDetalle,
                idReturn: responceReturn.orderNumber,
                finalDataEntrega
            })
        }

        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Exito en la devolucion`, ``, "inventario/devolucion-completa", process.env.PRD)
        return res.json({
            idCreditNote: responseCreditNote.orderNumber,
            idReturn: responceReturn.orderNumber,
            bodyCreditNotes,
            finalDataEntrega
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en en controlador devolucionExcepcionalController: ${error.message}` })
    }
}

const devolucionNotaDebitoCreditoController = async (req, res) => {
    let idReturn
    let cufndc
    let idCreditNote
    try {
        const {
            DocEntry: docEntry,
            BaseEntry,
            CardCode,
            Cuf,
            DocDate,
            DocDueDate,
            id_sap,
            Almacen,
            Detalle,
            idReturnHecho
        } = req.body

        console.log({
            docEntry,
            BaseEntry,
            CardCode,
            Cuf,
            DocDate,
            DocDueDate,
            id_sap,
            Almacen,
            Detalle,
            idReturnHecho
        })

        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const idSapUsuario = user.ID_SAP || 0
        if (!docEntry || docEntry <= 0) {
            return res.status(400).json({ mensaje: 'no hay DocEntry en la solicitud' })
        }

        if (idSapUsuario == 0) {
            return res.status(400).json({ mensaje: 'El Usuario no tiene ID SAP' })
        }

        const fechaFormater = new Date(DocDate)
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');
        const formater = `${year}${month}${day}`;
        console.log({ docEntry })

        //----------------------
        console.log({ BaseEntry, Cuf, docEntry, formater })
        const entregas = await entregaDetallerFactura(BaseEntry, Cuf, docEntry, formater)
        console.log({ entregas })
        // return res.json({ entregas })
        let finalDataEntrega
        if (entregas.message) {
            endTime = Date.now()
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${entregas.message || ""}` })
        }
        if (entregas.length == 0) {
            endTime = Date.now()
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Esta factura ${BaseEntry}, no tiene entregas`, entregas })
        }
        if (!idReturnHecho || idReturnHecho == '') {
            //*-------------------------------------------------- OBTENER ENTREGA DETALLE DEV
            const batchEntrega = await obtenerEntregaDetalleDevolucion(docEntry);
            if (batchEntrega.length == 0) {
                return res.status(400).json({ mensaje: 'no hay batchs para el body del portReturn', docEntry, batchEntrega })
            }
            console.log({ batchEntrega })
            let newDocumentLines = []
            let numRet = 0
            for (const line of entregas) {
                const detalle = Detalle.find((item) => item.ItemCode == line.ItemCode)
                console.log('detalle:------------------------------------------------')
                console.log({ detalle })
                if (detalle) {
                    const { cantidad } = detalle
                    const { ItemCode, WarehouseCode, Quantity, UnitsOfMeasurment, LineNum, BaseLine: base1, BaseType: base2, LineStatus, BaseEntry: base3, TaxCode, AccountCode, DocTotal: DocTotalEntr, GrossTotal: GrossTotalEntr, ...restLine } = line;

                    const batchData = batchEntrega.filter((item) => item.ItemCode == ItemCode)
                    console.log('batchData:------------------------------------------------')
                    console.log({ batchData })
                    if (batchData && batchData.length > 0) {
                        let cantidaUnit = cantidad * Number(UnitsOfMeasurment)
                        let batchNumbers = []
                        for (const batch of batchData) {
                            if (cantidaUnit == 0)
                                break;
                            if (cantidaUnit < Number(batch.OutQtyL)) {
                                batch.new_quantity = cantidaUnit
                            } else {
                                batch.new_quantity = Number(batch.OutQtyL)
                            }
                            cantidaUnit = Number(cantidaUnit) - Number(batch.new_quantity)
                            batchNumbers.push({
                                BaseLineNumber: numRet,
                                BatchNumber: batch.BatchNum,
                                Quantity: batch.new_quantity,
                                ItemCode: batch.ItemCode
                            })
                            // numBatch +=1
                        }
                        // console.log('------------------------------------------------------------------------------------')
                        // console.log({ UnitsOfMeasurment })
                        // console.log('------------------------------------------------------------------------------------')

                        // const data = {
                        //     BaseLine: LineNum,
                        //     BaseType: 17,
                        //     BaseEntry,
                        // }

                        let GrossTotalEntrega = detalle.UnitPriceAfDi * cantidad
                        newLine = {
                            // ...data,
                            ItemCode,
                            WarehouseCode: Almacen,
                            Quantity: cantidad,
                            LineNum: numRet,
                            TaxCode: "IVA_NC",
                            AccountCode: "6210103",
                            GrossTotal: GrossTotalEntrega,
                            ...restLine,
                            BatchNumbers: batchNumbers
                        };
                        newLine = { ...newLine };
                        console.log('------newLine-----')
                        console.log({ newLine })

                        newDocumentLines.push(newLine)
                        numRet += 1
                    }
                }
            }
            const { U_NIT, U_RAZSOC, U_UserCode, CardCode: cardCodeEntrega, U_B_cuf } = entregas[0]
            const finalData = {
                // DocDate,
                // DocDueDate,
                Series: 352,
                CardCode: CardCode || cardCodeEntrega,
                U_NIT,
                U_RAZSOC,
                U_B_cufd: U_B_cuf,
                U_TIPODOC: '6',
                U_UserCode: idSapUsuario,
                DocumentLines: newDocumentLines,
            }

            finalDataEntrega = finalData
            // return res.json({ finalDataEntrega, batchEntrega, docEntry })
            //*--------------------------------------------------- POST RETURN 
            const responceReturn = await postReturn(finalDataEntrega)
            // return res.json({responceReturn, finalDataEntrega, newDocumentLines})

            if (responceReturn.status > 300) {
                console.log({ errorMessage: responceReturn.errorMessage })
                let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
                if (mensaje.value)
                    mensaje = mensaje.value
                // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error en postReturn: ${mensaje}`, `postReturn()`, "inventario/devolucion-completa", process.env.PRD)
                return res.status(400).json({
                    mensaje: `Error en postReturn: ${mensaje}`, finalDataEntrega,
                    entregas, batchEntrega
                })
            }

            idReturn = responceReturn.orderNumber
            console.log({ idReturn })

        } else {
            idReturn = idReturnHecho
        }
        //*------------------------------------------------ DETALLE TO PROSIN
        // return res.json({ idReturn })

        console.log({ idReturn })
        const entregasFromProsin = await entregaDetalleToProsin(idReturn)
        console.log({ entregasFromProsin })
        if (!entregasFromProsin || entregasFromProsin.length == 0) {
            return res.status(400).json({
                mensaje: 'Error al obtener el detalle de la factura de prosin.',
                responceReturn, entregasFromProsin
            })
        }
        const {
            sucursal,
            punto,
            documento_via,
            codigo_cliente_externo,
            tipo_identificacion,
            identificacion,
            complemento,
            nombre,
            correo,
            direccion,
            subTotal,
            fechaEmision
        } = entregasFromProsin[0]

        const dataToProsin = {
            sucursal,
            punto,
            documento_via: `${documento_via}`,
            codigo_cliente_externo,
            tipo_identificacion,
            identificacion,
            complemento: complemento || "",
            nombre,
            correo: correo || '',
            direccion: direccion || '',
            numeroAutorizacionCuf: Cuf,
            usuario: user.USERNAME,
            fechaEmision,
            mediaPagina: true,
            detalle: []
        }
        let totalDevuelto = 0
        entregas.map((item) => {
            const entregaProsin = entregasFromProsin.find((item2) => item2.producto == item.ItemCode)
            if (entregaProsin) {
                const total = Number((+entregaProsin.cantidad * +entregaProsin.precioUnitario).toFixed(2))
                dataToProsin.detalle.push({
                    producto: entregaProsin.producto,
                    descripcion: entregaProsin.descripcion,
                    cantidad: +entregaProsin.cantidad,
                    precioUnitario: +entregaProsin.precioUnitario,
                    montoDescuento: +entregaProsin.montoDescuento,
                    subTotal: +entregaProsin.subTotal, //total,
                    codigoDetalleTransaccion: 2
                })
                totalDevuelto += +entregaProsin.subTotal //Number(total)
            }
            const total = +item.GrossPrice * item.Quantity
            dataToProsin.detalle.push({
                producto: item.ItemCode,
                descripcion: item.ItemName,
                cantidad: +item.Quantity,
                precioUnitario: +item.GrossPrice,
                montoDescuento: +item.U_DESCLINEA, //not sure total - item.GrossTotal
                subTotal: +item.GrossTotal, //total.toFixed(2)
                codigoDetalleTransaccion: 1
            })
        })
        dataToProsin.montoTotalDevuelto = +totalDevuelto
        // return res.json({
        //     entregasFromProsin,
        //     dataToProsin,
        //     entregas
        // })
        //*------------------------------------------------------------------------ PROSIN
        const responseProsin = await notaDebitoCredito(dataToProsin, user)
        if (responseProsin.statusCode > 300) {
            let mensaje = 'Error al intentar facturar la Nota Debito Credito.'
            if (responseProsin.message && responseProsin.message.errors) {
                mensaje += JSON.stringify(responseProsin.message.errors, null, 2)
            } else {
                mensaje += responseProsin.data.mensaje || ''
            }
            return res.status(400).json({
                mensaje,
                dataToProsin, entregasFromProsin, idReturn, finalDataEntrega, entregas
            })
        }


        // return res.json({ responseProsin })

        //     "responseProsin": {
        //     "statusCode": 200,
        //     "data": {
        //         "estado": 500,
        //         "datos": {
        //     "cuf": "4661A21FEE5F87E3008F04279BE82C53D4967D314157731EBCE091F74",
        //     "factura": 162
        // },
        //         "fecha": "28/02/2025 17:09:48",
        //         "mensaje": "PA.alta_nota_credito_debito_sfl.§PA.leer_factura_sfl.§LA FACTURA NO EXISTE. MATRIZ=1 SUCURSAL=0 PUNTO=0 CUF=4661A21FEE5F743C66BF05E76615094F54F6FA54C614B9CA572971F74 ERROR=0 ROWCOUNT=0"
        //     },
        //     "query": "https://lab2.laboratoriosifa.com:96/api/sfl/NotaCreditoDebito"
        // }
        //*------------------------------------------------------------------------ RESPONSE PROSIN
        console.log({ responseProsin })
        console.log({ datosProsin: responseProsin.data.datos })
        cufndc = responseProsin.data.datos.cuf
        const facturandc = responseProsin.data.datos.factura
        //TODO START OBTENER EL DETALLE NDC DESDE PDF, XML, O DB
        const detailNDC = await spDetalleNDC(cufndc)
        if (detailNDC.length == 0) {
            return res.status(responceReturn.status).json({
                mensaje: 'Error, no se pudo obtener el detalle NDC'
            })
        }

        // "detailNDCw": [
        //     {
        //         "producto": "101-005-010",
        //         "descripcion": "FENORAL X 2 ML X 3 AMP. SOLUCION INY.",
        //         "cantidad": 3,
        //         "precio_unitario": 76.55,
        //         "monto_descuento": 4.59,
        //         "sub_total": 225.06
        //     },
        //     {
        //         "producto": "101-011-011",
        //         "descripcion": "CILASTAX POLVO INY. + AGUA INYECTABLE X 10 ML",
        //         "cantidad": 11,
        //         "precio_unitario": 117.7,
        //         "monto_descuento": 0,
        //         "sub_total": 1294.7
        //     }
        // ]
        //TODO END
        //---------------------------------------------------------------------PATCH RETURNS
        console.log({ detailNDC })
        const responsePatchReturns = await patchReturn({ U_B_cuf: cufndc, NumAtCard: facturandc }, idReturn)

        if (responsePatchReturns.status > 299) {
            let mensaje = responsePatchReturns.errorMessage
            if (typeof mensaje != 'string' && mensaje.lang) {
                mensaje = mensaje.value
            }

            mensaje = `Error en patchReturn: ${mensaje}`
            return res.status(responceReturn.status).json({
                mensaje, cufndc, idReturn,
                finalDataEntrega,
                dataToProsin
            }
            )
        }
        console.log('Patch return hecho con exito')
        //*------------------------------------------------------------------ OBTENER CON DOCENTRY DEV
        const devolucionDetalle = await obtenerDevolucionDetalle(idReturn)
        const cabeceraCN = []
        const DocumentLinesCN = []
        let DocumentAdditionalExpenses = []
        let numDev = 0

        let link = `https://siat.impuestos.gob.bo/consulta/QR?nit=1028625022&cuf=${cufndc}&numero=${facturandc}&t=1`
        console.log({ link })
        for (const lineDevolucion of devolucionDetalle) {
            const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
                CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
                PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
                ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev,
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev,
                ...restDev
            } = lineDevolucion
            if (cabeceraCN.length == 0) {
                const deudaCliente = await getDeudaDelCliente(CardCodeDev)
                console.log({ deudaCliente })
                let ControlAccount = '2110401'
                if (deudaCliente.length > 0) {
                    if (!(deudaCliente[0].Balance == 0)) {
                        ControlAccount = '1120101'
                    }
                }

                cabeceraCN.push({
                    DocDate: responseProsin.data.fecha,
                    DocDueDate: DocDueDateDev,
                    CardCode: CardCodeDev,
                    DocTotal: DocTotalDev,
                    DocCurrency: DocCurrencyDev,
                    Reference1: idReturn,// DocEntry de la devolucion
                    Reference2: docEntry ?? '',// DocEntry de la factura
                    Comments: CommentsDev,
                    JournalMemo: JournalMemoDev,
                    PaymentGroupCode,
                    SalesPersonCode,
                    Series: 361,
                    U_UserCode,
                    ControlAccount,
                    U_B_cuf: cufndc,
                    NumAtCard: facturandc,
                    U_B_path: link
                })
            }
            if (DocumentAdditionalExpenses.length == 0) {
                DocumentAdditionalExpenses = [
                    { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_NC' },
                    { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_NC' },
                ]
            }
            // const detailNDCw = await spDetalleNDC('4661A21FEE5FD111BA79A103C86598C1013D037841868FD6B569E1F74')
            const product = detailNDC.find((item) => item.producto == ItemCodeDev)
            if (!product) {
                grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error, se realiazo la devolucion pero no se guardo en SAP , no se encontro el articulo: ${ItemCodeDev || "No definido"} en la lista detailNDC, revise la consola.`, ``, "inventario/devolucion-ndc", process.env.PRD)
                return res.status(400).json({
                    mensaje: `Error, se realiazo la devolucion pero no se guardo en SAP , no se encontro el articulo: ${ItemCodeDev || "No definido"} en la lista detailNDC, revise la consola.`,
                    detailNDC
                })
            }
            // return res.json({ detailNDCw, product })
            const newLineDev = {
                LineNum: numDev,
                BaseLine: LineNumDev,
                BaseType: 16,
                BaseEntry: idReturn,
                ItemCode: ItemCodeDev,
                Quantity: product.cantidad,
                WarehouseCode: WarehouseCodeDev,
                AccountCode: '6210103',
                GrossTotal: product.sub_total,
                GrossPrice: product.precio_unitario,
                MeasureUnit: MeasureUnitDev,
                UnitsOfMeasurment: UnitsOfMeasurmentDev,
                TaxCode: 'IVA_NC',
                U_DESCLINEA: product.monto_descuento,
            }

            DocumentLinesCN.push(newLineDev)

            numDev += 1
        }

        const bodyCreditNotes = {
            ...cabeceraCN[0],
            U_TIPODOC: '6',
            DocumentLines: DocumentLinesCN,
            DocumentAdditionalExpenses
        }

        const total = bodyCreditNotes.DocumentLines.reduce((acc, item) => {
            return acc + Number(item.GrossTotal)
        }, 0)
        bodyCreditNotes.DocTotal = Number(total.toFixed(2))
        console.log({ bodyCreditNotes })
        const responseCreditNote = await postCreditNotes(bodyCreditNotes)

        if (responseCreditNote.status > 299) {
            let mensaje = responseCreditNote.errorMessage
            if (typeof mensaje != 'string' && mensaje.lang) {
                mensaje = mensaje.value
            }

            mensaje = `Error en creditNote: ${mensaje}`

            return res.status(400).json({
                mensaje,
                bodyCreditNotes,
                devolucionDetalle,
                idReturn,
                cufndc,
                finalDataEntrega
            })
        }

        idCreditNote = responseCreditNote.orderNumber
        return res.json({
            finalDataEntrega,
            idReturn,
            cufndc,
            idCreditNote,
            entregasFromProsin,
            dataToProsin,
            responseProsin,
            bodyCreditNotes
        })
    } catch (error) {
        console.log({ errorCatch: JSON.stringify(error, null, 2) })
        return res.status(500).json({
            mensaje: `Error en el controlador devolucionNotaDebitoCreditoController: ${error.message}`,
            idReturn,
            cufndc,
            idCreditNote,
        })
    }
}

const devolucionDebitoCreditoCompletaController = async (req, res) => {
    try {
        const startTime = Date.now();
        const { DocEntry: docEntry, Cuf, BaseEntry, Detalle, id_sap,
            DocDate,
            DocDueDate,
            CardCode, Almacen } = req.body
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        if (!docEntry || docEntry <= 0) {
            return res.status(400).json({ mensaje: 'no hay DocEntry en la solicitud' })
        }

        const fechaFormater = new Date(DocDate)
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');
        const formater = `${year}${month}${day}`;
        const entregas = await entregaDetallerFactura(BaseEntry, Cuf, docEntry, formater)
        if (entregas.message) {
            endTime = Date.now()
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${entregas.message || ""}` })
        }
        if (entregas.length == 0) {
            endTime = Date.now()
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Esta factura ${BaseEntry}, no tiene entregas`, entregas })
        }
        const batchEntrega = await obtenerEntregaDetalleDevolucion(docEntry);

        if (batchEntrega.length == 0) {
            return res.status(400).json({ mensaje: 'no hay batchs para el body del portReturn', docEntry, batchEntrega, entregas })
        }
        let batchNumbers = []
        let newDocumentLines = []
        let cabeceraReturn = []
        let numRet = 0
        for (const line of entregas) {
            let newLine = {}
            const { ItemCode, WarehouseCode, Quantity, UnitsOfMeasurment, LineNum, BaseLine: base1, BaseType: base2, LineStatus, BaseEntry: base3, TaxCode,
                AccountCode, U_B_cuf: U_B_cufEntr, U_NIT, U_RAZSOC, U_UserCode, CardCode: cardCodeEntrega,
                ...restLine } = line;
            if (cabeceraReturn.length == 0) {
                cabeceraReturn.push({
                    U_NIT, U_RAZSOC,
                    U_UserCode: id_sap,
                    CardCode: cardCodeEntrega,
                    U_B_cufd: U_B_cufEntr,
                    Series: 352
                })
            }
            const batchData = batchEntrega.filter((item) => item.ItemCode == ItemCode)
            console.log({ batch: batchData })
            if (batchData && batchData.length > 0) {
                // return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}`, batch: batchData ,LineNum});
                let new_quantity = 0
                batchData.map((batch) => {
                    new_quantity = Number(new_quantity) + Number(batch.OutQtyL)
                })
                console.log('------------------------------------------------------------------------------------')
                console.log({ new_quantity, UnitsOfMeasurment })
                console.log('------------------------------------------------------------------------------------')

                //console.log({ batchData })
                batchNumbers = batchData.map(batch => ({
                    BaseLineNumber: numRet,
                    BatchNumber: batch.BatchNum,
                    Quantity: Number(batch.OutQtyL).toFixed(6),
                    ItemCode: batch.ItemCode
                }))

                // const data = {
                //     BaseLine: LineNum,
                //     BaseType: 17,
                //     BaseEntry,
                // }

                newLine = {
                    // ...data,
                    ItemCode,
                    WarehouseCode: Almacen,
                    Quantity: new_quantity / UnitsOfMeasurment,
                    LineNum: numRet,
                    TaxCode: "IVA_GND",
                    AccountCode: "6210103",
                    ...restLine,
                    BatchNumbers: batchNumbers
                };
                newLine = { ...newLine };
                console.log('------newLine-----')
                console.log({ newLine })

                newDocumentLines.push(newLine)
                numRet += 1
            }
        }
        const { U_NIT, U_RAZSOC, U_UserCode, CardCode: cardCodeEntrega, U_B_cuf } = entregas[0]

        const finalData = {
            // DocDate,
            // DocDueDate,
            ...cabeceraReturn[0],
            DocumentLines: newDocumentLines,
        }

        finalDataEntrega = finalData
        // return res.json(finalDataEntrega)
        const responceReturn = await postReturn(finalDataEntrega)
        // return res.json({responceReturn, finalDataEntrega, newDocumentLines})

        if (responceReturn.status > 300) {
            console.log({ errorMessage: responceReturn.errorMessage })
            let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
            if (mensaje.value)
                mensaje = mensaje.value
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error en postReturn: ${mensaje}`, `postReturn()`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en postReturn: ${mensaje}`, finalDataEntrega })
        }

        const idReturn = responceReturn.orderNumber
        //*------------------------------------------------ DETALLE TO PROSIN

        const entregasFromProsin = await entregaDetalleToProsin(idReturn)
        console.log({ entregasFromProsin })
        if (!entregasFromProsin || entregasFromProsin.length == 0) {
            return res.status(400).json({
                mensaje: 'Error al obtener el detalle de la factura de prosin.',
                finalDataEntrega, responceReturn, entregasFromProsin
            })
        }
        const {
            sucursal,
            punto,
            documento_via,
            codigo_cliente_externo,
            tipo_identificacion,
            identificacion,
            complemento,
            nombre,
            correo,
            direccion,
            fechaEmision
        } = entregasFromProsin[0]

        const dataToProsin = {
            sucursal,
            punto,
            documento_via: `${documento_via}`,
            codigo_cliente_externo,
            tipo_identificacion,
            identificacion,
            complemento: complemento || "",
            nombre,
            correo: correo || '',
            direccion: direccion || '',
            numeroAutorizacionCuf: U_B_cuf,
            usuario: user.USERNAME,
            fechaEmision,
            mediaPagina: true,
            detalle: []
        }
        let totalDevuelto = 0
        entregasFromProsin.map((item) => {
            const total = Number((+item.cantidad * +item.precioUnitario).toFixed(2))
            dataToProsin.detalle.push({
                producto: item.producto,
                descripcion: item.descripcion,
                cantidad: +item.cantidad,
                precioUnitario: +item.precioUnitario,
                montoDescuento: +item.montoDescuento,
                subTotal: +item.subTotal, //total,
                codigoDetalleTransaccion: 2
            })
            dataToProsin.detalle.push({
                producto: item.producto,
                descripcion: item.descripcion,
                cantidad: +item.cantidad,
                precioUnitario: +item.precioUnitario,
                montoDescuento: +item.montoDescuento,
                subTotal: +item.subTotal, //total,
                codigoDetalleTransaccion: 1
            })
            totalDevuelto += +item.subTotal
        })
        dataToProsin.montoTotalDevuelto = +totalDevuelto
        // return res.json({
        //     entregasFromProsin,
        //     dataToProsin,
        //     entregas
        // })
        //*------------------------------------------------------------------------ PROSIN
        const responseProsin = await notaDebitoCredito(dataToProsin, user)
        if (responseProsin.statusCode > 300) {
            let mensaje = 'Error al intentar facturar la Nota Debito Credito.'
            if (responseProsin.message && responseProsin.message.errors) {
                mensaje += JSON.stringify(responseProsin.message.errors, null, 2)
            } else {
                mensaje += responseProsin.data.mensaje || ''
            }
            return res.status(400).json({
                mensaje,
                dataToProsin, entregasFromProsin, idReturn, finalDataEntrega, entregas
            })
        }
        console.log({ responseProsin })
        //     "responseProsin": {
        //     "statusCode": 200,
        //     "data": {
        //         "estado": 500,
        //         "datos": null,
        //         "fecha": "28/02/2025 17:09:48",
        //         "mensaje": "PA.alta_nota_credito_debito_sfl.§PA.leer_factura_sfl.§LA FACTURA NO EXISTE. MATRIZ=1 SUCURSAL=0 PUNTO=0 CUF=4661A21FEE5F743C66BF05E76615094F54F6FA54C614B9CA572971F74 ERROR=0 ROWCOUNT=0"
        //     },
        //     "query": "https://lab2.laboratoriosifa.com:96/api/sfl/NotaCreditoDebito"
        // }
        //*------------------------------------------------------------------------ RESPONSE PROSIN
        const cufndc = responseProsin.data.datos.cuf ////?
        console.log({ cufndc })
        //---------------------------------------------------------------------PATCH RETURNS

        const responsePatchReturns = await patchReturn({ U_B_cuf: cufndc }, idReturn)

        if (responsePatchReturns.status > 299) {
            let mensaje = responsePatchReturns.errorMessage
            if (typeof mensaje != 'string' && mensaje.lang) {
                mensaje = mensaje.value
            }

            mensaje = `Error en patchReturn: ${mensaje}`
            return res.status(responceReturn.status).json({
                mensaje, cufndc, idReturn,
                finalDataEntrega,
                dataToProsin
            })
        }
        console.log('Patch return hecho con exito')

        //-------------------
        const devolucionDetalle = await obtenerDevolucionDetalle(idReturn)

        // if(devolucionDetalle.length==0){
        //     return res.status(400).json({mensaje: `No se encontro ninguna devolucion para ${idReturn}`,idReturn, responceReturn, finalDataEntrega})
        // }

        const cabeceraCN = []
        const DocumentLinesCN = []
        let DocumentAdditionalExpenses = []
        let numDev = 0
        for (const lineDevolucion of devolucionDetalle) {
            const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
                CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
                PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
                ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev,
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev,
                ...restDev
            } = lineDevolucion
            if (cabeceraCN.length == 0) {
                cabeceraCN.push({
                    DocDate: DocDateDev,
                    DocDueDate: DocDueDateDev,
                    CardCode: CardCodeDev,
                    NumAtCard,
                    DocTotal: DocTotalDev,
                    DocCurrency: DocCurrencyDev,
                    Reference1: idReturn,// DocEntry de la devolucion
                    Reference2: docEntry ?? '',// DocEntry de la factura
                    Comments: CommentsDev,
                    JournalMemo: JournalMemoDev,
                    PaymentGroupCode,
                    SalesPersonCode,
                    Series: 361,
                    U_UserCode
                })
            }
            if (DocumentAdditionalExpenses.length == 0) {
                DocumentAdditionalExpenses = [
                    { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_GND' },
                    { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_GND' },
                ]
            }

            const newLineDev = {
                LineNum: numDev,
                BaseLine: LineNumDev,
                BaseType: 16,
                BaseEntry: idReturn,
                ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev,
                AccountCode: '6210103',
                // AccountCode: AccountCodeDev,
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev,
                TaxCode: 'IVA_GND'
            }

            DocumentLinesCN.push(newLineDev)

            numDev += 1
        }

        const bodyCreditNotes = {
            ...cabeceraCN[0],
            DocumentLines: DocumentLinesCN,
            DocumentAdditionalExpenses
        }
        const responseCreditNote = await postCreditNotes(bodyCreditNotes)

        if (responseCreditNote.status > 299) {
            let mensaje = responseCreditNote.errorMessage
            if (typeof mensaje != 'string' && mensaje.lang) {
                mensaje = mensaje.value
            }

            mensaje = `Error en creditNote: ${mensaje}`

            return res.status(400).json({
                mensaje,
                bodyCreditNotes,
                devolucionDetalle,
                idReturn,
                finalDataEntrega,
                responseProsin,
                cufndc,
                dataToProsin
            })
        }

        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Exito en la devolucion`, ``, "inventario/devolucion-completa", process.env.PRD)
        return res.json({
            idCreditNote: responseCreditNote.orderNumber,
            idReturn: responceReturn.orderNumber,
            cufndc,
            bodyCreditNotes,
            finalDataEntrega,
        })


    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `${error.message || 'Error en devolucionDebitoCreditoCompletaController'}`, `Catch controller devolucionDebitoCreditoCompletaController`, "inventario/devolucion-ndc-completa", process.env.PRD)

        return res.status(500).json({ mensaje: `Error en el controlador devolucionDebitoCreditoCompletaController. ${error.message || ''}` })
    }
}

const searchArticulosController = async (req, res) => {
    try {
        const { cadena } = req.body
        const cadenS = cadena.toUpperCase()
        const response = await searchArticulos(cadenS)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador searchArticulosController: ${error.message}` })
    }
}

const facturasClienteLoteItemCodeGenesisController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const cardCode = req.query.cardCode
        const batchNum = req.query.batchNum
        const response = await facturasClienteLoteItemCodeGenesis(itemCode, cardCode, batchNum)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const devolucionNDCGenesisController = async (req, res) => {
    try {
        const startTime = Date.now();
        const {
            DocEntry: docEntry,
            Cuf,
            BaseEntry,
            id_sap,
            DocDate,
            Almacen } = req.body
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        if (!docEntry || docEntry <= 0) {
            return res.status(400).json({ mensaje: 'no hay DocEntry en la solicitud' })
        }

        return res.json({
            DocEntry: docEntry,
            Cuf,
            BaseEntry,
            id_sap,
            DocDate,
            Almacen
        })
        console.log({

        })
        const fechaFormater = new Date(DocDate)
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');
        const formater = `${year}${month}${day}`;
        const entregas = await entregaDetallerFactura(BaseEntry, Cuf, docEntry, formater)

        // if (entregas.message) {
        //     endTime = Date.now()
        //     // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
        //     return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${entregas.message || ""}` })
        // }
        // if (entregas.length == 0) {
        //     endTime = Date.now()
        //     // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
        //     return res.status(400).json({ mensaje: `Esta factura ${BaseEntry}, no tiene entregas`, entregas })
        // }
        // const batchEntrega = await obtenerEntregaDetalleDevolucion(docEntry);

        // if (batchEntrega.length == 0) {
        //     return res.status(400).json({ mensaje: 'no hay batchs para el body del portReturn', docEntry, batchEntrega, entregas })
        // }
        // let batchNumbers = []
        // let newDocumentLines = []
        // let cabeceraReturn = []
        // let numRet = 0
        // for (const line of entregas) {
        //     let newLine = {}
        //     const { ItemCode, WarehouseCode, Quantity, UnitsOfMeasurment, LineNum, BaseLine: base1, BaseType: base2, LineStatus, BaseEntry: base3, TaxCode,
        //         AccountCode, U_B_cuf: U_B_cufEntr, U_NIT, U_RAZSOC, U_UserCode, CardCode: cardCodeEntrega,
        //         ...restLine } = line;
        //     if(cabeceraReturn.length==0){
        //         cabeceraReturn.push({
        //             U_NIT, U_RAZSOC, 
        //             U_UserCode: id_sap, 
        //             CardCode: cardCodeEntrega, 
        //             U_B_cufd: U_B_cufEntr,
        //             Series: 352
        //         })
        //     }
        //     const batchData = batchEntrega.filter((item) => item.ItemCode == ItemCode)
        //     console.log({ batch: batchData })
        //     if (batchData && batchData.length > 0) {
        //         // return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}`, batch: batchData ,LineNum});
        //         let new_quantity = 0
        //         batchData.map((batch) => {
        //             new_quantity = Number(new_quantity) + Number(batch.OutQtyL)
        //         })
        //         console.log('------------------------------------------------------------------------------------')
        //         console.log({ new_quantity, UnitsOfMeasurment })
        //         console.log('------------------------------------------------------------------------------------')

        //         //console.log({ batchData })
        //         batchNumbers = batchData.map(batch => ({
        //             BaseLineNumber: numRet,
        //             BatchNumber: batch.BatchNum,
        //             Quantity: Number(batch.OutQtyL).toFixed(6),
        //             ItemCode: batch.ItemCode
        //         }))

        //         // const data = {
        //         //     BaseLine: LineNum,
        //         //     BaseType: 17,
        //         //     BaseEntry,
        //         // }

        //         newLine = {
        //             // ...data,
        //             ItemCode,
        //             WarehouseCode: Almacen,
        //             Quantity: new_quantity / UnitsOfMeasurment,
        //             LineNum: numRet,
        //             TaxCode: "IVA_GND",
        //             AccountCode: "6210103",
        //             ...restLine,
        //             BatchNumbers: batchNumbers
        //         };
        //         newLine = { ...newLine };
        //         console.log('------newLine-----')
        //         console.log({ newLine })

        //         newDocumentLines.push(newLine)
        //         numRet += 1
        //     }
        // }
        // const finalData = {
        //     // DocDate,
        //     // DocDueDate,
        //     ...cabeceraReturn[0],
        //     DocumentLines: newDocumentLines,
        // }

        // finalDataEntrega = finalData
        // // return res.json(finalDataEntrega)
        // const responceReturn = await postReturn(finalDataEntrega)
        // // return res.json({responceReturn, finalDataEntrega, newDocumentLines})

        // if (responceReturn.status > 300) {
        //     console.log({ errorMessage: responceReturn.errorMessage })
        //     let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
        //     if (mensaje.value)
        //         mensaje = mensaje.value
        //     // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error en postReturn: ${mensaje}`, `postReturn()`, "inventario/devolucion-completa", process.env.PRD)
        //     return res.status(400).json({ mensaje: `Error en postReturn: ${mensaje}`, finalDataEntrega })
        // }

        // const docEntryDev = responceReturn.orderNumber
        // const devolucionDetalle = await obtenerDevolucionDetalle(docEntryDev)

        // // if(devolucionDetalle.length==0){
        // //     return res.status(400).json({mensaje: `No se encontro ninguna devolucion para ${docEntryDev}`,docEntryDev, responceReturn, finalDataEntrega})
        // // }

        // const cabeceraCN = []
        // const DocumentLinesCN = []
        // let DocumentAdditionalExpenses = []
        // let numDev = 0
        // for (const lineDevolucion of devolucionDetalle) {
        //     const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
        //         CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
        //         PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
        //         ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2,ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
        //         ItemCode: ItemCodeDev, Quantity: QuantityDev,WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev, 
        //         GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev,
        //         ...restDev
        //     } = lineDevolucion
        //     if (cabeceraCN.length == 0) {
        //         cabeceraCN.push({
        //             DocDate: DocDateDev,
        //             DocDueDate: DocDueDateDev,
        //             CardCode: CardCodeDev,
        //             NumAtCard,
        //             DocTotal: DocTotalDev,
        //             DocCurrency: DocCurrencyDev,
        //             Reference1: docEntryDev,// DocEntry de la devolucion
        //             Reference2: docEntry ?? '',// DocEntry de la factura
        //             Comments: CommentsDev,
        //             JournalMemo: JournalMemoDev,
        //             PaymentGroupCode,
        //             SalesPersonCode,
        //             Series: 361,
        //             U_UserCode
        //         })
        //     }
        //     if(DocumentAdditionalExpenses.length==0){
        //         DocumentAdditionalExpenses = [
        //             { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_GND' },
        //             { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_GND' },
        //         ]
        //     }

        //     const newLineDev = {
        //         LineNum: numDev,
        //         BaseLine: LineNumDev,
        //         BaseType: 16,
        //         BaseEntry: docEntryDev,
        //         ItemCode: ItemCodeDev, Quantity: QuantityDev,WarehouseCode: WarehouseCodeDev, 
        //         AccountCode: '6210103', 
        //         // AccountCode: AccountCodeDev,
        //         GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, 
        //         TaxCode: 'IVA_GND'
        //     }

        //     DocumentLinesCN.push(newLineDev)

        //     numDev += 1
        // }

        // const bodyCreditNotes = {
        //     ...cabeceraCN[0],
        //     DocumentLines: DocumentLinesCN,
        //     DocumentAdditionalExpenses
        // }
        // const responseCreditNote = await postCreditNotes(bodyCreditNotes)

        // if(responseCreditNote.status > 299){
        //     let mensaje = responseCreditNote.errorMessage
        //     if(typeof mensaje != 'string' && mensaje.lang){
        //         mensaje = mensaje.value
        //     }

        //     mensaje = `Error en creditNote: ${mensaje}`

        //     return res.status(400).json({
        //         mensaje,
        //         bodyCreditNotes,
        //         devolucionDetalle,
        //         idReturn: responceReturn.orderNumber,
        //         finalDataEntrega
        //     })
        // }

        // // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Exito en la devolucion`, ``, "inventario/devolucion-completa", process.env.PRD)
        // return res.json({
        //     idCreditNote: responseCreditNote.orderNumber,
        //     idReturn: responceReturn.orderNumber,
        //     bodyCreditNotes,
        //     finalDataEntrega
        // })


    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `${error.message || 'Error en devolucionCompletaController'}`, `Catch controller devolucionCompletaController`, "inventario/devolucion-completa", process.env.PRD)

        return res.status(500).json({ mensaje: `Error en el controlador devolucionCompletaController. ${error.message || ''}` })
    }
}

const getCreditNoteController = async (req, res) => {
    try {
        const { id } = req.query
        const response = await getCreditNote(id)
        if (response.status == 400) {
            return res.status(400).json({ mensaje: `${response.errorMessage.value || response.errorMessage || 'error desconocido de getCreditNote'}` })
        }

        console.log({ id, responseGetCreditNote: response })
        const { DocEntry,
            DocNum,
            DocDate,
            CardCode,
            CardName,
            DocTotal, DocumentLines } = response.data

        let detalle = []
        let baseEntry = 0
        DocumentLines.forEach((item) => {
            const {
                LineNum,
                ItemCode,
                ItemDescription,
                Quantity,
                // Price,
                // PriceAfterVAT,
                DiscountPercent,
                WarehouseCode,
                MeasureUnit,
                BaseEntry,
                GrossTotal,
                GrossPrice,
                UnitPrice
            } = item
            if (baseEntry == 0) {
                baseEntry = BaseEntry
            }
            detalle.push({
                LineNum,
                ItemCode,
                ItemDescription,
                Quantity,
                // Price,
                // PriceAfterVAT,
                DiscountPercent: Math.round(DiscountPercent),
                WarehouseCode,
                MeasureUnit,
                GrossTotal,
                GrossPrice,
                UnitPrice: +UnitPrice.toFixed(2)
            })
        })
        const result = {
            DocEntry,
            DocNum,
            DocDate,
            CardCode,
            CardName,
            DocTotal,
            BaseEntry: baseEntry,
            DocumentLines: detalle
        }
        return res.json(result)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getCreditNoteController: ${error.message}` })
    }
}

const stockDisponiblePorSucursalController = async (req, res) => {
    try {
        const { sucursal } = req.body
        console.log({ sucursal })
        const stock = await stockDisponiblePorSucursal(sucursal);
        const toCamelCase = (str) =>
            str
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
                .replace(/\.$/, '')

        const formattedStock = stock.map(item => {
            const formattedItem = {};
            Object.keys(item).forEach(key => {
                const newKey = toCamelCase(key);
                formattedItem[newKey] = item[key];
            });
            return formattedItem;
        });
        console.log('type of stock', typeof formattedStock)


        return res.json({ stock: formattedStock });
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en stockDisponiblePorSucursalController: ${error.message}` })
    }
}

const getMonthDifference = (start, end) => {
    const yearDiff = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();

    return yearDiff * 12 + monthDiff;
}

const getAllCreditNotesController = async (req, res) => {
    try {
        const response = await getCreditNotes()
        if (response.status == 400) {
            return res.status(400).json({
                mensaje: `Error en obtener credit notes`,
                errorMessage: response.errorMessage
            })
        }

        console.log({ responseGetCreditNotes: response })
        let result = []
        // const todaysDate= new Date()
        for (const lineResponse of response.data) {
            const { DocEntry,
                DocNum,
                DocDate,
                CardCode,
                CardName,
                DocTotal, DocumentLines } = lineResponse

            // const dateThem = new Date(DocDate)
            // const months = getMonthDifference(dateThem, todaysDate)

            // if(months<3){
            let detalle = []
            let baseEntry = 0
            DocumentLines.forEach((item) => {
                const {
                    LineNum,
                    ItemCode,
                    ItemDescription,
                    Quantity,
                    // Price,
                    // PriceAfterVAT,
                    DiscountPercent,
                    WarehouseCode,
                    MeasureUnit,
                    BaseEntry,
                    GrossTotal,
                    GrossPrice,
                    // UnitPrice
                } = item
                if (baseEntry == 0) {
                    baseEntry = BaseEntry
                }
                detalle.push({
                    LineNum,
                    ItemCode,
                    ItemDescription,
                    Quantity,
                    // Price,
                    // PriceAfterVAT,
                    DiscountPercent: Math.round(DiscountPercent),
                    WarehouseCode,
                    MeasureUnit,
                    GrossTotal,
                    GrossPrice: +GrossPrice.toFixed(2),
                    // UnitPrice: +UnitPrice.toFixed(2)
                })
            })
            const lineResult = {
                DocEntry,
                DocNum,
                DocDate,
                CardCode,
                CardName,
                DocTotal,
                BaseEntry: baseEntry,
                DocumentLines: detalle
            }
            result.push(lineResult)
            // }
        }
        return res.json(result)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getAllCreditNotesController: ${error.message}` })
    }
}

const devolucionMalEstadoController = async (req, res) => {
    let idEntrega
    try {
        const { Devoluciones, AlmacenIngreso, AlmacenSalida, CardCode, id_sap, Comentario } = req.body
        const idEntregaBody = req.body.idEntrega
        console.log({ Devoluciones, AlmacenIngreso, CardCode, id_sap })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let numRet = 0
        let newDocumentLinesReturn = []
        let newDocumentLinesEntrega = []
        for (const devolucion of Devoluciones) {
            const { ItemCode, Lote, Cantidad, Precio, UnidadMedida, Total } = devolucion
            console.log({ ItemCode, Lote, Cantidad, Precio, UnidadMedida })
            let batchNumbers = []
            const cantidadBatch = Cantidad * UnidadMedida
            batchNumbers.push({
                BaseLineNumber: numRet,
                BatchNumber: Lote,
                Quantity: cantidadBatch,
                ItemCode: ItemCode
            })

            const newLineReturn = {
                BaseEntry: 0,
                BaseType: 15,
                BaseLine: numRet,
                ItemCode,
                WarehouseCode: AlmacenIngreso,
                Quantity: Cantidad,
                LineNum: numRet,
                TaxCode: "IVA_GND",
                AccountCode: "6210103",
                GrossTotal: Total,
                GrossPrice: Precio,
                BatchNumbers: batchNumbers
            };
            console.log('------newLineReturn-----')
            console.log({ newLineReturn })

            newDocumentLinesReturn.push(newLineReturn)

            let batchNumbersEntrega = []
            const batchData = await lotesArticuloAlmacenCantidad(ItemCode, AlmacenSalida, Cantidad);
            console.log({ batch: batchData })
            if (batchData.message) {
                grabarLog(user.USERCODE, user.USERNAME, "Devolucion Mal Estado", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, 'IFA_VM_SELECTION_BATCH_FEFO', "inventario/dev-mal-estado", process.env.PRD)
                return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, idEntrega })
            }
            if (batchData.length > 0) {
                let new_quantity = 0
                batchData.map((item) => {
                    new_quantity += Number(item.Quantity).toFixed(6)
                })
                //console.log({ batchData })
                batchNumbersEntrega = batchData.map(batch => ({
                    BaseLineNumber: numRet,
                    BatchNumber: batch.BatchNum,
                    Quantity: Number(batch.Quantity).toFixed(6),
                    ItemCode: batch.ItemCode
                }))
            } else {
                grabarLog(user.USERCODE, user.USERNAME, "Devolucion Mal Estado", `No hay lotes para el item: ${ItemCode}, almacen: ${AlmacenSalida}, cantidad: ${Cantidad}`, 'IFA_VM_SELECTION_BATCH_FEFO', "inventario/dev-mal-estado", process.env.PRD)
                return res.status(400).json({
                    mensaje: `No hay lotes para el item: ${ItemCode}, almacen: ${AlmacenSalida}, cantidad: ${Cantidad}`,
                    idEntrega
                })
            }

            const newLineEntrega = {
                ItemCode,
                WarehouseCode: AlmacenSalida,
                Quantity: Cantidad,
                LineNum: numRet,
                TaxCode: "IVA_GND",
                AccountCode: "6210103",
                GrossTotal: Total,
                GrossPrice: Precio,
                BatchNumbers: batchNumbersEntrega
            };
            console.log({ newLineEntrega })
            newDocumentLinesEntrega.push(newLineEntrega)
            numRet += 1
        }

        let bodyReturn
        let responceReturn
        let responseEntrega
        let bodyEntrega
        if (!idEntregaBody) { //Si no hay id de entrega, entonces se crea una nueva entrega
            bodyEntrega = {
                Series: 353,
                CardCode: CardCode,
                U_UserCode: id_sap,
                JournalMemo: Comentario,
                Comments: Comentario,
                DocumentLines: newDocumentLinesEntrega,
            }
            console.log(JSON.stringify({ bodyEntrega }, null, 2))
            responseEntrega = await postEntrega(bodyEntrega)

            if (responseEntrega.lang) {
                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                const fileNameJson = path.join(outputDir, `finalDataEntrega_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(bodyEntrega, null, 2), 'utf8');
                console.log(`Objeto finalDataEntrega guardado en ${fileNameJson}`);
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Mal Estado", `Error interno en la entrega de sap en postEntrega: ${responseEntrega.value || ''}`, ``, "inventario/dev-mal-estado", process.env.PRD)
                return res.status(400).json({
                    mensaje: `Error interno en la entrega de sap. ${responseEntrega.value || ''}`,
                    idEntrega,
                    bodyReturn,
                    responseEntrega,
                    bodyEntrega
                })
            }

            idEntrega = responseEntrega.deliveryN44umber

        } else {//Existe id de entrega
            idEntrega = idEntregaBody
        }

        console.log({ idEntrega })
        newDocumentLinesReturn.map((item) => {
            item.BaseEntry = idEntrega
        })

        bodyReturn = {
            Series: 352,
            CardCode: CardCode,
            U_UserCode: id_sap,
            JournalMemo: Comentario,
            Comments: Comentario,
            DocumentLines: newDocumentLinesReturn,
        }
        console.log(JSON.stringify({ bodyReturn }, null, 2))
        responceReturn = await postReturn(bodyReturn)
        console.log({ responceReturn })

        if (responceReturn.status > 300) {
            console.log({ errorMessage: responceReturn.errorMessage })
            let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
            if (typeof mensaje != 'string' && mensaje.value)
                mensaje = mensaje.value
            grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Mal Estado", `Error en postReturn: ${mensaje}`, `postReturn()`, "inventario/dev-mal-estado", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en postReturn: ${mensaje}`, bodyReturn, idEntrega, bodyEntrega })
        }

        grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Mal Estado", `Exito en el cambio por Mal Estado/Vencimiento`, ``, "inventario/dev-mal-estado", process.env.PRD)

        return res.json({
            idEntrega,
            idReturn: responceReturn.orderNumber,
            bodyEntrega,
            bodyReturn,
            responseEntrega,
            responceReturn,
        })
    } catch (error) {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Mal Estado", `Error en el devolucionMalEstadoController: ${error.message || ''}`, `catch del controller devolucionMalEstadoController`, "inventario/dev-mal-estado", process.env.PRD)
        return res.status(500).json({
            mensaje: `Error en en controlador devolucionMalEstadoController: ${error.message}`,
            idEntrega
        })
    }
}

const clientesDevMalEstado = async (req, res) => {
    try {
        const { listSucCode } = req.body
        let listClients = []
        console.log({ listSucCode })
        const clientes = await clientesBySucCode()
        listSucCode.map((sucursal) => {
            const filter = clientes.filter(client => client.SucCode === sucursal)
            listClients = [...listClients, ...filter]
        })
        return res.json(listClients)
    } catch (error) {
        console.log({ error })
        return res
    }
}
const getClienteByCardCodeController = async (req, res) => {
    try {
        const { cardCode } = req.query
        const cliente = await getClienteByCardCode(cardCode)
        if (cliente.length == 0)
            return res.status(400).json({ mensaje: `No existe cliente con el codigo: ${cardCode}` })
        return res.json(cliente[0])
    } catch (error) {
        console.log({ error })
        return res
    }
}

const devolucionPorValoradoController = async (req, res) => {
    let allResponseEntrega = [] //nuevo item
    let allResponseInvoice = []
    let allResponseReturn = []
    let allResponseCreditNote = []
    let allResponseReconciliacion = []
    let facturasCompletadas = []
    let allBodies = {}
    try {
        const { facturas, id_sap, AlmacenIngreso, AlmacenSalida, CardCode } = req.body
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        for (const factura of facturas) {
            const {
                Cuf,
                DocEntry,
                detalle,
            } = factura

            console.log(`----------FACTURA ${DocEntry}----------`)
            let totalFactura = 0

            let numRet = 0
            let newDocumentLinesReturn = []
            let newDocumentLinesEntrega = []
            let newDocumentLinesInvoice = []
            for (const devolucion of detalle) {
                const {
                    ItemCode,
                    Cantidad,
                    UnitPrice,
                    Total,
                    U_DESCLINEA,
                } = devolucion

                totalFactura += +Total

                let batchNumbers = []
                const batchData = await lotesArticuloAlmacenCantidad(ItemCode, AlmacenIngreso, Cantidad);
                console.log({ batch: batchData })
                if (batchData.message) {
                    endTime = Date.now();
                    // grabarLog(user.USERCODE, user.USERNAME, "Devolucion Valorado", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-valorado", process.env.PRD)
                    return res.status(400).json({
                        mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`,
                        allResponseReturn, allResponseCreditNote,
                        allResponseEntrega,
                        allResponseInvoice,
                        allResponseReconciliacion,
                        facturasCompletadas
                    })
                }
                if (batchData.length > 0) {
                    let new_quantity = 0
                    batchData.map((item) => {
                        new_quantity += Number(item.Quantity).toFixed(6)
                    })

                    batchNumbers = batchData.map(batch => ({
                        BaseLineNumber: numRet,
                        BatchNumber: batch.BatchNum,
                        Quantity: Number(batch.Quantity).toFixed(6),
                        ItemCode: batch.ItemCode
                    }))
                } else {
                    endTime = Date.now();
                    const mensaje = `No hay lotes para item: ${ItemCode}, almacen: ${AlmacenIngreso}, cantidad: ${Cantidad}. Factura: ${DocEntry}`
                    // grabarLog(user.USERCODE, user.USERNAME, "Devolucion Valorado", mensaje, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-valorado", process.env.PRD)                    

                    return res.status(400).json({
                        mensaje,
                        allResponseReturn,
                        allResponseCreditNote,
                        allResponseEntrega,
                        allResponseInvoice,
                        allResponseReconciliacion,
                        facturasCompletadas
                    })
                }

                const newLine = {
                    ItemCode,
                    WarehouseCode: AlmacenIngreso,
                    Quantity: Cantidad,
                    LineNum: numRet,
                    TaxCode: "IVA_GND",
                    AccountCode: "6210103",
                    GrossTotal: Total,
                    GrossPrice: UnitPrice,
                    U_DESCLINEA,
                    BatchNumbers: batchNumbers
                };
                console.log('------newLine-----')
                console.log({ newLine })

                newDocumentLinesReturn.push(newLine)

                let batchNumbersentrega = []
                const batchDataEntrega = await lotesArticuloAlmacenCantidad(ItemCode, AlmacenSalida, Cantidad);
                console.log({ batchDataEntrega })
                if (batchDataEntrega.message) {

                    const outputDir = path.join(__dirname, 'outputs');
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir);
                    }
                    const now = new Date();
                    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                    // Generar el nombre del archivo con el timestamp
                    const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                    fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                    console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                    endTime = Date.now();
                    // grabarLog(user.USERCODE, user.USERNAME, "Dovolucion Mal Estado", `${batchDataEntrega.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-mal-estado", process.env.PRD)
                    return res.status(400).json({
                        mensaje: `${batchDataEntrega.message || 'Error en lotesArticuloAlmacenCantidad'}`,
                        allResponseReturn, allResponseCreditNote,
                        allResponseEntrega,
                        allResponseInvoice,
                        allResponseReconciliacion,
                        facturasCompletadas
                    })
                }
                if (batchDataEntrega.length > 0) {
                    let new_quantity = 0
                    batchDataEntrega.map((item) => {
                        new_quantity += Number(item.Quantity).toFixed(6)
                    })
                    batchNumbersentrega = batchDataEntrega.map(batch => ({
                        BaseLineNumber: numRet,
                        BatchNumber: batch.BatchNum,
                        Quantity: Number(batch.Quantity).toFixed(6),
                        ItemCode: batch.ItemCode
                    }))
                } else {

                    const outputDir = path.join(__dirname, 'outputs');
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir);
                    }
                    const now = new Date();
                    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                    // Generar el nombre del archivo con el timestamp
                    const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                    fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                    console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                    endTime = Date.now();
                    const mensaje = `No hay lotes para item: ${ItemCode}, almacen: ${AlmacenSalida}, cantidad: ${Cantidad}. Factura: ${DocEntry}`
                    // grabarLog(user.USERCODE, user.USERNAME, "Devolucion Valorado", mensaje, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-valorado", process.env.PRD)                    

                    return res.status(400).json({
                        mensaje,
                        allResponseReturn,
                        allResponseCreditNote,
                        allResponseEntrega,
                        allResponseInvoice,
                        allResponseReconciliacion,
                        facturasCompletadas
                    })
                }

                const newLineEntrega = {
                    ItemCode,
                    WarehouseCode: AlmacenSalida,
                    Quantity: Cantidad,
                    LineNum: numRet,
                    TaxCode: "IVA_GND",
                    AccountCode: "6210103",
                    GrossTotal: Total,
                    GrossPrice: UnitPrice,
                    U_DESCLINEA,
                    BatchNumbers: batchNumbersentrega
                };
                console.log({ newLineEntrega })
                newDocumentLinesEntrega.push(newLineEntrega)

                const newLineInvoice = {
                    BaseLine: numRet,
                    BaseType: 15,
                    ItemCode,
                    WarehouseCode: AlmacenSalida,
                    Quantity: Cantidad,
                    LineNum: numRet,
                    TaxCode: "IVA_GND",
                    AccountCode: "6210103",
                    GrossTotal: Total,
                    GrossPrice: UnitPrice,
                    U_DESCLINEA
                };
                newDocumentLinesInvoice.push(newLineInvoice)

                numRet += 1
            }

            const bodyEntrega = {
                Series: 353,
                CardCode: CardCode,
                U_UserCode: id_sap,
                U_B_cufd: Cuf, //////
                DocumentLines: newDocumentLinesEntrega,
            }

            const bodyReturn = {
                Series: 352,
                CardCode: CardCode,
                U_UserCode: id_sap,
                U_B_cufd: Cuf,
                DocumentLines: newDocumentLinesReturn,
            }
            console.log('body enterga -----------------------------------------------')
            console.log(JSON.stringify({ bodyEntrega }, null, 2))
            allBodies[DocEntry] = { bodyEntrega }

            //? ----------------------------------------------------------------      entrega .
            const responseEntrega = await postEntrega(bodyEntrega)
            allResponseEntrega.push(responseEntrega)
            if (responseEntrega.lang) {
                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                console.log(`Objeto allBodies guardado en ${fileNameJson}`);
                endTime = Date.now();
                // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Valorado", `Error interno en la entrega de sap en postEntrega: ${responseEntrega.value || ''}`, ``, "inventario/dev-mal-estado", process.env.PRD)
                return res.status(400).json({
                    mensaje: `Error interno en la entrega de sap. ${responseEntrega.value || ''}. Nro Factura: ${DocEntry}`,
                    responseEntrega,
                    bodyEntrega,
                    bodyReturn,
                    allResponseEntrega,
                    allResponseReturn,
                    allResponseCreditNote,
                    allResponseInvoice,
                    allResponseReconciliacion,
                    facturasCompletadas
                })
            }

            //---------------------------- INVOICE
            const deliveryData = responseEntrega.deliveryN44umber

            const fechaFormater = new Date()
            // Extraer componentes de la fecha
            const year = fechaFormater.getUTCFullYear();
            const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0'); // Asegurarse de que sea 2 dígitos
            const day = String(fechaFormater.getUTCDate()).padStart(2, '0'); // Asegurarse de que sea 2 dígitos

            // Formatear la fecha en YYYYMMDD
            const formater = `${year}${month}${day}`;

            const responseHana = await entregaDetallerFactura(+deliveryData, Cuf, +DocEntry, formater)
            console.log({ responseHana })
            if (responseHana.message) {
                endTime = Date.now()
                // grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al entregaDetallerFactura: ${responseHana.message || "linea 292"}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                return res.status(400).json({ mensaje: 'Error al procesar la solicitud: entregaDetallerFactura' })
            }
            const DocumentLinesHana = [];
            let cabezeraHana = [];

            let DocumentAdditionalExpensesInv = [];

            for (const line of responseHana) {
                const {
                    LineNum,
                    BaseType,
                    BaseEntry, BaseLine, ItemCode, Quantity, GrossPrice, GrossTotal, WarehouseCode, AccountCode, TaxCode, MeasureUnit, UnitsOfMeasurment, U_DESCLINEA,
                    ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                    DocTotal, U_OSLP_ID, U_UserCode, ...result } = line

                if (!cabezeraHana.length) {
                    cabezeraHana = {
                        ...result,
                        DocTotal: Number(DocTotal),
                        U_OSLP_ID: U_OSLP_ID || "",
                        U_UserCode: U_UserCode || ""
                    };
                    DocumentAdditionalExpensesInv = [
                        { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode3, LineTotal: +LineTotal3, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode4, LineTotal: +LineTotal4, TaxCode: 'IVA' },
                    ]
                }
                DocumentLinesHana.push({
                    LineNum, BaseType, BaseEntry, BaseLine, ItemCode, Quantity: Number(Quantity), GrossPrice: Number(GrossPrice), GrossTotal: Number(GrossTotal), WarehouseCode, AccountCode, TaxCode, MeasureUnit, UnitsOfMeasurment: Number(UnitsOfMeasurment), U_DESCLINEA: Number(U_DESCLINEA)
                })
            }

            const responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses: DocumentAdditionalExpensesInv
            }
            console.log({ responseHanaB })

            console.log('body invoice -----------------------------------------------')
            console.log(JSON.stringify({ responseHanaB }, null, 2))
            allBodies[DocEntry] = { bodyEntrega, bodyInvoice: responseHanaB }
            const responseInvoice = await postInvoice(responseHanaB)
            allResponseInvoice.push(responseInvoice)
            if (responseInvoice.status == 400) {

                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                return res.status(400).json({
                    mensaje: `Error en postInvoice: ${responseInvoice.errorMessage.value || 'No definido'}. Factura Nro: ${DocEntry}`, responseHanaB, bodyEntrega, bodyReturn,
                    allResponseReturn, allResponseCreditNote, allResponseEntrega, allResponseInvoice,
                    allResponseReconciliacion,
                    facturasCompletadas
                })
            }

            // return res.json({bodyInvoice, responseHanaB, idInvoice: responseInvoice.idInvoice, bodyEntrega, bodyReturn})

            //? ---------------------------------------------------------------- return.
            console.log('body return -----------------------------------------------')
            bodyReturn.Series = 352
            console.log(JSON.stringify({ bodyReturn }, null, 2))
            allBodies[DocEntry] = { bodyEntrega, bodyInvoice: responseHanaB, bodyReturn }

            const responceReturn = await postReturn(bodyReturn)
            console.log({ responceReturn })

            const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
            allResponseReturn.push(responceReturn)
            if (responceReturn.status > 300) {
                console.log({ errorMessage: responceReturn.errorMessage })

                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
                if (mensaje.value)
                    mensaje = mensaje.value
                // grabarLog(user.USERCODE, user.USERNAME, "Inventario alorado", `Error en postReturn: ${mensaje}. Nro Factura ${DocEntry}`, `postReturn()`, "inventario/dev-valorado", process.env.PRD)
                return res.status(400).json({
                    mensaje: `Error en postReturn: ${mensaje}. Nro Factura: ${DocEntry}`,
                    bodyReturn,
                    allResponseReturn,
                    allResponseCreditNote,
                    allResponseEntrega,
                    allResponseInvoice,
                    allResponseReconciliacion,
                    facturasCompletadas
                })
            }
            const docEntryDev = responceReturn.orderNumber
            //---------------Credit notes
            const devolucionDetalle = await obtenerDevolucionDetalle(docEntryDev)

            const cabeceraCN = []
            const DocumentLinesCN = []
            let DocumentAdditionalExpenses = []
            let numDev = 0
            for (const lineDevolucion of devolucionDetalle) {
                const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
                    CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
                    PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
                    ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                    ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev,
                    GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev,
                    ...restDev
                } = lineDevolucion
                if (cabeceraCN.length == 0) {
                    cabeceraCN.push({
                        DocDate: DocDateDev,
                        DocDueDate: DocDueDateDev,
                        CardCode: CardCodeDev,
                        NumAtCard,
                        DocTotal: DocTotalDev,
                        DocCurrency: DocCurrencyDev,
                        Reference1: docEntryDev,// DocEntry de la devolucion
                        Reference2: DocEntry ?? '',// DocEntry de la factura
                        Comments: CommentsDev,
                        JournalMemo: JournalMemoDev,
                        PaymentGroupCode,
                        SalesPersonCode,
                        Series: 361,
                        U_UserCode
                    })
                }
                if (DocumentAdditionalExpenses.length == 0) {
                    DocumentAdditionalExpenses = [
                        { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_GND' },
                        { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_GND' },
                    ]
                }

                const newLineDev = {
                    LineNum: numDev,
                    BaseLine: LineNumDev,
                    BaseType: 16,
                    BaseEntry: docEntryDev,
                    ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev,
                    AccountCode: '6210103',
                    // AccountCode: AccountCodeDev,
                    GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev,
                    TaxCode: 'IVA_GND'
                }

                DocumentLinesCN.push(newLineDev)

                numDev += 1
            }

            const bodyCreditNotes = {
                ...cabeceraCN[0],
                DocumentLines: DocumentLinesCN,
                DocumentAdditionalExpenses
            }
            allBodies[DocEntry] = { bodyEntrega, bodyInvoice: responseHanaB, bodyReturn, bodyCreditNotes }

            const responseCreditNote = await postCreditNotes(bodyCreditNotes)
            allResponseCreditNote.push(responseCreditNote)
            if (responseCreditNote.status > 299) {

                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                let mensaje = responseCreditNote.errorMessage
                if (typeof mensaje != 'string' && mensaje.lang) {
                    mensaje = mensaje.value
                }

                mensaje = `Error en creditNote: ${mensaje}. Factura Nro: ${DocEntry}`

                return res.status(400).json({
                    mensaje,
                    bodyCreditNotes,
                    devolucionDetalle,
                    idReturn: docEntryDev,
                    bodyReturn,
                    allResponseCreditNote,
                    allResponseReturn,
                    allResponseEntrega,
                    allResponseInvoice,
                    allResponseReconciliacion,
                    facturasCompletadas
                })
            }

            const InternalReconciliationOpenTransRows = [
                {
                    ShortName: CardCode,
                    TransId: responseCreditNote.TransNum,
                    TransRowId: 0,
                    SrcObjTyp: "14",
                    SrcObjAbs: responseCreditNote.orderNumber,
                    CreditOrDebit: "codCredit",
                    ReconcileAmount: totalFactura,
                    CashDiscount: 0.0,
                    Selected: "tYES",
                },
                {
                    ShortName: CardCode,
                    TransId: responseInvoice.TransNum,
                    TransRowId: 0,
                    SrcObjTyp: "13",
                    SrcObjAbs: responseInvoice.idInvoice,
                    CreditOrDebit: "codDebit",
                    ReconcileAmount: totalFactura,
                    CashDiscount: 0.0,
                    Selected: "tYES",
                }
            ]

            let bodyReconciliacion = {
                ReconDate: `${year}-${month}-${day}`,
                CardOrAccount: "coaCard",
                // ReconType: "rtManual",
                // Total: totalFactura,
                InternalReconciliationOpenTransRows,
            }
            console.log({ bodyReconciliacion })
            allBodies[DocEntry] = { bodyEntrega, bodyInvoice: responseHanaB, bodyReturn, bodyCreditNotes, bodyReconciliacion }
            const responseReconciliacion = await postReconciliacion(bodyReconciliacion)
            console.log({ responseReconciliacion })
            allResponseReconciliacion.push(responseReconciliacion)

            if (responseReconciliacion.status == 400) {

                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                let mensaje = responseReconciliacion.errorMessage
                if (typeof mensaje != 'string' && mensaje.lang) {
                    mensaje = mensaje.value
                }

                mensaje = `Error en postReconciliacion: ${mensaje}. Factura Nro: ${DocEntry}`

                return res.status(400).json({
                    mensaje,
                    bodyReconciliacion,
                    bodyCreditNotes,
                    responseHanaB,
                    bodyReturn,
                    allResponseCreditNote,
                    allResponseReturn,
                    allResponseEntrega,
                    allResponseInvoice,
                    allResponseReconciliacion,
                    facturasCompletadas
                })
            }

            facturasCompletadas.push(DocEntry)
        }

        const outputDir = path.join(__dirname, 'outputs');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

        // Generar el nombre del archivo con el timestamp
        const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
        fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
        console.log(`Objeto allBodies guardado en ${fileNameJson}`);

        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Valorado", `Exito en la devolucion. Facturas realizadas: ${facturasCompletadas}`, ``, "inventario/dev-valorado", process.env.PRD)
        return res.json({
            allResponseReturn,
            allResponseCreditNote,
            allResponseEntrega,
            allResponseInvoice,
            allResponseReconciliacion,
            facturasCompletadas
        })
    } catch (error) {
        // const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ error })

        const outputDir = path.join(__dirname, 'outputs');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

        // Generar el nombre del archivo con el timestamp
        const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
        fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
        console.log(`Objeto allBodies guardado en ${fileNameJson}`);

        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Valorado", `Error en el devolucionPorValoradoController: ${error.message || ''}`, `catch del controller devolucionMalEstadoController`, "inventario/dev-mal-estado", process.env.PRD)
        return res.status(500).json({
            mensaje: `Error en en controlador devolucionPorValoradoController: ${error.message}`,
            allResponseReturn,
            allResponseCreditNote,
            allResponseEntrega,
            allResponseInvoice,
            allResponseReconciliacion,
            facturasCompletadas
        })
    }
}

const detalleFacturasController = async (req, res) => {
    try {
        const { docEntries } = req.body
        let results = {}
        for (const docEntry of docEntries) {
            const response = await detalleVentas(docEntry.DocEntry)
            console.log({ response })
            results[docEntry.DocEntry] = response
        }

        return res.json(results)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador detalleFacturasController. ${error.message || ''}` })
    }
}

const imprimibleDevolucionController = async (req, res) => {
    let browser;
    try {
        const { id } = req.body
        console.log({ id })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const layout = await devolucionLayout(id)
        console.log({ layout })

        if (layout.length == 0) {
            grabarLog(user.USERCODE, user.USERNAME, "Inventario Imprimible Devolucion",
                `Error de SAP, no hay devolucion con el id: ${id}`, 'IFA_LAPP_VEN_DEVOLUCION_LAYOUT',
                "inventario/imprimible-devolucion", process.env.PRD)
            return res.status(400).json({ mensaje: `Error de SAP, no hay devolucion con el id: ${id}` });
        }
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
            Comments,
            SlpName
        } = layout[0];

        layout.map((item) => {
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
        time = `${DocTime[0] || 0}${DocTime[1] || 0}:${DocTime[2] || 0}${DocTime[3] || 0}`
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
            Comments,
            SlpName: `${SlpName || 'No Asignado'}`,
            detailsList
        };
        // return res.json({data, layout})

        //! Generar QR Code
        const qrCode = await QRCode.toDataURL(data.BarCode.toString());

        //! Renderizar la plantilla EJS a HTML
        const htmlTemplate = path.join(__dirname, 'imprimible', 'template.ejs');
        const htmlContent = await ejs.renderFile(htmlTemplate, { data, qrCode });

        //! Generar el PDF con Puppeteer
        browser = await puppeteer.launch({ headless: 'new' }); // Modo headless
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });


        //! Definir nombre del archivo
        const fileName = `devolucion_${data.DocNum}_${new Date()}.pdf`;

        //! Registrar en el log
        // grabarLog(user.USERCODE, user.USERNAME, "Facturacion crear Nota Entrega",
        //     "Nota Creada con éxito", layout.query || '', "facturacion/nota-entrega", process.env.PRD);

        // await browser.close();
        //! Enviar el PDF como respuesta
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        grabarLog(user.USERCODE, user.USERNAME, "Inventario Imprimible Devolucion",
            `Exito en el imprimible Devolucion`, 'IFA_LAPP_VEN_DEVOLUCION_LAYOUT',
            "inventario/imprimible-devolucion", process.env.PRD)

        return res.end(pdfBuffer);
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }

        grabarLog(user.USERCODE, user.USERNAME, "Inventario Imprimible Devolucion",
            `${error.message || 'Error en el controlador imprimibleDevolucionController'}`, 'catch del controlador',
            "inventario/imprimible-devolucion", process.env.PRD)
        return res.status(500).json({ mensaje: `error en el controlador imprimibleDevolucionController. ${error.message || ''}` })
    }
    finally {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error("Error al cerrar el navegador:", err.message);
            }
        }
    }
}

const imprimibleSalidaController = async (req, res) => {
    let browser;
    try {
        const { id } = req.body

        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response = await notaEntrega(id)
        const layout = response.result
        console.log({ layout })
        // return res.json({layout})
        if (layout.length == 0) {
            grabarLog(user.USERCODE, user.USERNAME, "Inventario Imprimible Salida",
                `Error de SAP, no hay entrega con el id: ${id}`, 'IFA_LAPP_VEN_ENTREGA_LAYOUT',
                "inventario/imprimible-salida", process.env.PRD);
            return res.status(400).json({ mensaje: `Error de SAP, no hay entrega con el id: ${id}` });
        }
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
            Comments,
            SlpName
        } = layout[0];
        let totalCant = 0
        layout.map((item) => {
            const { Quantity, ...restData } = item;
            detailsList.push({ Quantity, ...restData });
            totalCant += +Quantity
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
        time = `${DocTime[0] || 0}${DocTime[1] || 0}:${DocTime[2] || 0}${DocTime[3] || 0}`
        const data = {
            BarCode,
            time,
            DocNum,
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
            Comments,
            SlpName: `${SlpName || 'No Asignado'}`,
            detailsList,
            totalCant
        };
        // return res.json({data, layout})

        //! Generar QR Code
        const qrCode = await QRCode.toDataURL(data.BarCode.toString());

        //! Renderizar la plantilla EJS a HTML
        const htmlTemplate = path.join(__dirname, 'imprimible', 'template-salida.ejs');
        const htmlContent = await ejs.renderFile(htmlTemplate, { data, qrCode });

        //! Generar el PDF con Puppeteer
        browser = await puppeteer.launch({ headless: 'new' }); // Modo headless
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        //! Definir nombre del archivo
        const fileName = `salida_${data.DocNum}_${new Date()}.pdf`;

        // await browser.close();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        grabarLog(user.USERCODE, user.USERNAME, "Inventario Imprimible Salida",
            `Exito en el imprimible salida`, 'IFA_LAPP_VEN_ENTREGA_LAYOUT',
            "inventario/imprimible-salida", process.env.PRD);
        return res.end(pdfBuffer);
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(user.USERCODE, user.USERNAME, "Inventario Imprimible Salida",
            `${error.message || 'Error en el controller imprimibleSalidaController'}`, 'catch del imprimibleSalidaController',
            "inventario/imprimible-salida", process.env.PRD);

        return res.status(500).json({ mensaje: `error en el controlador imprimibleSalidaController. ${error.message || ''}` })
    }
    finally {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error("Error al cerrar el navegador:", err.message);
            }
        }
    }
}

const devolucionPorValoradoDifArticulosController = async (req, res) => {
    let allResponseReturn = []
    let allResponseCreditNote = []
    let facturasCompletadas = []
    let responseEntrega
    let responseInvoice
    let responseReconciliacion
    let devolucionFinished = false
    let entregaFinished = false
    let allBodies = {}
    try {
        let { facturas, id_sap, CardCode, AlmacenIngreso, Comentario
            // AlmacenSalida, nuevosArticulos 
        } = req.body
        console.log(JSON.stringify({
            facturas, id_sap, CardCode, AlmacenIngreso, Comentario
            // , AlmacenSalida, nuevosArticulos 
        }, null, 2))
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const idSap = user.ID_SAP || 0
        id_sap = idSap
        if (id_sap == 0 || !id_sap) {
            return res.status(400).json({ mensaje: 'Usted no tiene ID SAP' })
        }
        // return res.json({ facturas, id_sap, AlmacenIngreso, CardCode })
        // return 

        let totalFacturas = 0
        let totalesFactura = []

        const deudaCliente = await getDeudaDelCliente(CardCode)
        console.log({ deudaCliente })
        let ControlAccount = '2110401'
        if (deudaCliente.length > 0 && (deudaCliente[0].Balance > 0)) {
            ControlAccount = '1120101'
        }

        for (const factura of facturas) {
            const {
                Cuf,
                DocEntry,
                DocEntrySap,
                detalle,
            } = factura

            console.log(`----------FACTURA ${DocEntry}----------`)
            let totalFactura = 0

            let numRet = 0
            let newDocumentLinesReturn = []
            for (const devolucion of detalle) {
                const {
                    ItemCode,
                    Cantidad,
                    UnitPrice,
                    Total,
                    U_DESCLINEA,
                    Lote,
                    NumPerMsr
                } = devolucion

                totalFactura += +Total

                let batchNumbers = []
                // const batchData = await lotesArticuloAlmacenCantidad(ItemCode, AlmacenIngreso, Cantidad);
                // console.log({ batch: batchData })
                // if (batchData.message) {
                //     endTime = Date.now();
                //     // grabarLog(user.USERCODE, user.USERNAME, "Devolucion Valorado", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-valorado", process.env.PRD)
                //     return res.status(400).json({
                //         mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`,
                //         allResponseReturn, allResponseCreditNote,
                //         facturasCompletadas,
                //         devolucionFinished, 
                //         // entregaFinished
                //     })
                // }
                // if (batchData.length > 0) {
                //     let new_quantity = 0
                //     batchData.map((item) => {
                //         new_quantity += Number(item.Quantity).toFixed(6)
                //     })

                //     batchNumbers = batchData.map(batch => ({
                //         BaseLineNumber: numRet,
                //         BatchNumber: batch.BatchNum,
                //         Quantity: Number(batch.Quantity).toFixed(6),
                //         ItemCode: batch.ItemCode
                //     }))
                // }else{
                //     endTime = Date.now();
                //     const mensaje = `No hay lotes para item: ${ItemCode}, almacen: ${AlmacenIngreso}, cantidad: ${Cantidad}. Factura: ${DocEntry}`
                //     // grabarLog(user.USERCODE, user.USERNAME, "Devolucion Valorado", mensaje, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-valorado", process.env.PRD)                    

                //     return res.status(400).json({
                //         mensaje,
                //         allResponseReturn, 
                //         allResponseCreditNote,
                //         facturasCompletadas,
                //         devolucionFinished, 
                //         // entregaFinished
                //     })
                // }

                batchNumbers.push({
                    BaseLineNumber: numRet,
                    BatchNumber: Lote,
                    Quantity: Cantidad * NumPerMsr,
                    ItemCode: ItemCode
                })
                const newLine = {
                    ItemCode,
                    WarehouseCode: AlmacenIngreso,
                    Quantity: Cantidad,
                    LineNum: numRet,
                    TaxCode: "IVA_GND",
                    AccountCode: "6210103",
                    GrossTotal: Total,
                    GrossPrice: UnitPrice,
                    U_DESCLINEA,
                    BatchNumbers: batchNumbers
                };
                console.log('------newLine-----')
                console.log({ newLine })

                newDocumentLinesReturn.push(newLine)

                numRet += 1
            }

            const bodyReturn = {
                Series: 352,
                CardCode: CardCode,
                U_UserCode: id_sap,
                U_B_cufd: Cuf,
                JournalMemo: `CAMBIO X VALORADO. ${Comentario ? Comentario.toUpperCase() : ''}`,
                Comments: `CAMBIO X VALORADO. ${Comentario ? Comentario.toUpperCase() : ''}`,
                DocumentLines: newDocumentLinesReturn,
            }


            //? ---------------------------------------------------------------- return.
            console.log('body return -----------------------------------------------')
            bodyReturn.Series = 352
            console.log(JSON.stringify({ bodyReturn }, null, 2))
            allBodies[DocEntry] = { bodyReturn }
            //! 1ERO RETURN 
            const responceReturn = await postReturn(bodyReturn)
            console.log({ responceReturn })

            allResponseReturn.push(responceReturn)
            if (responceReturn.status > 300) {
                console.log({ errorMessage: responceReturn.errorMessage })

                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
                if (mensaje.value)
                    mensaje = mensaje.value
                grabarLog(user.USERCODE, user.USERNAME, "Inventario Cambio Valorado", `Error en postReturn: ${mensaje}. Nro Factura ${DocEntry}`, `postReturn()`, "inventario/dev-valorado-dif-art", process.env.PRD)
                return res.status(400).json({
                    mensaje: `Error en postReturn: ${mensaje}. Nro Factura: ${DocEntry}`,
                    bodyReturn,
                    allResponseReturn,
                    allResponseCreditNote,
                    facturasCompletadas,
                    devolucionFinished,
                    // entregaFinished
                })
            }
            const docEntryDev = responceReturn.orderNumber
            //---------------Credit notes
            //! 2ERO DETALLE DE LA DEVOLUCION
            const devolucionDetalle = await obtenerDevolucionDetalle(docEntryDev)

            const cabeceraCN = []
            const DocumentLinesCN = []
            let DocumentAdditionalExpenses = []
            let numDev = 0
            for (const lineDevolucion of devolucionDetalle) {
                const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
                    CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
                    PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
                    ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                    ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev,
                    GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev,
                    ...restDev
                } = lineDevolucion
                if (cabeceraCN.length == 0) {

                    cabeceraCN.push({
                        DocDate: DocDateDev,
                        DocDueDate: DocDueDateDev,
                        CardCode: CardCodeDev,
                        NumAtCard,
                        DocTotal: DocTotalDev,
                        DocCurrency: DocCurrencyDev,
                        Reference1: docEntryDev,// DocEntry de la devolucion
                        Reference2: DocEntrySap ?? '',// DocEntry de la factura
                        Comments: CommentsDev,
                        JournalMemo: JournalMemoDev,
                        PaymentGroupCode,
                        SalesPersonCode,
                        Series: 361,
                        U_UserCode,
                        ControlAccount
                    })
                }
                if (DocumentAdditionalExpenses.length == 0) {
                    DocumentAdditionalExpenses = [
                        { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_GND' },
                        { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_GND' },
                    ]
                }

                const newLineDev = {
                    LineNum: numDev,
                    BaseLine: LineNumDev,
                    BaseType: 16,
                    BaseEntry: docEntryDev,
                    ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev,
                    AccountCode: '6210103',
                    // AccountCode: AccountCodeDev,
                    GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev,
                    TaxCode: 'IVA_GND'
                }

                DocumentLinesCN.push(newLineDev)

                numDev += 1
            }

            const bodyCreditNotes = {
                ...cabeceraCN[0],
                DocumentLines: DocumentLinesCN,
                DocumentAdditionalExpenses
            }
            allBodies[DocEntry] = { bodyReturn, bodyCreditNotes }
            //! 3ERO CREDIT NOTES
            const responseCreditNote = await postCreditNotes(bodyCreditNotes)
            allResponseCreditNote.push(responseCreditNote)
            if (responseCreditNote.status > 299) {

                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
                console.log(`Objeto allBodies guardado en ${fileNameJson}`);

                let mensaje = responseCreditNote.errorMessage
                if (typeof mensaje != 'string' && mensaje.lang) {
                    mensaje = mensaje.value
                }

                mensaje = `Error en creditNote: ${mensaje}. Factura Nro: ${DocEntry}`
                grabarLog(user.USERCODE, user.USERNAME, `Inventario DEvolucion Valorado`, mensaje, 'postCreditNotes', `inventario/dev-valorado-dif-art`, process.env.PRD)
                return res.status(400).json({
                    mensaje,
                    bodyCreditNotes,
                    devolucionDetalle,
                    idReturn: docEntryDev,
                    bodyReturn,
                    allResponseCreditNote,
                    allResponseReturn,
                    facturasCompletadas,
                    devolucionFinished,
                    // entregaFinished
                })
            }
            totalFacturas += +totalFactura
            totalesFactura.push(totalFactura)
            facturasCompletadas.push(DocEntry)
        }
        devolucionFinished = true

        grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Valorado", `Exito en el return y credit note. Facturas realizadas: ${facturasCompletadas}`, ``, "inventario/dev-valorado-dif-art", process.env.PRD)
        return res.json({
            allResponseReturn,
            allResponseCreditNote,
            facturasCompletadas,
            devolucionFinished,
        })
    } catch (error) {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ error })

        const outputDir = path.join(__dirname, 'outputs');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

        // Generar el nombre del archivo con el timestamp
        const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
        fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
        console.log(`Objeto allBodies guardado en ${fileNameJson}`);

        grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Valorado", `Error en el devolucionPorValoradoController: ${error.message || ''}`, `catch del controller devolucionMalEstadoController`, "inventario/dev-valorado-dif-art", process.env.PRD)
        return res.status(500).json({
            mensaje: `Error en en controlador devolucionPorValoradoController: ${error.message}`,
            allResponseReturn,
            allResponseCreditNote,
            // responseEntrega,
            // responseInvoice,
            // responseReconciliacion,
            facturasCompletadas,
            // entregaFinished,
            devolucionFinished
        })
    }
}

const entregaCambioValoradoController = async (req, res) => {
    let entregaFinished = false
    let responseEntrega
    let bodyEntrega
    try {
        const { nuevosArticulos, AlmacenSalida, CardCode, id_sap, Comentario, CreditNotes } = req.body
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        ///////////////////////// Entregas
        let newDocumentLinesEntrega = []
        let numLines = 0
        // return res.status(400).json({
        //     nuevosArticulos,
        //     AlmacenSalida,
        //     CardCode,
        //     id_sap,
        //     Comentario,
        //     CreditNotes,
        // })
        for (const nuevoArticulo of nuevosArticulos) {
            const {
                ItemCode,
                Cantidad,
                UnitPrice,
                Total,
                U_DESCLINEA,
            } = nuevoArticulo

            let batchNumbersentrega = []
            const batchDataEntrega = await lotesArticuloAlmacenCantidad(ItemCode, AlmacenSalida, Cantidad);
            console.log({ batchDataEntrega })
            if (batchDataEntrega.message) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Inventario Entrega Valorado", 'IFA_VM_SELECTION_BATCH_FEFO', "inventario/dev-valorado-dif-art", process.env.PRD)
                return res.status(400).json({
                    mensaje: `${batchDataEntrega.message || 'Error en lotesArticuloAlmacenCantidad'}`,
                    newDocumentLinesEntrega,
                    entregaFinished
                })
            }
            if (batchDataEntrega.length > 0) {
                let new_quantity = 0
                batchDataEntrega.map((item) => {
                    new_quantity += Number(item.Quantity).toFixed(6)
                })
                batchNumbersentrega = batchDataEntrega.map(batch => ({
                    BaseLineNumber: numLines,
                    BatchNumber: batch.BatchNum,
                    Quantity: Number(batch.Quantity).toFixed(6),
                    ItemCode: batch.ItemCode
                }))
            } else {
                const mensaje = `No hay lotes para item: ${ItemCode}, almacen: ${AlmacenSalida}, cantidad: ${Cantidad}.`
                grabarLog(user.USERCODE, user.USERNAME, "Inventario Entrega Valorado", mensaje, 'IFA_VM_SELECTION_BATCH_FEFO', "inventario/dev-valorado-dif-art", process.env.PRD)
                return res.status(400).json({
                    mensaje, newDocumentLinesEntrega, entregaFinished
                })
            }

            const newLineEntrega = {
                ItemCode,
                WarehouseCode: AlmacenSalida,
                Quantity: Cantidad,
                LineNum: numLines,
                TaxCode: "IVA",
                AccountCode: "6210103",
                GrossTotal: Total,
                GrossPrice: UnitPrice,
                U_DESCLINEA,
                BatchNumbers: batchNumbersentrega
            };
            console.log({ newLineEntrega })
            newDocumentLinesEntrega.push(newLineEntrega)
            numLines += 1
        }
        bodyEntrega = {
            Series: 353,
            CardCode: CardCode,
            U_UserCode: id_sap,
            JournalMemo: `CAMBIO X VALORADO.  ${Comentario ? Comentario.toUpperCase() : ''}`,
            Comments: `CAMBIO X VALORADO. ${Comentario ? Comentario.toUpperCase() : ''}`,
            DocumentLines: newDocumentLinesEntrega,
        }
        // console.log('body enterga -----------------------------------------------')
        console.log(JSON.stringify({ bodyEntrega }, null, 2))
        const allBodies = { bodyEntrega }

        //? ----------------------------------------------------------------      entrega .
        // return res.status(400).json({
        //     nuevosArticulos,
        //     AlmacenSalida,
        //     CardCode,
        //     id_sap,
        //     Comentario,
        //     CreditNotes,
        //     bodyEntrega
        // })
        responseEntrega = await postEntrega(bodyEntrega)
        if (responseEntrega.lang) {
            const outputDir = path.join(__dirname, 'outputs');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

            // Generar el nombre del archivo con el timestamp
            const fileNameJson = path.join(outputDir, `bodie_entrega_${timestamp}.json`);
            fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
            console.log(`Objeto allBodies guardado en ${fileNameJson}`);
            grabarLog(user.USERCODE, user.USERNAME, "Inventario Entrega Valorado", `Error interno en la entrega de sap en postEntrega: ${responseEntrega.value || ''}`, `postEntrega`, "inventario/dev-mal-estado-dif-art", process.env.PRD)
            return res.status(400).json({
                mensaje: `Error interno en la entrega de sap. ${responseEntrega.value || ''}.`,
                responseEntrega,
                bodyEntrega, entregaFinished
            })
        }

        entregaFinished = true
        deliveryNumber = responseEntrega.deliveryN44umber
        for (const element of CreditNotes) {
            await createReferenceCreditNotesAndDelivery(element.orderNumber, deliveryNumber)
        }
        grabarLog(user.USERCODE, user.USERNAME, "Inventario Entrega Valorado", `Entrega de sap exitosa`, ``, "inventario/dev-valorado-dif-art", process.env.PRD)
        return res.json({
            responseEntrega, entregaFinished,
            bodyEntrega,
            idEntrega: responseEntrega.deliveryN44umber
        })
    } catch (error) {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Inventario Entrega Valorado", `Error en el controlador entregaCambioValoradoController: ${error.message || ''}`, `catch de entregaCambioValoradoController`, "inventario/dev-valorado-dif-art", process.env.PRD)
        return res.status(500).json({
            mensaje: `Error en el controlador entregaCambioValoradoController: ${error.message || ''}`,
            error: error.message,
            entregaFinished,
            bodyEntrega,
            responseEntrega
        })
    }
}

const facturacionCambioValoradoController = async (req, res) => {
    let cuf
    try {
        const { CardCode, totalFacturas, allResponseCreditNote, idEntrega, totalesFactura } = req.body
        const deliveryData = idEntrega
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const deliveryBody = await obtenerEntregaDetalle(deliveryData)
        if (deliveryBody.message) {
            grabarLog(user.USERCODE, user.USERNAME, "Inventario Facturacion Cambio Valorado", `${deliveryBody.message}`, `IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE`, "inventario/facturacion-cambio", process.env.PRD)
            return res.json({ mensaje: deliveryBody.message })
        }
        // return res.json({deliveryBody})
        let totalDeLaEntrega = 0

        const detalle = [];
        const cabezera = [];
        for (const line of deliveryBody) {
            const { producto, descripcion, cantidad, precioUnitario, montoDescuento,
                subTotal, numeroImei, numeroSerie, complemento, ...result
            } = line
            if (!cabezera.length) {
                cabezera.push({ ...result, complemento: complemento || "" })
            }
            detalle.push({
                producto,
                descripcion,
                cantidad,
                precioUnitario,
                montoDescuento,
                subTotal,
                numeroImei,
                numeroSerie
            })
            totalDeLaEntrega += +subTotal
        }

        const bodyFactura = {
            ...cabezera[0],
            detalle
        }

        const { documento_via: docVia, ...rest } = bodyFactura
        const bodyFinalFactura = {
            ...rest,
            documento_via: `${docVia}`
        }
        const { direccion, ...restFact } = bodyFinalFactura
        if (direccion == null || !direccion || direccion == undefined) {
            body = { ...restFact, direccion: '' }
        } else {
            body = bodyFinalFactura
        }
        //TODO --------------------------------------------------------------  PROSIN
        const responseGenesis = await spObtenerCUF(deliveryData)
        console.log({ responseGenesis })
        if (responseGenesis.message) {
            grabarLog(user.USERCODE, user.USERNAME, "Inventario Facturacion Cambio Valorado", `${responseGenesis.message}`, `spObtenerCUF`, "inventario/facturacion-cambio", process.env.PRD)
            return res.status(400).json({ mensaje: `${responseGenesis.message || 'Error en la consulta spObtenerCUF'}` })
        }
        let invoiceResponse
        let responseHanaB
        //? si existe el cuf:
        if (responseGenesis.length != 0) {
            console.log('el cuf ya existe')
            const dataGenesis = responseGenesis[0]
            cuf = dataGenesis.cuf
            const nroFactura = dataGenesis.factura
            const fechaFormater = new Date(dataGenesis.fecha_emision)
            // Extraer componentes de la fecha
            const year = fechaFormater.getUTCFullYear();
            const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0'); // Asegurarse de que sea 2 dígitos
            const day = String(fechaFormater.getUTCDate()).padStart(2, '0'); // Asegurarse de que sea 2 dígitos

            // Formatear la fecha en YYYYMMDD
            const formater = `${year}${month}${day}`;
            //TODO ------------------------------------------------------------ PATCH ENTREGA
            endTime = Date.now()
            const responsePatchEntrega = await patchEntrega(deliveryData, {
                U_B_cuf: `${cuf}`,
                U_B_em_date: `${formater}`,
                NumAtCard: `${nroFactura}`
            })
            if (responsePatchEntrega.status == 400) {
                console.error({ error: responsePatchEntrega.errorMessage })
                endTime = Date.now()
                return res.status(400).json({
                    mensaje: `Error al procesar la solicitud: patchEntrega ${responsePatchEntrega.errorMessage.value}`,
                    cuf
                })
            }
            //TODO ------------------------------------------------------------ ENTREGA DETALLER TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, formater)
            console.log({ responseHana })
            if (responseHana.message) {
                endTime = Date.now()
                return res.status(400).json({
                    mensaje: 'Error al procesar la solicitud: entregaDetallerFactura',
                    cuf
                })
            }
            const DocumentLinesHana = [];
            let cabezeraHana = [];

            let DocumentAdditionalExpenses = [];

            for (const line of responseHana) {
                const {
                    LineNum,
                    BaseType,
                    BaseEntry, BaseLine, ItemCode, Quantity, GrossPrice, GrossTotal, WarehouseCode, AccountCode, TaxCode, MeasureUnit, UnitsOfMeasurment, U_DESCLINEA,
                    ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                    DocTotal, U_OSLP_ID, U_UserCode, ...result } = line

                if (!cabezeraHana.length) {
                    cabezeraHana = {
                        ...result,
                        DocTotal: Number(DocTotal),
                        U_OSLP_ID: U_OSLP_ID || "",
                        U_UserCode: U_UserCode || ""
                    };
                    DocumentAdditionalExpenses = [
                        { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode3, LineTotal: +LineTotal3, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode4, LineTotal: +LineTotal4, TaxCode: 'IVA' },
                    ]
                }
                DocumentLinesHana.push({
                    LineNum, BaseType, BaseEntry, BaseLine, ItemCode, Quantity: Number(Quantity), GrossPrice: Number(GrossPrice), GrossTotal: Number(GrossTotal), WarehouseCode, AccountCode, TaxCode, MeasureUnit, UnitsOfMeasurment: Number(UnitsOfMeasurment), U_DESCLINEA: Number(U_DESCLINEA)
                })
            }

            responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            //TODO --------------------------------------------------------------  INVOICE
            console.log({ responseHanaB })
            invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (invoiceResponse.status == 400) {
                const mensaje = `Error del SAP en el PostInvoice: ${invoiceResponse.errorMessage.value || ''}`
                grabarLog(user.USERCODE, user.USERNAME, 'Inventario Facturacion Cambio Valorado',
                    mensaje, 'postInvoice', 'inventario/facturacion-cambio', process.env.DBSAPPRD
                )
                return res.status(400).json({
                    mensaje,
                    cuf
                })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: deliveryData,
                cuf
            }
            console.log({ response })

        } else {
            //? si no existe el cuf:
            console.log('el cuf No existe')
            let dataToProsin = {}
            const { direccion, ...restBodyFinalFactura } = bodyFinalFactura
            if (direccion == null || direccion == undefined) {
                dataToProsin = {
                    ...restBodyFinalFactura,
                    direccion: ''
                }
            } else {
                dataToProsin = bodyFinalFactura
            }

            if (dataToProsin.tipo_identificacion == null ||
                (dataToProsin.tipo_identificacion != 1 && dataToProsin.tipo_identificacion != 5)) {
                grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${dataToProsin.tipo_identificacion || 'No definido'} `, 'facturacionProsin', 'inventario/facturacion-cambio', process.env.PRD)
                return res.status(400).json({
                    mensaje: `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${dataToProsin.tipo_identificacion || 'No definido'} `,
                    dataToProsin, bodyFinalFactura, cuf
                })
            }

            if (dataToProsin.correo == null || dataToProsin.correo == '') {
                grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, `No existe el correo `, 'facturacionProsin', 'inventario/facturacion-cambio', process.env.PRD)
                return res.status(400).json({ mensaje: `No existe hay datos del CORREO `, dataToProsin, bodyFinalFactura, cuf })
            }
            dataToProsin.usuario = user.USERNAME || 'No definido'
            // return res.json({dataToProsin})
            const responseProsin = await facturacionProsin(dataToProsin, user)
            console.log({ responseProsin })
            const { data: dataProsin } = responseProsin
            console.log({ dataProsin })
            if (dataProsin && dataProsin.estado != 200) {
                grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, `Error de facturacionProsin ${dataProsin.mensaje || ''}`, 'facturacionProsin', 'inventario/facturacion-cambio', process.env.PRD)
                return res.status(400).json({ mensaje: `Error de facturacionProsin ${dataProsin.mensaje || ''}`, dataProsin, dataToProsin, bodyFinalFactura, cuf, responseProsin })
            }
            const fecha = dataProsin.fecha
            const nroFactura = dataProsin.datos.factura
            cuf = dataProsin.datos.cuf

            console.log({ fecha })
            const formater = fecha.split('/')
            const day = formater[0]
            const month = formater[1]
            const yearTime = formater[2]
            const yearFomater = yearTime.split(' ')
            const year = yearFomater[0]
            console.log({ day, month, year })
            const fechaFormater = year + month + day
            console.log({ deliveryData, cuf, nroFactura, fechaFormater })
            //TODO --------------------------------------------------------------  PATCH ENTREGA
            const responsePatchEntrega = await patchEntrega(deliveryData, {
                U_B_cuf: `${cuf}`,
                U_B_em_date: `${fechaFormater}`,
                NumAtCard: `${nroFactura}`
            })
            if (responsePatchEntrega.status == 400) {
                console.error({ error: responsePatchEntrega.errorMessage })
                grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, `Error en la solicitud patch entrega ${responsePatchEntrega.errorMessage.value || ''}`, 'patchEntrega', 'inventario/facturacion-cambio', process.env.PRD)
                return res.status(400).json({ mensaje: `Error en la solicitud patch entrega ${responsePatchEntrega.errorMessage.value || ''}`, cuf })
            }
            //TODO --------------------------------------------------------------  ENTREGA DETALLE TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, fechaFormater)
            console.log({ responseHana })
            if (responseHana.message) {

                grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}`, 'entregaDetallerFactura', 'inventario/facturacion-cambio', process.env.PRD)
                return res.status(400).json(
                    { mensaje: `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}`, cuf })
            }
            const DocumentLinesHana = [];
            let cabezeraHana = [];

            let DocumentAdditionalExpenses = [];

            for (const line of responseHana) {
                const { LineNum, BaseType, BaseEntry, BaseLine, ItemCode, Quantity, GrossPrice, GrossTotal, WarehouseCode, AccountCode, TaxCode, MeasureUnit, UnitsOfMeasurment, U_DESCLINEA,
                    ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                    DocTotal, U_OSLP_ID, U_UserCode, ...result } = line

                if (!cabezeraHana.length) {
                    cabezeraHana = {
                        ...result,
                        DocTotal: Number(DocTotal),
                        U_OSLP_ID: U_OSLP_ID || "",
                        U_UserCode: U_UserCode || ""
                    };
                    DocumentAdditionalExpenses = [
                        { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode3, LineTotal: +LineTotal3, TaxCode: 'IVA' },
                        { ExpenseCode: ExpenseCode4, LineTotal: +LineTotal4, TaxCode: 'IVA' },
                    ]

                }
                DocumentLinesHana.push({
                    LineNum, BaseType, BaseEntry, BaseLine, ItemCode, Quantity: Number(Quantity), GrossPrice: Number(GrossPrice), GrossTotal: Number(GrossTotal), WarehouseCode, AccountCode, TaxCode, MeasureUnit, UnitsOfMeasurment: Number(UnitsOfMeasurment), U_DESCLINEA: Number(U_DESCLINEA)
                })
            }

            responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            //TODO --------------------------------------------------------------  INVOICE
            console.log({ responseHanaB })
            invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (invoiceResponse.status == 400) {
                grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, `Error en la solicitud postInvoice ${invoiceResponse.errorMessage.value || ''}`, 'postInvoice', 'inventario/facturacion-cambio', process.env.PRD)
                return res.status(400).json(
                    { mensaje: `Error del SAP postInvoice ${invoiceResponse.errorMessage.value || ''}`, cuf })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: deliveryData,
                cuf
            }
            console.log({ response })
        }
        //* Eliminando la reconciliacion:
        // let diferencia = totalFacturas - totalDeLaEntrega
        // let ReconcileAmountInv = +totalDeLaEntrega
        // if (diferencia < 0) {
        //     ReconcileAmountInv += +diferencia
        // }
        // const InternalReconciliationOpenTransRows = [
        //     {
        //         ShortName: CardCode,
        //         TransId: invoiceResponse.TransNum,
        //         TransRowId: 0,
        //         SrcObjTyp: "13",
        //         SrcObjAbs: invoiceResponse.idInvoice,
        //         CreditOrDebit: "codDebit",
        //         ReconcileAmount: ReconcileAmountInv,
        //         CashDiscount: 0.0,
        //         Selected: "tYES",
        //     }
        // ]

        // let numInternalRec = 0
        //* Eliminando la reconciliacion:
        // for (const creditNote of allResponseCreditNote) {
        //     let ReconcileAmountCN = +totalesFactura[numInternalRec]
        //     if (diferencia > 0 && (ReconcileAmountCN - diferencia) > 0) {
        //         ReconcileAmountCN -= +diferencia
        //         diferencia = 0
        //     }
        //     const internalRecLine = {
        //         ShortName: CardCode,
        //         TransId: creditNote.TransNum,
        //         TransRowId: 0,
        //         SrcObjTyp: "14",
        //         SrcObjAbs: creditNote.orderNumber,
        //         CreditOrDebit: "codCredit",
        //         ReconcileAmount: ReconcileAmountCN,
        //         CashDiscount: 0.0,
        //         Selected: "tYES",
        //     }

        //     InternalReconciliationOpenTransRows.push(internalRecLine)
        //     numInternalRec += 1
        // }

        // const fechaFormater = new Date()
        // Extraer componentes de la fecha
        // const year = fechaFormater.getUTCFullYear();
        // const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0'); // Asegurarse de que sea 2 dígitos
        // const day = String(fechaFormater.getUTCDate()).padStart(2, '0'); // Asegurarse de que sea 2 dígitos

        // let bodyReconciliacion = {
        //     ReconDate: `${year}-${month}-${day}`,
        //     CardOrAccount: "coaCard",
        //     // ReconType: "rtManual",
        //     // Total: totalFactura,
        //     InternalReconciliationOpenTransRows,
        // }

        // console.log({ bodyReconciliacion })
        // let responseReconciliacion = await postReconciliacion(bodyReconciliacion)
        // console.log({ responseReconciliacion })

        // if (responseReconciliacion.status == 400) {
        //     let mensaje = responseReconciliacion.errorMessage
        //     if (typeof mensaje != 'string' && mensaje.lang) {
        //         mensaje = mensaje.value
        //     }

        //     mensaje = `Error en postReconciliacion: ${mensaje}.`
        //     grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, mensaje, 'postReconciliacion', 'inventario/facturacion-cambio', process.env.PRD)
        //     return res.status(400).json({
        //         mensaje,
        //         bodyReconciliacion,
        //         responseHanaB,
        //         invoiceResponse,
        //         cuf,
        //         allResponseCreditNote,
        //     })
        // }

        grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, `Facturacion y Reconciliacion exitosa`, '', 'inventario/facturacion-cambio', process.env.PRD)
        return res.json({
            // bodyReconciliacion,
            invoiceResponse,
            responseHanaB,
            cuf,
            // responseReconciliacion
        })
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, `Error en el controlador entregaFacturaCambioValoradoController: ${error.message || ''}. Cuf: ${cuf || ''}`, 'catch del controller', 'inventario/facturacion-cambio', process.env.PRD)
        return res.status(500).json({
            mensaje: `Error en el controlador entregaFacturaCambioValoradoController: ${error.message || ''}`,
            cuf
        })
    }
}

const findClienteController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        const buscar = body.buscar.toUpperCase()
        console.log({ buscar })
        const response = await findCliente(buscar)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador findClienteController: ${error.message || ''}` })
    }
}

const findClienteInstitucionesController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        const buscar = body.buscar.toUpperCase()
        console.log({ buscar })
        const response = await findClienteInstituciones(buscar)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador findClienteInstitucionesController: ${error.message || ''}` })
    }
}

const getAlmacenesSucursalController = async (req, res) => {
    try {
        const { listSucCode } = req.body
        let listClients = []
        const clientes = await getAlmacenesSucursal()
        // return res.json(clientes)
        listSucCode.map((sucursal) => {
            const filter = clientes.filter(client => client.SucCode == sucursal)
            listClients = [...listClients, ...filter]
        })
        return res.json(listClients)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getAlmacenesSucursalController: ${error.message || 'No definido'}` })
    }
}

const getStockdeItemAlmacenController = async (req, res) => {
    try {
        const { itemCode, whsCode } = req.body
        const response = await getStockdeItemAlmacen(itemCode, whsCode)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getStockdeItemAlmacenController: ${error.message || 'No definido'}` })
    }
}

const getStockVariosItemsAlmacenController = async (req, res) => {
    try {
        const { itemCodes, whsCode } = req.body
        let responses = []
        //const response = await getStockdeItemAlmacen(itemCode, whsCode)
        //return res.json(response)
        for (const itemCode of itemCodes) {
            const response = await getStockdeItemAlmacen(itemCode, whsCode)
            responses.push(...response)
        }
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getStockVariosItemsAlmacenController: ${error.message || 'No definido'}` })
    }
}

const getLineaArticuloController = async (req, res) => {
    try {
        const { itemCode } = req.query
        const response = await getLineaArticulo(itemCode)
        if (response.length == 0) {
            return res.json({})
        }

        return res.json(response[0])
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getLineaArticuloController: ${error.message || 'No definido'}` })
    }
}
const articuloDiccionarioController = async (req, res) => {
    try {
        const data = await articuloDiccionario();

        // Agrupamos por ITEMCODE
        const agrupado = {};

        data.forEach(item => {
            const key = item.ItemCode;

            if (!agrupado[key]) {
                agrupado[key] = {
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    Relacionados: []
                };
            }

            agrupado[key].Relacionados.push({
                ItemEq: item.ItemEq,
                ItemNameEq: item.ItemNameEq,
            });
        });

        const resultado = Object.values(agrupado);
        return res.json(resultado);

    } catch (error) {
        console.log({ error });
        return res.status(500).json({
            mensaje: `Error en articuloDiccionarioController: ${error.message || 'No definido'}`
        });
    }
};


const relacionArticuloController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const data = await relacionArticulo(itemCode)
        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en relacionArticuloController: ${error.message || 'No definido'}` })
    }
}

const articulosController = async (req, res) => {
    try {

        const data = await articulos()
        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en articulosController : ${error.message || 'No definido'}` })
    }
}

const saveArticuloDiccionario = async (req, res) => {
    try {
        const { principal, relacionados } = req.body;
        console.log(principal, relacionados);

        const data = await articuloDiccionario();
        const relacionesAInsertar = [];

        for (const relacionado of relacionados) {
            const existeDirecta = data.some(relacion =>
                relacion.ItemCode === principal.ItemCode && relacion.ItemEq === relacionado.ItemCode
            );

            const existeInversa = data.some(relacion =>
                relacion.ItemCode === relacionado.ItemCode && relacion.ItemEq === principal.ItemCode
            );

            if (!existeDirecta && !existeInversa) {
                // No existe ni directa ni inversa: insertamos ambas
                relacionesAInsertar.push({
                    desdeCode: principal.ItemCode,
                    desdeName: principal.ItemName,
                    haciaCode: relacionado.ItemCode,
                    haciaName: relacionado.ItemName
                });
                relacionesAInsertar.push({
                    desdeCode: relacionado.ItemCode,
                    desdeName: relacionado.ItemName,
                    haciaCode: principal.ItemCode,
                    haciaName: principal.ItemName
                });
            } else if (!existeDirecta && existeInversa) {
                // Solo falta la directa
                relacionesAInsertar.push({
                    desdeCode: principal.ItemCode,
                    desdeName: principal.ItemName,
                    haciaCode: relacionado.ItemCode,
                    haciaName: relacionado.ItemName
                });
            } else if (existeDirecta && !existeInversa) {
                // Solo falta la inversa
                relacionesAInsertar.push({
                    desdeCode: relacionado.ItemCode,
                    desdeName: relacionado.ItemName,
                    haciaCode: principal.ItemCode,
                    haciaName: principal.ItemName
                });
            }
        }

        if (relacionesAInsertar.length === 0) {
            return res.status(200).json({ mensaje: 'Todas las relaciones ya existen.', status: 200 });
        }

        // Aquí insertarías las relaciones nuevas
        await saveDiccionario(relacionesAInsertar);

        return res.json({ mensaje: 'Todas las relaciones han sido insertadas', status: 200 });
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en saveArticuloDiccionario : ${error.message || 'No definido'}` })
    }
}

const solicitudTrasladoController = async (req, res) => {
    try {
        
        const {
            Comments,
            JournalMemo,
            FromWarehouse,
            U_TIPO_TRASLADO,
            U_GroupCode,
            ToWarehouse,
            U_UserCode,
            SalesPersonCode,
            DueDate,
            CardName,
            CardCode,
            U_FECHA_FACT,
            U_Autorizacion,
            //! cambiar o eliminar para cuendo se guarde el almacen destino final
            U_B_destplace,
            StockTransferLines
        } = req.body
        const U_UserSign = U_UserCode;
        let U_ProcessName = '';
        if(U_TIPO_TRASLADO === 'N'){
            U_ProcessName = 'COMPRAS PLANTA NORMAL';
        }
        if(U_TIPO_TRASLADO === 'CNS' ){
            U_ProcessName = 'COMPRAS PLANTA INSTITUCIONES';
        }
        if(U_TIPO_TRASLADO === 'MM' ){
            U_ProcessName = 'COMPRAS PLANTA MUESTRAS MEDICAS';
        }
        if(U_TIPO_TRASLADO === 'E' ){
            U_ProcessName = 'COMPRAS PLANTA INSTITUCIONES';
        }
        console.log(req.body);

        const user = req.usuarioAutorizado
        console.log(JSON.stringify({
            Comments,
            JournalMemo,
            FromWarehouse,
            U_TIPO_TRASLADO,
            U_GroupCode,
            ToWarehouse,
            SalesPersonCode,
            CardName,
            CardCode,
            U_UserCode,
            DueDate,
            U_FECHA_FACT,
            U_Autorizacion,
            U_B_destplace,
            StockTransferLines,
            U_ProcessName,
            U_UserSign
        }, null, 2))
        const sapResponse = await postInventoryTransferRequests({
            Comments,
            JournalMemo,
            FromWarehouse,
            U_TIPO_TRASLADO,
            SalesPersonCode,
            U_GroupCode,
            ToWarehouse,
            CardName,
            CardCode,
            U_UserCode,
            DueDate,
            U_FECHA_FACT,
            U_Autorizacion,
            U_B_destplace,
            StockTransferLines,
            U_ProcessName,
            U_UserSign
        })


        // console.log(JSON.stringify({ sapResponse }, null, 2))
        const { status, errorMessage } = sapResponse
        if (status && status == 400) {
            const { value } = errorMessage
            let mensaje = 'Error en la solicitud de traslado. '
            if (value && value.includes('This entry already exists')) {
                mensaje += 'Ya existe la Solicitud';
            } else {
                mensaje += value || 'No definido';
            }

            return res.status(400).json({ mensaje })
        }
        const { idTransfer } = sapResponse
        await insertWorkFlowWithCheck(idTransfer, '1250000001', 'Proceso de Abastecimiento Normal', user.USERNAME || 'No definido', user.ID_SAP || 0, '', 'Solicitud', idTransfer, '1250000001', '', '')
        return res.json({ sapResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en solicitudTrasladoController : ${error.message || 'No definido'}` })
    }
}

const tipoSolicitudController = async (req, res) => {
    try {

        const response = await tipoSolicitud()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en tipoSolicitudController : ${error.message || 'No definido'}` })
    }
}

const costoComercialItemcodeController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const response = await costoComercialByItemCode(itemCode)
        if (response.length == 0) {
            return res.status(400).json({ mensaje: `Error no se encontro el costo comercial del item  : ${itemCode}` })
        }
        const costoComercial = Number(response[0].ComlPriceAct)
        console.log({ costoComercial, itemCode })
        return res.json({ costoComercial })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en tipoSolicitudController : ${error.message || 'No definido'}` })
    }
}

const tipoClientesController = async (req, res) => {
    try {
        const response = await tipoCliente()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en tipoClientesController : ${error.message || 'No definido'}` })
    }
}


const devoluccionInstitucionesController = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    let idEntrega
    try {
        const { Entregas, Devoluciones, AlmacenIngreso, AlmacenSalida, CardCode, id_sap, Comentario } = req.body

        const idEntregaBody = req.body.idEntrega
        console.log({ Entregas, Devoluciones, AlmacenIngreso, AlmacenSalida, CardCode, id_sap })

        let bodyReturn
        let responceReturn
        let responseEntrega
        let bodyEntrega
        if (!idEntregaBody) { //Si no hay id de entrega, entonces se crea una nueva entrega
            let numEnt = 0
            let newDocumentLinesEntrega = []
            for (const entrega of Entregas) {
                const { ItemCode, Cantidad, Precio, Total } = entrega
                console.log({ ItemCode, Cantidad, Precio, })

                let batchNumbersEntrega = []
                const batchData = await lotesArticuloAlmacenCantidad(ItemCode, AlmacenSalida, Cantidad);
                console.log({ batch: batchData })
                if (batchData.message) {
                    grabarLog(user.USERCODE, user.USERNAME, "Devolucion Instituciones", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`,
                        'IFA_VM_SELECTION_BATCH_FEFO', "inventario/dev-instituciones", process.env.PRD)
                    return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, idEntrega })
                }
                if (batchData.length > 0) {
                    let new_quantity = 0
                    batchData.map((item) => {
                        new_quantity += Number(item.Quantity).toFixed(6)
                    })
                    //console.log({ batchData })
                    batchNumbersEntrega = batchData.map(batch => ({
                        BaseLineNumber: numEnt,
                        BatchNumber: batch.BatchNum,
                        Quantity: Number(batch.Quantity).toFixed(6),
                        ItemCode: batch.ItemCode
                    }))
                } else {
                    grabarLog(user.USERCODE, user.USERNAME, "Devolucion Instituciones",
                        `No hay lotes para el item: ${ItemCode}, almacen: ${AlmacenSalida}, cantidad: ${Cantidad}`, 'IFA_VM_SELECTION_BATCH_FEFO',
                        "inventario/dev-instituciones", process.env.PRD)
                    return res.status(400).json({
                        mensaje: `No hay lotes para el item: ${ItemCode}, almacen: ${AlmacenSalida}, cantidad: ${Cantidad}`,
                        idEntrega
                    })
                }

                const newLineEntrega = {
                    ItemCode,
                    WarehouseCode: AlmacenSalida,
                    Quantity: Cantidad,
                    LineNum: numEnt,
                    TaxCode: "IVA_GND",
                    AccountCode: "6210103",
                    GrossTotal: Total,
                    GrossPrice: Precio,
                    BatchNumbers: batchNumbersEntrega
                };
                console.log({ newLineEntrega })
                newDocumentLinesEntrega.push(newLineEntrega)
                numEnt++;
            }

            bodyEntrega = {
                Series: 353, ///
                CardCode: CardCode,
                U_UserCode: id_sap,
                JournalMemo: Comentario,
                Comments: Comentario,
                DocumentLines: newDocumentLinesEntrega,
            }
            console.log(JSON.stringify({ bodyEntrega }, null, 2))
            responseEntrega = await postEntrega(bodyEntrega)

            if (responseEntrega.lang) {
                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                const fileNameJson = path.join(outputDir, `finalDataEntrega_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(bodyEntrega, null, 2), 'utf8');
                console.log(`Objeto finalDataEntrega guardado en ${fileNameJson}`);
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Instituciones",
                    `Error interno en la entrega de sap en postEntrega: ${responseEntrega.value || ''}`, ``,
                    "inventario/dev-instituciones", process.env.PRD)
                return res.status(400).json({
                    mensaje: `Error interno en la entrega de sap. ${responseEntrega.value || ''}`,
                    idEntrega,
                    bodyReturn,
                    responseEntrega,
                    bodyEntrega
                })
            }

            idEntrega = responseEntrega.deliveryN44umber

        } else {//Existe id de entrega
            idEntrega = idEntregaBody
        }

        console.log({ idEntrega })


        let numRet = 0
        let newDocumentLinesReturn = []
        for (const devolucion of Devoluciones) {
            const { ItemCode, Lote, Cantidad, Precio, UnidadMedida, Total } = devolucion
            console.log({ ItemCode, Lote, Cantidad, Precio, UnidadMedida })
            let batchNumbers = []
            const cantidadBatch = Cantidad * UnidadMedida
            batchNumbers.push({
                BaseLineNumber: numRet,
                BatchNumber: Lote,
                Quantity: cantidadBatch,
                ItemCode: ItemCode
            })

            const newLineReturn = {
                // BaseEntry: 0,
                // BaseType: 15,
                // BaseLine: numRet,
                ItemCode,
                WarehouseCode: AlmacenIngreso,
                Quantity: Cantidad,
                LineNum: numRet,
                TaxCode: "IVA_GND",
                AccountCode: "6210103",
                GrossTotal: Total,
                GrossPrice: Precio,
                BatchNumbers: batchNumbers
            };
            console.log('------newLineReturn-----')
            console.log({ newLineReturn })

            newDocumentLinesReturn.push(newLineReturn)

            numRet += 1
        }

        // newDocumentLinesReturn.map((item) => {
        //     item.BaseEntry = idEntrega
        // })

        bodyReturn = {
            Series: 352,
            CardCode: CardCode,
            U_UserCode: id_sap,
            JournalMemo: Comentario,
            Comments: Comentario,
            DocumentLines: newDocumentLinesReturn,
        }
        console.log(JSON.stringify({ bodyReturn }, null, 2))
        responceReturn = await postReturn(bodyReturn)
        console.log({ responceReturn })

        if (responceReturn.status > 300) {
            console.log({ errorMessage: responceReturn.errorMessage })
            let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
            if (typeof mensaje != 'string' && mensaje.value)
                mensaje = mensaje.value
            grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Instituciones",
                `Error en postReturn: ${mensaje}`, `postReturn()`, "inventario/dev-instituciones", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en postReturn: ${mensaje}`, bodyReturn, idEntrega, bodyEntrega })
        }

        grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Instituciones",
            `Exito en el cambio por Valorado para instituciones`, ``, "inventario/dev-instituciones", process.env.PRD)

        return res.json({
            idEntrega,
            idReturn: responceReturn.orderNumber,
            bodyEntrega,
            bodyReturn,
            responseEntrega,
            responceReturn,
        })
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Instituciones", `Error en el devoluccionInstitucionesController: ${error.message || ''}`, `catch del controller devoluccionInstitucionesController`, "inventario/dev-instituciones", process.env.PRD)
        return res.status(500).json({
            mensaje: `Error en en controlador devoluccionInstitucionesController: ${error.message}`,
            idEntrega
        })
    }
}

const solicitudesTrasladoController = async (req, res) => {
    try {
        const { listSucCode, roleAll } = req.body
        const user = req.usuarioAutorizado
        const { ID_SAP } = user
        let listSolicitudes = []
        console.log({ listSucCode, ID_SAP, roleAll })
        if (ID_SAP == null || ID_SAP == 0 || ID_SAP == '0') {
            return res.status(400).json({ mensaje: `Usted No tiene ID SAP`, ID_SAP })
        }
        if (listSucCode.length == 0) {
            return res.status(400).json({ mensaje: `Usted No tiene Sucursales asignadas` })
        }
        for (const sucCode of listSucCode) {
            let response = await solicitudesPendiente(sucCode)
            if (!roleAll) {
                response = response.filter((item) => item.UserCode == ID_SAP)
                listSolicitudes = [...listSolicitudes, ...response]
            } else {
                listSolicitudes = [...listSolicitudes, ...response]
            }

        }
        if (listSolicitudes.length > 0) {
            listSolicitudes.sort((a, b) => new Date(b.CreateDate) - new Date(a.CreateDate));
        }
        return res.json(listSolicitudes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en solicitudesTrasladoController : ${error.message || 'No definido'}` })
    }
}

const todasSolicitudesTrasladoController = async (req, res) => {
    try {
        let listSolicitudes = await todasSolicitudesPendiente()
        if (listSolicitudes.length > 0) {
            listSolicitudes.sort((a, b) => a.SucCode - b.SucCode)
        }
        return res.json(listSolicitudes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en todasSolicitudesTrasladoController : ${error.message || 'No definido'}` })
    }
}

const detalleSolicitudTrasladoController = async (req, res) => {
    try {
        const docEntry = req.query.docEntry
        const response = await detalleSolicitudPendiente(docEntry)
        let dataResponse = response.map((item) => ({
            ...item,
            QuantityMod: +item.OpenQty || 0,
            subTotal: Number(item.U_COSTO_COM) * Number(item.Quantity)
        }))
        // console.log({ dataResponse, docEntry })
        return res.json(dataResponse)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en solicitudesTrasladoController : ${error.message || 'No definido'}` })
    }
}

const reporteDevolucionValoradosController = async (req, res) => {
    try {
        const { fechaIni, fechaFin } = req.body
        console.log({ fechaIni, fechaFin })
        const response = await reporteDevolucionValorados(fechaIni, fechaFin)
        console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en reporteDevolucionValoradosController  : ${error.message || 'No definido'}` })
    }
}

const searchClienteController = async (req, res) => {
    try {
        const { cadena } = req.body
        const cadenS = cadena.toUpperCase()
        const response = await searchClientes(cadenS)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador searchClienteController: ${error.message}` })
    }
}

const reporteDevolucionCambiosController = async (req, res) => {
    try {
        const { fechaIni, fechaFin } = req.body
        console.log({ fechaIni, fechaFin })
        const response = await reporteDevolucionCambios(fechaIni, fechaFin)
        // console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en reporteDevolucionCambiosController  : ${error.message || 'No definido'}` })
    }
}

const reporteDevolucionRefacturacionController = async (req, res) => {
    try {
        const { fechaIni, fechaFin, user } = req.body
        console.log({ fechaIni, fechaFin, user })
        const response = await reporteDevolucionRefacturacion(fechaIni, fechaFin, user)
        // console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en reporteDevolucionRefacturacionController  : ${error.message || 'No definido'}` })
    }
}

const getDevolucionesParaCancelarController = async (req, res) => {
    try {
        let { id_user, fechaIni, fechaFin } = req.body
        if (!fechaIni) {
            const newDate = new Date();
            fechaIni = newDate.toISOString().split('T')[0]
        }
        if (!fechaFin) {
            fechaFin = fechaIni
        }
        const response = await getDevolucionesParaCancelar(id_user, fechaIni, fechaFin)
        // console.log({ response })
        let cabecera = []
        for (const line of response) {
            let { U_UserCode, DocEntry, DocNum, CardCode, CardName, Comments, DocDate, DocTime, DocTotal, TrgetEntry, TransClass, ...rest } = line
            if (cabecera.length == 0) {
                DocTime = String(DocTime)
                if (DocTime.length == 4) {
                    DocTime = `${DocTime.slice(0, 2)}:${DocTime.slice(2, 4)}`
                } else {
                    DocTime = `${DocTime.slice(0, 1)}:${DocTime.slice(1, 3)}`
                }
                cabecera = [{
                    U_UserCode, DocEntry, TrgetEntry, DocNum, CardCode, CardName, Comments, DocDate, DocTime, DocTotal, TransClass,
                    detalle: [{ ...rest }]
                }]
            } else {
                if (cabecera[cabecera.length - 1].DocEntry == DocEntry) {
                    cabecera[cabecera.length - 1].detalle.push({ ...rest });
                } else {
                    DocTime = String(DocTime)
                    if (DocTime.length == 4) {
                        DocTime = `${DocTime.slice(0, 2)}:${DocTime.slice(2, 4)}`
                    } else {
                        DocTime = `${DocTime.slice(0, 1)}:${DocTime.slice(1, 3)}`
                    }
                    cabecera.push({
                        U_UserCode, DocEntry, TrgetEntry, DocNum, CardCode, CardName, Comments, DocDate, DocTime, DocTotal, TransClass,
                        detalle: [{ ...rest }]
                    })
                }
            }
        }
        return res.json(cabecera)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getDevolucionesParaCancelarController  : ${error.message || 'No definido'}` })
    }
}
//inv 487939
const getEntregasParaCancelarController = async (req, res) => {
    try {
        const { id_user, fechaIni, fechaFin } = req.body
        if (!fechaIni) {
            const newDate = new Date();
            fechaIni = newDate.toISOString().split('T')[0]
        }
        if (!fechaFin) {
            fechaFin = fechaIni
        }
        const response = await getEntregasParaCancelar(id_user, fechaIni, fechaFin)
        // console.log({ response })
        let cabecera = []
        for (const line of response) {
            let { U_UserCode, DocEntry, DocNum, TrgetEntry, TargetType, CardCode, CardName, Comments, DocDate, DocTime, DocTotal, ...rest } = line
            if (cabecera.length == 0) {
                DocTime = String(DocTime)
                if (DocTime.length == 4) {
                    DocTime = `${DocTime.slice(0, 2)}:${DocTime.slice(2, 4)}`
                } else {
                    DocTime = `${DocTime.slice(0, 1)}:${DocTime.slice(1, 3)}`
                }
                cabecera = [{
                    U_UserCode, DocEntry, DocNum, TrgetEntry, TargetType, CardCode, CardName, Comments, DocDate, DocTime, DocTotal,
                    detalle: [{ ...rest }]
                }]
            } else {
                if (cabecera[cabecera.length - 1].DocEntry == DocEntry) {
                    cabecera[cabecera.length - 1].detalle.push({ ...rest });
                } else {
                    DocTime = String(DocTime)
                    if (DocTime.length == 4) {
                        DocTime = `${DocTime.slice(0, 2)}:${DocTime.slice(2, 4)}`
                    } else {
                        DocTime = `${DocTime.slice(0, 1)}:${DocTime.slice(1, 3)}`
                    }
                    cabecera.push({
                        U_UserCode, DocEntry, DocNum, TrgetEntry, TargetType, CardCode, CardName, Comments, DocDate, DocTime, DocTotal,
                        detalle: [{ ...rest }]
                    })
                }
            }
        }
        return res.json(cabecera)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getEntregasParaCancelarController  : ${error.message || 'No definido'}` })
    }
}

const cancelarDevolucionController = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { idDev, idCN, idRC } = req.query

        let responseCN
        let responseRC
        if (idCN != 0) {
            if (idRC && idRC != 0) {
                responseRC = await cancelReconciliacion(idRC);
                console.log({ responseRC });
                if (responseRC.status == 400) {
                    let mensaje = `Error en cancelReconciliacion: `
                    if (typeof responseRC.errorMessage === 'string') {
                        mensaje = `${responseRC.errorMessage}`
                    } else {
                        mensaje = `${responseRC.errorMessage.value}`
                    }
                    if (!mensaje.includes('Document is already closed')) {
                        grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Devolucion`,
                            `${mensaje}`, `https://srvhana:50000/b1s/v1/InternalReconciliations(${idRC})/Cancel`, `/inventario/cancelar-devolucion`, process.env.DBSAPPRD)

                        return res.status(400).json({ mensaje })
                    }
                }
            }
            responseCN = await cancelCreditNotes(idCN)
            console.log({ responseCN });
            if (responseCN.status == 400) {
                let mensaje = `Error en cancelCreditNotes: `
                if (typeof responseCN.errorMessage === 'string') {
                    mensaje += `${responseCN.errorMessage}`
                } else {
                    mensaje += `${responseCN.errorMessage.value}`
                }
                if (!mensaje.includes('Document is already closed')) {
                    grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Devolucion`,
                        `${mensaje}`, `https://srvhana:50000/b1s/v1/CreditNotes(${idCN})/Cancel`, `/inventario/cancelar-devolucion`, process.env.DBSAPPRD)
                    return res.status(400).json({ mensaje, responseRC })
                }
            }
        }

        const responseDev = await cancelReturn(idDev)
        console.log({ responseDev })
        if (responseDev.status == 400) {
            let mensaje
            if (typeof responseDev.errorMessage === 'string') {
                mensaje = `${responseDev.errorMessage}`
            } else {
                mensaje = `${responseDev.errorMessage.value || 'Error en cancelReturn'}`
            }
            grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Devolucion`,
                `${mensaje}`, `https://srvhana:50000/b1s/v1/Returns(${idDev})/Cancel`, `/inventario/cancelar-devolucion`, process.env.DBSAPPRD)
            return res.status(400).json({ mensaje, responseCN, responseRC })
        }


        //devolucion nro: 1308 y entrega nro: 72683
        grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Devolucion`, `Exito en la cancelacion de la devolucion`,
            `https://srvhana:50000/b1s/v1/Returns(id)/Cancel`, `/inventario/cancelar-devolucion`, process.env.DBSAPPRD)

        return res.json({ responseDev, responseCN, responseRC })
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Devolucion`,
            `${error.message || 'Error en cancelarDevolucionController'}`, `catch de cancelarDevolucionController`, `/inventario/cancelar-devolucion`, process.env.DBSAPPRD)
        return res.status(500).json({ mensaje: error.message || 'Error en cancelarDevolucionController' })
    }
}

const cancelarEntregaController = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { idEnt, TargetType } = req.query

        const responseEnt = await cancelEntrega(idEnt)
        if (responseEnt.status == 400) {
            let mensaje = `Error en el cancel entrega: `
            let errorMessage = responseEnt.errorMessage
            if (typeof errorMessage !== 'string')
                errorMessage = responseEnt.errorMessage.value
            console.log({ mensaje })
            if (errorMessage.includes('cancel target documents first')) {
                console.log('includes')
                if (TargetType == 13) {
                    mensaje += 'Cancele la FACTURA primero!'
                } else if (TargetType == 16) {
                    mensaje += 'Cancele la DEVOLUCION primero!'
                } else {
                    mensaje += errorMessage
                }
            } else {
                mensaje += errorMessage
            }

            grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Entrega`, mensaje,
                `https://srvhana:50000/b1s/v1/DeliveryNotes(${idEnt})/Cancel`, `/inventario/cancelar-entrega`, process.env.DBSAPPRD)

            return res.status(400).json({ mensaje })
        }

        grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Entrega`, `Exito en la cancelacion de la entrega`,
            `https://srvhana:50000/b1s/v1/DeliveryNotes(${idEnt})/Cancel`, `/inventario/cancelar-entrega`, process.env.DBSAPPRD);

        return res.json({ responseEnt })
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Entrega`,
            `${error.message || 'Error en cancelarEntregaController'}`, `catch del cancelarEntregaController`, `/inventario/cancelar-entrega`, process.env.DBSAPPRD)
        return res.status(500).json({ mensaje: error.message || 'Error en cancelarEntregaController' })
    }
}

const actualizarTrasladoController = async (req, res) => {
    try {
        const body = req.body
        const { DocEntry, isReception, ...restData } = body
        console.log(JSON.stringify({ body }, null, 2))
        if (!DocEntry) {
            return res.status(400).json({ mensaje: 'Debe existir un Doc Entry en la peticion' })
        }
        console.log(JSON.stringify({ DocEntry, restData }, null, 2))
        const response = await patchInventoryTransferRequests(DocEntry, restData)
        if (response.status == 400) {
            const mensaje = response.errorMessage.value
            return res.status(400).json({ mensaje: `Error del SAP. ${mensaje}` })
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en solicitudesTrasladoController : ${error.message || 'No definido'}` })
    }
}

const crearTrasladoController = async (req, res) => {
    try {

        let {
            isReception,
            BaseEntry,
            DocEntry,
            Comments,
            JournalMemo,
            FromWarehouse,
            U_TIPO_TRASLADO,
            U_GroupCode,
            ToWarehouse,
            U_UserCode,
            SalesPersonCode,
            DueDate,
            CardName,
            CardCode,
            U_FECHA_FACT,
            U_Autorizacion,
            U_B_destplace,
            StockTransferLines
        } = req.body

        console.log(JSON.stringify({
            isReception,
            DocEntry,
            Comments,
            JournalMemo,
            FromWarehouse,
            U_TIPO_TRASLADO,
            U_GroupCode,
            ToWarehouse,
            U_UserCode,
            SalesPersonCode,
            DueDate,
            CardName,
            CardCode,
            U_FECHA_FACT,
            U_B_destplace,
            U_Autorizacion,
            StockTransferLines
        }, null, 2))
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }

        if (isReception == true) {

            const bodyData = {
                isReception,
                BaseEntry,
                DocEntry,
                Comments,
                JournalMemo,
                FromWarehouse,
                U_TIPO_TRASLADO,
                U_GroupCode,
                ToWarehouse,
                U_UserCode,
                SalesPersonCode,
                DueDate,
                CardName,
                CardCode,
                U_FECHA_FACT,
                U_Autorizacion,
                U_B_destplace,
                StockTransferLines
            }

            const filePath = path.join(__dirname, 'logs', `traslado_${DocEntry || 0}_${DueDate}.json`);
            fs.mkdir(path.join(__dirname, 'logs'), { recursive: true }, (err) => {
                if (err) console.error('Error creando el directorio logs:', err);
                else {
                    fs.writeFile(filePath, JSON.stringify(bodyData, null, 2), (err) => {
                        if (err) console.error('Error guardando el archivo JSON:', err);
                        else console.log(`Body guardado en ${filePath}`);
                    });
                }
            });
        }

        for (let data of StockTransferLines) {
            const { U_BatchNum, LineNum, Quantity, ItemCode, FromWarehouseCode, NumPerMsr, ...rest } = data
            if (isReception) {
                data.BaseType = 67
                data.BaseLine = LineNum
                data.BaseEntry = DocEntry
            } else {
                data.BaseType = 1250000001
                data.BaseLine = LineNum
                data.BaseEntry = DocEntry
            }

            if (U_BatchNum == '' || !U_BatchNum && isReception == false) {
                const batchData = await lotesArticuloAlmacenCantidad(ItemCode, FromWarehouseCode, Quantity)
                if (batchData.message) {
                    return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}` })
                }
                console.log({ batchData })
                if (batchData.length == 0) {
                    return res.status(400).json({ mensaje: `No hay stock en el almacen: ${FromWarehouseCode} , para el articulo : ${ItemCode} y la cantidad : ${Quantity}` })
                } else {
                    batchNumbers = batchData.map(batch => ({
                        BaseLineNumber: LineNum,
                        BatchNumber: batch.BatchNum,
                        Quantity: Number(batch.Quantity),
                        ItemCode: batch.ItemCode
                    }))
                    data.BatchNumbers = batchNumbers
                }
            } else {
                data.BatchNumbers = [
                    {
                        BaseLineNumber: LineNum,
                        BatchNumber: U_BatchNum,
                        Quantity: Number(Quantity) * Number(NumPerMsr),
                        ItemCode: ItemCode
                    }
                ]
            }
        }

        const isMoreThanTwo = StockTransferLines.some((item) => item.BatchNumbers.length > 1)
        let idx = 0
        let newStockTransferLines = []
        let updateStockTransferLines = []
        if (isMoreThanTwo) {
            for (const line of StockTransferLines) {
                const { BatchNumbers, NumPerMsr, ...rest } = line;

                if (BatchNumbers.length > 1) {
                    for (const [batchIndex, batch] of BatchNumbers.entries()) {
                        if (batchIndex == 0) {
                            newStockTransferLines.push({
                                ...rest,
                                LineNum: idx,
                                Quantity: batch.Quantity / NumPerMsr,
                                BatchNumbers: [{
                                    ...batch,
                                    BaseLineNumber: idx
                                }],
                            });
                            idx++
                        } else {
                            newStockTransferLines.push({
                                ...rest,
                                BaseLine: -1,
                                BaseType: null,
                                BaseEntry: null,
                                LineNum: idx,
                                Quantity: batch.Quantity / NumPerMsr,
                                BatchNumbers: [{
                                    ...batch,
                                    BaseLineNumber: idx
                                }],
                            });

                            updateStockTransferLines.push({
                                // idTralado: DocEntry,
                                LineTralado: idx,
                                itemcode: line.ItemCode,
                                idSolicitud: line.BaseEntry,
                                LineSolicitud: line.BaseLine
                            })

                            idx++

                        }

                    }
                } else {
                    const batchValue = BatchNumbers[0]
                    newStockTransferLines.push({
                        ...rest,
                        LineNum: idx,
                        BatchNumbers: (batchValue)
                            ? [{ ...batchValue, BaseLineNumber: idx }]
                            : [],
                    });
                    idx++
                }
            }
        }

        StockTransferLines = StockTransferLines.map((item) => {
            const { NumPerMsr, ...rest } = item
            return {
                ...rest
            }
        })

        const data = {
            Comments,
            JournalMemo,
            FromWarehouse,
            U_TIPO_TRASLADO,
            U_GroupCode,
            ToWarehouse,
            U_UserCode,
            SalesPersonCode,
            DueDate,
            CardName,
            CardCode,
            U_FECHA_FACT,
            U_Autorizacion,
            U_B_destplace,
            StockTransferLines: (isMoreThanTwo && isReception == false) ? newStockTransferLines : StockTransferLines,
        }
        // return res.json({
        //     updateStockTransferLines,
        //     data,
        //     StockTransferLines,
        //     newStockTransferLines
        // })
        console.log('data:')
        console.log(JSON.stringify({
            data
        }, null, 2))
        const sapResponse = await postStockTransfer({
            ...data
        })

        console.log({ sapResponse })
        const { status } = sapResponse

        if (status == 400) {
            const { errorMessage } = sapResponse
            return res.status(400).json({ mensaje: `Error del SAP en Stock Transfer. ${errorMessage.value || errorMessage || 'No definido'}` })
        }
        const { idStockTransfer } = sapResponse

        console.log(JSON.stringify({
            updateStockTransferLines
        }, null, 2))
        let listResponseUpdateOpenQty = []
        for (const element of updateStockTransferLines) {
            const { LineTralado, itemcode, idSolicitud, LineSolicitud, } = element
            console.log({ idStockTransfer, LineTralado, itemcode, idSolicitud, LineSolicitud })
            const updateResponse = await updateOpenqtyTrasladoSolicitud(idStockTransfer, LineTralado, itemcode, idSolicitud, LineSolicitud)
            listResponseUpdateOpenQty.push({ ...updateResponse })
            console.log({ updateResponse })
        }

        if (isReception || isReception == false) {
            (isReception)
                ? await insertWorkFlowWithCheck(BaseEntry, '1250000001', 'Proceso de Abastecimiento Normal', user.USERNAME || 'No definido', user.ID_SAP || 0, '', 'Recepcion', idStockTransfer, '67', '67', DocEntry)
                : await insertWorkFlowWithCheck(DocEntry, '1250000001', 'Proceso de Abastecimiento Normal', user.USERNAME || 'No definido', user.ID_SAP || 0, '', 'Transito', idStockTransfer, '67', '1250000001', DocEntry)
        }
        return res.json({
            sapResponse,
            listResponseUpdateOpenQty
        })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en crearTrasladoController : ${error.message || 'No definido'}` })
    }
}

const detalleTrasladoController = async (req, res) => {
    try {
        const docEntry = req.query.docEntry
        const response = await detalleTraslado(docEntry)
        let dataResponse = response.map((item) => {
            const newDate = new Date(item.ExpDate || '')
            const day = newDate.getDate()
            const month = newDate.getMonth() + 1
            return {
                ...item,
                subTotal: Number(item.U_COSTO_COM) * Number(item.Quantity),
                ExpDate: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${newDate.getFullYear()}`
            }
        })
        return res.json(dataResponse)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en detalleTrasladoController : ${error.message || 'No definido'}` })
    }
}

const selectionBatchPlazoController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const whsCodeFrom = req.query.whsCodeFrom
        const plazo = req.query.plazo
        let response = await selectionBatchPlazo(itemCode, whsCodeFrom, plazo)
        response = response.map((item) => {
            return {
                ...item,
                Quantity: +item.Quantity
            }
        })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en selectionBatchPlazoController : ${error.message || 'No definido'}` })
    }
}

const procesoAbastecimientoController = async (req, res) => {
    try {
        const { listSucCode } = req.body
        let response = await procesoAbastecimiento()
        response = response.map((item) => {
            return {
                ...item,
                Fulfilled: Number(item.Fulfilled) / 100
            }
        })
        // console.log(JSON.stringify({ response }, null, 2))
        response = response.sort((a, b) => new Date(b.SolicitudDateTime) - new Date(a.SolicitudDateTime))
        let result = []
        for (const element of listSucCode) {
            result = [...result, ...response.filter((item) => Number(item.SucCode) == element)]
        }
        return res.json(result)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en procesoAbastecimientoController : ${error.message || 'No definido'}` })
    }
}

const datosRecepcionTrasladoController = async (req, res) => {
    try {
        const docEntry = req.query.docEntry
        if (!docEntry || docEntry == '') {
            res.status(400).json({ mensaje: `Error, no existe el Doc Entry`, docEntry })
        }
        let response = await datosRecepcionTraslado(docEntry)
        if (response.length == 0) {
            res.status(400).json({ mensaje: `No hay datos en la peticion`, response, docEntry })
        }
        response = response.map((item) => {
            const newDate = new Date(item.ExpDate || '')
            const day = newDate.getDate()
            const month = newDate.getMonth() + 1
            return {
                ...item,
                U_COSTO_COM: Number(+item.U_COSTO_COM).toFixed(4),
                ExpDate: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${newDate.getFullYear()}`
            }
        })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en datosRecepcionTrasladoController : ${error.message || 'No definido'}` })
    }
}

const cancelarCambioMalEstadoController = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { idEnt, idDev } = req.query

        let responseDev
        if (idDev && idDev != null) {
            responseDev = await cancelReturn(idDev)
            console.log({ responseDev })
            if (responseDev.status == 400) {
                let mensajeDv
                if (typeof responseDev.errorMessage === 'string') {
                    mensajeDv = `${responseDev.errorMessage}`
                } else {
                    mensajeDv = `${responseDev.errorMessage.value || 'Error en cancelReturn'}`
                }
                if (!mensajeDv.includes('Document is already closed')) {
                    grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Cambio Mal Estado`,
                        `${mensajeDv}`, `https://srvhana:50000/b1s/v1/Returns(${idDev})/Cancel`, `/inventario/cancelar-cambio-mal-estado`, process.env.DBSAPPRD)
                    return res.status(400).json({ mensajeDv })
                }
            }
        }
        const responseEnt = await cancelEntrega(idEnt)
        if (responseEnt.status == 400) {
            let mensaje = `Error en el cancel entrega: `
            let errorMessage = responseEnt.errorMessage
            if (typeof errorMessage !== 'string')
                errorMessage = responseEnt.errorMessage.value
            console.log({ mensaje })
            mensaje += errorMessage

            grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Cambio Mal Estado`, mensaje,
                `https://srvhana:50000/b1s/v1/DeliveryNotes(${idEnt})/Cancel`, `/inventario/cancelar-cambio-mal-estado`, process.env.DBSAPPRD)

            return res.status(400).json({ mensaje, responseDev })
        }

        grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Cambio Mal Estado`, `Exito en la cancelacion del cambio por mal estado/vencimiento`,
            `https://srvhana:50000/b1s/v1/DeliveryNotes(${idEnt})/Cancel`, `/inventario/cancelar-cambio-mal-estado`, process.env.DBSAPPRD);

        return res.json({ responseEnt, responseDev })
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, `Inventario Cancelar Cambio Mal Estado`,
            `${error.message || 'Error en cancelarCambioMalEstadoController'}`, `catch del cancelarCambioMalEstadoController`, `/inventario/cancelar-cambio-mal-estado`, process.env.DBSAPPRD)
        return res.status(500).json({ mensaje: error.message || 'Error en cancelarCambioMalEstadoController' })
    }
}


const excelDevolucion = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { data, displayedColumns, cabecera } = req.body;
        const { fechaIni, fechaFin } = cabecera;

        //   console.log({data});
        //   console.log({displayedColumns})
        const fechaActual = new Date();
        const date = new Intl.DateTimeFormat('es-VE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(fechaActual);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Devoluciones');

        worksheet.columns = [
            { header: 'Clase', key: 'TransClass', width: 12 },
            { header: 'No. Devolucion', key: 'DocNum', width: 15 },
            { header: 'Cod Cliente', key: 'CardCode', width: 14 },
            { header: 'Cliente', key: 'CardName', width: 40 },
            { header: 'Comentario', key: 'Comments', width: 50 },
            { header: 'Fecha', key: 'DocDate', width: 13 },
            { header: 'Total', key: 'DocTotal', width: 13 }
        ];

        // Insertar filas antes del encabezado
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        // Agregar contenido a las filas de cabecera
        worksheet.getCell('A1').value = `Devoluciones`;
        worksheet.getCell('A2').value = `Fechas: Desde ${fechaIni} Hasta ${fechaFin}`;
        worksheet.getCell('A3').value = `Fecha de Impresión: ${date}`;
        // Fusionar celdas para que el texto se centre sobre varias columnas
        worksheet.mergeCells('A1:G1');
        worksheet.mergeCells('A2:G2');
        worksheet.mergeCells('A3:G3');

        // Estilizar cabecera
        const cellA = worksheet.getCell('A1');
        cellA.alignment = { vertical: 'middle', horizontal: 'center' };
        cellA.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' },
        };
        cellA.font = { bold: true, size: 14 };
        cellA.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };

        ['A2', 'A3'].forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.font = { bold: true, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'start' };
        });

        const rowRefs = data.map(row =>
            worksheet.addRow(
                displayedColumns.reduce((acc, column) => ({
                    ...acc,
                    [column]: row[column] ?
                        (column.includes('Date') ? new Date(row[column]) : (column.includes('Total') || column.includes('Pend') || column.includes('Num')) ? parseFloat(row[column]) : row[column])
                        : ''
                }), {})
            )
        );

        // Apply formatting per row
        rowRefs.forEach(row => {
            row.getCell('DocTotal').numFmt = '"Bs"#,##0.00';

            row.eachCell(cell => {
                cell.border = {
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        worksheet.getRow(5).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        worksheet.lastRow.eachCell(cell => {
            cell.border = {
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            }
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=devoluciones.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error({ error });
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        //   grabarLog(user.USERCODE, user.USERNAME,`Inventario Excel Devolucion`, `Error generando el Excel del reporte cuenta ${error}`,
        //     'catch de excelReporte', 'cobranza/excel-reporte', process.env.PRD
        //   );
        return res.status(500).json({ mensaje: `Error generando el Excel de devoluciones ${error}` });
    }
};


const entregasRealizadasCabeceraController = async (req, res) => {
    try {
        const { cardCode, page = 1, limit = 10, search = '', fecha = null } = req.query;
        const skip = (page - 1) * limit;
        console.log({ cardCode, skip, limit, search, fecha })
        const entregas = await entregasClienteDespachadorCabecera(cardCode, skip, limit, search, fecha);

        const total = entregas.length > 0 ? entregas[0].TotalCount : 0;
        const totalPages = Math.ceil(total / limit);

        return res.json({
            entregas,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages,
            }
        })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const mensaje = `Error en el controlador entregasRealizadasCabeceraController: ${error.message || ''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Entregas Entregas realizadass", mensaje, ``, "inventario/entregas-realizadas", process.env.PRD)
        return res.status(500).json({
            mensaje
        })
    }
}

const entregasRealizadasDetalleController = async (req, res) => {
    try {
        const { docEntry, page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;
        console.log({ docEntry, skip, limit, search })
        const entregas_detalles = await entregasClienteDespachadorDetalle(docEntry, skip, limit, search);

        const total = entregas_detalles.length > 0 ? entregas_detalles[0].TotalCount : 0;
        const totalPages = Math.ceil(total / limit);

        return res.json({
            entregas_detalles,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages,
            }
        })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const mensaje = `Error en el controlador entregasRealizadasDetalleController: ${error.message || ''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Entregas Entregas realizadas Detalle", mensaje, ``, "inventario/entregas-realizadas-detalles", process.env.PRD)
        return res.status(500).json({
            mensaje
        })
    }
}




const excelReporte = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { data, displayedColumns, headerColumns, cabecera } = req.body;
        const { fechaIni, fechaFin } = cabecera;
        console.log('headerColumns', headerColumns);
        const fechaActual = new Date();
        const date = new Intl.DateTimeFormat('es-VE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(fechaActual);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Devoluciones');

        worksheet.columns = displayedColumns.map((column) => ({
            header: headerColumns[column],
            key: column,
            width: 10
        }));

        console.log({ columns: worksheet.columns })

        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.getCell('A1').value = `Devoluciones`;
        worksheet.getCell('A2').value = `Fechas: Desde ${fechaIni} Hasta ${fechaFin}`;
        worksheet.getCell('A3').value = `Fecha de Impresión: ${date}`;
        const letra = String.fromCharCode('A'.charCodeAt(0) + (displayedColumns.length - 1));
        console.log({ letra })
        worksheet.mergeCells(`A1:${letra}1`);
        worksheet.mergeCells(`A2:${letra}2`);
        worksheet.mergeCells(`A3:${letra}3`);

        // Estilizar cabecera
        const cellA = worksheet.getCell('A1');
        cellA.alignment = { vertical: 'middle', horizontal: 'center' };
        cellA.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' },
        };
        cellA.font = { bold: true, size: 14 };
        cellA.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };

        ['A2', 'A3'].forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.font = { bold: true, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'start' };
        });

        data.map(row =>
            worksheet.addRow(
                displayedColumns.reduce((acc, column) => ({
                    ...acc,
                    [column]: row[column] ?
                        (column.includes('Date') ? new Date(row[column]) :
                            (column.includes('Num') ? parseFloat(row[column]) : row[column]))
                        : ''
                }), {})
            )
        );

        worksheet.columns.forEach(column => {
            const header = column.header.toString()
            let maxLength = header.length;

            column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
                if (rowNumber > 4) {
                    let cellValue = cell.value ? cell.value.toString() : '';
                    if (header.includes('Fecha') && cell.value instanceof Date) {
                        console.log({ fecha: cell.value.toString() })
                        const dateValue = new Date(cell.value.toString())
                        cellValue = dateValue.toISOString().split('T')[0]
                    }
                    maxLength = Math.max(maxLength, cellValue.length);
                    cell.border = {
                        left: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                }
            });
            column.width = maxLength + 3;
        });

        worksheet.getRow(5).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        worksheet.lastRow.eachCell(cell => {
            cell.border = {
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            }
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=devoluciones.xlsx');

        await workbook.xlsx.write(res);
        grabarLog(user.USERCODE, user.USERNAME, `Inventario Excel Reporte Devolucion`, `Exito en el reporte de devoluciones`,
            '', 'inventario/excel-reporte', process.env.PRD
        );
        res.end();
    } catch (error) {
        console.error({ error });
        grabarLog(user.USERCODE, user.USERNAME, `Inventario Excel Reporte Devolucion`, `Error generando el Excel del reporte de devoluciones ${error}`,
            'catch de excelReporte', 'inventario/excel-reporte', process.env.PRD
        );
        return res.status(500).json({ mensaje: `Error generando el Excel de reporte de devolucion ${error}` });
    }
};

const ndcByDateRangeController = async (req, res) => {
    try {
        const { startDate, endDate, listSucCode } = req.body

        if (!startDate || startDate == '') {
            return res.status(400).json({ mensaje: `No existe la fecha inicial` });
        }

        if (!endDate || endDate == '') {
            return res.status(400).json({ mensaje: `No existe la fecha final` });
        }

        if (!listSucCode || listSucCode.length == 0) {
            return res.status(400).json({ mensaje: `No existe la lista de sucursales o la listas esta vacia` });
        }

        let data = []
        for (const element of listSucCode) {
            const response = await ndcByDateRange(startDate, endDate, element)
            data = [...data, ...response]
        }

        return res.json(data)

    } catch (error) {
        return res.status(500).json({ mensaje: `Error en el controlador.`, error });
    }
}

const getAllWarehousePlantByParamsController = async (req, res) => {
    try {
        const parametro = req.query.parametro
        console.log({ parametro })
        if (parametro == undefined || parametro == null) {
            return res.status(400).json({ mensaje: `No existe el parametro de busqueda` });
        }
        const response = await getAllWarehousePlantByParams(parametro)
        const dataFilter = response.map((item) => {
            const {
                BusinessUnit,
                WhsCode,
                WhsName,
                SucCode,
                SucName,
                County,
                City,
                createDate,
                Address3,
                Address2,
                ...restDataItem

            } = item
            return {
                BusinessUnit,
                WhsCode,
                WhsName,
                SucCode,
                SucName,
                County,
                City,
                createDate,
                Address3,
                Address2,
            }
        })
        return res.json(dataFilter)
    } catch (error) {
        return res.status(500).json({ mensaje: `Error en el controlador.`, error });
    }
}

const getAllWarehouseCommercialByParamsController = async (req, res) => {
    try {
        const { listSucCode } = req.body

        let result = []
        for (const parametro of listSucCode) {
            console.log({ parametro })
            const response = await getAllWarehouseCommercialByParams(parametro)
            const dataFilter = response.map((item) => {
                const {
                    BusinessUnit,
                    WhsCode,
                    WhsName,
                    SucCode,
                    SucName,
                    County,
                    City,
                    createDate,
                    Address3,
                    Address2,
                    ...restDataItem

                } = item
                return {
                    BusinessUnit,
                    WhsCode,
                    WhsName,
                    SucCode,
                    SucName,
                    County,
                    City,
                    createDate,
                    Address3,
                    Address2,
                }
            })

            result = [...result, ...dataFilter]
        }

        return res.json(result)
    } catch (error) {
        return res.status(500).json({ mensaje: `Error en el controlador.`, error });
    }
}

const kardexPlantController = async (req, res) => {
    try {

        const {
            start,
            end,
            whsCode,
            itemCode, } = req.body

        if (!start || start == undefined || start == '') {
            return res.status(400).json({ mensaje: `Se requiere una fecha de inicio (start)` });
        }

        if (!end || end == undefined || end == '') {
            return res.status(400).json({ mensaje: `Se requiere una fecha de final (end)` });
        }

        const response = await kardexPlant(start, end, whsCode, itemCode)
        const dataFilter = response.map((item) => {
            const { InQty, OutQty, StockPrice, ...rest } = item
            return {
                ...rest,
                InQty: +InQty,
                OutQty: +OutQty,
                StockPrice: +StockPrice,
            }
        })
        return res.json(dataFilter)
    } catch (error) {
        return res.status(500).json({ mensaje: `Error en el controlador.`, error });
    }
}

const kardexCommercialController = async (req, res) => {
    try {

        const {
            start,
            end,
            whsCode,
            itemCode,
            sucCode } = req.body

        if (!start || start == undefined || start == '') {
            return res.status(400).json({ mensaje: `Se requiere una fecha de inicio (start)` });
        }

        if (!end || end == undefined || end == '') {
            return res.status(400).json({ mensaje: `Se requiere una fecha de final (end)` });
        }

        const response = await kardexCommercial(start, end, whsCode, itemCode, sucCode)
        const dataFilter = response.map((item) => {
            const { InQty, OutQty, StockPrice, ...rest } = item
            return {
                ...rest,
                InQty: +InQty,
                OutQty: +OutQty,
                StockPrice: +StockPrice,
            }
        })
        return res.json(dataFilter)
    } catch (error) {
        return res.status(500).json({ mensaje: `Error en el controlador.`, error });
    }
}

const postEntregaPorOrderNumberController = async (req, res) => {

    try {
        const orderNumber = req.query.orderNumber
        const user = req.usuarioAutorizado
        console.log({ orderNumber })
        if (!orderNumber) {
            return res.status(400).json({ mensaje: 'no existe eol orden number en la peticion' });
        }
        // return res.json({ orderNumber })
        const responseHana = await inventarioHabilitacion(orderNumber)
        // return res.json({responseHana})
        console.log('inventarioHabilitacion')
        // const lote = await fechaVencLote('1231231313213213')
        // if(lote.length==0){
        //     return res.status(400).json({ mensaje: 'el lote no se encontro' });
        // }
        if (responseHana.length == 0) {
            return res.status(400).json({ mensaje: 'no se encontraron datos' });
        }
        console.log({ responseHana })
        const cabecera = {
            // DocEntry: responseHana[0].DocEntry,
            Reference2: responseHana[0].Ref2,
            U_CardCode: responseHana[0].U_CardCode,
            U_Tipo_entradas: responseHana[0].U_Tipo_entradas,
            Comments: responseHana[0].Comments,
            U_UserCode: responseHana[0].U_UserCode,
            JrnlMemo: responseHana[0].JrnlMemo,
        }
        const DocumentLines = []

        responseHana.map(async (item) => {
            const BatchNumbers = []
            const batch = {
                BatchNumber: item.BatchNumber,
                Quantity: item.Quantity,
                BaseLineNumber: item.DocLineNum,
                ItemCode: item.ItemCode,
                ExpiryDate: item.ExpiryDate,
            }

            BatchNumbers.push(batch)
            //? item code por articuloDict
            const linea = {
                DocLineNum: item.DocLineNum,
                ItemCode: item.ItemCode,
                Dscription: item.Dscription,
                WarehouseCode: item.WhsCode,
                Quantity: item.Quantity,
                Price: item.Price,
                LineTotal: item.LineTotal,
                AccountCode: item.AccountCode,
                BatchNumbers
            }

            DocumentLines.push(linea)
        })

        const dataFinal = {
            ...cabecera,
            DocumentLines
        }
        console.log({ dataFinal })
        // return res.json({ dataFinal})
        const responseEntradaHabilitacion = await postEntradaHabilitacion(dataFinal)
        console.log('respuesta post entrada habilitacion')
        console.log({ responseEntradaHabilitacion })
        console.log({ value: responseEntradaHabilitacion.value })
        console.log({ lang: responseEntradaHabilitacion.lang })
        const { status } = responseEntradaHabilitacion
        if (status == undefined || status !== 204) {
            grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error. Habilitacion incompleta, entrada no realizada: ${responseEntradaHabilitacion.value || responseEntradaHabilitacion.errorMessage || responseEntradaHabilitacion.errorMessage.value || ''}`, ``, "inventario/habilitacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'Habilitacion incompleta, entrada no realizada' });
        }
        return res.json({ responseEntradaHabilitacion })
    } catch (error) {
        return res.status(500).json({ mensaje: `Error en el controlador.`, error });
    }
}

const habilitacionesPorIduserController = async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId || userId === '') { // Usar === para una comparación estricta
            // Si no hay userId, enviar respuesta y SALIR de la función.
            return res.status(400).json({ mensaje: `Error, no existe el userId`, userId });
        }

        let response = await habilitacionesPorIduser(userId);

        if (response.length === 0) { // Usar === para una comparación estricta
            // Si no hay datos, enviar respuesta y SALIR de la función.
            return res.status(400).json({ mensaje: `No hay datos en la peticion`, response, userId });
        }

        // Si todo va bien, enviar la respuesta de éxito y SALIR de la función.
        return res.json(response);

    } catch (error) {
        console.log({ error });
        // Si hay un error, enviar la respuesta de error y SALIR de la función.
        return res.status(500).json({ mensaje: `Error en habilitacionesPorIduserController : ${error.message || 'No definido'}` });
    }
};


const patchBatchNumberDetailsController = async (req, res) => {
    try {
        const { batchNumberId, ExpirationDate } = req.body;

        if (!batchNumberId || !ExpirationDate) {
            const errorMessage = 'Datos incompletos para la actualización del lote. Se requiere el ID del lote y la fecha de expiración.';
            return res.status(400).json({ message: errorMessage });
        }

        const entitys = await getIDEntityLote(batchNumberId);

        const payloadForSAP = {
            "ExpirationDate": ExpirationDate
        };

        // 1. Mapea cada 'item' a una promesa de patch
        const patchPromises = entitys.map(item =>
            // Esta línea crea una promesa para cada llamada patch
            patchBatchNumberDetails(item.DocEntry, payloadForSAP)
        );

        // 2. Espera a que todas las promesas se resuelvan
        // Si una sola promesa falla, el 'try...catch' la capturará
        const results = await Promise.all(patchPromises);

        // 3. Si Promise.all se completa, significa que todas las operaciones fueron exitosas.
        res.status(200).json({
            message: 'Todos los lotes fueron actualizados con éxito.',
            details: results
        });

    } catch (error) {
        // 4. Si una o más operaciones fallan, Promise.all se rechaza y el control
        // pasa a este bloque 'catch'
        console.error('Error en patchBatchNumberDetailsController:', error);

        res.status(500).json({
            message: 'Error al actualizar uno o más lotes.',
            error: error.message || 'Error desconocido'
        });
    }
};



const getBatchNumberDetailsController = async (req, res) => {
    try {
        console.log('Iniciando la obtención de los detalles de todos los lotes...');

        // 1. Llama a la función que interactúa con SAP B1
        const result = await getLotesExpDate();

        // 2. Verifica si la respuesta contiene un error
        if (result.error) {
            // Si la función devolvió un error, lo enviamos al cliente
            console.error('Error en el controlador:', result.message);
            return res.status(result.status || 500).json({
                message: result.message || 'Error al obtener los detalles de los lotes desde SAP Business One.'
            });
        }

        // 3. Si no hay error, enviamos el arreglo de datos al cliente
        // El status 200 OK indica que la operación fue exitosa
        console.log('Se obtuvieron los detalles de los lotes con éxito.');
        res.status(200).json({
            message: 'Detalles de lotes obtenidos con éxito.',
            data: result
        });

    } catch (error) {
        // Manejo de errores a nivel de controlador
        console.error('Error interno en getBatchNumberDetailsController:', error);
        res.status(500).json({
            message: 'Error interno del servidor al procesar la solicitud.',
            error: error.message
        });
    }
};



const getDetallesDocumentos = async (req, res) => {
    try {
        const {DocEntry, typeDocument} = req.query;
        const result = await getDetailsDocuments(DocEntry, typeDocument);

        if (result.error) {
            console.error('Error en el controlador:', result.message);
            return res.status(result.status || 500).json({ 
                message: result.message || 'Error al obtener los detalles.'
            });
        }

        console.log('Se obtuvieron los detalles con éxito.');
        res.status(200).json({
            result
        });

    } catch (error) {
        // Manejo de errores a nivel de controlador
        console.error('Error interno en getBatchNumberDetailsController:', error);
        res.status(500).json({
            message: 'Error interno del servidor al procesar la solicitud.',
            error: error.message
        });
    }
};


const getReturnValuesProcessController = async (req, res) => {
    try {
        const user = req.usuarioAutorizado
        const idSap = user.ID_SAP
        if (!idSap) {
            return res.status(401).json({ mensaje: `el usuario no tiene ID SAP` })
        }
        const response = await getReturnValuesProcess(idSap)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getReturnValuesProcessController  : ${error.message || 'No definido'}` })
    }
}

const processIncommingPaymentsController = async (req, res) => {
    try {
        //TODO BODY GENERICO PARA INCOMMING PAYMENTS
        // "CashAccount": "1110104",
        // "CashSum": 1000,// doc total
        // "TransferAccount": null,
        // "CheckAccount": null,
        // "TransferSum": 0,
        // "TransferDate": null,
        // "TransferReference": null,
        // "CardCode": "C000925",
        // "Remarks": "Cobrador BLANCO RODRIGUEZ SARAH ESTEFANI",
        // "JournalRemarks": "19/08 COB WEB C000925 - EFECTIVO",
        // "Series": 321,
        // "U_OSLP_ID": 16,// id vendedor sap
        // "U_ORIGIN": "SAP",
        // "U_UserCode":"id sap",// id  sap
        // "PaymentInvoices": [
        //     {
        //         "LineNum": 0,
        //         "DocEntry": 515369,//DocEntryInv
        //         "SumApplied": 1000,// doc total
        //         "InvoiceType": "it_Invoice"
        //     }
        // ],
        //TODO ------------------------------------
        const { DocTotalInv, CardCode, CommentsRet, DocEntryInv } = req.body
        const user = req.usuarioAutorizado
        const idSap = user.ID_SAP || 0
        const idVendedorSap = user.ID_VENDEDOR_SAP || 0
        const docTotal = +DocTotalInv
        if (idSap == 0 || idVendedorSap == 0) {
            return res.status(400).json({
                mensaje: 'El usuario no tiene Id Sap o Id Vendedor Sap'
            })
        }

        if (docTotal == 0 || docTotal == undefined) {
            return res.status(400).json({
                mensaje: 'El total no existe o es cero'
            })
        }

        const incommingPaymentsBody = {
            CashAccount: "1110104",
            CashSum: +DocTotalInv,
            TransferAccount: null,
            CheckAccount: null,
            TransferSum: 0,
            TransferDate: null,
            TransferReference: null,
            CardCode,
            Remarks: CommentsRet,
            JournalRemarks: CommentsRet,
            U_OSLP_ID: idVendedorSap,
            U_ORIGIN: "SAP",
            U_UserCode: idSap,
            PaymentInvoices: [],
        }

        const paymentInvoice = {
            LineNum: 0,
            DocEntry: DocEntryInv,
            SumApplied: +DocTotalInv,
            InvoiceType: "it_Invoice",
        }

        incommingPaymentsBody.PaymentInvoices.push(paymentInvoice)
        // return res.json(incommingPaymentsBody)
        console.log(JSON.stringify({ incommingPaymentsBody }, null, 2,))
        const responseIncommingPayment = await postIncommingPayments(incommingPaymentsBody)

        if (responseIncommingPayment.status !== 200) {
            const { errorMessage } = responseIncommingPayment
            return res.status(400).json({
                mensaje: `Hubo un error de Sap. ${errorMessage.value || 'No definido'}`,
                incommingPaymentsBody
            })
        }

        return res.json(responseIncommingPayment)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en processIncommingPaymentsController  : ${error.message || 'No definido'}` })
    }
}



const processReconciliationController = async (req, res) => {
    try {
        const { ID_SAP, ID_VENDEDOR_SAP } = req.usuarioAutorizado
        const {
            CreditNoteListToRecon,
            TransIdNC,
            DocTotalNCs,
            DocTotalNC,
            DocTotalInv,
            TransIdCaja,
            DocEntryInv,
            TransIdInv,
            DocNumInv,
            AmountCaja,
            CardCode } = req.body

        const creditNoteReconSplit = CreditNoteListToRecon.split(',')
        const transIdSplit = TransIdNC.split(',')
        const DocTotal = Number(DocTotalNCs)
        const docTotalNCSplit = DocTotalNC.split(',')
        let diferencia = Number(AmountCaja) - DocTotal

        let ReconcileAmountCN = (Number(AmountCaja) <= DocTotal) ? Number(AmountCaja) : DocTotal

        const InternalReconciliationOpenTransRows = [
            {
                ShortName: CardCode,
                TransId: TransIdCaja,
                TransRowId: 1,
                SrcObjTyp: "30",
                SrcObjAbs: TransIdCaja,
                CreditOrDebit: "codDebit",
                ReconcileAmount: Number(ReconcileAmountCN),
                CashDiscount: 0.0,
                Selected: "tYES",
            }
        ]

        let numInternalRec = 0

        for (const creditNoteOrderNumber of creditNoteReconSplit) {

            const amount = docTotalNCSplit[numInternalRec]
            const creditTransNum = transIdSplit[numInternalRec]
            const internalRecLine = {
                ShortName: CardCode,
                TransId: creditTransNum,
                TransRowId: 0,
                SrcObjTyp: "14",
                SrcObjAbs: creditNoteOrderNumber,
                CreditOrDebit: "codCredit",
                ReconcileAmount: Number(amount),
                CashDiscount: 0.0,
                Selected: "tYES",
            }

            InternalReconciliationOpenTransRows.push(internalRecLine)
            numInternalRec += 1
        }

        const reconciliationFinal = InternalReconciliationOpenTransRows[InternalReconciliationOpenTransRows.length - 1];
        if (diferencia < 0) {
            reconciliationFinal.ReconcileAmount -= diferencia * -1
        }

        const fechaFormater = new Date()
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');

        let bodyReconciliacion = {
            ReconDate: `${year}-${month}-${day}`,
            CardOrAccount: "coaCard",
            InternalReconciliationOpenTransRows,
        }

        console.log(JSON.stringify({ bodyReconciliacion }, null, 2))
        let responseReconciliacion = await postReconciliacion(bodyReconciliacion)
        console.log({ responseReconciliacion })

        if (responseReconciliacion.status == 400) {
            let mensaje = responseReconciliacion.errorMessage
            if (typeof mensaje != 'string' && mensaje.lang) {
                mensaje = mensaje.value
            }

            mensaje = `Error en postReconciliacion: ${mensaje}.`
            // grabarLog(user.USERCODE, user.USERNAME, `Inventario Facturacion Cambio Valorado`, mensaje, 'postReconciliacion', 'inventario/facturacion-cambio', process.env.PRD)
            return res.status(400).json({
                mensaje,
                bodyReconciliacion,
            })
        }

        return res.json({ ...responseReconciliacion })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en processIncommingPaymentsController  : ${error.message || 'No definido'}` })
    }
}

const getValoradosPorIdSapController = async (req, res) => {
    try {
        const user = req.usuarioAutorizado
        const idSap = user.ID_SAP
        if (!idSap) {
            return res.status(401).json({ mensaje: `el usuario no tiene ID SAP` })
        }
        const response = await getValoradosPorIdSap(idSap)
        // console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getValoradosPorIdSapController  : ${error.message || 'No definido'}` })
    }
}

const getInvoiceByDocNumController = async (req, res) => {
    try {
        const DocNum = req.query.docnum;
        const response = await getInvoiceByDocNum(DocNum)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getInvoiceByDocNumController  : ${error.message || 'No definido'}` })
    }
}


module.exports = {
    clientePorDimensionUnoController,
    almacenesPorDimensionUnoController,
    postHabilitacionController,
    inventarioValoradoController,
    descripcionArticuloController,
    createQuotationController,
    fechaVenLoteController,
    stockDisponibleController,
    habilitacionDiccionarioController,
    stockDisponibleIfavetController,
    facturasClienteLoteItemCodeController,
    detalleVentasController,
    devolucionCompletaController,
    pruebaController,
    devolucionExcepcionalController,
    getAllAlmacenesController,
    devolucionNotaDebitoCreditoController,
    searchArticulosController,
    devolucionNDCGenesisController,
    devolucionDebitoCreditoCompletaController,
    facturasClienteLoteItemCodeGenesisController,
    getCreditNoteController,
    stockDisponiblePorSucursalController,
    getAllCreditNotesController,
    devolucionMalEstadoController,
    clientesDevMalEstado,
    getClienteByCardCodeController,
    devolucionPorValoradoController,
    detalleFacturasController,
    detalleFacturasController,
    stockDisponibleIfaController,
    imprimibleDevolucionController,
    devolucionPorValoradoDifArticulosController,
    imprimibleSalidaController,
    findClienteController, findClienteInstitucionesController,
    getAlmacenesSucursalController,
    getStockdeItemAlmacenController, getStockVariosItemsAlmacenController,
    facturacionCambioValoradoController, entregaCambioValoradoController,
    detalleFacturasGenesisController, getLineaArticuloController,
    relacionArticuloController,
    articuloDiccionarioController,
    articulosController,
    saveArticuloDiccionario,
    solicitudTrasladoController,
    costoComercialItemcodeController,
    tipoSolicitudController,
    tipoClientesController,
    devoluccionInstitucionesController,
    solicitudesTrasladoController,
    reporteDevolucionValoradosController,
    detalleSolicitudTrasladoController,
    searchClienteController,
    reporteDevolucionCambiosController,
    reporteDevolucionRefacturacionController,
    cancelarDevolucionController,
    cancelarEntregaController,
    getDevolucionesParaCancelarController,
    getEntregasParaCancelarController,
    actualizarTrasladoController,
    crearTrasladoController,
    detalleTrasladoController,
    selectionBatchPlazoController,
    procesoAbastecimientoController,
    datosRecepcionTrasladoController, cancelarCambioMalEstadoController,
    excelReporte,
    excelDevolucion,
    entregasRealizadasCabeceraController,
    entregasRealizadasDetalleController,
    todasSolicitudesTrasladoController,
    ndcByDateRangeController,
    getAllWarehousePlantByParamsController,
    kardexPlantController,
    getAllWarehouseCommercialByParamsController,
    kardexCommercialController,
    postEntregaPorOrderNumberController,
    habilitacionesPorIduserController,
    patchBatchNumberDetailsController,
    getBatchNumberDetailsController,
    getValoradosPorIdSapController,
    getReturnValuesProcessController,
    processIncommingPaymentsController,
    processReconciliationController,
    getDetallesDocumentos,
    getInvoiceByDocNumController
}