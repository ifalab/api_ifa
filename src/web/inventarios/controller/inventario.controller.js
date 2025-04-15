const { json } = require("express")
const ejs = require('ejs');
const QRCode = require('qrcode');
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
    findCliente, getAlmacenesSucursal, getStockdeItemAlmacen, getLineaArticulo } = require("./hana.controller")
const { postSalidaHabilitacion, postEntradaHabilitacion, postReturn, postCreditNotes, patchReturn,
    getCreditNote, getCreditNotes, postReconciliacion } = require("./sld.controller")
const { postInvoice, facturacionByIdSld, postEntrega, getEntrega, patchEntrega, } = require("../../facturacion_module/controller/sld.controller")
const { grabarLog } = require("../../shared/controller/hana.controller")
const { obtenerEntregaDetalle, lotesArticuloAlmacenCantidad, notaEntrega } = require("../../facturacion_module/controller/hana.controller")
const { spObtenerCUF } = require("../../facturacion_module/controller/sql_genesis.controller")
const { notaDebitoCredito } = require("../../facturacion_module/service/apiFacturacionProsin")
const path = require('path');
const fs = require('fs');
const { facturacionProsin } = require("../../facturacion_module/service/apiFacturacionProsin")
const {getFacturasParaDevolucion, getDetalleFacturasParaDevolucion} = require("./sql_genesis.controller")

const clientePorDimensionUnoController = async (req, res) => {
    try {

        // const list = []
        // for (const iterator of dimension) {
        //     const result = await clientesPorDimensionUno()
        //     result.map((itemResult) => {
        //         list.push(itemResult)
        //     })
        // }
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

        // console.log({ code })
        // console.log({ concepto })
        // console.log({ inventario })
        // console.log({ warehouseCode })
        // console.log({ id })
        // return res.json({ id: userLocal.user.ID })

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

        // console.log({ code })
        // console.log({ concepto })
        // console.log({ inventario })
        // console.log({ warehouseCode })
        // console.log({ id })
        // return res.json({ id: userLocal.user.ID })
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

            // if (!item.unidad || item.unidad == null || item.unidad == 0) {
            //     return res.status(400).json({ mensaje: 'La cantidad por caja debe ser mayor a cero' })
            //     break
            // }

            // if (!item.cantidadSalida || item.cantidadSalida == null || item.cantidadSalida == 0) {
            //     return res.status(400).json({ mensaje: 'La cantidad de cajas debe ser mayor a cero' })
            //     break
            // }

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
        // console.log('data que se envia a salida: ')
        // console.log({ data })
        // return res.json({ data })

        const response = await postSalidaHabilitacion(data)
        // return res.json({response })
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
        //todo-------------------------------------------------------------

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

        if (responseEntradaHabilitacion.value) {
            grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error. Habilitacion incompleta, entrada no realizada: ${responseEntradaHabilitacion.value || responseEntradaHabilitacion.errorMessage || responseEntradaHabilitacion.errorMessage.value || ''}`, ``, "inventario/habilitacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'Habilitacion incompleta, entrada no realizada' });
        }
        if (responseEntradaHabilitacion.errorMessage) {
            grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error del SAP en postEntradaHabilitacion, ${responseEntradaHabilitacion.value || responseEntradaHabilitacion.errorMessage || responseEntradaHabilitacion.errorMessage.value || 'No definido'}`, `https://srvhana:50000/b1s/v1/InventoryGenExits`, "inventario/habilitacion", process.env.PRD)
            return res.status(400).json({ mensaje: `Error del SAP en postEntradaHabilitacion. ${responseEntradaHabilitacion.value || responseEntradaHabilitacion.errorMessage || 'No definido'}` });
        }
        grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Habilitado con exito`, ``, "inventario/habilitacion", process.env.PRD)
        return res.json(responseEntradaHabilitacion)
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
            if (item.itemcode != '103-012-015' &&
                item.itemcode != '103-012-017' &&
                item.itemcode != '103-012-016' &&
                item.itemcode != '103-005-001' &&
                item.itemcode != '103-012-019' &&
                item.itemcode != '103-012-018' &&
                item.itemcode != '103-011-001' &&
                item.itemcode != '103-012-020' &&
                item.itemcode != '103-012-022' &&
                item.itemcode != '103-012-021' &&
                item.itemcode != '103-012-024' &&
                item.itemcode != '103-012-023' &&
                item.itemcode != '103-012-027' &&
                item.itemcode != '103-012-026' &&
                item.itemcode != '103-004-003') {
                result.push(item)
            }
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
        console.log({ response })
        const responseGenesis = await getFacturasParaDevolucion(cardCode, itemCode, batchNum)
        console.log({ responseGenesis })
        if(responseGenesis.message){
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
        const {nro_cuentas} = req.body
        let responses = {}
        for(const nro_cuenta of nro_cuentas){
            const response = await getDetalleFacturasParaDevolucion(nro_cuenta)
            if(response.message){
                console.log({response: response.message})
                return res.json(responses)
            }
            response.map(item => {
                item.DiscPrcnt = item.Porcentaje_Descuento
                item.ItemCode = item.Articulo
                item.Dscription = item.NombreArticulo
                item.Quantity = item.Cantidad
                item.UnitPrice = item.Precio
                item.DocNum = item.Nro_Cuenta
                item.Cuf = item.cuf
                item.cuf = undefined
            })
            responses[nro_cuenta] = response
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
        const response = await detalleVentas(id)
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
        if (!docEntry || docEntry <= 0) {
            return res.status(400).json({ mensaje: 'no hay DocEntry en la solicitud' })
        }
        
        const fechaFormater = new Date(DocDate)
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');
        const formater = `${year}${month}${day}`;
        console.log({ docEntry })

        //----------------------
        const entregas = await entregaDetallerFactura(BaseEntry, Cuf, docEntry, formater)
        console.log({ entregas })
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
        if(!idReturnHecho || idReturnHecho==''){    
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
                U_UserCode: id_sap,
                DocumentLines: newDocumentLines,
            }

            finalDataEntrega = finalData
            // return res.json(finalDataEntrega)
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

        }else{
            idReturn=idReturnHecho
        }
        //*------------------------------------------------ DETALLE TO PROSIN
        // return res.json({idReturn})
        
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
        console.log({ responseProsin })
        // return res.json({responseProsin})

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
        
        console.log({ datosProsin: responseProsin.data.datos })
        cufndc = responseProsin.data.datos.cuf
        const facturandc = responseProsin.data.datos.factura
        //---------------------------------------------------------------------PATCH RETURNS

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
        console.log({link})
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
                console.log({deudaCliente})
                let ControlAccount = '2110401'
                if(deudaCliente.length>0){
                    if(!(deudaCliente[0].Balance==0)){
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

            const newLineDev = {
                LineNum: numDev,
                BaseLine: LineNumDev,
                BaseType: 16,
                BaseEntry: idReturn,
                ItemCode: ItemCodeDev, Quantity: QuantityDev, WarehouseCode: WarehouseCodeDev,
                AccountCode: '6210103',
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev,
                TaxCode: 'IVA_NC'
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
    let idReturn
    try {
        const { Devoluciones, AlmacenIngreso, AlmacenSalida, CardCode, id_sap, Comentario } = req.body
        const idReturnBody = req.body.idReturn
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

            const newLine = {
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
            console.log('------newLine-----')
            console.log({ newLine })

            newDocumentLinesReturn.push(newLine)

            let batchNumbersEntrega = []
            const batchData = await lotesArticuloAlmacenCantidad(ItemCode, AlmacenSalida, Cantidad);
            console.log({ batch: batchData })
            if (batchData.message) {
                endTime = Date.now();
                // grabarLog(user.USERCODE, user.USERNAME, "Dovolucion Mal Estado", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-mal-estado", process.env.PRD)
                return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}` })
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
            }else{
                return res.status(400).json({ mensaje: `No hay lotes para el item: ${ItemCode}, almacen: ${AlmacenSalida}, cantidad: ${Cantidad}` })
            }
            
            const newLineEntrega = {
                BaseEntry: 0,
                BaseType: 16,
                BaseLine: numRet,
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
        if(!idReturnBody){ //Si no hay id de devolucion, entonces se crea una nueva devolucion
            bodyReturn = {
                Series: 352,
                CardCode: CardCode,
                U_UserCode: id_sap,
                JournalMemo:Comentario,
                Comments: Comentario,
                DocumentLines: newDocumentLinesReturn,
            }
            console.log(JSON.stringify({ bodyReturn }, null, 2))
            // return res.status(400).json()
            responceReturn = await postReturn(bodyReturn)
            console.log({ responceReturn })

            if (responceReturn.status > 300) {
                console.log({ errorMessage: responceReturn.errorMessage })
                let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
                if (mensaje.value)
                    mensaje = mensaje.value
                grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Mal Estado", `Error en postReturn: ${mensaje}`, `postReturn()`, "inventario/dev-mal-estado", process.env.PRD)
                return res.status(400).json({ mensaje: `Error en postReturn: ${mensaje}`, bodyReturn })
            }
            // return res.json({
            //     idReturn: responceReturn.orderNumber,
            //     bodyReturn
            // })
            idReturn = responceReturn.orderNumber
        }else{//Existe id de devolucion
            idReturn = idReturnBody
        }
        console.log({ idReturn })
        newDocumentLinesEntrega.map((item) => {
            item.BaseEntry = idReturn
        })

        const bodyEntrega = {
            Series: 353,
            CardCode: CardCode,
            U_UserCode: id_sap,
            JournalMemo: Comentario,
            Comments: Comentario,
            DocumentLines: newDocumentLinesEntrega,
        }
        console.log(JSON.stringify({ bodyEntrega }, null, 2))
        const responseEntrega = await postEntrega(bodyEntrega)

        if (responseEntrega.lang) {
            const outputDir = path.join(__dirname, 'outputs');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

            // Generar el nombre del archivo con el timestamp
            const fileNameJson = path.join(outputDir, `finalDataEntrega_${timestamp}.json`);
            fs.writeFileSync(fileNameJson, JSON.stringify(bodyEntrega, null, 2), 'utf8');
            console.log(`Objeto finalDataEntrega guardado en ${fileNameJson}`);
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Mal Estado", `Error interno en la entrega de sap en postEntrega: ${responseEntrega.value || ''}`, ``, "inventario/dev-mal-estado", process.env.PRD)
            return res.status(400).json({
                mensaje: `Error interno en la entrega de sap. ${responseEntrega.value || ''}`,
                idReturn,
                bodyReturn,
                responseEntrega,
                bodyEntrega
            })
        }

        grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Mal Estado", `Exito en la devolucion`, ``, "inventario/dev-mal-estado", process.env.PRD)

        return res.json({
            responceReturn,
            idReturn,
            bodyReturn,
            responseEntrega,
            idEntrega: responseEntrega.deliveryN44umber,
            bodyEntrega
        })
    } catch (error) {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Mal Estado", `Error en el devolucionMalEstadoController: ${error.message || ''}`, `catch del controller devolucionMalEstadoController`, "inventario/dev-mal-estado", process.env.PRD)
        return res.status(500).json({ 
            mensaje: `Error en en controlador devolucionMalEstadoController: ${error.message}`,
            idReturn })
    }
}

const clientesDevMalEstado = async (req, res) => {
    try {
        const { listSucCode } = req.body
        let listClients = []
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
    const startTime = Date.now();
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
                }else{
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
                }else{

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
            allBodies[DocEntry]= {bodyEntrega}

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
            allBodies[DocEntry]= {bodyEntrega, bodyInvoice: responseHanaB}
            const responseInvoice = await postInvoice(responseHanaB)
            allResponseInvoice.push(responseInvoice)
            if(responseInvoice.status == 400){

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

                return res.status(400).json({mensaje:`Error en postInvoice: ${responseInvoice.errorMessage.value || 'No definido'}. Factura Nro: ${DocEntry}`, responseHanaB, bodyEntrega, bodyReturn,
                 allResponseReturn, allResponseCreditNote, allResponseEntrega, allResponseInvoice,
                 allResponseReconciliacion,
                 facturasCompletadas})
            }

            // return res.json({bodyInvoice, responseHanaB, idInvoice: responseInvoice.idInvoice, bodyEntrega, bodyReturn})

            //? ---------------------------------------------------------------- return.
            console.log('body return -----------------------------------------------')
            bodyReturn.Series = 352
            console.log(JSON.stringify({ bodyReturn }, null, 2))
            allBodies[DocEntry]= {bodyEntrega, bodyInvoice: responseHanaB, bodyReturn}
            
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
            allBodies[DocEntry]= {bodyEntrega, bodyInvoice: responseHanaB, bodyReturn, bodyCreditNotes}

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
            
            let bodyReconciliacion={
                ReconDate: `${year}-${month}-${day}`,
                CardOrAccount: "coaCard",
                // ReconType: "rtManual",
                // Total: totalFactura,
                InternalReconciliationOpenTransRows,
            }
            console.log({bodyReconciliacion})
            allBodies[DocEntry]= {bodyEntrega, bodyInvoice: responseHanaB, bodyReturn, bodyCreditNotes, bodyReconciliacion}
            const responseReconciliacion =  await postReconciliacion(bodyReconciliacion)
            console.log({responseReconciliacion})
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
    try {
        const { id, cambio } = req.body
        console.log({id, cambio})
        const user = req.usuarioAutorizado
        const layout = await devolucionLayout(id)
        console.log({ layout })
        
        if (layout.length == 0) {
            // grabarLog(user.USERCODE, user.USERNAME, "Facturacion crear Nota entrega", `Error de SAP al crear la nota de entrega`, response.query, "facturacion/nota-entrega", process.env.PRD)
            return res.status(400).json({ mensaje: `Error de SAP, no hay devoluCion con el id: ${id}` });
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
            detailsList,
            cambio
        };
        // return res.json({data, layout})

        //! Generar QR Code
        const qrCode = await QRCode.toDataURL(data.BarCode.toString());

        //! Renderizar la plantilla EJS a HTML
        const htmlTemplate = path.join(__dirname, 'imprimible', 'template.ejs');
        const htmlContent = await ejs.renderFile(htmlTemplate, { data, qrCode });

        //! Generar el PDF con Puppeteer
        const browser = await puppeteer.launch({ headless: 'new' }); // Modo headless
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();

        //! Definir nombre del archivo
        const fileName = `devolucion_${data.DocNum}_${new Date()}.pdf`;

        //! Registrar en el log
        // grabarLog(user.USERCODE, user.USERNAME, "Facturacion crear Nota Entrega",
        //     "Nota Creada con éxito", layout.query || '', "facturacion/nota-entrega", process.env.PRD);

        //! Enviar el PDF como respuesta
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        return res.end(pdfBuffer);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador imprimibleDevolucionController. ${error.message || ''}` })
    }
}

const imprimibleSalidaController = async (req, res) => {
    try {
        const { id, cambio } = req.body

        const user = req.usuarioAutorizado
        const response = await notaEntrega(id)
        const layout = response.result
        console.log({ layout })
        // return res.json({layout})
        if (layout.length == 0) {
            // grabarLog(user.USERCODE, user.USERNAME, "Facturacion crear Nota entrega", `Error de SAP al crear la nota de entrega`, response.query, "facturacion/nota-entrega", process.env.PRD)
            return res.status(400).json({ mensaje: `Error de SAP, no hay devoluCion con el id: ${id}` });
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
            const {Quantity, ...restData } = item;
            detailsList.push({Quantity, ...restData });
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
            cambio,
            totalCant
        };
        // return res.json({data, layout})

        //! Generar QR Code
        const qrCode = await QRCode.toDataURL(data.BarCode.toString());

        //! Renderizar la plantilla EJS a HTML
        const htmlTemplate = path.join(__dirname, 'imprimible', 'template-salida.ejs');
        const htmlContent = await ejs.renderFile(htmlTemplate, { data, qrCode });

        //! Generar el PDF con Puppeteer
        const browser = await puppeteer.launch({ headless: 'new' }); // Modo headless
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();

        //! Definir nombre del archivo
        const fileName = `salida_${data.DocNum}_${new Date()}.pdf`;

        //! Registrar en el log
        // grabarLog(user.USERCODE, user.USERNAME, "Facturacion crear Nota Entrega",
        //     "Nota Creada con éxito", layout.query || '', "facturacion/nota-entrega", process.env.PRD);

        //! Enviar el PDF como respuesta
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        return res.end(pdfBuffer);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador imprimibleSalidaController. ${error.message || ''}` })
    }
}

const devolucionPorValoradoDifArticulosController = async (req, res) => {
    let allResponseReturn = []
    let allResponseCreditNote = []
    let facturasCompletadas = []
    let responseEntrega
    let responseInvoice
    let responseReconciliacion
    let devolucionFinished=false
    let entregaFinished=false
    let allBodies = {}
    const startTime = Date.now();
    try {
        const { facturas, id_sap, CardCode, AlmacenIngreso, 
            // AlmacenSalida, nuevosArticulos 
        } = req.body
        console.log(JSON.stringify({ facturas, id_sap, CardCode, AlmacenIngreso
            // , AlmacenSalida, nuevosArticulos 
        }, null, 2))
       
        // return res.json({ facturas, id_sap, AlmacenIngreso, AlmacenSalida, CardCode, nuevosArticulos })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        let totalFacturas = 0
        let totalesFactura=[]

        const deudaCliente = await getDeudaDelCliente(CardCode)
        console.log({deudaCliente})
        let ControlAccount = '2110401'
        if(deudaCliente.length>0 && (deudaCliente[0].Balance>0)){
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
                        facturasCompletadas,
                        devolucionFinished, 
                        // entregaFinished
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
                }else{
                    endTime = Date.now();
                    const mensaje = `No hay lotes para item: ${ItemCode}, almacen: ${AlmacenIngreso}, cantidad: ${Cantidad}. Factura: ${DocEntry}`
                    // grabarLog(user.USERCODE, user.USERNAME, "Devolucion Valorado", mensaje, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-valorado", process.env.PRD)                    
                    
                    return res.status(400).json({
                        mensaje,
                        allResponseReturn, 
                        allResponseCreditNote,
                        facturasCompletadas,
                        devolucionFinished, 
                        // entregaFinished
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

                numRet += 1
            }

            const bodyReturn = {
                Series: 352,
                CardCode: CardCode,
                U_UserCode: id_sap,
                U_B_cufd: Cuf,
                DocumentLines: newDocumentLinesReturn,
            }
            

            //? ---------------------------------------------------------------- return.
            console.log('body return -----------------------------------------------')
            bodyReturn.Series = 352
            console.log(JSON.stringify({ bodyReturn }, null, 2))
            allBodies[DocEntry]= {bodyReturn}
            
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
                // grabarLog(user.USERCODE, user.USERNAME, "Inventario alorado", `Error en postReturn: ${mensaje}. Nro Factura ${DocEntry}`, `postReturn()`, "inventario/dev-valorado", process.env.PRD)
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
            allBodies[DocEntry]= {bodyReturn, bodyCreditNotes}

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
                    facturasCompletadas,
                    devolucionFinished, 
                    // entregaFinished
                })
            }
            totalFacturas+= +totalFactura
            totalesFactura.push(totalFactura)
            facturasCompletadas.push(DocEntry)
        }
        devolucionFinished=true

        // const bodyEntrega = {
        //     Series: 353,
        //     CardCode: CardCode,
        //     U_UserCode: id_sap,
        //     DocumentLines: newDocumentLinesEntrega,
        // }
        // // console.log('body enterga -----------------------------------------------')
        // // console.log(JSON.stringify({ bodyEntrega }, null, 2))
        // allBodies[0]= {bodyEntrega}

        // //? ----------------------------------------------------------------      entrega .
        // responseEntrega = await postEntrega(bodyEntrega)
        // if (responseEntrega.lang) {
        //     const outputDir = path.join(__dirname, 'outputs');
        //     if (!fs.existsSync(outputDir)) {
        //         fs.mkdirSync(outputDir);
        //     }
        //     const now = new Date();
        //     const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

        //     // Generar el nombre del archivo con el timestamp
        //     const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
        //     fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
        //     console.log(`Objeto allBodies guardado en ${fileNameJson}`);
        //     endTime = Date.now();
        //     // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Valorado", `Error interno en la entrega de sap en postEntrega: ${responseEntrega.value || ''}`, ``, "inventario/dev-mal-estado", process.env.PRD)
        //     return res.status(400).json({
        //         mensaje: `Error interno en la entrega de sap. ${responseEntrega.value || ''}.`,
        //         responseEntrega,
        //         bodyEntrega,
        //         allResponseReturn,
        //         allResponseCreditNote,
        //         facturasCompletadas,
        //         devolucionFinished, entregaFinished
        //     })
        // }
        
        // entregaFinished=true

        //---------------------------- INVOICE
        // const deliveryData = responseEntrega.deliveryN44umber

        // const fechaFormater = new Date()
        // // Extraer componentes de la fecha
        // const year = fechaFormater.getUTCFullYear();
        // const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0'); // Asegurarse de que sea 2 dígitos
        // const day = String(fechaFormater.getUTCDate()).padStart(2, '0'); // Asegurarse de que sea 2 dígitos

        // // Formatear la fecha en YYYYMMDD
        // const formater = `${year}${month}${day}`;

        // const responseHana = await entregaDetallerFactura(+deliveryData, '', 0, formater)
        // console.log({ responseHana })
        // if (responseHana.message) {
        //     endTime = Date.now()
        //     // grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al entregaDetallerFactura: ${responseHana.message || "linea 292"}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
        //     const outputDir = path.join(__dirname, 'outputs');
        //     if (!fs.existsSync(outputDir)) {
        //         fs.mkdirSync(outputDir);
        //     }
        //     const now = new Date();
        //     const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

        //     // Generar el nombre del archivo con el timestamp
        //     const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
        //     fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
        //     console.log(`Objeto allBodies guardado en ${fileNameJson}`);
            
        //     return res.status(400).json({ mensaje: `Error al procesar la solicitud: entregaDetallerFactura`, message:responseHana.message, bodyEntrega, responseEntrega,
        //         allResponseReturn, allResponseCreditNote, 
        //         facturasCompletadas,
        //         devolucionFinished  })
        // }
        // const DocumentLinesHana = [];
        // let cabezeraHana = [];

        // let DocumentAdditionalExpensesInv = [];
        // let totalDeLaEntrega = 0
        // for (const line of responseHana) {
        //     const {
        //         LineNum,
        //         BaseType,
        //         BaseEntry, BaseLine, ItemCode, Quantity, GrossPrice, GrossTotal, WarehouseCode, AccountCode, TaxCode, MeasureUnit, UnitsOfMeasurment, U_DESCLINEA,
        //         ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
        //         DocTotal, U_OSLP_ID, U_UserCode, Series, ...result } = line

        //     if (!cabezeraHana.length) {
        //         totalDeLaEntrega=+DocTotal
        //         cabezeraHana = {
        //             ...result,
        //             Series: process.env.SAP_SERIES_BILL,
        //             DocTotal: Number(DocTotal),
        //             U_OSLP_ID: U_OSLP_ID || "",
        //             U_UserCode: U_UserCode || "",
        //             ControlAccount,
        //             DocumentSubType: "bod_Bill",
        //         };
        //         DocumentAdditionalExpensesInv = [
        //             { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA' },
        //             { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA' },
        //             { ExpenseCode: ExpenseCode3, LineTotal: +LineTotal3, TaxCode: 'IVA' },
        //             { ExpenseCode: ExpenseCode4, LineTotal: +LineTotal4, TaxCode: 'IVA' },
        //         ]
        //     }
        //     DocumentLinesHana.push({
        //         LineNum, BaseType, BaseEntry, BaseLine, ItemCode, Quantity: Number(Quantity), GrossPrice: Number(GrossPrice), GrossTotal: Number(GrossTotal), WarehouseCode, AccountCode, TaxCode, MeasureUnit, UnitsOfMeasurment: Number(UnitsOfMeasurment), U_DESCLINEA: Number(U_DESCLINEA)
        //     })
        // }

        // const responseHanaB = {
        //     ...cabezeraHana,
        //     DocumentLines: DocumentLinesHana,
        //     DocumentAdditionalExpenses: DocumentAdditionalExpensesInv
        // }
        // console.log({ responseHanaB })

        // console.log('body invoice -----------------------------------------------')
        // console.log(JSON.stringify({ responseHanaB }, null, 2))
        // allBodies[0]= {...allBodies[0], bodyInvoice: responseHanaB}
        // responseInvoice = await postInvoice(responseHanaB)
        // if(responseInvoice.status == 400){

        //     const outputDir = path.join(__dirname, 'outputs');
        //     if (!fs.existsSync(outputDir)) {
        //         fs.mkdirSync(outputDir);
        //     }
        //     const now = new Date();
        //     const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

        //     // Generar el nombre del archivo con el timestamp
        //     const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
        //     fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
        //     console.log(`Objeto allBodies guardado en ${fileNameJson}`);

        //     return res.status(400).json({mensaje:`Error en postInvoice: ${responseInvoice.errorMessage.value || 'No definido'}.`, responseHanaB, 
        //         bodyEntrega, responseEntrega,
        //         allResponseReturn, allResponseCreditNote, 
        //         facturasCompletadas,
        //         devolucionFinished})
        // }


        // let diferencia = totalFacturas - totalDeLaEntrega
        // let ReconcileAmountInv= +totalDeLaEntrega
        // if(diferencia<0){
        //     ReconcileAmountInv+= +diferencia
        // }
        // const InternalReconciliationOpenTransRows = [
        //     {
        //         ShortName: CardCode,
        //         TransId: responseInvoice.TransNum,
        //         TransRowId: 0,
        //         SrcObjTyp: "13",
        //         SrcObjAbs: responseInvoice.idInvoice,
        //         CreditOrDebit: "codDebit",
        //         ReconcileAmount: ReconcileAmountInv,
        //         CashDiscount: 0.0,
        //         Selected: "tYES",
        //     }
        // ]

        // let numInternalRec =0
        // for(const creditNote of allResponseCreditNote){
        //     let ReconcileAmountCN= +totalesFactura[numInternalRec]
        //     if(diferencia>0 && (ReconcileAmountCN-diferencia) > 0){
        //         ReconcileAmountCN -= +diferencia
        //         diferencia=0
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
        //     numInternalRec +=1
        // }
        
        // let bodyReconciliacion={
        //     ReconDate: `${year}-${month}-${day}`,
        //     CardOrAccount: "coaCard",
        //     InternalReconciliationOpenTransRows,
        // }
        // console.log({bodyReconciliacion})
        // allBodies[0]= {...allBodies[0], bodyReconciliacion}
        // responseReconciliacion =  await postReconciliacion(bodyReconciliacion)
        // console.log({responseReconciliacion})

        // if (responseReconciliacion.status == 400) {

        //     const outputDir = path.join(__dirname, 'outputs');
        //     if (!fs.existsSync(outputDir)) {
        //         fs.mkdirSync(outputDir);
        //     }
        //     const now = new Date();
        //     const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

        //     // Generar el nombre del archivo con el timestamp
        //     const fileNameJson = path.join(outputDir, `bodies_${timestamp}.json`);
        //     fs.writeFileSync(fileNameJson, JSON.stringify(allBodies, null, 2), 'utf8');
        //     console.log(`Objeto allBodies guardado en ${fileNameJson}`);

        //     let mensaje = responseReconciliacion.errorMessage
        //     if (typeof mensaje != 'string' && mensaje.lang) {
        //         mensaje = mensaje.value
        //     }

        //     mensaje = `Error en postReconciliacion: ${mensaje}.`

        //     return res.status(400).json({
        //         mensaje,
        //         bodyReconciliacion,
        //         responseHanaB,
        //         responseEntrega,
        //         // responseInvoice,
        //         allResponseCreditNote,
        //         allResponseReturn,
        //         facturasCompletadas,
        //         devolucionFinished
        //     })
        // }

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
            // responseEntrega,
            // responseInvoice,
            // responseReconciliacion,
            facturasCompletadas,
            devolucionFinished,
            // entregaFinished
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
        const {nuevosArticulos, AlmacenSalida, CardCode, id_sap}=req.body

        ///////////////////////// Entregas
        let newDocumentLinesEntrega = []
        let numLines =0
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
                // grabarLog(user.USERCODE, user.USERNAME, "Devolucion Mal Estado", `${batchDataEntrega.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-mal-estado", process.env.PRD)
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
            }else{

                endTime = Date.now();
                const mensaje = `No hay lotes para item: ${ItemCode}, almacen: ${AlmacenSalida}, cantidad: ${Cantidad}.`
                // grabarLog(user.USERCODE, user.USERNAME, "Devolucion Valorado", mensaje, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/dev-valorado", process.env.PRD)                    
                
                return res.status(400).json({
                    mensaje,newDocumentLinesEntrega, entregaFinished
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
            numLines +=1
        }
        bodyEntrega = {
            Series: 353,
            CardCode: CardCode,
            U_UserCode: id_sap,
            DocumentLines: newDocumentLinesEntrega,
        }
        // console.log('body enterga -----------------------------------------------')
        console.log(JSON.stringify({ bodyEntrega }, null, 2))
        const allBodies= {bodyEntrega}

        //? ----------------------------------------------------------------      entrega .
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
            endTime = Date.now();
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Valorado", `Error interno en la entrega de sap en postEntrega: ${responseEntrega.value || ''}`, ``, "inventario/dev-mal-estado", process.env.PRD)
            return res.status(400).json({
                mensaje: `Error interno en la entrega de sap. ${responseEntrega.value || ''}.`,
                responseEntrega,
                bodyEntrega, entregaFinished
            })
        }
        
        entregaFinished=true

        return res.json({
            responseEntrega, entregaFinished,
            bodyEntrega,
            idEntrega: responseEntrega.deliveryN44umber
        })
    } catch (error) {
        console.log({ error })
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
        const { CardCode, totalFacturas, allResponseCreditNote, idEntrega, totalesFactura} = req.body
        const deliveryData = idEntrega
        const deliveryBody = await obtenerEntregaDetalle(deliveryData)
        // return res.json({deliveryBody})
        let totalDeLaEntrega = 0
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        
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
        if (responseGenesis.message) {
            endTime = Date.now()
            return res.status(400).json({ mensaje: `${responseGenesis.message || 'Error en la consulta spObtenerCUF'}` })
        }
        let invoiceResponse 
        let responseHanaB
        //? si existe el cuf:
        if (responseGenesis.length != 0) {

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
                cuf })
            }
            //TODO ------------------------------------------------------------ ENTREGA DETALLER TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, formater)
            console.log({ responseHana })
            if (responseHana.message) {
                endTime = Date.now()
                return res.status(400).json({ mensaje: 'Error al procesar la solicitud: entregaDetallerFactura',
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
                endTime = Date.now()
                return res.status(400).json({ 
                    mensaje: `Error del SAP en el PostInvoice: ${invoiceResponse.errorMessage.value || ''}`,
                cuf })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: deliveryData,
                cuf
            }
            console.log({ response })
            endTime = Date.now()

        } else {
            //? si no existe el cuf:
            endTime = Date.now()
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
                endTime = Date.now()
                return res.status(400).json({ 
                    mensaje: `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${dataToProsin.tipo_identificacion || 'No definido'} `, 
                    dataToProsin, bodyFinalFactura, cuf })
            }

            if (dataToProsin.correo == null || dataToProsin.correo == '') {
                endTime = Date.now()
                return res.status(400).json({ mensaje: `No existe hay datos del CORREO `, dataToProsin, bodyFinalFactura, cuf })
            }
            dataToProsin.usuario = user.USERNAME || 'No definido'
            const responseProsin = await facturacionProsin(dataToProsin, user)
            console.log({ responseProsin })
            const { data: dataProsin } = responseProsin
            console.log({ dataProsin })
            if (dataProsin && dataProsin.estado != 200) {
                endTime = Date.now()
                return res.status(400).json({ mensaje: `Error de facturacionProsin ${dataProsin.mensaje || ''}`, dataProsin, dataToProsin, bodyFinalFactura, cuf })
            }
            if (dataProsin.mensaje != null) {
                endTime = Date.now()
                return res.status(400).json({ mensaje: `Error de facturacionProsin ${dataProsin.mensaje || ''}`, dataProsin, dataToProsin, bodyFinalFactura, cuf })
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
            if (year.length > 4) {
                endTime = Date.now()
                return res.status(400).json({ mensaje: 'error al formateo de la fecha', cuf })
            }
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
                endTime = Date.now()
                return res.status(400).json({ mensaje: `error en la solicitud patch entrega ${responsePatchEntrega.errorMessage.value || ''}`, cuf })
            }
            //TODO --------------------------------------------------------------  ENTREGA DETALLE TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, fechaFormater)
            console.log({ responseHana })
            if (responseHana.message) {
                endTime = Date.now()
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
                endTime = Date.now()
                return res.status(400).json(
                    { mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}`, cuf })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: deliveryData,
                cuf
            }
            console.log({ response })
            endTime = Date.now()
        }

        let diferencia = totalFacturas - totalDeLaEntrega
        let ReconcileAmountInv= +totalDeLaEntrega
        if(diferencia<0){
            ReconcileAmountInv+= +diferencia
        }
        const InternalReconciliationOpenTransRows = [
            {
                ShortName: CardCode,
                TransId: invoiceResponse.TransNum,
                TransRowId: 0,
                SrcObjTyp: "13",
                SrcObjAbs: invoiceResponse.idInvoice,
                CreditOrDebit: "codDebit",
                ReconcileAmount: ReconcileAmountInv,
                CashDiscount: 0.0,
                Selected: "tYES",
            }
        ]

        let numInternalRec =0
        for(const creditNote of allResponseCreditNote){
            let ReconcileAmountCN= +totalesFactura[numInternalRec]
            if(diferencia>0 && (ReconcileAmountCN-diferencia) > 0){
                ReconcileAmountCN -= +diferencia
                diferencia=0
            }
            const internalRecLine = {
                ShortName: CardCode,
                TransId: creditNote.TransNum,
                TransRowId: 0,
                SrcObjTyp: "14",
                SrcObjAbs: creditNote.orderNumber,
                CreditOrDebit: "codCredit",
                ReconcileAmount: ReconcileAmountCN,
                CashDiscount: 0.0,
                Selected: "tYES",
            }

            InternalReconciliationOpenTransRows.push(internalRecLine)
            numInternalRec +=1
        }

        const fechaFormater = new Date()
        // Extraer componentes de la fecha
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0'); // Asegurarse de que sea 2 dígitos
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0'); // Asegurarse de que sea 2 dígitos

        let bodyReconciliacion={
            ReconDate: `${year}-${month}-${day}`,
            CardOrAccount: "coaCard",
            // ReconType: "rtManual",
            // Total: totalFactura,
            InternalReconciliationOpenTransRows,
        }

        console.log({bodyReconciliacion})
        responseReconciliacion =  await postReconciliacion(bodyReconciliacion)
        console.log({responseReconciliacion})

        if (responseReconciliacion.status == 400) {
            let mensaje = responseReconciliacion.errorMessage
            if (typeof mensaje != 'string' && mensaje.lang) {
                mensaje = mensaje.value
            }

            mensaje = `Error en postReconciliacion: ${mensaje}.`

            return res.status(400).json({
                mensaje,
                bodyReconciliacion,
                responseHanaB,
                invoiceResponse,
                cuf,
                allResponseCreditNote,
            })
        }

        return res.json({bodyReconciliacion,
            invoiceResponse,
            responseHanaB,
            cuf,
            responseReconciliacion})
    }catch (error) {
        console.log({ error })
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
        return res.status(500).json({mensaje: `Error en getAlmacenesSucursalController: ${error.message || 'No definido'}`})
    }
}

const getStockdeItemAlmacenController = async (req, res) => {
    try {
        const { itemCode, whsCode } = req.body
        const response = await getStockdeItemAlmacen(itemCode, whsCode)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({mensaje: `Error en getStockdeItemAlmacenController: ${error.message || 'No definido'}`})
    }
}

const getStockVariosItemsAlmacenController = async (req, res) => {
    try {
        const { itemCodes, whsCode } = req.body
        let responses =[]
        //const response = await getStockdeItemAlmacen(itemCode, whsCode)
        //return res.json(response)
        for(const itemCode of itemCodes){
            const response = await getStockdeItemAlmacen(itemCode, whsCode)
            responses.push(...response)
        }
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({mensaje: `Error en getStockVariosItemsAlmacenController: ${error.message || 'No definido'}`})
    }
}

const getLineaArticuloController = async (req, res) => {
    try {
        const { itemCode } = req.query
        const response = await getLineaArticulo(itemCode)
        if(response.length == 0){
            return res.json({})
        }

        return res.json(response[0])
    } catch (error) {
        console.log({ error })
        return res.status(500).json({mensaje: `Error en getLineaArticuloController: ${error.message || 'No definido'}`})
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
    findClienteController,
    getAlmacenesSucursalController,
    getStockdeItemAlmacenController, getStockVariosItemsAlmacenController,
    facturacionCambioValoradoController, entregaCambioValoradoController,
    detalleFacturasGenesisController, getLineaArticuloController
}