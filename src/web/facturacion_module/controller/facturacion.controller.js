const ejs = require('ejs');
const pdf = require('html-pdf');
const QRCode = require('qrcode');
const path = require('path');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const puppeteer = require('puppeteer');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const { entregaDetallerFactura } = require("../../inventarios/controller/hana.controller")
const { facturacionById, facturacionPedido } = require("../service/apiFacturacion")
const { facturacionProsin, anulacionFacturacion } = require("../service/apiFacturacionProsin")
const { lotesArticuloAlmacenCantidad, solicitarId, obtenerEntregaDetalle, notaEntrega, obtenerEntregasPorFactura, facturasParaAnular, facturaInfo, facturaPedidoDB, pedidosFacturados, obtenerEntregas, facturasPedidoCadenas,
    facturasAnuladas, pedidosPorEntrega,
    entregasSinFacturas } = require("./hana.controller")
const { postEntrega, postInvoice, facturacionByIdSld, cancelInvoice, cancelDeliveryNotes, patchEntrega, cancelOrder } = require("./sld.controller");
const { spObtenerCUF, spEstadoFactura } = require('./sql_genesis.controller');
const { postFacturacionProsin } = require('./prosin.controller');
const { response } = require('express');
const { grabarLog } = require('../../shared/controller/hana.controller');

const facturacionController = async (req, res) => {
    let body = {}
    const startTime = Date.now();
    try {
        let endTime = Date.now();
        const { id } = req.body
        const user = req.usuarioAutorizado
        const id_sap = user.ID_SAP
        // return res.json({id_sap})
        let deliveryData
        let deliveryBody
        let finalDataEntrega
        // return {id}
        if (!id || id == '') {
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", 'error: debe haber un ID valido', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: 'debe haber un ID valido' })
        }
        const solicitud = await solicitarId(id);
        console.log('1 solicitud')

        if (solicitud.message) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${solicitud.message || 'Error en solicitarId'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: `${solicitud.message || 'Error en solicitarId'}` })
        }

        if (solicitud.result.length > 1) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Existe más de una entrega`, `${solicitud.query || ''}. [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)

            return res.status(400).json({ mensaje: 'Existe más de una entrega' })
        }
        else if (solicitud.result.length == 1) {
            //return res.json({solicitud})
            deliveryData = solicitud.result[0].DocEntry
            deliveryBody = await obtenerEntregaDetalle(deliveryData)
            console.log('1 solicitud tiene mas de uno')
            // console.log({ solicitud, deliveryData })
            if (deliveryBody.message) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${deliveryBody.message || 'Error en obtenerEntregaDetalle'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `${deliveryBody.message || ''}` })
            }
        }

        if (!deliveryBody) {

            // const { data } = await facturacionById(id)
            const facturacion = await facturacionByIdSld(id)
            console.log('2 facturacion ')
            console.log({ facturacion })
            // return res.json({data})
            if (facturacion.lang) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error: Hubo un error al facturar: ${facturacion.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Hubo un error al facturar: ${facturacion.value || ''}` })
            }
            if (!facturacion.data) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error: Hubo un error al facturar`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Hubo un error al facturar`, facturacion })
            }
            const data = facturacion.data
            const { DocumentLines, ...restData } = data
            if (!DocumentLines) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", 'Error: No existen los DocumentLines en la facturacion por ID', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No existen los DocumentLines en la facturacion por ID ' })
            }

            let batchNumbers = []
            let newDocumentLines = []
            // return res.json({data})
            for (const line of DocumentLines) {
                let newLine = {}
                const { ItemCode, WarehouseCode, Quantity, UnitsOfMeasurment, LineNum, BaseLine: base1, BaseType: base2, BaseEntry: base3, LineStatus, ...restLine } = line;
                const batchData = await lotesArticuloAlmacenCantidad(ItemCode, WarehouseCode, Quantity);
                console.log({ batch: batchData })
                if (batchData.message) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}` })
                }
                if (batchData && batchData.length !== 0) {
                    // return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}`, batch: batchData ,LineNum});
                    // console.log('------------------------------------------------------------------------------------')
                    // console.log({ UnitsOfMeasurment })
                    // console.log('------------------------------------------------------------------------------------')
                    let new_quantity = 0
                    batchData.map((item) => {
                        new_quantity += Number(item.Quantity).toFixed(6)
                    })
                    //console.log({ batchData })
                    batchNumbers = batchData.map(batch => ({
                        BaseLineNumber: LineNum,
                        BatchNumber: batch.BatchNum,
                        Quantity: Number(batch.Quantity).toFixed(6),
                        ItemCode: batch.ItemCode
                    }))

                    const data = {
                        BaseLine: LineNum,
                        BaseType: 17,
                        BaseEntry: id,
                    }

                    newLine = {
                        ...data,
                        ItemCode,
                        WarehouseCode,
                        Quantity: new_quantity / UnitsOfMeasurment,
                        LineNum,
                        ...restLine,
                        BatchNumbers: batchNumbers
                    };
                    newLine = { ...newLine };
                    newDocumentLines.push(newLine)

                }


            }
            let newData = {
                ...restData,
                DocumentLines: newDocumentLines
            }
            console.log('rest data------------------------------------------------------------')
            // return res.json({ restData })
            const { U_NIT, U_RAZSOC, U_UserCode } = restData
            console.log({ restData })
            const {
                DocDate,
                DocDueDate,
                CardCode,
                DocumentLines: docLines,
                ...restNewData
            } = newData;

            const finalData = {
                // DocDate,
                // DocDueDate,
                CardCode,
                U_NIT,
                U_RAZSOC,
                U_UserCode: id_sap,
                DocumentLines: docLines,
            }

            finalDataEntrega = finalData
            // return res.json({ ...finalDataEntrega })
            console.log('FINAL ENTREGA------------------------------------------------------------')
            console.log({ finalDataEntrega })
            // return res.json({finalDataEntrega,responseBatch})
            //TODO --------------------------------------------------------------  ENTREGA DELIVERY NOTES
            deliveryBody = await postEntrega(finalDataEntrega)
            if (deliveryBody.lang) {

                const outputDir = path.join(__dirname, 'outputs');
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }
                const now = new Date();
                const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

                // Generar el nombre del archivo con el timestamp
                const fileNameJson = path.join(outputDir, `finalDataEntrega_${timestamp}.json`);
                fs.writeFileSync(fileNameJson, JSON.stringify(finalDataEntrega, null, 2), 'utf8');
                console.log(`Objeto finalDataEntrega guardado en ${fileNameJson}`);
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error interno en la entrega de sap en postEntrega: ${deliveryBody.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error interno en la entrega de sap. ${deliveryBody.value || ''}`, respuestaSapEntrega: deliveryBody, finalDataEntrega })
            }
            console.log('3 post entrega')
            console.log({ deliveryBody })
            // console.log('response post entrega ejecutado')

        }

        console.log('4 delivery body fuera del if')
        console.log({ deliveryBody })

        let { responseData } = deliveryBody
        if (!responseData) {
            responseData = deliveryBody
        } else {
            const delivery = deliveryBody.deliveryN44umber
            if (!delivery) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", 'Error del sap, no se pudo crear la entrega, no se encontro el deliveryNumber en la respuesta', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'error del sap, no se pudo crear la entrega, falta delivery linea 164 en el controlador de la factura' })
            }
            deliveryData = delivery
            console.log('5 deliveryData')
            console.log({ deliveryData })
        }

        console.log('6 responseData de delivery body')
        console.log({ responseData })
        if (responseData.deliveryN44umber) { ///
            deliveryData = responseData.deliveryN44umber
        }
        console.log('7 deliveryData')
        console.log({ deliveryData })

        if (responseData.lang) {
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error interno de SAP. ${responseData.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: `Error interno de sap. ${responseData.value || ''}` })
        }
        const detalle = [];
        const cabezera = [];
        if (responseData.responseData) { ///
            responseData = responseData.responseData
        }

        for (const line of responseData) {
            const { producto, descripcion, cantidad, precioUnitario, montoDescuento, subTotal, numeroImei, numeroSerie, complemento, ...result } = line
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
        // return res.json({bodyFinalFactura})
        const responseGenesis = await spObtenerCUF(deliveryData)
        if (responseGenesis.message) {
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${responseGenesis.message || 'Error en la consulta spObtenerCUF'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: `${responseGenesis.message || 'Error en la consulta spObtenerCUF'}` })
        }

        if (responseGenesis.length != 0) {

            const dataGenesis = responseGenesis[0]
            const cuf = dataGenesis.cuf
            const nroFactura = dataGenesis.factura
            const fechaFormater = new Date(dataGenesis.fecha_emision)
            // Extraer componentes de la fecha
            const year = fechaFormater.getUTCFullYear();
            const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0'); // Asegurarse de que sea 2 dígitos
            const day = String(fechaFormater.getUTCDate()).padStart(2, '0'); // Asegurarse de que sea 2 dígitos

            // Formatear la fecha en YYYYMMDD
            const formater = `${year}${month}${day}`;
            //TODO ------------------------------------------------------------ PATCH ENTREGA
            const responsePatchEntrega = await patchEntrega(deliveryData, {
                U_B_cuf: `${cuf}`,
                U_B_em_date: `${formater}`,
                NumAtCard: `${nroFactura}`
            })
            if (responsePatchEntrega.status == 400) {
                console.error({ error: responsePatchEntrega.errorMessage })
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar patchEntrega: ${responsePatchEntrega.errorMessage.value || 'linea 280'}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Error al procesar la solicitud: patchEntrega ${responsePatchEntrega.errorMessage.value}` })
            }
            //TODO ------------------------------------------------------------ ENTREGA DETALLER TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, formater)
            console.log({ responseHana })
            if (responseHana.message) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al entregaDetallerFactura: ${responseHana.message || "linea 292"}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'Error al procesar la solicitud: entregaDetallerFactura' })
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

            const responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            //TODO --------------------------------------------------------------  INVOICE
            console.log({ responseHanaB })
            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (!invoiceResponse.status == 400) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud: patchEntrega: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}` })
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
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)

            return res.json({ ...response, cuf })

        } else {
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error el tipo de identificacion es ${dataToProsin.tipo_identificacion || 'No definido'} codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${dataToProsin.tipo_identificacion || 'No definido'} `, dataToProsin, bodyFinalFactura })
            }

            if (dataToProsin.correo == null || dataToProsin.correo == '') {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `error no hay datos en CORREO codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe hay datos del CORREO `, dataToProsin, bodyFinalFactura })
            }

            const responseProsin = await facturacionProsin(dataToProsin, user)
            // return res.json({bodyFinalFactura,responseProsin,deliveryData})
            console.log({ responseProsin })
            const { data: dataProsin } = responseProsin
            console.log({ dataProsin })
            if (dataProsin && dataProsin.estado != 200) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.mensaje || dataProsin.estado || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, bodyFinalFactura })
            }
            if (dataProsin.mensaje != null) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.mensaje || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, bodyFinalFactura })
            }
            const fecha = dataProsin.fecha
            const nroFactura = dataProsin.datos.factura
            const cuf = dataProsin.datos.cuf
            // return res.json({ delivery, fecha,nroFactura,cuf })
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error en el formateo de la fecha: linea 360`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'error al formateo de la fecha' })
            }
            const fechaFormater = year + month + day
            // return res.json({fechaFormater})
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud patchEntrega: ${responsePatchEntrega.errorMessage.value || "No definido"}, U_B_cuf: ${cuf || ''}, U_B_em_date: ${fechaFormater || 'No definido'} ,NumAtCard: ${nroFactura || 'No definido'}, delivery: ${deliveryData || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error en la solicitud patch entrega ${responsePatchEntrega.errorMessage.value || ''}` })
            }
            //TODO --------------------------------------------------------------  ENTREGA DETALLE TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, fechaFormater)
            console.log({ responseHana })
            if (responseHana.message) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}, cuf: ${cuf || ''}, fechaFormater: ${fechaFormater || ''}, nroFactura: ${nroFactura || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}` })
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

            const responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            //TODO --------------------------------------------------------------  INVOICE
            console.log({ responseHanaB })
            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (!invoiceResponse.status == 400) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud: patchEntrega: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}` })
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
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.json({ ...response, cuf })

        }

    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ user })
        const endTime = Date.now()
        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error en el controlador Facturar catch. ${error.message || ''}`, `catch facturacion facturar. ${error.message || ''}, [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
        return res.status(error.statusCode ?? 500).json({
            mensaje: `Error en el controlador Catch. ${error?.message || 'No definido'}`,
            sapMessage: `${error?.message || 'No definido'}`,
            error: {
                message: error.message ?? '',
                stack: error.stack,
                statusCode: error.statusCode || 500,
            },
            errorController: {
                ...error
            },
            bodyFactura: body
        })
    }
}

const facturacionStatusController = async (req, res) => {
    try {
        const whsCode = req.query.whsCode
        // const {listWhsCode} = req.body
        const data = await facturaPedidoDB(whsCode)
        return res.json({ data })

    } catch (error) {
        console.log('error en facturacionStatusController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const facturacionStatusListController = async (req, res) => {
    try {

        const { listWhsCode } = req.body
        let data = []
        for (const iterator of listWhsCode) {
            const dataToList = await facturaPedidoDB(iterator)
            dataToList.map((item) => {
                data.push({ ...item })
            })

        }
        return res.json({ data })

    } catch (error) {
        console.log('error en facturacionStatusController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const noteEntregaController = async (req, res) => {
    try {
        const delivery = req.query.delivery;
        const user = req.usuarioAutorizado
        const response = await notaEntrega(delivery);
        console.log({ notaEntregaResponse: response.result })
        if (response.result.length == 0) {
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion crear Nota entrega", `Error de SAP al crear la nota de entrega`, response.query, "facturacion/nota-entrega", process.env.PRD)
            return res.status(400).json({ mensaje: 'Error de SAP al crear la nota de entrega' });
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
            detailsList,
        };
        //! Generar QR Code
        const qrCode = await QRCode.toDataURL(data.BarCode.toString());

        //! Renderizar la plantilla EJS a HTML
        const htmlTemplate = path.join(__dirname, 'notaEntrega', 'template.ejs');
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
        const fileName = `nota_entrega_${data.DocNum}.pdf`;

        //! Registrar en el log
        grabarLog(user.USERCODE, user.USERNAME, "Facturacion crear Nota Entrega",
            "Nota Creada con éxito", response.query, "facturacion/nota-entrega", process.env.PRD);

        //! Enviar el PDF como respuesta
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        return res.end(pdfBuffer);
    } catch (error) {
        const user = req.usuarioAutorizado
        console.error('Error en el controlador:', error);
        console.log(error.message)
        let mensaje = error.message || 'Error en el controlador: notaEntregaController'
        if (mensaje.length > 255) {
            mensaje = 'Error en el controlador: notaEntregaController'
        }
        const query = error.query || "No disponible"
        grabarLog(user.USERCODE, user.USERNAME, "Facturacion crear Nota Entrega", mensaje, query, "facturacion/nota-entrega", process.env.PRD)
        return res.status(500).json({ mensaje });
    }
}

const listaFacturasAnular = async (req, res) => {
    try {

        const { sucCodeList } = req.body
        let listaFacturas = []
        for (const sucursal of sucCodeList) {

            const response = await facturasParaAnular(sucursal)
            if (listaFacturas.message) return res.status(404).json({ mensaje: listaFacturas.message })
            // console.log({ response })
            listaFacturas.push(...response)
        }

        return res.json({ listaFacturas })
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const generatePDF = (data) => {
    const fonts = {
        Roboto: {
            normal: 'node_modules/pdfmake/build/vfs_fonts.js',
            bold: 'node_modules/pdfmake/build/vfs_fonts.js',
            italics: 'node_modules/pdfmake/build/vfs_fonts.js',
            bolditalics: 'node_modules/pdfmake/build/vfs_fonts.js',
        }
    };

    const printer = new PdfPrinter(fonts);

    const detailsTableBody = data.detailsList.map((detail) => [
        { text: detail.ItemCode, alignment: 'left', fontSize: 8 },
        { text: detail.Dscription, alignment: 'left', fontSize: 8 },
        { text: detail.BatchNum, alignment: 'center', fontSize: 8 },
        { text: new Date(detail.ExpDate).toLocaleDateString(), alignment: 'center', fontSize: 8 },
        { text: detail.Quantity, alignment: 'center', fontSize: 8 },
        { text: detail.Subnivel1 || '', alignment: 'left', fontSize: 8 },
        { text: parseFloat(detail.Price).toFixed(2), alignment: 'right', fontSize: 8 },
        { text: parseFloat(detail.LineTotal).toFixed(2), alignment: 'right', fontSize: 8 },
    ]);

    const docDefinition = {
        content: [
            { text: 'LABORATORIOS IFA', style: 'header', alignment: 'center' },
            { text: `NOTA DE ENTREGA ${data.DocNum}`, style: 'subheader', alignment: 'center' },
            { text: `Usuario: ${data.USER_CODE}`, alignment: 'right', fontSize: 10 },
            { text: `Hora: ${data.DocTime}`, alignment: 'right', fontSize: 10 },
            { text: `Fecha de creación: ${new Date(data.DocDate).toLocaleDateString()}`, fontSize: 10 },
            { text: `Fecha de entrega: ${new Date(data.DocDueDate).toLocaleDateString()}`, fontSize: 10 },

            // Cliente Información
            { text: `Cliente: ${data.CardName}`, style: 'sectionHeader' },
            {
                columns: [
                    { text: `Teléfono: ${data.Phone1}`, fontSize: 10 },
                    { text: `Dirección: ${data.Address2}`, fontSize: 10 }
                ]
            },
            { text: `Zona: ${data.U_Zona}`, fontSize: 10 },
            { text: `Condición de pago: ${data.PymntGroup}`, fontSize: 10 },

            // Tabla de detalles
            { text: 'Detalle de Productos', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['10%', '25%', '10%', '10%', '10%', '10%', '12.5%', '12.5%'],
                    body: [
                        [
                            { text: 'Código', style: 'tableHeader' },
                            { text: 'Descripción', style: 'tableHeader' },
                            { text: 'Lote', style: 'tableHeader' },
                            { text: 'Exp.', style: 'tableHeader' },
                            { text: 'Cant.', style: 'tableHeader' },
                            { text: 'Ubicación', style: 'tableHeader' },
                            { text: 'Precio', style: 'tableHeader' },
                            { text: 'Total', style: 'tableHeader' },
                        ],
                        ...detailsTableBody
                    ],
                },
                layout: 'lightHorizontalLines',
            },

            // Resumen y pie de página
            {
                columns: [
                    { text: 'Preparado por:', fontSize: 10 },
                    { text: `Creado por: ${data.U_NAME}`, alignment: 'center', fontSize: 10 },
                    { text: 'Revisado por:', alignment: 'right', fontSize: 10 },
                ],
                margin: [0, 10, 0, 0]
            },
            { text: `Total: ${parseFloat(data.DocTotal).toFixed(2)}`, style: 'total', alignment: 'right', margin: [0, 10, 0, 0] },
            { text: `Glosa: ${data.detailsList[0]?.JrnlMemo || ''}`, fontSize: 10, margin: [0, 10, 0, 0] },
        ],
        styles: {
            header: { fontSize: 16, bold: true },
            subheader: { fontSize: 14, bold: true },
            sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
            tableHeader: { bold: true, fontSize: 10, color: 'black' },
            total: { bold: true, fontSize: 12 },
        },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream('nota_entrega.pdf'));
    pdfDoc.end();
}

const obtenerCuf = async (req, res) => {
    try {
        const nro = req.query.nro
        const response = await spObtenerCUF(nro)
        return res.json({ response })
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const obtenerEntregasPorFacturaController = async (req, res) => {
    try {
        const id = req.body.id
        console.log(id)
        const response = await obtenerEntregasPorFactura(id)
        if (response.lang) return res.status(400).json({ mensaje: response.value })

        return res.json({ response })
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: 'error en obtenerEntregasPorFacturaController' })
    }
}

const obtenerInvoicesCancel = async (req, res) => {
    try {
        console.log(req.body)
        // return res.json(req.body)
        const id = req.body.id
        console.log(id)
        const response = await cancelInvoice(id)
        // const response = await cancelDeliveryNotes(id)
        if (response.lang)
            return res.status(400).json({ mensaje: response.value })

        return res.json({ response })
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: 'error en obtenerEntregasPorFacturaController' })
    }
}

const infoFacturaController = async (req, res) => {
    try {
        const info = await facturaInfo()
        let infoFactura = []
        info.map((itemInfo) => {
            if (itemInfo.VALUE_DESCR == 1 || itemInfo.VALUE_DESCR == 3) {
                infoFactura.push({ ...itemInfo })
            }
        })
        return res.json({ infoFactura })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const cancelToProsinController = async (req, res) => {
    const startTime = Date.now();
    try {
        const {
            sucursal,
            punto,
            cuf,
            descripcion,
            motivoAnulacion,
            tipoDocumento,
            usuario,
            mediaPagina,
            docEntry,
            anulacionOrden,
        } = req.body
        let responseProsin = {}
        let endTime = Date.now();
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ user })
        if (!cuf || cuf == '') {
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error el cuf no esta bien definido. ${cuf || ''}`, '', "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Error el cuf no esta bien definido. ${cuf || ''}` })
        }
        const estadoFacturaResponse = await spEstadoFactura(cuf)
        if (estadoFacturaResponse.message) {
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `${estadoFacturaResponse.message || 'Error en spEstadoFactura'}`, '', "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `${estadoFacturaResponse.message || 'Error en spEstadoFactura'}` })
        }
        let { estado } = estadoFacturaResponse[0]
        // //! ELIMINAR: ------------------------------------------------------------------------------
        // // estado = false
        // //!  ------------------------------------------------------------------------------
        if (estado) {
            responseProsin = await anulacionFacturacion({
                sucursal,
                punto,
                cuf,
                descripcion,
                motivoAnulacion,
                tipoDocumento,
                usuario,
                mediaPagina,
            }, user)

            if (responseProsin.data.mensaje) {
                const mess = responseProsin.data.mensaje.split('§')
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en anulacionFacturacion de parte de Prosin: ${mess[1] || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
                return res.status(400).json({ mensaje: `${mess[1] || 'Error en anulacionFacturacion'}` })
            }
        }

        if (!docEntry) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Debe venir el doc entry CUF(${cuf})`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Debe venir el doc entry` })
        }
        const reponseInvoice = await cancelInvoice(docEntry)
        if (reponseInvoice.value) {
            const outputDir = path.join(__dirname, 'outputsAnulacion');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
            const fileNameJson = path.join(outputDir, `reponseInvoiceAnulacion_${timestamp}.json`);
            fs.writeFileSync(fileNameJson, JSON.stringify(docEntry, null, 2), 'utf8');
            console.log(`Objeto reponseInvoice guardado en ${fileNameJson}`);

            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en cancel invoice: ${reponseInvoice.value || ''}, CUF(${cuf})`, `https://srvhana:50000/b1s/v1/Invoices(id)/Cancel, [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en cancel invoice: ${reponseInvoice.value || ''}` })
        }

        const responseEntregas = await obtenerEntregasPorFactura(docEntry)
        if (responseEntregas.length == 0) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `No hay entregas de la factura`, `CALL ifa_lapp_ven_obtener_entregas_por_factura(id), [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `No hay entregas de la factura` })
        }
        if (responseEntregas.message) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en obtenerEntregasPorFactura: ${responseEntregas.message || ''}, CUF(${cuf})`, `CALL ifa_lapp_ven_obtener_entregas_por_factura(id) [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en obtenerEntregasPorFactura: ${responseEntregas.message || ''}` })
        }

        let listResponseDelivery = []
        let listCancelOrders = []
        let responsePedidosPorEntrega = []
        for (const iterator of responseEntregas) {
            const responseDeliveryNotes = await cancelDeliveryNotes(iterator.BaseEntry)
            // console.log({ responseDeliveryNotes })
            if (responseDeliveryNotes.status == 400) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en cancelDeliveryNotes: ${responseDeliveryNotes.errorMessage.value || ''}`, `https://srvhana:50000/b1s/v1/DeliveryNotes(id)/Cancel [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
                // console.log({ responseDeliveryNotes })
                return res.status(400).json({ mensaje: `Error en cancelDeliveryNotes: ${responseDeliveryNotes.errorMessage.value || ''}` })
            }
            console.log('Inicio de anulacion de ordenes---------------------------------------------------------------')
            if (anulacionOrden) {
                console.log('se esta ejecutando anulacion de ordenes')
                const auxResponsePedido = await pedidosPorEntrega(iterator.BaseEntry)
                // console.log({auxResponsePedido})
                responsePedidosPorEntrega.push(auxResponsePedido)
                let responseCancelOrder = []
                for (const pedido of auxResponsePedido) {
                    const auxResponseCancelOrder = await cancelOrder(pedido.BaseEntry)
                    console.log('se esta ejecutando cancelOrder')
                    if (auxResponseCancelOrder.status == 400) {
                        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en cancelOrder: ${auxResponseCancelOrder.errorMessage.value || ''}`, 'https://srvhana:50000/b1s/v1/Orders(id)/Cancel', "facturacion/cancel-to-prosin", process.env.PRD)
                        // console.log({ auxResponseCancelOrder })
                        return res.status(400).json({ mensaje: `Error en cancelOrder: ${auxResponseCancelOrder.errorMessage.value || ''}` })
                    }
                    responseCancelOrder.push(auxResponseCancelOrder)
                }
                listCancelOrders.push(responseCancelOrder)
            }
            console.log('fin de anulacion de ordenes---------------------------------------------------------------')

            listResponseDelivery.push(responseDeliveryNotes)
        }
        console.log(JSON.stringify(listResponseDelivery, null, 2))

        endTime = Date.now();
        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", "Anulado con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)

        return res.json({
            responseProsin: { ...responseProsin, cuf },
            reponseInvoice,
            responseEntregas,
            listResponseDelivery,
            responsePedidosPorEntrega,
            listCancelOrders
        })

    } catch (error) {
        console.log({ error })

        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ usuario })
        let mensaje = `Error en el controlador CancelToProsin: ${error.message || ''}`
        console.log({ statuscode: error.statusCode })
        const endTime = Date.now();
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Anular factura", mensaje + `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, 'Catch de CancelToProsin', "facturacion/cancel-to-prosin", process.env.PRD)

        return res.status(error.statusCode ?? 500).json({ mensaje })
    }
}

const pedidosFacturadosController = async (req, res) => {
    try {
        const { SucCodes } = req.body
        if (SucCodes.length == 0) return res.status(400).json({ mensaje: 'el SucCodes es obligatorio y debe tener un item o mas' })
        let facturados = []
        console.log({ SucCodes })
        for (const ItemCode of SucCodes) {
            const facturas = await pedidosFacturados(ItemCode)
            facturados = facturados.concat(facturas)
        }
        return res.json({ facturados })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const obtenerEntregaDetalleController = async (req, res) => {
    try {
        const id = req.query.id
        console.log({ id })

        const detalle = await obtenerEntregaDetalle(id)
        return res.json({ detalle })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: obtenerEntregaDetalleController' })
    }
}

const obtenerEntregasController = async (req, res) => {
    try {
        const id_sucursal = req.query.idSucursal
        console.log({ id_sucursal })
        if (!id_sucursal) return res.status(400).json({ mensaje: 'el id de la sucursal es obligatorio' })

        const entregas = await obtenerEntregas(id_sucursal)
        return res.json({ entregas })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: obtenerEntregasController' })
    }
}

const facturacionEntregaController = async (req, res) => {
    let body = {}
    try {
        const { id } = req.body

        const responseGenesis = await spObtenerCUF(id)
        console.log({ responseGenesis });
        // return res.json({responseGenesis})

        if (responseGenesis.length != 0) {
            const dataGenesis = responseGenesis[0]
            const cuf = dataGenesis.cuf
            const nroFactura = dataGenesis.factura
            const fechaFormater = new Date(dataGenesis.fecha_emision)
            // Extraer componentes de la fecha
            const year = fechaFormater.getUTCFullYear();
            const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0'); // Asegurarse de que sea 2 dígitos
            const day = String(fechaFormater.getUTCDate()).padStart(2, '0'); // Asegurarse de que sea 2 dígitos

            // Formatear la fecha en YYYYMMDD
            const formater = `${year}${month}${day}`;
            //TODO ------------------------------------------------------------ PATCH ENTREGA
            const responsePatchEntrega = await patchEntrega(id, {
                U_B_cuf: `${cuf}`,
                U_B_em_date: `${formater}`,
                NumAtCard: `${nroFactura}`
            })
            if (responsePatchEntrega.status == 400) {
                console.error({ error: responsePatchEntrega.errorMessage })
                return res.status(400).json({ mensaje: 'Error al procesar la solicitud: patchEntrega' })
            }
            //TODO ------------------------------------------------------------ ENTREGA DETALLER TO FACTURA
            const responseHana = await entregaDetallerFactura(+id, cuf, +nroFactura, formater)
            console.log({ responseHana })
            if (responseHana.message) {
                return res.status(400).json({ mensaje: 'Error al procesar la solicitud: entregaDetallerFactura' })
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

            const responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            //TODO --------------------------------------------------------------  INVOICE
            console.log({ responseHanaB })
            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (!invoiceResponse.status == 400) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud: patchEntrega: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}` })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: deliveryData,
                cuf
            }
            console.log({ response })
            return res.json({ ...response, cuf })

        } else {
            const deliveryData = id
            const deliveryBody = await obtenerEntregaDetalle(id)
            console.log({ deliveryBody })
            let { responseData } = deliveryBody
            if (deliveryBody) {
                responseData = deliveryBody
            } else {
                const delivery = deliveryBody.deliveryN44umber
                if (!delivery) return res.status(400).json({ mensaje: 'error del sap, no se pudo crear la entrega' })
                deliveryData = delivery
                console.log('5 deliveryData')
                console.log({ deliveryData })
            }

            console.log({ responseData })
            if (responseData.deliveryN44umber) {
                deliveryData = responseData.deliveryN44umber
            }
            console.log({ deliveryData })

            if (responseData.lang) {
                return res.status(400).json({ mensaje: 'error interno de sap' })
            }
            // return res.json({ delivery })
            const detalle = [];
            const cabezera = [];
            if (responseData.responseData) {
                responseData = responseData.responseData
            }

            for (const line of responseData) {
                const { producto, descripcion, cantidad, precioUnitario, montoDescuento, subTotal, numeroImei, numeroSerie, complemento, documento_via: docVia, direccion, ...result } = line
                if (!cabezera.length) {
                    cabezera.push({ ...result, complemento: complemento || "", documento_via: `${docVia}`, direccion: direccion || "" })
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
            }
            const bodyFinalFactura = {
                ...cabezera[0],
                detalle
            }

            const { direccion, ...restFact } = bodyFinalFactura
            if (direccion == null || !direccion || direccion == undefined) {
                body = { ...restFact, direccion: '' }
            } else {
                body = bodyFinalFactura
            }

            if (body.tipo_identificacion == null ||
                (body.tipo_identificacion != 1 && body.tipo_identificacion != 5)) {
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error el tipo de identificacion es ${body.tipo_identificacion || 'No definido'} codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${body.tipo_identificacion || 'No definido'} `, bodyFinalFactura })
            }

            if (body.correo == null || body.correo == '') {
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `error no hay datos en CORREO codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No hay datos en CORREO del cliente`, bodyFinalFactura })
            }
            const responseProsin = await facturacionProsin(body, user)
            //return res.json({ bodyFinalFactura, responseProsin, deliveryData })
            console.log({ responseProsin })
            const { data: dataProsin } = responseProsin
            if (dataProsin && dataProsin.estado != 200) {
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.message || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, '/api/sfl/FacturaCompraVenta', "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Error de Prosin. ${dataProsin.mensaje || ''}`, dataProsin, bodyFinalFactura })
            }
            if (dataProsin.mensaje != null) return res.status(400).json({ mensaje: `Error de Prosin. ${dataProsin.mensaje || ''}`, dataProsin, bodyFinalFactura })
            const fecha = dataProsin.fecha
            const nroFactura = dataProsin.datos.factura
            const cuf = dataProsin.datos.cuf
            // return res.json({ delivery, fecha,nroFactura,cuf })
            console.log({ fecha })
            const formater = fecha.split('/')
            const day = formater[0]
            const month = formater[1]
            const yearTime = formater[2]
            const yearFomater = yearTime.split(' ')
            const year = yearFomater[0]
            console.log({ day, month, year })
            if (year.length > 4) return res.status(400).json({ mensaje: 'error al formateo de la fecha' })
            const fechaFormater = year + month + day
            // return res.json({fechaFormater})
            console.log({ deliveryData, cuf, nroFactura, fechaFormater, })
            //TODO --------------------------------------------------------------  PATCH ENTREGA
            const responsePatchEntrega = await patchEntrega(deliveryData, {
                U_B_cuf: `${cuf}`,
                U_B_em_date: `${fechaFormater}`,
                NumAtCard: `${nroFactura}`
            })
            if (responsePatchEntrega.status == 400) {
                console.error({ error: responsePatchEntrega.errorMessage })
                return res.status(400).json({ mensaje: 'Error al procesar la solicitud: patchEntrega' })
            }
            //TODO --------------------------------------------------------------  ENTREGA DETALLE TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, fechaFormater)
            console.log({ responseHana })
            if (responseHana.message) {
                return res.status(400).json({ mensaje: 'Error al procesar la solicitud: entregaDetallerFactura' })
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

            const responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            //TODO --------------------------------------------------------------  INVOICE
            console.log({ responseHanaB })
            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (!invoiceResponse.status == 400) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud: patchEntrega: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}` })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: deliveryData,
                cuf
            }
            console.log({ response })
            return res.json({ ...response, cuf })

        }

    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en el controlador facturacionEntregaController',
            sapMessage: `${error?.message?.error || 'No definido'}`,
            error: {
                mensaje: error.message,
                stack: error.stack,
                statusCode: error.statusCode || 500,
            },
            errorController: {
                ...error
            },
            bodyFactura: body
        })
    }
}

const facturasPedidoCadenasController = async (req, res) => {
    try {
        const { listWhsCode } = req.body
        let data = []
        for (const iterator of listWhsCode) {
            const dataToList = await facturasPedidoCadenas(iterator)
            dataToList.map((item) => {
                data.push({ ...item })
            })
        }
        return res.json({ data })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const facturasAnuladasController = async (req, res) => {
    try {
        const { SucCodes } = req.body
        if (SucCodes.length == 0) return res.status(400).json({ mensaje: 'el SucCodes es obligatorio y debe tener un item o mas' })
        let listaFacturas = []
        console.log({ SucCodes })
        for (const sucCode of SucCodes) {
            const facturas = await facturasAnuladas(sucCode)
            if (facturas.message) {
                return res.status(400).json({ mensaje: `${facturas.message || 'Error en facturasAnuladas()'}. sucCode: ${sucCode || ''}` })
            }
            listaFacturas = listaFacturas.concat(facturas)
        }
        return res.json({ listaFacturas })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador facturasAnuladasController. ${error.message || ''}` })
    }
}

const entregasSinFacturasController = async (req, res) => {
    try {
        const { listSucCode } = req.body
        let listEntregas = []
        for (const element of listSucCode) {
            const response = await entregasSinFacturas(element)
            listEntregas.push(...response)
        }
        return res.json(listEntregas)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

module.exports = {
    facturacionController,
    facturacionStatusController,
    noteEntregaController,
    obtenerCuf,
    obtenerEntregasPorFacturaController,
    obtenerInvoicesCancel,
    listaFacturasAnular,
    infoFacturaController,
    cancelToProsinController,
    pedidosFacturadosController,
    obtenerEntregasController,
    facturacionEntregaController,
    facturacionStatusListController,
    obtenerEntregaDetalleController,
    facturasPedidoCadenasController,
    facturasAnuladasController,
    entregasSinFacturasController
}