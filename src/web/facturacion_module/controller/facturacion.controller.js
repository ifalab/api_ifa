const ejs = require('ejs');
const pdf = require('html-pdf');
const QRCode = require('qrcode');
const path = require('path');

const { entregaDetallerFactura } = require("../../inventarios/controller/hana.controller")
const { facturacionById, facturacionPedido } = require("../service/apiFacturacion")
const { facturacionProsin } = require("../service/apiFacturacionProsin")
const { lotesArticuloAlmacenCantidad, solicitarId, obtenerEntregaDetalle, notaEntrega } = require("./hana.controller")
const { postEntrega, postInvoice } = require("./sld.controller")

const facturacionController = async (req, res) => {
    let body = {}
    try {
        const { id } = req.body
        let deliveryData
        let deliveryBody
        let finalDataEntrega
        // return {id}
        if (!id || id == '') return res.status(400).json({ mensaje: 'debe haber un ID valido' })
        const solicitud = await solicitarId(id);
        console.log('1 solicitud')
        console.log({ solicitud })

        if (solicitud.length > 1) {
            return res.status(400).json({ mensaje: 'Existe más de una entrega' })
        }
        else if (solicitud.length == 1) {
            //return res.json({solicitud})
            deliveryData = solicitud[0].DocEntry
            deliveryBody = await obtenerEntregaDetalle(deliveryData)
            console.log('1 solicitud tiene mas de uno')
            console.log({ solicitud, deliveryData })
        }

        if (!deliveryBody) {

            const { data } = await facturacionById(id)
            console.log('2 facturacion ')
            console.log({ data })
            if (!data) return res.status(400).json({ mensaje: 'Hubo un error al facturar' })
            const { DocumentLines, ...restData } = data
            if (!DocumentLines) return res.status(400).json({ mensaje: 'No existe los DocumentLines en la facturacio por ID ' })

            let batchNumbers = []
            let newDocumentLines = []
            // return res.json({data})
            for (const line of DocumentLines) {
                let newLine = {}
                const { ItemCode, WarehouseCode, Quantity, LineNum, BaseLine: base1, BaseType: base2, BaseEntry: base3, ...restLine } = line;
                const batchData = await lotesArticuloAlmacenCantidad(ItemCode, WarehouseCode, Quantity);
                // console.log({ batchData })
                if (batchData && batchData.length !== 0) {
                    // return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}`, batch: batchData ,LineNum});

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
                        Quantity,
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
            console.log({ restData })
            const { U_NIT, U_RAZSOC } = restData
            const {
                DocDate,
                DocDueDate,
                CardCode,
                DocumentLines: docLines,
                ...restNewData
            } = newData;

            const finalData = {
                DocDate,
                DocDueDate,
                CardCode,
                U_NIT,
                U_RAZSOC,
                DocumentLines: docLines,
            }

            finalDataEntrega = finalData
            // return res.json({ ...finalDataEntrega })
            console.log('FINAL ENTREGA------------------------------------------------------------')
            console.log({ finalDataEntrega })
            deliveryBody = await postEntrega(finalDataEntrega)
            if (deliveryBody.lang) {
                return res.status(400).json({ mensaje: 'error interno en la entrega de sap', respuestaSapEntrega: deliveryBody, finalDataEntrega })
            }
            console.log('3 post entrega')
            console.log({ deliveryBody })
            // console.log('response post entrega ejecutado')

        }

        console.log('4 delivery body fuera del if')
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

        console.log('6 responseData de delivery body')
        console.log({ responseData })
        if (responseData.deliveryN44umber) {
            deliveryData = responseData.deliveryN44umber
        }
        console.log('7 deliveryData')
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

        body = bodyFinalFactura
        // return res.json({bodyFinalFactura})
        const responseProsin = await facturacionProsin(bodyFinalFactura)
        // return res.json({bodyFinalFactura,responseProsin,deliveryData})
        console.log({ responseProsin })
        const { data: dataProsin } = responseProsin
        if (dataProsin && dataProsin.estado != 200) return res.status(400).json({ mensaje: dataProsin.mensaje, dataProsin, bodyFinalFactura })
        if (dataProsin.mensaje != null) return res.status(400).json({ mensaje: dataProsin.mensaje, dataProsin, bodyFinalFactura })
        const fecha = dataProsin.fecha
        const nroFactura = dataProsin.datos.factura
        const cuf = dataProsin.datos.cuf
        //TODO ENVIAR A call IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE_TOFACTURAR(dcoentry, cuf,nrofactura, fecha)
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
                DocumentAdditionalExpenses = [{ ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1 }, { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2 }, { ExpenseCode: ExpenseCode3, LineTotal: +LineTotal3 }, { ExpenseCode: ExpenseCode4, LineTotal: +LineTotal4 }]
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

        //TODO - ENVIAR A INVOICE:
        console.log({ responseHanaB })
        const invoiceResponse = await postInvoice(responseHanaB)
        console.log({ invoiceResponse })
        if (invoiceResponse.value) {
            return res.status(400).json({ messageSap: `${invoiceResponse.value}` })
        }
        const response = {
            status: invoiceResponse.status || {},
            statusText: invoiceResponse.statusText || {},
            idInvoice: invoiceResponse.idInvoice,
            delivery: +deliveryData
        }
        return res.json({ ...response, cuf })
    } catch (error) {
        console.log({ error })
        const { statusCode } = error
        // if (statusCode) {
        //     return res.status(statusCode).json({ mensaje: 'Error en el controlador', sapMessage: `${error.message.message.value || 'No definido'}`, error:error.message })
        // }
        return res.status(500).json({
            mensaje: 'Error en el controlador',
            sapMessage: `${error?.message?.error || 'No definido'}`,
            error: {
                message: error.message,
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
        const { opcion } = req.query;
        const response = await facturacionPedido(opcion)
        return res.json({ response })

    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const noteEntregaController = async (req, res) => {
    try {
        const delivery = req.query.delivery;
        const response = await notaEntrega(delivery);
        if (response.length == 0) {
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
        } = response[0];

        response.map((item) => {
            const { ...restData } = item;
            detailsList.push({ ...restData });
        });

        const data = {
            DocNum,
            BarCode,
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
            detailsList,
        };
        return res.json({data})
        // Ruta del archivo PDF (asegúrate de que el directorio tenga permisos de escritura)
        const filePath = path.join(__dirname, `nota_entrega_${data.DocNum}.pdf`);
        // Generar el QR Code
        const qrCode = await QRCode.toDataURL(data.BarCode.toString());

        // Renderizar la plantilla EJS a HTML
        const html = await ejs.renderFile(path.join(__dirname, 'notaEntrega', 'template.ejs'), { data, qrCode });

        // Configuración para html-pdf
        const options = { format: 'A4', orientation: 'portrait' };

        // Generar el PDF
        pdf.create(html, options).toStream((err, stream) => {
            if (err) {
                console.error('Error al generar el PDF:', err);
                return res.status(500).json({ mensaje: 'Error al generar el PDF' });
            }

            // Enviar el PDF en la respuesta
            res.setHeader('Content-Type', 'application/pdf');
            stream.pipe(res);
        });
    } catch (error) {
        // Manejar cualquier error general
        console.error('Error en el controlador:', error);
        return res.status(500).json({ mensaje: 'Error en el controlador' });
    }
};

module.exports = {
    facturacionController,
    facturacionStatusController,
    noteEntregaController
}