const ejs = require('ejs');
const pdf = require('html-pdf');
const QRCode = require('qrcode');
const path = require('path');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const PdfPrinter = require('pdfmake');
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const { entregaDetallerFactura } = require("../../inventarios/controller/hana.controller")
const { facturacionById, facturacionPedido } = require("../service/apiFacturacion")
const { facturacionProsin } = require("../service/apiFacturacionProsin")
const { lotesArticuloAlmacenCantidad, solicitarId, obtenerEntregaDetalle, notaEntrega, facturasParaAnular } = require("./hana.controller")
const { postEntrega, postInvoice, facturacionByIdSld } = require("./sld.controller");
const { spObtenerCUF } = require('./sql_genesis.controller');

const facturacionController = async (req, res) => {
    let body = {}
    let responseBatch = []
    try {
        const { id } = req.body
        const user = req.usuarioAutorizado
        const id_sap = user.ID_SAP
        // return res.json({id_sap})
        let deliveryData
        let deliveryBody
        let finalDataEntrega
        // return {id}
        if (!id || id == '') return res.status(400).json({ mensaje: 'debe haber un ID valido' })
        const solicitud = await solicitarId(id);
        console.log('1 solicitud')
        // console.log({ solicitud })

        if (solicitud.length > 1) {
            return res.status(400).json({ mensaje: 'Existe más de una entrega' })
        }
        else if (solicitud.length == 1) {
            //return res.json({solicitud})
            deliveryData = solicitud[0].DocEntry
            deliveryBody = await obtenerEntregaDetalle(deliveryData)
            console.log('1 solicitud tiene mas de uno')
            // console.log({ solicitud, deliveryData })
        }

        if (!deliveryBody) {

            // const { data } = await facturacionById(id)
            const { data } = await facturacionByIdSld(id)
            console.log('2 facturacion ')
            console.log({ data })
            // return res.json({data})
            if (!data) return res.status(400).json({ mensaje: 'Hubo un error al facturar' })
            const { DocumentLines, ...restData } = data
            if (!DocumentLines) return res.status(400).json({ mensaje: 'No existe los DocumentLines en la facturacio por ID ' })

            let batchNumbers = []
            let newDocumentLines = []
            // return res.json({data})
            for (const line of DocumentLines) {
                let newLine = {}
                const { ItemCode, WarehouseCode, Quantity, LineNum, BaseLine: base1, BaseType: base2, BaseEntry: base3, LineStatus, ...restLine } = line;
                const batchData = await lotesArticuloAlmacenCantidad(ItemCode, WarehouseCode, Quantity);
                responseBatch.push(batchData)
                console.log({ batch: batchData })
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
                DocDate,
                DocDueDate,
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
        //TODO --------------------------------------------------------------  PROSIN
        // return res.json({bodyFinalFactura})
        const responseGenesis = await spObtenerCUF(deliveryData)
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
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, formater)
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

            //TODO --------------------------------------------------------------  INVOICE
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
                delivery: deliveryData,
                cuf
            }
            console.log({ response })
            return res.json({ ...response, cuf })

        } else {

            const responseProsin = await facturacionProsin(bodyFinalFactura)
            // return res.json({bodyFinalFactura,responseProsin,deliveryData})
            console.log({ responseProsin })
            const { data: dataProsin } = responseProsin
            if (dataProsin && dataProsin.estado != 200) return res.status(400).json({ mensaje: dataProsin.mensaje, dataProsin, bodyFinalFactura })
            if (dataProsin.mensaje != null) return res.status(400).json({ mensaje: dataProsin.mensaje, dataProsin, bodyFinalFactura })
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

            //TODO --------------------------------------------------------------  INVOICE
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
                delivery: deliveryData,
                cuf
            }
            console.log({ response })
            return res.json({ ...response, cuf })

        }

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
        console.log({ notaEntregaResponse: response })
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

        // return res.json({ data: data })
        //! PDF MAKE
        // const detailsListPDF = response.map((item) => [
        //     { text: item.ItemCode || '-', fontSize: 8 }, // Código
        //     { text: item.Dscription || '-', fontSize: 8 }, // Descripción
        //     { text: item.BatchNum || '-', fontSize: 8 }, // Lote
        //     { text: item.ExpDate ? new Date(item.ExpDate).toLocaleDateString() : '-', fontSize: 8 }, // Expiración
        //     { text: item.Quantity || '0', fontSize: 8 }, // Cantidad
        //     { text: item.Subnivel1 || '-', fontSize: 8 }, // Ubicación
        //     { text: parseFloat(item.Price || '0').toFixed(2), fontSize: 8 }, // Precio
        //     { text: parseFloat(item.LineTotal || '0').toFixed(2), fontSize: 8 }, // Total
        // ]);

        // const docDefinition = {
        //     content: [
        //         { text: 'LABORATORIOS IFA', style: 'header', alignment: 'center' },
        //         { text: `NOTA DE ENTREGA ${DocNum}`, style: 'subheader', alignment: 'center' },
        //         { text: `Usuario: ${USER_CODE}`, alignment: 'right', fontSize: 10 },
        //         { text: `Fecha de creación: ${new Date(DocDate).toLocaleDateString()}`, fontSize: 10 },
        //         { text: `Fecha de entrega: ${new Date(DocDueDate).toLocaleDateString()}`, fontSize: 10 },
        //         { text: `Cliente: ${CardName}`, style: 'sectionHeader' },
        //         { text: `Teléfono: ${Phone1}`, fontSize: 10 },
        //         { text: `Dirección: ${Address2}`, fontSize: 10 },
        //         { text: `Zona: ${U_Zona}`, fontSize: 10 },
        //         { text: `Condición de pago: ${PymntGroup}`, fontSize: 10 },
        //         { text: 'Detalle de Productos', style: 'sectionHeader' },
        //         {
        //             table: {
        //                 headerRows: 1,
        //                 widths: ['10%', '25%', '10%', '10%', '10%', '10%', '12.5%', '12.5%'],
        //                 body: [
        //                     [
        //                         { text: 'Código', style: 'tableHeader' },
        //                         { text: 'Descripción', style: 'tableHeader' },
        //                         { text: 'Lote', style: 'tableHeader' },
        //                         { text: 'Exp.', style: 'tableHeader' },
        //                         { text: 'Cant.', style: 'tableHeader' },
        //                         { text: 'Ubicación', style: 'tableHeader' },
        //                         { text: 'Precio', style: 'tableHeader' },
        //                         { text: 'Total', style: 'tableHeader' },
        //                     ],
        //                     ...detailsListPDF,
        //                 ],
        //             },
        //             layout: 'lightHorizontalLines',
        //         },
        //         { text: `Total: ${parseFloat(DocTotal).toFixed(2)}`, style: 'total', alignment: 'right', margin: [0, 10, 0, 0] },
        //     ],
        //     styles: {
        //         header: { fontSize: 16, bold: true },
        //         subheader: { fontSize: 14, bold: true },
        //         sectionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
        //         tableHeader: { bold: true, fontSize: 10, color: 'black' },
        //         total: { bold: true, fontSize: 12 },
        //     },
        // };

        // const pdfPath = path.join(__dirname, `nota_entrega_${response[0].DocNum}.pdf`);

        // // Generar el PDF y guardarlo
        // const pdfDoc = pdfMake.createPdf(docDefinition);

        // // Convertir a buffer y escribir archivo
        // const buffer = await new Promise((resolve, reject) => {
        //     pdfDoc.getBuffer((data) => {
        //         if (!data) reject(new Error('Error al generar el buffer del PDF'));
        //         resolve(data);
        //     });
        // });

        // await fs.promises.writeFile(pdfPath, buffer);

        // // Enviar el archivo como respuesta
        // res.sendFile(pdfPath, async (err) => {
        //     if (err) {
        //         console.error('Error al enviar el archivo PDF:', err);
        //         return res.status(500).json({ mensaje: 'Error al enviar el PDF' });
        //     }

        //     // Eliminar el archivo después de enviarlo
        //     try {
        //         await fs.promises.unlink(pdfPath);
        //     } catch (unlinkError) {
        //         console.error('Error al eliminar el archivo PDF:', unlinkError);
        //     }
        // });

        //! EJS
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

        console.error('Error en el controlador:', error);
        return res.status(500).json({ mensaje: 'Error en el controlador' });
    }
}

const listaFacturasAnular = async (req, res) => {
    try {
        const sucursal = req.query.sucursal
        console.log({sucursal})
        const listaFacturas = await facturasParaAnular(sucursal)
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


module.exports = {
    facturacionController,
    facturacionStatusController,
    noteEntregaController,
    obtenerCuf,
    listaFacturasAnular,
}