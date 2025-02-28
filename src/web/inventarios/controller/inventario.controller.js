const { json } = require("express")
const { almacenesPorDimensionUno, clientesPorDimensionUno, inventarioHabilitacion, inventarioValorado,
    descripcionArticulo, fechaVencLote, stockDisponible, inventarioHabilitacionDict, stockDisponibleIfavet,
    facturasClienteLoteItemCode, detalleVentas,
    entregaDetallerFactura, detalleParaDevolucion, obtenerEntregaDetalle: obtenerEntregaDetalleDevolucion,
    obtenerDevolucionDetalle,
    getAllAlmacenes,
    entregaDetalleToProsin } = require("./hana.controller")
const { postSalidaHabilitacion, postEntradaHabilitacion, postReturn, postCreditNotes } = require("./sld.controller")
const { postInvoice, facturacionByIdSld, postEntrega } = require("../../facturacion_module/controller/sld.controller")
const { grabarLog } = require("../../shared/controller/hana.controller")
const { obtenerEntregaDetalle, lotesArticuloAlmacenCantidad } = require("../../facturacion_module/controller/hana.controller")
const { spObtenerCUF } = require("../../facturacion_module/controller/sql_genesis.controller")
const { notaDebitoCredito } = require("../../facturacion_module/service/apiFacturacionProsin")
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
            grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `el inventario es obligatorio. ${formulario.almacen || 'No definido'}`, ``, "inventario/habilitacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'El almacen es obligatorio' })
        } else {
            if (formulario.almacen.WhsCode) {
                warehouseCode = formulario.almacen.WhsCode
            } else {
                return res.status(400).json({ mensaje: 'El almacen es obligatorio' })
            }

        }

        if (userLocal.user) {
            if (userLocal.user.ID) {
                id = userLocal.user.ID
            } else {
                return res.status(400).json({ mensaje: 'El usuario es obligatorio' })
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
                return res.status(400).json({ mensaje: 'El codigo del articulo es obligatorio' })
            }

            if (!item.articuloDict || item.articuloDict == null || item.articuloDict == '') {
                return res.status(400).json({ mensaje: 'El codigo del articulo EQUIVALENTE es obligatorio' })
            }

            if (!item.lote || item.lote == null || item.lote == '') {
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
                "AccountCode": "6110401",
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
        const responseEntradaHabilitacion = await postEntradaHabilitacion(dataFinal)
        console.log('respuesta post entrada habilitacion')
        console.log({ responseEntradaHabilitacion })
        console.log({ value: responseEntradaHabilitacion.value })
        console.log({ lang: responseEntradaHabilitacion.lang })
        grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Error del SAP en postEntradaHabilitacion, ${responseEntradaHabilitacion.value || 'No definido'}`, `https://srvhana:50000/b1s/v1/InventoryGenExits`, "inventario/habilitacion", process.env.PRD)
        if (responseEntradaHabilitacion.value) {
            grabarLog(user.USERCODE, user.USERNAME, "inventario habilitacion", `Habilitacion incompleta, entrada no realizada: ${responseEntradaHabilitacion.value || ''}`, ``, "inventario/habilitacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'Habilitacion incompleta, entrada no realizada' });
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
        return res.status(500).json({ mensaje: 'error en inventarioValoradoController' })
    }
}

const descripcionArticuloController = async (req, res) => {
    try {
        const { itemCode } = req.body
        const response = await descripcionArticulo(itemCode)
        if (response.length == 0) return res.status(404).json({ mensaje: 'El articulo no fue encontrado' })
        return res.json({ ItemName: response[0].ItemName })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en descripcionArticuloController' })
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
        const response = await facturasClienteLoteItemCode(itemCode, cardCode, batchNum)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}
const detalleVentasController = async (req, res) => {
    try {
        const id = req.query.id
        const response = await detalleVentas(id)
        console.log({ response })
        let cabecera = []
        let detalle = []
        response.forEach((value) => {
            const { DocEntry, BaseEntry, DocNum, DocDate, Cuf, ...rest } = value
            if (cabecera.length == 0) {
                cabecera.push({ DocEntry, BaseEntry, DocNum, DocDate, Cuf })
            }
            detalle.push(rest)
        })
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
        let numRet = 0
        for (const line of entregas) {
            let newLine = {}
            const { ItemCode, WarehouseCode, Quantity, UnitsOfMeasurment, LineNum, BaseLine: base1, BaseType: base2, LineStatus, BaseEntry: base3, TaxCode,AccountCode, ...restLine } = line;
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
                    BaseLineNumber: LineNum,
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
        const { U_NIT, U_RAZSOC, U_UserCode, CardCode: cardCodeEntrega } = entregas[0]

        const finalData = {
            // DocDate,
            // DocDueDate,
            Series: 352,
            CardCode: CardCode || cardCodeEntrega,
            U_NIT,
            U_RAZSOC,
            U_UserCode: id_sap,
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
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error en postReturn: ${mensaje}`, `postInvoice()`, "inventario/devolucion-completa", process.env.PRD)
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
                ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2,ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                ItemCode: ItemCodeDev, Quantity: QuantityDev,WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev, 
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
            if(DocumentAdditionalExpenses.length==0){
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
                ItemCode: ItemCodeDev, Quantity: QuantityDev,WarehouseCode: WarehouseCodeDev, 
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

        if(responseCreditNote.status > 299){
            return res.json({mensaje: responseCreditNote.errorMessage,
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
        const { id, docEntryFact } = req.query
        const devolucionDetalle = await obtenerDevolucionDetalle(id)
        const cabeceraCN = []
        const DocumentLinesCN = []
        let numDev = 0
        for (const lineDevolucion of devolucionDetalle) {
            const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
                CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
                PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
                ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2,ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                ItemCode: ItemCodeDev, Quantity: QuantityDev,WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev, 
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
                    Reference1: id,// DocEntry de la devolucion
                    Reference2: docEntryFact ?? '',// DocEntry de la factura
                    Comments: CommentsDev,
                    JournalMemo: JournalMemoDev,
                    PaymentGroupCode,
                    SalesPersonCode,
                    Series: 354,
                    U_UserCode
                })
            }
            const newLineDev = {
                LineNum: numDev,
                BaseLine: LineNumDev,
                BaseType: 16,
                BaseEntry: id,
                ItemCode: ItemCodeDev, Quantity: QuantityDev,WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev, 
                GrossTotal: GrossTotalDev, GrossPrice: GrossPriceDev, MeasureUnit: MeasureUnitDev, UnitsOfMeasurment: UnitsOfMeasurmentDev, TaxCode: TaxCodeDev
            }

            DocumentLinesCN.push(newLineDev)
            numDev += numDev
        }

        const bodyCreditNotes = {
            ...cabeceraCN[0],
            DocumentLines: DocumentLinesCN
        }
        // return res.json({...bodyCreditNotes})
        const responseCreditNote = await postCreditNotes(bodyCreditNotes)

        return res.json({
            responseCreditNote,
            bodyCreditNotes,
            devolucionDetalle,
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
        let batchNumbers = []
        let newDocumentLines = []
        let numRet = 0
        let numBatch = 0
        for (const line of entregas) {
            const detalle = Detalle.find((item)=> item.ItemCode == line.ItemCode)
          if(detalle){
            const {cantidad}=detalle
            const { ItemCode, WarehouseCode, Quantity, UnitsOfMeasurment, LineNum, BaseLine: base1, BaseType: base2, LineStatus, BaseEntry: base3, TaxCode,AccountCode, ...restLine } = line;
            
            const batchData = batchEntrega.filter((item) => item.ItemCode == ItemCode)
            console.log({ batch: batchData })
            if (batchData && batchData.length > 0) {
                //TO-DO: UTILIZAR LA CANTIDAD DEL DETALLE 
                let cantidaUnit = cantidad*Number(UnitsOfMeasurment)
                let batchNumbers= []
                for(const batch of batchData){
                    if(cantidaUnit==0)
                        break;
                    if(cantidaUnit < Number(batch.OutQtyL)){
                        batch.new_quantity = cantidaUnit
                    }else{
                        batch.new_quantity = Number(batch.OutQtyL)
                    }
                    cantidaUnit = Number(cantidaUnit) - Number(batch.new_quantity)
                    batchNumbers.push({
                        BaseLineNumber: numBatch,
                        BatchNumber: batch.BatchNum,
                        Quantity: batch.new_quantity,
                        ItemCode: batch.ItemCode
                    })
                    numBatch +=1
                }
                console.log('------------------------------------------------------------------------------------')
                console.log({ UnitsOfMeasurment })
                console.log('------------------------------------------------------------------------------------')


                // const data = {
                //     BaseLine: LineNum,
                //     BaseType: 17,
                //     BaseEntry,
                // }
                
                newLine = {
                    // ...data,
                    ItemCode,
                    WarehouseCode: Almacen,
                    Quantity: cantidad,
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
        }
        const { U_NIT, U_RAZSOC, U_UserCode, CardCode: cardCodeEntrega } = entregas[0]

        const finalData = {
            // DocDate,
            // DocDueDate,
            Series: 352,
            CardCode: CardCode || cardCodeEntrega,
            U_NIT,
            U_RAZSOC,
            U_UserCode: id_sap,
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
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error en postReturn: ${mensaje}`, `postInvoice()`, "inventario/devolucion-completa", process.env.PRD)
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
                ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2,ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
                ItemCode: ItemCodeDev, Quantity: QuantityDev,WarehouseCode: WarehouseCodeDev, AccountCode: AccountCodeDev, 
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
            if(DocumentAdditionalExpenses.length==0){
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
                ItemCode: ItemCodeDev, Quantity: QuantityDev,WarehouseCode: WarehouseCodeDev, 
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

        if(responseCreditNote.status > 299){
            return res.json({mensaje: responseCreditNote.errorMessage,
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
    try {
        const {
            DocEntry: docEntry,
            BaseEntry,
            Cuf,
            DocDate,
            DocDueDate,
            id_sap,
            Almacen,
            Detalle
        } = req.body

        console.log({
            docEntry,
            BaseEntry,
            Cuf,
            DocDate,
            DocDueDate,
            id_sap,
            Almacen,
            Detalle
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
        const entregas = await entregaDetalleToProsin(docEntry)
        const {
            sucursal,
            punto,
            documento_via,
            codigo_cliente_externo,
            tipo_identificacion,
            identificacion,
            complemento,
            nombre
        } = entregas
        const dataToProsin = {
            sucursal
        }
        const responseProsin = await notaDebitoCredito(user)
        return res.json({
            entregas
        })
        // if (entregas.message) {
        //     endTime = Date.now()
        //     // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
        //     return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${entregas.message || ""}` })
        // }
        // if (entregas.length == 0) {
        //     endTime = Date.now()
        // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error al entregaDetallerFactura: ${entregas.message || ""}, cuf: ${Cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "inventario/devolucion-completa", process.env.PRD)
        //     return res.status(400).json({ mensaje: `Esta factura ${BaseEntry}, no tiene entregas`, entregas })
        // }
        // const batchEntrega = await obtenerEntregaDetalleDevolucion(docEntry);
        // const devolucionDetalle = await obtenerDevolucionDetalle(docEntryDev)
        // const cabeceraCN = []
        // const DocumentLinesCN = []
        // let numDev = 0
        // for (const lineDevolucion of devolucionDetalle) {
        //     const { DocDate: DocDateDev, DocDueDate: DocDueDateDev, NumAtCard, DocTotal: DocTotalDev,
        //         CardCode: CardCodeDev, DocCurrency: DocCurrencyDev, Comments: CommentsDev, JournalMemo: JournalMemoDev,
        //         PaymentGroupCode, SalesPersonCode, Series, U_UserCode, LineNum: LineNumDev, BaseLine: notusexd, BaseType: notUsex2,
        //         ExpenseCode1, LineTotal1, ExpenseCode2, LineTotal2, ExpenseCode3, LineTotal3, ExpenseCode4, LineTotal4,
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
        //     const newLineDev = {
        //         LineNum: numDev,
        //         BaseLine: LineNumDev,
        //         ...restDev
        //     }

        //     DocumentLinesCN.push(newLineDev)
        //     numDev += numDev
        // }

        // const bodyCreditNotes = {
        //     ...cabeceraCN[0],
        //     DocumentLines: DocumentLinesCN
        // }


        // return res.json({
        //     entregas,
        //     batchEntrega,
        //     // bodyCreditNotes,
        // })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
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
    devolucionNotaDebitoCreditoController
}