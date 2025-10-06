const ejs = require('ejs');
const pdf = require('html-pdf');
const QRCode = require('qrcode');
const path = require('path');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const puppeteer = require('puppeteer');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const { entregaDetallerFactura, pedidoDetallerFactura, clientesPorDimensionUno, obtenerDevolucionDetalle } = require("../../inventarios/controller/hana.controller")
const { facturacionById, facturacionPedido } = require("../service/apiFacturacion")
const { facturacionProsin, anulacionFacturacion, facturacionExportacionProsin } = require("../service/apiFacturacionProsin")
const { lotesArticuloAlmacenCantidad, solicitarId, obtenerEntregaDetalle, notaEntrega, obtenerEntregasPorFactura, facturasParaAnular, facturaInfo, facturaPedidoDB, pedidosFacturados, obtenerEntregas, facturasPedidoCadenas,
    facturasAnuladas, pedidosPorEntrega,
    entregasSinFacturas,
    obtenerEntregaPorPedido,
    facturaPedidoInstituciones,
    obtenerPedidoDetalle,
    obtenerDevoluciones,
    detalleDevolucion,
    clienteByCardName,
    ofertaDelPedido, obtenerGroupCode,
    clientesExportacion,
    getAllAlmacenes,
    articulosExportacion,
    pedidosExportacion,
    intercom,
    obtenerEntregaDetalleExportacion,
    reabrirOferta, getClienteByCardCode,
    obtenerDetallePedidoAnulado,
    reabrirLineas,
    getOrdersById,
    setOrderState,
    facturaPedidoTodos,
    actualizarEstadoPedido,
    stockByItemCodeBatchNumWhsCode,
    getBatchDetailByOrderNum,
    fefoMinExpiry,
    baseEntryByDetailsNDC,
    getUnpaidFromPreviousMonths,
    getPaidDeliveryDetails,
    setSyncSalesReturnProcess,
    getPaidEntryDetails, } = require("./hana.controller")
const { postEntrega, postInvoice, facturacionByIdSld, cancelInvoice, cancelDeliveryNotes, patchEntrega,
    cancelOrder, closeQuotations,
    cancelCreditNotes,
    cancelReturns, } = require("./sld.controller");
const { spObtenerCUF, spEstadoFactura, listaFacturasSfl, spObtenerCUFString } = require('./sql_genesis.controller');
const { postFacturacionProsin } = require('./prosin.controller');
const { response } = require('express');
const { grabarLog } = require('../../shared/controller/hana.controller');
const { obtenerEntregaDetalle: obtenerEntregaDetalleDevolucion } = require("../../inventarios/controller/hana.controller")
const { postReturn } = require("../../inventarios/controller/sld.controller");
const { clientePorCardCode, articuloPorItemCode } = require('../../pedido_module/controller/hana.controller');
const { getDocDueDate } = require('../../../controllers/hanaController');
const { postOrden } = require('../../../movil/ventas_module/controller/sld.controller');
const { tipoDeCambioByFecha, tipoDeCambio } = require('../../contabilidad_module/controllers/hana.controller');
const { clientExpiryPolicy } = require('../../ventas_module/controller/hana.controller');
const { groupBatchesByLineNum } = require('../helpers/groupBatchesByLineNum');
const { buildBodyReturn } = require('../helpers/buildBodyReturn');
const { postCreditNotes } = require('../../service/sapService');
const { buildBodyCreditNotes } = require('../helpers/buildBodyCreditNote');

const facturacionController = async (req, res) => {
    let body = {}
    let idData = ''
    const startTime = Date.now();
    try {
        let closeOrder = false
        let endTime = Date.now();
        const { id } = req.body
        const user = req.usuarioAutorizado
        const id_sap = user.ID_SAP || 0

        idData = id
        let deliveryData
        let deliveryBody
        let finalDataEntrega

        if (id_sap == 0) {
            return res.status(400).json({ mensaje: 'Debe tener ID SAP' })
        }

        const responseDeliveryByID = await getOrdersById(id)
        if (responseDeliveryByID.length == 0) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se encontro la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se encontro la orden', responseDeliveryByID })
        }
        const dataByID = responseDeliveryByID[0]
        const { U_B_State } = dataByID
        if (U_B_State == null) {
            const setOrderResponse = await setOrderState(id, 'P') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
        }
        // if (U_B_State == 'P') {
        //     endTime = Date.now();
        //     grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se puede Facturar una Orden con Estado Pendiente , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
        //     return res.status(400).status(400).json({ mensaje: 'No se puede Facturar una Orden con Estado P - Pendiente', })
        // }

        if (U_B_State == 'R') {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se puede Facturar una Orden con Estado R - Procesado , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "/facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se puede Facturar una Orden con Estado R - Procesado', })
        }

        if (U_B_State == 'E') {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se puede Facturar una Orden con Estado E - Error , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "/facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se puede Facturar una Orden con Estado E - Error', })
        }
        // return res.json({ id })
        if (!id || id == '') {
            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", 'error: debe haber un ID valido', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: 'debe haber un ID valido' })
        }
        const solicitud = await solicitarId(id);
        console.log('1 solicitud')

        if (solicitud.message) {
            endTime = Date.now();
            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${solicitud.message || 'Error en solicitarId'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: `${solicitud.message || 'Error en solicitarId'}` })
        }

        if (solicitud.result.length > 1) {
            endTime = Date.now();
            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Existe más de una entrega`, `${solicitud.query || ''}. [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)

            return res.status(400).json({ mensaje: 'Existe más de una entrega' })
        }
        else if (solicitud.result.length == 1) {
            // return res.json({solicitud})
            deliveryData = solicitud.result[0].DocEntry
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Se consulto obtenerEntregaDetalle,  deliveryData: ${deliveryData || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE( ${deliveryData || ''})`, process.env.PRD)
            deliveryBody = await obtenerEntregaDetalle(deliveryData)
            console.log('1 solicitud tiene mas de uno')
            console.log({ solicitud, deliveryData })
            // return res.json({ solicitud, deliveryData})
            if (deliveryBody.message) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${deliveryBody.message || 'Error en obtenerEntregaDetalle'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `${deliveryBody.message || ''}` })
            }
        }
        // return res.json({ deliveryBody}) 
        if (!deliveryBody) {

            // const { data } = await facturacionById(id)
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Se al consulto facturacionByIdSld,  id: ${id || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "https://srvhana:50000/b1s/v1/Orders(${id})", process.env.PRD)
            const facturacion = await facturacionByIdSld(id)
            console.log('2 facturacion ')
            // console.log({ facturacion })
            // return res.json({data})
            if (facturacion.lang) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error: Hubo un error al facturar: ${facturacion.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Hubo un error al facturar: ${facturacion.value || ''}` })
            }
            if (!facturacion.data) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error: Hubo un error al facturar`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Hubo un error al facturar`, facturacion })
            }
            const data = facturacion.data

            //* validar si el cliente esta dentro de la tabla CLIENTS_EXPIRY_POLICY
            const cardCodeClient = data.CardCode
            const responseExpiryClient = await clientExpiryPolicy(cardCodeClient)
            const expiryClient = (responseExpiryClient.length == 0) ? false : true
            //* validar si el cliente esta dentro de la tabla CLIENTS_EXPIRY_POLICY

            const { DocumentLines, ...restData } = data
            if (!DocumentLines) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", 'Error: No existen los DocumentLines en la facturacion por ID', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No existen los DocumentLines en la facturacion por ID ' })
            }

            let batchNumbers = []
            let newDocumentLines = []

            // return res.json({ data })
            for (const line of DocumentLines) {
                let newLine = {}
                const {
                    ItemCode,
                    WarehouseCode,
                    Quantity,
                    UnitsOfMeasurment,
                    LineNum,
                    BaseLine: base1,
                    BaseType: base2,
                    BaseEntry: base3,
                    LineStatus,
                    U_BatchNum,
                    BaseLine,
                    ...restLine
                } = line;

                console.log({
                    ItemCode,
                    WarehouseCode,
                    Quantity,
                    UnitsOfMeasurment,
                    LineNum,
                    BaseLine: base1,
                    BaseType: base2,
                    BaseEntry: base3,
                    LineStatus,
                    U_BatchNum,
                    BaseLine,
                })
                if (expiryClient == true) {
                    //TODO SI el cliente esta dentro de la tabla CLIENTS_EXPIRY_POLICY ------------------------------
                    const batchData = await getBatchDetailByOrderNum(id, base3, BaseLine)

                    if (batchData.message) {
                        const setOrderResponse = await setOrderState(id, '') // pendiente 
                        if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                            endTime = Date.now();
                            grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                            return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                        }
                        endTime = Date.now();
                        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                        return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}` })
                    }

                    if (batchData && batchData.length > 0) {

                        // console.log({new_quantity, UnitsOfMeasurment})
                        let new_quantity = 0
                        batchData.map((item) => {
                            new_quantity += Number(item.QuantitySelectedUser)
                        })

                        batchNumbers = batchData.map(batch => {

                            const newBatch = {
                                BaseLineNumber: LineNum,
                                BatchNumber: batch.BatchNum,
                                Quantity: batch.QuantitySelectedUser * UnitsOfMeasurment,
                                ItemCode: batch.ItemCode
                            }

                            return newBatch
                        })

                        const data = {
                            BaseLine: LineNum,
                            BaseType: 17,
                            BaseEntry: id,
                        }

                        newLine = {
                            ...data,
                            ItemCode,
                            WarehouseCode,
                            // Quantity: new_quantity / UnitsOfMeasurment,
                            Quantity: new_quantity,
                            LineNum,
                            ...restLine,
                            BatchNumbers: batchNumbers
                        }

                        newLine = { ...newLine }
                        console.log({ new_quantity, UnitsOfMeasurment })
                        newDocumentLines.push(newLine)
                    } else {
                        //! HACER FEFO 12 MESES
                        const batchData = await fefoMinExpiry(ItemCode, WarehouseCode, Quantity)
                        if (batchData.message) {
                            const setOrderResponse = await setOrderState(id, '') // pendiente 
                            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                                endTime = Date.now();
                                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                            }
                            endTime = Date.now();
                            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                            return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}` })
                        }

                        if (batchData && batchData.length > 0) {

                            let new_quantity = 0
                            batchData.map((item) => {
                                new_quantity += Number(item.Quantity)
                            })

                            batchNumbers = batchData.map(batch => {

                                const newBatch = {
                                    BaseLineNumber: LineNum,
                                    BatchNumber: batch.BatchNum,
                                    Quantity: Number(batch.Quantity),
                                    ItemCode: batch.ItemCode
                                }

                                return newBatch
                            })

                            const data = {
                                BaseLine: LineNum,
                                BaseType: 17,
                                BaseEntry: id,
                            }

                            newLine = {
                                ...data,
                                ItemCode,
                                WarehouseCode,
                                Quantity: Number(new_quantity / UnitsOfMeasurment),
                                LineNum,
                                ...restLine,
                                BatchNumbers: batchNumbers
                            }

                            newLine = { ...newLine }
                            newDocumentLines.push(newLine)
                        }
                    }

                } else {
                    //TODO NO el cliente esta dentro de la tabla CLIENTS_EXPIRY_POLICY ------------------------------
                    const batchData = await lotesArticuloAlmacenCantidad(ItemCode, WarehouseCode, Quantity)

                    if (batchData.message) {
                        const setOrderResponse = await setOrderState(id, '') // pendiente 
                        if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                            endTime = Date.now();
                            grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                            return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                        }
                        endTime = Date.now();
                        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                        return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}` })
                    }

                    if (batchData && batchData.length > 0) {

                        let new_quantity = 0
                        batchData.map((item) => {
                            new_quantity += Number(item.Quantity)
                        })

                        batchNumbers = batchData.map(batch => {

                            const newBatch = {
                                BaseLineNumber: LineNum,
                                BatchNumber: batch.BatchNum,
                                Quantity: Number(batch.Quantity),
                                ItemCode: batch.ItemCode
                            }

                            return newBatch
                        })

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
                        }

                        newLine = { ...newLine }
                        newDocumentLines.push(newLine)
                    }

                }

            }

            let newData = {
                ...restData,
                DocumentLines: newDocumentLines
            }
            console.log('rest data------------------------------------------------------------')
            // return res.json({ restData })
            const { U_NIT, U_RAZSOC, U_UserCode } = restData
            // console.log({ restData })
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
            // return res.json({ data, finalDataEntrega })
            console.log('FINAL ENTREGA------------------------------------------------------------')
            // console.log({ finalDataEntrega })
            // return res.json({ finalDataEntrega })
            //TODO --------------------------------------------------------------  ENTREGA DELIVERY NOTES
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Se envio postEntrega,  CardCode: ${finalDataEntrega.CardCode || ''}, U_UserCode: ${finalDataEntrega.U_UserCode || ''}, U_NIT: ${finalDataEntrega.U_NIT || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `https://srvhana:50000/b1s/v1/DeliveryNotes`, process.env.PRD)
            deliveryBody = await postEntrega(finalDataEntrega)
            if (deliveryBody.lang) {
                const setOrderResponse = await setOrderState(id, '')
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
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
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
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
            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME,
                "Facturacion Facturar", `Error interno de SAP. ${responseData.value || ''}`,
                `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`,
                "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: `Error interno de sap. ${responseData.value || ''}` })
        }
        const detalle = [];
        const cabezera = [];
        if (responseData.responseData) { ///
            responseData = responseData.responseData
        }

        for (const line of responseData) {
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
                //?! ELIMINAR PRUEBA
                // montoDescuento: 0,
                // subTotal: Number(precioUnitario) * Number(cantidad),
                //?! ELIMINAR PRUEBA
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
            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${responseGenesis.message || 'Error en la consulta spObtenerCUF'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: `${responseGenesis.message || 'Error en la consulta spObtenerCUF'}` })
        }
        //? si existe el cuf:
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
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Se envio al patchEntrega,  cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            const responsePatchEntrega = await patchEntrega(deliveryData, {
                U_B_cuf: `${cuf}`,
                U_B_em_date: `${formater}`,
                NumAtCard: `${nroFactura}`
            })
            if (responsePatchEntrega.status == 400) {
                console.error({ error: responsePatchEntrega.errorMessage })
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar patchEntrega: ${responsePatchEntrega.errorMessage.value || 'linea 280'}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Error al procesar la solicitud: patchEntrega ${responsePatchEntrega.errorMessage.value}` })
            }
            //TODO ------------------------------------------------------------ ENTREGA DETALLER TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, formater)
            console.log({ responseHana })
            if (responseHana.message) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al entregaDetallerFactura: ${responseHana.message || "linea 292"}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'Error al procesar la solicitud: entregaDetallerFactura' })
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

            const responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            //TODO --------------------------------------------------------------  INVOICE
            console.log({ responseHanaB })
            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (invoiceResponse.status == 400) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud postInvoice: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)

            return res.json({ ...response, cuf, setOrderResponse })

        } else {
            //! si no existe el cuf:
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

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error el tipo de identificacion es ${dataToProsin.tipo_identificacion || 'No definido'}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${dataToProsin.tipo_identificacion || 'No definido'} `, dataToProsin, bodyFinalFactura })
            }

            if (dataToProsin.correo == null || dataToProsin.correo == '') {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `error no hay datos en CORREO. codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe hay datos del CORREO `, dataToProsin, bodyFinalFactura })
            }

            dataToProsin.usuario = user.USERNAME || 'No definido'
            //! PRUEBA CON DESCUENTOS ELIMINAR
            // dataToProsin.correo = 'SINCORREO@LABORATORIOSIFA.COM'
            // dataToProsin.descuentoAdicional = 5
            // dataToProsin.montoDetalle = "646.31"
            //! PRUEBA CON DESCUENTOS ELIMINAR
            console.log({ dataToProsin })
            // return res.json({dataToProsin})
            const responseProsin = await facturacionProsin(dataToProsin, user)
            console.log({ responseProsin })
            const { data: dataProsin } = responseProsin
            console.log({ dataProsin })
            if (dataProsin && dataProsin.estado != 200) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.mensaje || dataProsin.estado || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, dataToProsin, bodyFinalFactura, responseProsin })
            }
            if (dataProsin.mensaje != null) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.mensaje || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, dataToProsin, bodyFinalFactura })
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
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
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
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud patchEntrega: ${responsePatchEntrega.errorMessage.value || "No definido"}, U_B_cuf: ${cuf || ''}, U_B_em_date: ${fechaFormater || 'No definido'} ,NumAtCard: ${nroFactura || 'No definido'}, delivery: ${deliveryData || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error en la solicitud patch entrega ${responsePatchEntrega.errorMessage.value || ''}` })
            }
            //TODO --------------------------------------------------------------  ENTREGA DETALLE TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, fechaFormater)
            console.log({ responseHana })
            if (responseHana.message) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
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
            if (invoiceResponse.status == 400) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud: postInvoice: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
            const setOrderResponse = await setOrderState(id, 'R') //Procesado
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.json({ ...response, cuf, setOrderResponse })
        }

    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ user })
        const setOrderResponse = await setOrderState(+idData, '') // pendiente 
        const response = setOrderResponse[0]
        if (response == 404) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion ", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse, BodyToProsin })
        }
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
const setStatusFacturaController = async (req, res) => {
    try {
        const id = req.query.id
        let state = req.query.state
        if (!id) {
            return res.json({ mensaje: 'No existe el ID ', id })
        }

        if (!state) {
            state = ''
        }
        const setOrderResponse = await setOrderState(id, state)
        if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse, id, state })
        }
        return res.json({ mensaje: 'Se actualizo con exito el estado de la factura', setOrderResponse, id, state })
    } catch (error) {
        console.log({ error })
        return res.json({ mensaje: 'Error en el controlador', })
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

        const { listWhsCode, date, bringAll, groupCode } = req.body
        let data = []
        console.log({ date })
        if (!date) {
            return res.status(400).json({ mensaje: 'No hay fecha en la peticion' })
        }
        const dateNow = date.split('T')
        for (const iterator of listWhsCode) {
            const dataToList = await facturaPedidoDB(iterator)
            dataToList.map((item) => {
                if (item.GroupName != 'INSTITUCIONES') {
                    const dateNowItem = item.DocDate.split(' ')
                    if (dateNow[0] == dateNowItem[0] && !bringAll) {
                        // if(groupCode==-1){
                        data.push({ ...item })
                        // }else{}
                    }
                    if (bringAll) {
                        data.push({ ...item })
                    }
                }
            })
        }
        return res.json({ data })
    } catch (error) {
        console.log('error en facturacionStatusController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const facturacionAllStatusListController = async (req, res) => {
    try {

        const response = await facturaPedidoTodos()
        return res.json(response)
    } catch (error) {
        console.log('error en facturacionAllStatusListController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const actualizarEstadoPedidoController = async (req, res) => {
    try {
        const docNum = req.query.docNum
        let estado = req.query.estado
        if (!docNum || docNum == '') {
            return res.status(400).json({ mensaje: 'Debe existir un Doc Num en la peticion (Nro SAP)' })
        }

        if (!estado) {
            estado = ''
        }
        const response = await actualizarEstadoPedido(docNum, estado)
        return res.json(response)
    } catch (error) {
        console.log('error en actualizarEstadoPedidoController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const noteEntregaController = async (req, res) => {
    let browser;
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
            Comments,
            SlpName,
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
            Comments,
            SlpName: `${SlpName || 'No Asignado'}`,
            detailsList,
        };
        // return res.json({data})
        //! Generar QR Code
        const qrCode = await QRCode.toDataURL(data.BarCode.toString());

        //! Renderizar la plantilla EJS a HTML
        const htmlTemplate = path.join(__dirname, 'notaEntrega', 'template.ejs');
        const htmlContent = await ejs.renderFile(htmlTemplate, { data, qrCode });

        //! Generar el PDF con Puppeteer
        browser = await puppeteer.launch({ headless: 'new' }); // Modo headless
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: { bottom: '50px', top: '10px' },
            // headerTemplate:`
            //     <div style="padding:1 0;">

            //     </div>`,
            footerTemplate: `
                <div style="width: 100%; margin-left: 60px; margin-right: 20px; font-size: 10px; color: #555;">
                    <div style="display: flex;align-items: center;">
                        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: black;">
                            <p>"Estimado Cliente: Firma en conformidad al recibir el pedido. En provincia, reclamos dentro de las 24 horas."</p>
                        </div>
                    </div>
                </div>`,
        });

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
        console.log({
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
        })
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
        console.log({ estado })
        if (estado) {
            console.log({
                mensaje: 'ANULACION PROSIN',
                sucursal,
                punto,
                cuf,
                descripcion,
                motivoAnulacion,
                tipoDocumento,
                usuario,
                mediaPagina,
            })
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
            console.log({ responseProsin });

            if (responseProsin.data.mensaje) {
                const mess = responseProsin.data.mensaje.split('§')
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en anulacionFacturacion de parte de Prosin: ${mess[1] || responseProsin.data.mensaje || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
                return res.status(400).json({ mensaje: `${mess[1] || responseProsin.data.mensaje || 'Error de Prosin en anulacionFacturacion'}` })
            }
        }

        if (!docEntry) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Debe venir el doc entry CUF(${cuf})`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Debe venir el doc entry` })
        }
        const reponseInvoice = await cancelInvoice(docEntry)

        if (reponseInvoice.value && !reponseInvoice.value.includes('Document is already closed')) {
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
        let responseReabrirOferta = [];

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
                    console.log('se esta ejecutando cancelOrder', pedido.BaseEntry)
                    if (auxResponseCancelOrder.status == 400) {
                        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en cancelOrder: ${auxResponseCancelOrder.errorMessage.value || ''}`, 'https://srvhana:50000/b1s/v1/Orders(id)/Cancel', "facturacion/cancel-to-prosin", process.env.PRD)
                        // console.log({ auxResponseCancelOrder })
                        return res.status(400).json({ mensaje: `Error en cancelOrder: ${auxResponseCancelOrder.errorMessage.value || ''}` })
                    }
                    responseCancelOrder.push(auxResponseCancelOrder)

                    //?------------------------------------------------- procedimiento pedido.BaseEntry

                    const auxOfertaLinea = await obtenerDetallePedidoAnulado(pedido.BaseEntry)
                    console.log("Ofertaaaaaaaaaaaaaa----------------------------------------------------------------------------------------------", auxOfertaLinea);
                    let index = 0;
                    console.log(auxOfertaLinea);
                    if (auxOfertaLinea.length > 0) {
                        for (const element of auxOfertaLinea) {
                            if (index === 0) {
                                const result = await reabrirOferta(element.BaseEntry);
                                console.log(result);
                            }

                            const responseLinea = await reabrirLineas(element.BaseEntry, element.BaseLine);
                            console.log("Lineas a reaperturar----------------------------------------------------------------------", responseLinea);
                            responseReabrirOferta.push(responseLinea);
                            index++;
                        }
                    }

                }

                listCancelOrders.push(responseCancelOrder);

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
            listCancelOrders,
            responseReabrirOferta
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

const cancelToProsinNDCController = async (req, res) => {
    const startTime = Date.now();
    try {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
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
        console.log({
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
        })
        // const responseProsin = await anulacionFacturacion({
        //     sucursal,
        //     punto,
        //     cuf,
        //     descripcion,
        //     motivoAnulacion,
        //     tipoDocumento,
        //     usuario,
        //     mediaPagina,
        // }, user)
        // return res.json({
        //     responseProsin
        // })
        ///? return 
        let responseProsin = {}
        let endTime = Date.now();

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
        console.log({ estado })
        if (estado) {
            console.log({
                mensaje: 'ANULACION PROSIN',
                sucursal,
                punto,
                cuf,
                descripcion,
                motivoAnulacion,
                tipoDocumento,
                usuario,
                mediaPagina,
            })
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
            console.log({ responseProsin });

            if (responseProsin.data.mensaje) {
                const mess = responseProsin.data.mensaje.split('§')
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en anulacionFacturacion de parte de Prosin: ${mess[1] || responseProsin.data.mensaje || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
                return res.status(400).json({ mensaje: `${mess[1] || responseProsin.data.mensaje || 'Error de Prosin en anulacionFacturacion'}` })
            }
        }

        if (!docEntry) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Debe venir el doc entry CUF(${cuf})`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Debe venir el doc entry` })
        }

        const reponseCreditNotes = await cancelCreditNotes(docEntry)

        if (reponseCreditNotes.value && !reponseCreditNotes.value.includes('Document is already closed')) {
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en cancel Credit Notes: ${reponseCreditNotes.value || ''}, CUF(${cuf})`, `https://srvhana:50000/b1s/v1/Invoices(id)/Cancel, [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en cancel Credit Notes: ${reponseCreditNotes.value || ''}` })
        }

        const baseEntryByNDC = await baseEntryByDetailsNDC(docEntry)
        let listResponseCancelReturns = []
        for (const element of baseEntryByNDC) {
            const { BaseEntry } = element
            const responseCancelReturns = await cancelReturns(BaseEntry)
            listResponseCancelReturns.push({ ...listResponseCancelReturns })
            if (responseCancelReturns.value && !responseCancelReturns.value.includes('Document is already closed')) {
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en Returns: ${responseCancelReturns.value || ''}, CUF(${cuf}), BASE ENTRY: ${BaseEntry || 'No Definido'}`, `https://srvhana:50000/b1s/v1/Invoices(id)/Cancel, [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
                return res.status(400).json({
                    mensaje: `Error en Returns: ${responseCancelReturns.value || ''}`,
                    listResponseCancelReturns,
                    responseProsin: { ...responseProsin, cuf },
                    reponseCreditNotes,
                })
            }
        }

        return res.json({
            responseProsin: { ...responseProsin, cuf },
            reponseCreditNotes,
            listResponseCancelReturns
        })

    } catch (error) {
        console.log({ error })

        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ usuario })
        let mensaje = `Error en el controlador CancelToProsin: ${error.message || ''}`
        console.log({ statuscode: error.statusCode })
        const endTime = Date.now();
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Anular factura NDC", mensaje + `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, 'Catch de CancelToProsin', "facturacion/cancel-to-prosin-ndc", process.env.PRD)
        return res.status(error.statusCode ?? 500).json({ mensaje })
    }
}
const pedidosFacturadosController = async (req, res) => {
    try {
        let { SucCodes, fecha } = req.body
        if (SucCodes.length == 0) return res.status(400).json({ mensaje: 'el SucCodes es obligatorio y debe tener un item o mas' })
        let facturados = []
        if (!fecha) fecha = ''
        console.log({ SucCodes })
        for (const ItemCode of SucCodes) {
            const facturas = await pedidosFacturados(ItemCode, fecha)
            facturados = facturados.concat(facturas)
        }
        return res.json({ facturados })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador pedidosFacturadosController: ${error.message}` })
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
        console.log(req.body)
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
            if (invoiceResponse.status == 400) {
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
            const user = req.usuarioAutorizado
            body.usuario = user.USERNAME || 'No definido'
            const responseProsin = await facturacionProsin(body, user)
            //return res.json({ bodyFinalFactura, responseProsin, deliveryData })
            console.log({ responseProsin })
            const { data: dataProsin } = responseProsin
            if (dataProsin && dataProsin.estado != 200) {
                let messageEvaluate = ''
                if (dataProsin.mensaje.includes('NIT INEXISTENTE')) {
                    messageEvaluate += 'Contacte con CPD.'
                }
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.message || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, '/api/sfl/FacturaCompraVenta', "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Error de Prosin. ${dataProsin.mensaje || ''}`, dataProsin, bodyFinalFactura })
            }
            if (dataProsin.mensaje != null) return res.status(400).json({ mensaje: `Error de Prosin. ${dataProsin.mensaje || ''}. ${messageEvaluate}`, dataProsin, bodyFinalFactura })
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
            if (invoiceResponse.status == 400) {
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

const cancelarOrdenController = async (req, res) => {
    try {
        const docEntry = req.query.docEntry
        const total = req.query.total
        const entrega = req.query.entrega
        const user = req.usuarioAutorizado
        let listResponseDelivery = []
        let response = {}

        if (total == 1) {
            console.log('ejecutando el cancel order')
            const resCancel = await cancelOrder(docEntry)
            if (resCancel.status == 400) {
                grabarLog(user.USERCODE, user.USERNAME, "Cancelacion orden desde facturacion", `Error en cancelOrder: ${resCancel.errorMessage.value || ''}`, 'https://srvhana:50000/b1s/v1/Orders(id)/Cancel', "facturacion/cancelar-orden", process.env.PRD)
                return res.status(400).json({ mensaje: `Error en cancelOrder: ${resCancel.errorMessage.value || ''}` })
            } else {
                response = resCancel
            }
        }

        if (entrega == 1) {
            const data = await obtenerEntregaPorPedido(docEntry)
            for (const iterator of data) {

                const responseDeliveryNotes = await cancelDeliveryNotes(iterator.DocEntry)
                listResponseDelivery.push(responseDeliveryNotes)
                if (responseDeliveryNotes.status == 400) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Cancelacion orden desde facturacion", `Error en cancelDeliveryNotes: ${responseDeliveryNotes.errorMessage.value || ''}`, `https://srvhana:50000/b1s/v1/DeliveryNotes(id)/Cancel [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancelar-orden", process.env.PRD)
                    return res.status(400).json({ mensaje: `Error en cancelDeliveryNotes. ${responseDeliveryNotes.errorMessage.value || ''}` })
                }
                console.log('fin de anulacion de ordenes---------------------------------------------------------------')
            }

            const resCancel = await cancelOrder(docEntry)
            if (resCancel.status == 400) {
                grabarLog(user.USERCODE, user.USERNAME, "Cancelacion orden desde facturacion", `Error en cancelOrder: ${resCancel.errorMessage.value || ''}`, 'https://srvhana:50000/b1s/v1/Orders(id)/Cancel', "facturacion/cancelar-orden", process.env.PRD)
                return res.status(400).json({ mensaje: `Error en cancelOrder: ${resCancel.errorMessage.value || ''}` })
            } else {
                response = resCancel
            }
        }

        return res.json({ response, listResponseDelivery })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })

    }
}

const pedidosInstitucionesController = async (req, res) => {
    try {
        const { listWhsCode } = req.body
        let responses = []
        for (const whsCode of listWhsCode) {
            const data = await facturaPedidoInstituciones()
            for (const pedido of data) {
                if (pedido.GroupName == 'INSTITUCIONES' && pedido.SucCode == whsCode) {
                    responses.push(pedido)
                }
            }
        }
        return res.json({ data: responses })
        // const data = await facturaPedidoInstituciones()
        // return res.json({ data })
    } catch (error) {
        console.log('error en pedidosInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador pedidosInstitucionesController: ${error.message || ''}` })
    }
}

const facturacionInstitucionesController = async (req, res) => {
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
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", 'error: debe haber un ID valido', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: 'debe haber un ID valido' })
        }
        const solicitud = await solicitarId(id);
        console.log('1 solicitud')

        if (solicitud.message) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `${solicitud.message || 'Error en solicitarId'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: `${solicitud.message || 'Error en solicitarId'}` })
        }

        if (solicitud.result.length > 1) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Existe más de una entrega`, `${solicitud.query || ''}. [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)

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
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `${deliveryBody.message || 'Error en obtenerEntregaDetalle'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error: Hubo un error al facturar: ${facturacion.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Hubo un error al facturar: ${facturacion.value || ''}` })
            }
            if (!facturacion.data) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error: Hubo un error al facturar`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Hubo un error al facturar`, facturacion })
            }
            const data = facturacion.data
            const { DocumentLines, ...restData } = data
            if (!DocumentLines) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", 'Error: No existen los DocumentLines en la facturacion por ID', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
                    grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}` })
                }
                if (batchData && batchData.length > 0) {
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error interno en la entrega de sap en postEntrega: ${deliveryBody.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", 'Error del sap, no se pudo crear la entrega, no se encontro el deliveryNumber en la respuesta', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error interno de SAP. ${responseData.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `${responseGenesis.message || 'Error en la consulta spObtenerCUF'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error al procesar patchEntrega: ${responsePatchEntrega.errorMessage.value || 'linea 280'}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Error al procesar la solicitud: patchEntrega ${responsePatchEntrega.errorMessage.value}` })
            }
            //TODO ------------------------------------------------------------ ENTREGA DETALLER TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, formater)
            console.log({ responseHana })
            if (responseHana.message) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error al entregaDetallerFactura: ${responseHana.message || "linea 292"}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
            responseHanaB.U_UserCode = id_sap
            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (invoiceResponse.status == 400) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error al procesar la solicitud postInvoice: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)

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
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error el tipo de identificacion es ${dataToProsin.tipo_identificacion || 'No definido'}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${dataToProsin.tipo_identificacion || 'No definido'} `, dataToProsin, bodyFinalFactura })
            }

            if (dataToProsin.correo == null || dataToProsin.correo == '') {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `error no hay datos en CORREO. codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe hay datos del CORREO `, dataToProsin, bodyFinalFactura })
            }
            dataToProsin.usuario = user.USERNAME || 'No definido'
            const responseProsin = await facturacionProsin(dataToProsin, user)
            // return res.json({bodyFinalFactura,responseProsin,deliveryData})
            console.log({ responseProsin })
            const { data: dataProsin } = responseProsin
            console.log({ dataProsin })
            if (dataProsin && dataProsin.estado != 200) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error Prosin: ${dataProsin.mensaje || dataProsin.estado || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, bodyFinalFactura })
            }
            if (dataProsin.mensaje != null) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error Prosin: ${dataProsin.mensaje || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error en el formateo de la fecha: linea 360`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error al procesar la solicitud patchEntrega: ${responsePatchEntrega.errorMessage.value || "No definido"}, U_B_cuf: ${cuf || ''}, U_B_em_date: ${fechaFormater || 'No definido'} ,NumAtCard: ${nroFactura || 'No definido'}, delivery: ${deliveryData || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error en la solicitud patch entrega ${responsePatchEntrega.errorMessage.value || ''}` })
            }
            //TODO --------------------------------------------------------------  ENTREGA DETALLE TO FACTURA
            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, fechaFormater)
            console.log({ responseHana })
            if (responseHana.message) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}, cuf: ${cuf || ''}, fechaFormater: ${fechaFormater || ''}, nroFactura: ${nroFactura || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
            if (invoiceResponse.status == 400) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error al procesar la solicitud: postInvoice: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.json({ ...response, cuf })

        }

    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ user })
        const endTime = Date.now()
        grabarLog(user.USERCODE, user.USERNAME, "Facturar Instituciones", `Error en el controlador Facturar catch. ${error.message || ''}`, `catch Facturar Instituciones. ${error.message || ''}, [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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

const getLocalISOString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // Offset en milisegundos
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1); // Quita la 'Z'
    return localISOTime;
}

const facturacionVehiculo = async (req, res) => {
    const startTime = Date.now();
    const { nro_ped, cliente, cardCode } = req.body;
    const user = req.usuarioAutorizado
    const today = getLocalISOString();

    let body = {};
    try {

        const idSap = user.ID_SAP || 0

        if (idSap == 0) {
            return res.status(400).json({ mensaje: `Usted no tiene ID SAP` })
        }

        const data = await obtenerPedidoDetalle(nro_ped);
        const detalle = data.map(item => ({
            producto: item.ItemCode,
            cantidad: item.Quantity,
            descripcion: item.Dscription,
            precioUnitario: item.UnitPrice,
            montoDescuento: item.Disc,
            subtotal: +((item.Quantity * item.UnitPrice) - item.Disc).toFixed(2),
            numeroImei: "",
            numeroSerie: "",
        }))

        const montoDetalle = detalle
            .reduce((total, item) => total + item.subtotal, 0)
            .toFixed(2);
        console.log(data);
        body = {
            sucursal: 0,
            punto: 0,
            documento_via: `17-${nro_ped}`,
            codigo_cliente_externo: cardCode,
            tipo_identificacion: 1,
            identificacion: data[0].LicTradNum,
            complemento: "",
            nombre: cliente,
            correo: data[0].E_Mail,
            direccion: data[0].Address || '',
            codigo_excepcion: false,
            metodo_pago: 1,
            numeroTarjeta: "",
            montoDetalle: montoDetalle,
            descuentoAdicional: 0.00,
            giftCard: 0.00,
            codigoMoneda: 1,
            tipoCambio: 1,
            usuario: user.USERNAME,
            facturaManual: false,
            fechaEmision: today,
            mediaPagina: true,
            detalle: detalle
        }

        body.usuario = user.USERNAME || 'No definido'
        const via = `${body.documento_via}`
        const dataCuf = await spObtenerCUFString(via)
        if (dataCuf.message) {
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Vehiculos", `${dataCuf.message || 'Error en la consulta spObtenerCUF'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/Vehiculo", process.env.PRD)
            return res.status(400).json({ mensaje: `${dataCuf.message || 'Error en la consulta spObtenerCUF'}`, dataCuf })
        }

        if (dataCuf.length != 0) {

            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturar Vehiculos", `${dataCuf.message || 'Se consulto spObtenerCuf con exito'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/Vehiculo", process.env.PRD)

            const dataGenesis = dataCuf[0]
            const cuf = dataGenesis.cuf
            const nroFactura = dataGenesis.factura
            const fechaFormater = new Date(dataGenesis.fecha_emision)
            const year = fechaFormater.getUTCFullYear();
            const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0')
            const day = String(fechaFormater.getUTCDate()).padStart(2, '0')
            const formater = `${year}${month}${day}`;
            const responseHana = await pedidoDetallerFactura(+nro_ped, cuf, +nroFactura, formater)

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
                    LineNum,
                    BaseType: 17,
                    BaseEntry: nro_ped,
                    BaseLine,
                    ItemCode,
                    Quantity: Number(Quantity),
                    GrossPrice: Number(GrossPrice),
                    GrossTotal: Number(GrossTotal),
                    WarehouseCode,
                    AccountCode,
                    TaxCode,
                    MeasureUnit,
                    UnitsOfMeasurment: Number(UnitsOfMeasurment),
                    U_DESCLINEA: Number(U_DESCLINEA)
                })
            }

            const responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }
            responseHanaB.U_UserCode = idSap
            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })

            if (invoiceResponse.status == 400) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud postInvoice: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}`, invoiceResponse })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: +nro_ped,
                cuf
            }
            console.log({ response })
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.json({ ...response, cuf })

        } else {


            if (!body.direccion) {
                body.direccion = ''
            }
            body.codigo_cliente_externo = cardCode
            // body.identificacion = '9054853'
            const responseProsin = await facturacionProsin(body, user);
            const { data: dataProsin } = responseProsin
            console.log({ dataProsin })
            if (dataProsin && dataProsin.estado != 200) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.mensaje || dataProsin.estado || ""}, codigo_cliente: ${body.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, body })
            }
            if (dataProsin.mensaje != null) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.mensaje || ""}, codigo_cliente: ${body.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, body })
            }

            const { cuf, factura } = responseProsin.data.datos;
            const fechaString = responseProsin.data.fecha;
            const [dia, mes, anioHora] = fechaString.split("/");
            const [anio] = anioHora.split(" ");
            const formater = `${anio}${mes}${dia}`;

            const responseHana = await pedidoDetallerFactura(+nro_ped, cuf, +factura, formater)

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
                    LineNum,
                    BaseType: 17,
                    BaseEntry: nro_ped,
                    BaseLine,
                    ItemCode,
                    Quantity: Number(Quantity),
                    GrossPrice: Number(GrossPrice),
                    GrossTotal: Number(GrossTotal),
                    WarehouseCode,
                    AccountCode,
                    TaxCode,
                    MeasureUnit,
                    UnitsOfMeasurment: Number(UnitsOfMeasurment),
                    U_DESCLINEA: Number(U_DESCLINEA)
                })
            }

            const responseHanaB = {
                ...cabezeraHana,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }
            responseHanaB.U_UserCode = idSap
            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            // return res.json({ invoiceResponse })
            if (invoiceResponse.status == 400) {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error al procesar la solicitud postInvoice: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}`, invoiceResponse })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: +nro_ped,
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
        // grabarLog(user.USERCODE, user.USERNAME, "Facturar Vehiculos", `Error en el controlador Facturar catch. ${error.message || ''}`, `catch Facturar Vehiculo. ${error.message || ''}, [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar/vehiculo", process.env.PRD)
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

const cancelarParaRefacturarController = async (req, res) => {
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
            id_sap,
            DocDate, Almacen,
            glosa
        } = req.body
        let responseProsin = {}
        let endTime = Date.now();
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ user })
        if (!cuf || cuf == '') {
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error el cuf no esta bien definido. ${cuf || ''}`, '', "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Error el cuf no esta bien definido. ${cuf || ''}` })
        }
        // const groupCode1 = await obtenerGroupCode('C000023')
        // console.log({ groupCode1 })
        const estadoFacturaResponse = await spEstadoFactura(cuf)
        if (estadoFacturaResponse.message) {
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `${estadoFacturaResponse.message || 'Error en spEstadoFactura'}`, '', "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `${estadoFacturaResponse.message || 'Error en spEstadoFactura'}` })
        }
        let { estado } = estadoFacturaResponse[0]

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
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en anulacionFacturacion de parte de Prosin: ${mess[1] || responseProsin.data.mensaje || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
                return res.status(400).json({ mensaje: `${mess[1] || responseProsin.data.mensaje || 'Error de Prosin en anulacionFacturacion'}` })
            }
        }

        if (!docEntry) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Debe venir el doc entry CUF(${cuf})`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Debe venir el doc entry` })
        }
        const reponseInvoice = await cancelInvoice(docEntry)
        if (reponseInvoice.value && !reponseInvoice.value.includes('Document is already closed')) {
            // const outputDir = path.join(__dirname, 'outputsAnulacion');
            // if (!fs.existsSync(outputDir)) {
            //     fs.mkdirSync(outputDir);
            // }
            // const now = new Date();
            // const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
            // const fileNameJson = path.join(outputDir, `reponseInvoiceAnulacion_${timestamp}.json`);
            // fs.writeFileSync(fileNameJson, JSON.stringify(docEntry, null, 2), 'utf8');
            // console.log(`Objeto reponseInvoice guardado en ${fileNameJson}`);

            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en cancel invoice: ${reponseInvoice.value || ''}, CUF(${cuf})`, `https://srvhana:50000/b1s/v1/Invoices(id)/Cancel, [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-refacturar", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en cancel invoice: ${reponseInvoice.value || ''}` })
        }

        const responseEntregas = await obtenerEntregasPorFactura(docEntry)
        if (responseEntregas.length == 0) {
            endTime = Date.now();
            // grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `No hay entregas de la factura`, `CALL ifa_lapp_ven_obtener_entregas_por_factura(id), [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `No hay entregas de la factura` })
        }
        if (responseEntregas.length > 1) {
            // endTime = Date.now();
            // grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `No hay entregas de la factura`, `CALL ifa_lapp_ven_obtener_entregas_por_factura(id), [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-to-prosin", process.env.PRD)
            return res.status(400).json({ mensaje: `Existe más de una entrega en esta factura` })
        }
        if (responseEntregas.message) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anular factura", `Error en obtenerEntregasPorFactura: ${responseEntregas.message || ''}, CUF(${cuf})`, `CALL ifa_lapp_ven_obtener_entregas_por_factura(id) [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/cancel-refacturar", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en obtenerEntregasPorFactura: ${responseEntregas.message || ''}` })
        }
        // return res.json({responseEntregas})

        const { BaseEntry } = responseEntregas[0]
        const fechaFormater = new Date(DocDate)
        const year = fechaFormater.getUTCFullYear();
        const month = String(fechaFormater.getUTCMonth() + 1).padStart(2, '0');
        const day = String(fechaFormater.getUTCDate()).padStart(2, '0');
        const formater = `${year}${month}${day}`;
        const entregas = await entregaDetallerFactura(BaseEntry, cuf, docEntry, formater)
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
        let CardCode = ''
        for (const line of entregas) {
            let newLine = {}
            const { ItemCode, WarehouseCode, Quantity, UnitsOfMeasurment, LineNum, BaseLine: base1, BaseType: base2, LineStatus, BaseEntry: base3, TaxCode,
                AccountCode, U_B_cuf: U_B_cufEntr, U_NIT, U_RAZSOC, U_UserCode, CardCode: cardCodeEntrega, Comments,
                ...restLine } = line;
            if (cabeceraReturn.length == 0) {
                cabeceraReturn.push({
                    U_NIT, U_RAZSOC,
                    U_UserCode: id_sap,
                    CardCode: cardCodeEntrega,
                    U_B_cufd: U_B_cufEntr,
                    Series: 352
                })
                CardCode = cardCodeEntrega
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

                const data = {
                    BaseLine: LineNum,
                    BaseType: 15,
                    BaseEntry: base3
                }
                newLine = {
                    ...data,
                    ItemCode,
                    WarehouseCode: Almacen,
                    Quantity: new_quantity / UnitsOfMeasurment,
                    LineNum: numRet,
                    TaxCode: "IVA_GND",
                    AccountCode: "6210103",
                    Comments: glosa,
                    ...restLine,
                    BatchNumbers: batchNumbers
                };
                newLine = { ...newLine };

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
            console.log({ resReturnStatus: responceReturn.status })
            console.log({ errorMessage: responceReturn.errorMessage })
            let mensaje = responceReturn.errorMessage || 'Mensaje no definido'
            if (mensaje.value)
                mensaje = mensaje.value
            // grabarLog(user.USERCODE, user.USERNAME, "Inventario Devolucion Completa", `Error en postReturn: ${mensaje}`, `postInvoice()`, "inventario/devolucion-completa", process.env.PRD)
            return res.status(400).json({ mensaje: `Error en postReturn: ${mensaje}`, finalDataEntrega })
        }

        console.log('---------------------------------------------ORDER NUMBER')
        const responsePedido = await pedidosPorEntrega(BaseEntry)

        let orderNumber = responsePedido[0].BaseEntry
        console.log({ orderNumberDespues: orderNumber })
        const groupCode = await obtenerGroupCode(CardCode)

        const responseOferta = await ofertaDelPedido(orderNumber)

        const resCancelOrden = await cancelOrder(orderNumber)
        console.log(JSON.stringify({ resCancelOrden }, null, 2))
        if (resCancelOrden.status == 400) {
            grabarLog(user.USERCODE, user.USERNAME, "Cancelacion para Refacturacion", `Error en cancelOrder: ${resCancelOrden.errorMessage.value || ''}`, 'https://srvhana:50000/b1s/v1/Orders(id)/Cancel', "facturacion/cancelar-refacturar", process.env.DBSAPPRD)
            return res.status(400).json({ mensaje: `Error en cancelOrder: ${resCancelOrden.errorMessage.value || ''}`, orderNumber, finalDataEntrega, entregas })
        }
        //------------------------------------------------CLOSE OFERTA

        let resCancelOferta

        if (groupCode.GroupCode == 100) {
            if (responseOferta.length > 0) {
                const idOferta = responseOferta[0].BaseEntry
                console.log({ idOferta })
                if (idOferta != null) {
                    resCancelOferta = await closeQuotations(idOferta)
                    if (resCancelOferta.status == 400 && resCancelOferta.errorMessage.value != "Document is already closed.") {
                        console.log({ errorMessage: resCancelOferta.errorMessage })
                        grabarLog(user.USERCODE, user.USERNAME, "Cancelacion para Refacturacion", `Error en cerrar la Oferta: ${resCancelOferta.errorMessage.value || ''}`, 'https://srvhana:50000/b1s/v1/Quotations(id)/Close', "facturacion/cancelar-refacturar", process.env.DBSAPPRD)
                        return res.status(400).json({ mensaje: `Error en cerrar la oferta: ${resCancelOferta.errorMessage.value || ''}`, orderNumber, resCancelOrden, responceReturn, finalDataEntrega, entregas })
                    }
                }
            }
        }

        grabarLog(user.USERCODE, user.USERNAME, "Cancelacion para Refacturacion", "Exito en la cancelacion para refcaturacion", '', "facturacion/cancelar-refacturar", process.env.PRD)
        return res.json({
            responseProsin: { ...responseProsin, cuf },
            reponseInvoice,
            finalDataEntrega,
            batchEntrega,
            entregas,
            resCancelOrden,
            idReturn: responceReturn.orderNumber,
            resCancelOferta
        })

    } catch (error) {
        console.log({ error })

        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ usuario })
        let mensaje = `Error en el controlador cancelarParaRefacturarController: ${error.message || ''}`
        const endTime = Date.now();
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Anular factura", mensaje + `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, 'Catch de cancelarParaRefacturarController', "facturacion/cancel-to-prosin", process.env.PRD)

        return res.status(error.statusCode ?? 500).json({ mensaje })
    }
}

const obtenerDevolucionesController = async (req, res) => {
    try {
        const sucCode = req.query.sucCode
        console.log({ sucCode })

        const devoluciones = await obtenerDevoluciones(sucCode)
        return res.json(devoluciones)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: obtenerDevolucionesController' })
    }
}

const obtenerDevolucionDetallerController = async (req, res) => {
    try {
        const idReturn = req.query.idReturn
        console.log({ idReturn })

        const detalle = await detalleDevolucion(idReturn)
        if (detalle.length == 0) {
            return res.status(400).json({ mensaje: 'Error al traer el detalle de la devolucion' })
        }
        const {
            Series,
            DocDate,
            DocDueDate,
            CardCode,
            CardName,
            FederalTaxID,
            DocTotal,
            DocCurrency,
            Comments,
            JournalMemo,
            PaymentGroupCode,
            SalesPersonCode,
            U_OSLP_ID,
            U_TIPODOC,
            U_TIPOCOM,
            NumAtCard,
            U_NIT,
            U_RAZSOC,
            U_B_cuf,
            U_B_path,
            U_B_em_date,
            U_UserCode,
        } = detalle[0]

        let response = {
            Series,
            DocDate,
            DocDueDate,
            CardCode,
            CardName,
            FederalTaxID,
            DocTotal,
            DocCurrency,
            Comments,
            JournalMemo,
            PaymentGroupCode,
            SalesPersonCode,
            U_OSLP_ID,
            U_TIPODOC,
            U_TIPOCOM,
            NumAtCard,
            U_NIT,
            U_RAZSOC,
            U_B_cuf,
            U_B_path,
            U_B_em_date,
            U_UserCode,
            DocumentLines: []
        }

        detalle.map((item) => {
            const {
                Series,
                DocDate,
                DocDueDate,
                CardCode,
                CardName,
                FederalTaxID,
                DocTotal,
                DocCurrency,
                Comments,
                JournalMemo,
                PaymentGroupCode,
                SalesPersonCode,
                U_OSLP_ID,
                U_TIPODOC,
                U_TIPOCOM,
                NumAtCard,
                U_NIT,
                U_RAZSOC,
                U_B_cuf,
                U_B_path,
                U_B_em_date,
                U_UserCode,
                ...rest
            } = item
            response.DocumentLines.push({ ...rest })
        })
        console.log({ detalle })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: obtenerDevolucionDetalleController' })
    }
}

const clientesByCardNameController = async (req, res) => {
    try {
        const cardName = req.query.cardName
        const response = await clienteByCardName(cardName.toUpperCase())
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'error en el controlador'
        })
    }
}

const ofertaDelPedidoController = async (req, res) => {
    try {
        const id = req.query.id
        console.log({ id })

        // const response = await ofertaDelPedido(id)
        // const response = await closeQuotations(id)
        const response = await obtenerGroupCode(id)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en el controlador: obtenerDevolucionesController: ${error.message}` })
    }
}

const reporteFacturasSiatController = async (req, res) => {
    try {
        const datenow = new Date();
        const formattedDate = `${datenow.getDate().toString().padStart(2, '0')}-${(datenow.getMonth() + 1).toString().padStart(2, '0')}-${datenow.getFullYear()}`;
        console.log({ formattedDate })
        const response = await listaFacturasSfl(1, formattedDate, formattedDate);
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
    }
}

const clientesExportacionController = async (req, res) => {
    try {
        const clientes = await clientesExportacion()
        return res.json(clientes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
    }
}
const almacenesController = async (req, res) => {
    try {
        const almacenes = await getAllAlmacenes()
        return res.json(almacenes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
    }
}

const articulosExportacionController = async (req, res) => {
    try {
        const parameter = req.query.parameter
        const articulos = await articulosExportacion(parameter.toUpperCase())
        return res.json(articulos)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
    }
}

const getIncoterm = async (req, res) => {
    try {
        const intercomList = await intercom()
        return res.json(intercomList)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
    }
}

const facturacionExportacion = async (req, res) => {
    try {
        const body = req.body
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador', error })
    }
}

const crearPedidoExportacionController = async (req, res) => {
    try {
        const {
            CardCode,
            CardName,
            CardFName,
            WhsCode,
            WhsName,
            DocDate,
            PuertoDestino,
            TransFrontNac,
            PickRmrk,
            SegFrontNac,
            LicTradNum,
            TransFrontInt,
            SegFrontInt,
            cajaEmbalaje,
            OtrosInt,
            totalGastoNac,
            totalGastoInt,
            Incoterm,
            total,
            // glosa,
            items
        } = req.body

        const alprazolamCode = '102-004-028'
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const usdResponse = await tipoDeCambio()
        if (!usdResponse || usdResponse.length == 0) {
            return res.status(400).json({ message: `Error al intentar obtener el tipo de cambio` })
        }
        const usd = usdResponse[0].Rate
        // return res.json({usd})
        const docLine = items
        let alprazolamContains = false
        let otherContains = false
        docLine.map((item) => {
            if (item.itemCode == alprazolamCode) {
                alprazolamContains = true
            } else {
                otherContains = true
            }
        })

        if (alprazolamContains && otherContains) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Pedido crear orden", `Error no se puede MEZCLAR ALPRAZOLAM con otros articulos.`, '', "pedido/crear-orden", process.env.PRD)
            return res.status(400).json({ message: `Error no se puede MEZCLAR ALPRAZOLAM con otros articulos.` })
        }

        let bodyToOrder = {}

        const cliente = await clientePorCardCode(CardCode)
        if (!cliente || cliente.length == 0) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Exportacion", `error El cliente no existe: ${CardCode || 'No Definido'}.`, '', "facturacion/crear-pedido-exportacion", process.env.PRD)
            return res.status(404).json({ mensaje: 'El cliente no existe' })
        }
        const paymentCode = cliente[0].GroupNum
        const DocDue = await getDocDueDate(DocDate, paymentCode)
        if (!DocDue || DocDue.length == 0) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Exportacion", `No se pudo calcular el DocDueDate, revise el DocDate ${DocDue || 'No Definido'}.`, '', "facturacion/crear-pedido-exportacion", process.env.PRD)
            return res.status(404).json({ mensaje: `No se pudo calcular el DocDueDate, revise el DocDate` })
        }
        const docDueData = DocDue[0].DocDueDate
        // return res.json({ cliente })
        bodyToOrder.Series = 319
        bodyToOrder.DocDate = DocDate
        bodyToOrder.DocDueDate = docDueData
        bodyToOrder.CardCode = CardCode
        bodyToOrder.FederalTaxID = LicTradNum
        bodyToOrder.PickRemark = PickRmrk
        bodyToOrder.Comments = 'PEDIDO PARA EXPORTACION DESDE LA WEB'
        bodyToOrder.JournalMemo = ''
        bodyToOrder.PaymentGroupCode = paymentCode
        bodyToOrder.U_NIT = LicTradNum
        bodyToOrder.U_RAZSOC = CardFName
        bodyToOrder.DocTotal = total
        bodyToOrder.SalesPersonCode = ''
        bodyToOrder.U_OSLP_ID = usuario.ID_SAP
        bodyToOrder.U_UserCode = usuario.ID_VENDEDOR_SAP
        bodyToOrder.U_B_doctype = 3
        bodyToOrder.Currency = 'USD'
        bodyToOrder.U_B_incoterm = Incoterm
        bodyToOrder.U_B_nexpcost = TransFrontNac
        bodyToOrder.U_B_iexpcost = TransFrontInt
        bodyToOrder.U_B_destplace = SegFrontNac
        bodyToOrder.U_B_cntrycode = SegFrontInt
        bodyToOrder.U_B_addinfo = OtrosInt
        bodyToOrder.U_B_iexpfob = totalGastoInt
        bodyToOrder.U_B_nexpfob = totalGastoNac
        bodyToOrder.U_B_paqnum = cajaEmbalaje
        bodyToOrder.U_B_destport = PuertoDestino
        bodyToOrder.DocumentLines = []

        sumatoriaNacional = TransFrontNac + SegFrontNac
        sumatoriaInternacional = TransFrontInt + SegFrontInt + OtrosInt

        if (totalGastoNac != sumatoriaNacional) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Exportacion", `El total Nacional (${totalGastoNac}) es diferente de la sumatoria de los gastos (${sumatoriaNacional})`, '', "facturacion/crear-pedido-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: `El total Nacional (${totalGastoNac}) es diferente de la sumatoria de los gastos (${sumatoriaNacional})` })
        }

        if (totalGastoInt != sumatoriaInternacional) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Exportacion", `El total Internacional (${totalGastoInt}) es diferente de la sumatoria de los gastos (${sumatoriaInternacional})`, '', "facturacion/crear-pedido-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: `El total Internacional (${totalGastoInt}) es diferente de la sumatoria de los gastos (${sumatoriaInternacional})` })
        }
        // return res.status(200).json({ mensaje: `ok` })
        // if (bodyToOrder.U_OSLP_ID == null || !bodyToOrder.U_OSLP_ID) {
        //     grabarLog(`${bodyToOrder.U_OSLP_ID  || 'No Definido'}`, 'Facturacion Exportacion', "crear-pedido-exportacion", `error , el ID SAP no esta definido`, 'https://srvhana:50000/b1s/v1/Orders', "facturacion/crear-pedido-exportacion", process.env.PRD)
        //     return res.status(400).json({ mensaje: 'error el ID SAP es obligatorio' })
        // }

        let docLines = []
        let idx = 0
        for (const element of items) {
            const { ItemCode } = element
            if (!ItemCode || ItemCode == '') {
                // grabarLog(`${ItemCode || 'No Definido'}`, 'Facturacion Exportacion', "crear-pedido-exportacion", `error El itemcode no es valido ${ItemCode||'No definido'}`, 'https://srvhana:50000/b1s/v1/Orders', "facturacion/crear-pedido-exportacion", process.env.PRD)
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Exportacion", `error El itemcode no es valido ${ItemCode || 'No definido'}`, '', "facturacion/crear-pedido-exportacion", process.env.PRD)
                return res.status(404).json({ mensaje: `El Item No es valido: ${ItemCode}` })
            }

            const itemData = await articuloPorItemCode(ItemCode)

            if (!itemData || itemData.length == 0) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Exportacion", `error El Item No fue encontrado ${itemData || 'No definido'}`, '', "facturacion/crear-pedido-exportacion", process.env.PRD)
                return res.status(404).json({ mensaje: `El Item No fue encontrado: ${itemData}` })
            }
            const { SalUnitMsr } = itemData
            const { cantidad, precio, subtotal, U_DESCLINEA } = element
            const subTotalBs = subtotal * Number(usd)
            const newData = {
                LineNum: idx,
                ItemCode,
                Quantity: cantidad,
                GrossPrice: precio,
                GrossTotalFC: subtotal,
                GrossTotal: Number(subTotalBs.toFixed(2)),
                WarehouseCode: WhsCode,
                AccountCode: '4110101',
                TaxCode: 'IVA_EXE',
                MeasureUnit: SalUnitMsr,
                U_DESCLINEA
            }

            docLines.push({ ...newData })
            idx++
        }
        const sumDescLinea = docLines.reduce((acc, item) => {
            return acc + item.U_DESCLINEA
        }, 0)
        bodyToOrder.DocumentLines = docLines
        // bodyToOrder.DocTotal = bodyToOrder.DocTotal + sumDescLinea
        console.log('--------------------------------------------------------')
        console.log(JSON.stringify(bodyToOrder, null, 2))
        console.log('--------------------------------------------------------')
        // return res.json({ bodyToOrder, cliente })
        const ordenResponse = await postOrden(bodyToOrder)
        if (ordenResponse.status == 400) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Facturacion Exportacion", `Error en el proceso post orden ${ordenResponse.errorMessage.value || ordenResponse.errorMessage || ordenResponse.message || ''}`, 'https://srvhana:50000/b1s/v1/Orders', "facturacion/crear-pedido-exportacion", process.env.PRD)
            return res.status(400).json({ message: `Error en el proceso postOrden. ${ordenResponse.errorMessage.value || ordenResponse.errorMessage || ordenResponse.message || ''}`, bodyToOrder })
        }
        return res.json({ ordenResponse, })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador', error })
    }
}

const pedidosExportacionController = async (req, res) => {
    try {
        const pedidos = await pedidosExportacion()
        // return res.json(pedidos)
        let listPedidos = []
        pedidos.map((item) => {
            const usd = +item.DocRate
            if (!usd || usd == 0) {
                return res.status(400).json({ mensaje: 'El tipo de cambio es 0', usd, item })
            }
            const docTotalUSD = (+item.DocTotal) / usd
            item.DocTotalUSD = Number(docTotalUSD.toFixed(2))
            listPedidos.push(item)
        })
        return res.json(listPedidos)
    } catch (error) {
        console.log({ error })
        return res.json({ mensaje: 'Error en el controlador', error })
    }
}

const facturarExportacionController = async (req, res) => {
    let idData = ''
    let body = {}
    let BodyToProsin = {}
    const startTime = Date.now();
    try {
        const id = req.query.id
        const user = req.usuarioAutorizado
        const id_sap = user.ID_SAP || 0
        let deliveryData
        let deliveryBody
        let usd = 0
        let finalDataEntrega
        idData = id

        const usdRate = await tipoDeCambio()
        if (usdRate.length == 0) {
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `No se obtuvo el tipo de cambio`, `CALL "${process.env.PRD}".IFA_CON_MONEDAS_TIPOS();`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se obtuvo el tipo de cambio' })
        }
        usd = +usdRate[0].Rate
        // return res.json({ usd })

        const responseDeliveryByID = await getOrdersById(id)
        // const setOrderResponse = await setOrderState(id, '') // null 
        // return res.json({responseDeliveryByID}) 
        if (responseDeliveryByID.length == 0) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se encontro la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se encontro la orden', responseDeliveryByID })
        }
        const dataByID = responseDeliveryByID[0]
        // return res.json({ dataByID })
        const { U_B_State } = dataByID
        // const {response}  = await setOrderState(id, '')
        // return res.json({stateData,U_B_State})
        if (U_B_State == null) {
            const setOrderResponse = await setOrderState(id, 'P') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
        }
        // const responseDeliveryByID2 = await getOrdersById(id)
        // return res.json({ mensaje: 'estado cambiado ',responseDeliveryByID2  })
        // if (U_B_State == 'P') {
        //     endTime = Date.now();
        //     grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se puede Facturar una Orden con Estado Pendiente , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
        //     return res.status(400).json({ mensaje: 'No se puede Facturar una Orden con Estado P - Pendiente', })
        // }

        if (U_B_State == 'R') {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se puede Facturar una Orden con Estado R - Procesado , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se puede Facturar una Orden con Estado R - Procesado', })
        }

        if (U_B_State == 'E') {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se puede Facturar una Orden con Estado E - Error , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se puede Facturar una Orden con Estado E - Error', })
        }

        if (!id || id == '') {

            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", 'error: debe haber un ID valido', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'debe haber un ID valido' })
        }
        const solicitud = await solicitarId(id);
        if (solicitud.message) {

            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }

            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `${solicitud.message || 'Error en solicitarId'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: `${solicitud.message || 'Error en solicitarId'}` })
        }

        if (solicitud.result.length > 1) {
            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Existe más de una entrega`, `${solicitud.query || ''}. [${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'Existe más de una entrega' })
        }

        else if (solicitud.result.length == 1) {
            //return res.json({solicitud})
            deliveryData = solicitud.result[0].DocEntry
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Se consulto obtenerEntregaDetalle,  deliveryData: ${deliveryData || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE( ${deliveryData || ''})`, process.env.PRD)
            deliveryBody = await obtenerEntregaDetalleExportacion(deliveryData)
            // return res.json({mensaje:'after obtenerEntregaDetalleExportacion',deliveryBody,deliveryData})
            // return res.json({deliveryBody})
            console.log('1 solicitud tiene mas de uno')
            // console.log({ solicitud, deliveryData })
            if (deliveryBody.message) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${deliveryBody.message || 'Error en obtenerEntregaDetalle'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_EXP_DETALLE(${deliveryData})`, process.env.PRD)
                return res.status(400).json({ mensaje: `${deliveryBody.message || ''}` })
            }
        }

        if (!deliveryBody) {

            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Se al consulto facturacionByIdSld,  id: ${id || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "https://srvhana:50000/b1s/v1/Orders(${id})", process.env.PRD)
            const facturacionD = await getOrdersById(id)
            const facturacion = await facturacionByIdSld(id)
            console.log('2 facturacion ')
            console.log({ facturacion })
            // await setOrderState(id, '') //! pendiente 
            // return res.json({facturacion})
            if (facturacion.lang) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error: Hubo un error al facturar: ${facturacion.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Hubo un error al facturar: ${facturacion.value || ''}` })
            }
            if (!facturacion.data) {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error: Hubo un error al facturar`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `Hubo un error al facturar`, facturacion })
            }
            const data = facturacion.data
            const { DocumentLines, ...restData } = data
            if (!DocumentLines) {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", 'Error: No existen los DocumentLines en la facturacion por ID', `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: 'No existen los DocumentLines en la facturacion por ID ' })
            }

            let batchNumbers = []
            let newDocumentLines = []

            for (const line of DocumentLines) {
                let newLine = {}
                const {
                    ItemCode, WarehouseCode, Quantity,
                    UnitsOfMeasurment, LineNum, BaseLine: base1,
                    BaseType: base2, BaseEntry: base3,
                    LineStatus, ...restLine
                } = line;
                const batchData = await lotesArticuloAlmacenCantidad(ItemCode, WarehouseCode, Quantity);
                console.log({ batch: batchData })
                // newDocumentLines.push({batchData})
                // break
                if (batchData.message) {

                    const setOrderResponse = await setOrderState(id, '') // pendiente 
                    if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                        endTime = Date.now();
                        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                        return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                    }

                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                    return res.status(400).json({ mensaje: `${batchData.message || 'Error en lotesArticuloAlmacenCantidad'}` })
                }
                if (batchData && batchData.length > 0) {

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
            //  await setOrderState(id, '') //! pendiente 
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
                CardCode,
                U_NIT,
                U_RAZSOC,
                U_UserCode: id_sap,
                DocumentLines: docLines,
            }

            finalDataEntrega = finalData
            console.log('FINAL ENTREGA------------------------------------------------------------')
            console.log({ finalDataEntrega })
            //TODO --------------------------------------------------------------  ENTREGA DELIVERY NOTES
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion exportacion", `Se envio postEntrega,  CardCode: ${finalDataEntrega.CardCode || ''}, U_UserCode: ${finalDataEntrega.U_UserCode || ''}, U_NIT: ${finalDataEntrega.U_NIT || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `https://srvhana:50000/b1s/v1/DeliveryNotes`, process.env.PRD)
            // return res.json({ mensaje: 'after post entrega', finalDataEntrega })
            deliveryBody = await postEntrega(finalDataEntrega)

            if (deliveryBody.lang) {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error interno en la entrega de sap en postEntrega: ${deliveryBody.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error interno en la entrega de sap. ${deliveryBody.value || ''}`, respuestaSapEntrega: deliveryBody, finalDataEntrega })
            }
            console.log('3 post entrega')
            console.log({ deliveryBody })
            const responseHana = await obtenerEntregaDetalleExportacion(deliveryBody.deliveryN44umber);
            // return res.json({ responseHana })
            deliveryBody.responseData = responseHana

        }


        console.log('4 delivery body fuera del if')
        console.log({ deliveryBody })
        // await setOrderState(id, '') //! pendiente 
        // return res.json({ mensaje: 'after post entrega', deliveryBody })
        let { responseData } = deliveryBody
        if (!responseData) {
            responseData = deliveryBody
        } else {
            const delivery = deliveryBody.deliveryN44umber
            if (!delivery) {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

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
        // await setOrderState(id, '') //! pendiente 
        // return res.json({ responseData })
        if (responseData.deliveryN44umber) { ///
            deliveryData = responseData.deliveryN44umber
        }
        console.log('7 deliveryData')
        console.log({ deliveryData })

        if (responseData.lang) {

            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }

            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error interno de SAP. ${responseData.value || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
            return res.status(400).json({ mensaje: `Error interno de sap. ${responseData.value || ''}` })
        }
        const detalle = [];
        const cabezera = [];
        if (responseData.responseData) { ///
            responseData = responseData.responseData
        }
        // return res.json({responseData})
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
                // numeroImei,
                // numeroSerie
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

            const setOrderResponse = await setOrderState(id, '') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }

            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `${responseGenesis.message || 'Error en la consulta spObtenerCUF'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
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
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Se envio al patchEntrega,  cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            // return res.json({ mensaje: 'genesis', responseGenesis, dataGenesis, cuf, nroFactura, formater })
            const responsePatchEntrega = await patchEntrega(deliveryData, {
                U_B_cuf: `${cuf}`,
                U_B_em_date: `${formater}`,
                NumAtCard: `${nroFactura}`
            })
            if (responsePatchEntrega.status == 400) {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                console.error({ error: responsePatchEntrega.errorMessage })
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error al procesar patchEntrega: ${responsePatchEntrega.errorMessage.value || 'linea 280'}, cuf: ${cuf || ''}, nroFactura: ${nroFactura || ''}, formater: ${formater}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `Error al procesar la solicitud: patchEntrega ${responsePatchEntrega.errorMessage.value}` })
            }

            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, formater)
            if (responseHana.message) {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}, cuf: ${cuf || ''}, fechaFormater: ${fechaFormater || ''}, formater: ${formater || ''}, nroFactura: ${nroFactura || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}`, responseHana, deliveryData, cuf, nroFactura, fechaFormater, formater })
            }
            const DocumentLinesHana = [];
            let cabezeraHana = [];
            let total = 0
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
                        // U_UserCode: 0
                    };
                    DocumentAdditionalExpenses = [
                        // { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_EXE' },
                        // { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_EXE' },
                        // { ExpenseCode: ExpenseCode3, LineTotal: +LineTotal3, TaxCode: 'IVA_EXE' },
                        // { ExpenseCode: ExpenseCode4, LineTotal: +LineTotal4, TaxCode: 'IVA_EXE' },
                    ]

                }
                DocumentLinesHana.push({
                    LineNum,
                    BaseType,
                    BaseEntry,
                    BaseLine,
                    ItemCode,
                    Quantity: Number(Quantity),
                    GrossPrice: Number(GrossPrice),
                    GrossTotal: Math.round((Number(GrossTotal) / usd) * 100) / 100,
                    WarehouseCode,
                    AccountCode,
                    TaxCode: 'IVA_EXE',
                    MeasureUnit,
                    UnitsOfMeasurment: Number(UnitsOfMeasurment),
                    U_DESCLINEA: 0
                })
                total += Math.round((Number(GrossTotal) / usd) * 100) / 100
            }

            const responseHanaB = {
                ...cabezeraHana,
                U_B_doctype: 3,
                DocTotal: total,
                ControlAccount: 1120201,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (invoiceResponse.status == 400) {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error al procesar la solicitud: postInvoice: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}`, invoiceResponse, responseHanaB })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: deliveryData,
                cuf,
                dataGenesis,
            }
            console.log({ response })
            const setOrderResponse = await setOrderState(id, 'R') // pendiente 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.json({ ...response, cuf, dataProsin, responsePatchEntrega, responseHana, responseHanaB })
        } else {
            endTime = Date.now()
            let dataToProsin = {}
            // return res.json({ bodyFinalFactura })
            const { direccion, ...restBodyFinalFactura } = bodyFinalFactura
            if (direccion == null || direccion == undefined) {
                dataToProsin = {
                    ...restBodyFinalFactura,
                    direccion: ''
                }
            } else {
                dataToProsin = bodyFinalFactura
            }
            // return res.json({ dataToProsin,deliveryBody })
            dataToProsin.tipo_identificacion = 4
            if (dataToProsin.tipo_identificacion == null ||
                (dataToProsin.tipo_identificacion == 1 || dataToProsin.tipo_identificacion == 5)) {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error el tipo de identificacion es ${dataToProsin.tipo_identificacion || 'No definido'}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${dataToProsin.tipo_identificacion || 'No definido'} `, dataToProsin, bodyFinalFactura })
            }

            if (dataToProsin.correo == null || dataToProsin.correo == '') {

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error no hay datos en CORREO. codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe hay datos del CORREO `, dataToProsin, bodyFinalFactura })
            }
            dataToProsin.usuario = user.USERNAME || 'No definido'
            const tipoCambio = await tipoDeCambio()
            const usdRate = tipoCambio[0]
            const usd = +usdRate.Rate

            const totalDescuentoAdicional = dataToProsin.detalle.reduce((acc, item) => {
                return acc + Number(item.montoDescuento)
            }, 0)

            dataToProsin.detalle.map((item) => {
                const cantidad = Number(item.cantidad).toFixed(2)
                const precioUnitario = Number(item.precioUnitario).toFixed(2)
                item.cantidad = Number(item.cantidad).toFixed(2)
                item.precioUnitario = Number(item.precioUnitario).toFixed(2)
                item.montoDescuento = 0
                item.subTotal = Number(Number(cantidad) * Number(precioUnitario)).toFixed(2)
            })

            const totalMontoDetalle = dataToProsin.detalle.reduce((acc, item) => {
                return acc + Number(item.subTotal)
            }, 0)

            let informacionAdd = ''
            const infoAdd = dataToProsin.PickRmrk || ''
            const arrayInfoAdd = infoAdd.split('-')
            // dataToProsin.paquetes1 = Number(200)
            if (arrayInfoAdd.length > 0) {
                informacionAdd = arrayInfoAdd[1]
                // informacionAdd = informacionAdd.slice(0,-1)
            }
            // return res.json({ dataToProsin,arrayInfoAdd,informacionAdd })

            // return res.json({informacionAdd,infoAdd})
            const { } = dataToProsin
            let formatedDataToProsin = {
                sucursal: dataToProsin.sucursal,
                punto: dataToProsin.punto,
                documento_via: dataToProsin.documento_via,
                codigo_cliente_externo: dataToProsin.codigo_cliente_externo,
                tipo_identificacion: Number(dataToProsin.tipo_identificacion),
                identificacion: dataToProsin.identificacion,
                complemento: dataToProsin.complemento,
                nombre: dataToProsin.nombre,
                correo: dataToProsin.correo,
                direccionComprador: dataToProsin.direccionComprador,
                incoterm: dataToProsin.incoterm,
                incotermDetalle: dataToProsin.incotermDetalle,
                puertoDestino: dataToProsin.puertoDestino,
                // puertoDestino: '.',
                lugarDestino: dataToProsin.lugarDestino,
                codigoPais: dataToProsin.codigoPais,
                metodo_pago: dataToProsin.metodo_pago,
                numeroTarjeta: dataToProsin.numeroTarjeta,
                montoDetalle: Number(totalMontoDetalle),
                // totalGastosNacionalesFob: Number(dataToProsin.TransFrontNac || 0) + Number(dataToProsin.SegFrontNac || 0),
                // totalGastosInternacionales: Number(dataToProsin.TransFrontInt || 0) + Number(dataToProsin.SegFrontInt || 0) + Number(dataToProsin.OtrosInt || 0),
                totalGastosNacionalesFob: 0,
                totalGastosInternacionales: 0,
                informacionAdicional: (informacionAdd) ? informacionAdd.slice(0, -1) : '',
                descuentoAdicional: Number(totalDescuentoAdicional.toFixed(2)),
                codigoMoneda: dataToProsin.codigoMoneda,
                tipoCambio: usd,
                usuario: dataToProsin.usuario,
                facturaManual: dataToProsin.facturaManual,
                fechaEmision: dataToProsin.fechaEmision,
                mediaPagina: true,
                detalle: dataToProsin.detalle,
                costosGastosNacional: [
                ],
                costosGastosInternacional: [
                ],
                numeroDescripcionPaquetesBultos: [
                ]
            }
            //? nacional
            // 
            // if (dataToProsin.TransFrontNac && Number(dataToProsin.TransFrontNac) > 0) {
            //     formatedDataToProsin.costosGastosNacional.push(
            //         {
            //             campo: 'Transporte Frontera',
            //             valor: Number(dataToProsin.TransFrontNac)
            //         },
            //     )
            // }

            // if (dataToProsin.SegFrontNac && Number(dataToProsin.SegFrontNac) > 0) {
            //     formatedDataToProsin.costosGastosNacional.push(
            //         {
            //             campo: 'Seguro Frontera',
            //             valor: Number(dataToProsin.SegFrontNac)
            //         },
            //     )
            // }
            //? internacional
            // { campo: 'Transporte Internacional', valor: Number(dataToProsin.TransFrontInt) },
            // if (dataToProsin.TransFrontInt && Number(dataToProsin.TransFrontInt) > 0) {
            //     formatedDataToProsin.costosGastosInternacional.push(
            //         {
            //             campo: 'Transporte Internacional',
            //             valor: Number(dataToProsin.TransFrontInt)
            //         },
            //     )
            // }
            // { campo: 'Seguro Internacional', valor: Number(dataToProsin.SegFrontInt) },
            // if (dataToProsin.SegFrontInt && Number(dataToProsin.SegFrontInt) > 0) {
            //     formatedDataToProsin.costosGastosInternacional.push(
            //         {
            //             campo: 'Seguro Internacional',
            //             valor: Number(dataToProsin.SegFrontInt)
            //         },
            //     )
            // }
            // { campo: 'Otros', valor: Number(dataToProsin.OtrosInt) },
            // if (dataToProsin.OtrosInt && Number(dataToProsin.OtrosInt) > 0) {
            //     formatedDataToProsin.costosGastosInternacional.push(
            //         {
            //             campo: 'Otros',
            //             valor: Number(dataToProsin.OtrosInt)
            //         },
            //     )
            // }
            //? numeroDescrip
            // { campo: 'Cajas', valor: Number(dataToProsin.paquetes1) },
            if (dataToProsin.paquetes1 && Number(dataToProsin.paquetes1) > 0) {
                formatedDataToProsin.numeroDescripcionPaquetesBultos.push(
                    {
                        campo: 'Cajas',
                        valor: Number(dataToProsin.paquetes1)
                    },
                )
            }
            // const setOrderResponsew = await setOrderState(id, '') //! pendiente 
            // return res.json({ formatedDataToProsin, dataToProsin })

            BodyToProsin = formatedDataToProsin

            if (formatedDataToProsin.lugarDestino == null || formatedDataToProsin.lugarDestino == '') {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No existe el lugar de destino en el Cliente , CardCode : ${formatedDataToProsin.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `call ${process.env.PRD}.getOrderByDocEntry(${id})`, process.env.PRD)
                    return res.status(400).json({ mensaje: 'No existe el lugar de destino en el Cliente ', formatedDataToProsin })
                }
                return res.status(400).json({ mensaje: 'No existe el lugar de destino en el Cliente ', formatedDataToProsin })
            }

            if (formatedDataToProsin.codigoPais == null || formatedDataToProsin.codigoPais == 0) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No existe el Codigo de Pais en el Cliente , CardCode : ${formatedDataToProsin.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `call ${process.env.PRD}.getOrderByDocEntry(${id})`, process.env.PRD)
                    return res.status(400).json({ mensaje: 'No existe el Codigo de Pais en el Cliente ', formatedDataToProsin })
                }
                return res.status(400).json({ mensaje: 'No existe el Codigo de Pais en el Cliente ', formatedDataToProsin })
            }

            if (formatedDataToProsin.informacionAdicional == ' ') {
                formatedDataToProsin.informacionAdicional = ''
            }

            console.log(JSON.stringify({ formatedDataToProsin }, null, 2))
            const responseProsin = await facturacionExportacionProsin(formatedDataToProsin, user)
            console.log(JSON.stringify(responseProsin, null, 2))
            console.log({ mensaje: 'ya se ejecuto factura exportacion' })
            //! return res.json({ responseProsin })
            const { data: dataProsin } = responseProsin
            if (dataProsin && dataProsin.estado != 200) {
                endTime = Date.now()
                if (dataProsin.mensaje.includes('§')) {
                    const mensaje = dataProsin.mensaje.split('§')

                    const setOrderResponse = await setOrderState(id, '') // pendiente 
                    if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                        endTime = Date.now();
                        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                        return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                    }

                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error Prosin: ${mensaje[mensaje.length - 1] || dataProsin.mensaje || "No definido"}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: `error de prosin ${mensaje[mensaje.length - 1] || dataProsin.mensaje || "No definido"}`, dataProsin, formatedDataToProsin, deliveryData })
                }

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error Prosin: ${dataProsin.mensaje || dataProsin.estado || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, formatedDataToProsin, deliveryData })
            }

            if (dataProsin.mensaje != null) {
                endTime = Date.now()
                if (dataProsin.mensaje.includes('§')) {

                    const setOrderResponse = await setOrderState(id, '') // pendiente 
                    if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                        endTime = Date.now();
                        grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                        return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                    }

                    endTime = Date.now();
                    const mensaje = dataProsin.mensaje.split('§')
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error Prosin: ${mensaje[mensaje.length - 1] || dataProsin.mensaje || "No definido"}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: `error de prosin ${mensaje[mensaje.length - 1] || dataProsin.mensaje || "No definido"}`, dataProsin, formatedDataToProsin, deliveryData })
                }

                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }

                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error Prosin: ${dataProsin.mensaje || dataProsin.estado || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, formatedDataToProsin, deliveryData })
            }
            const fecha = dataProsin.fecha
            const nroFactura = dataProsin.datos.factura
            const cuf = dataProsin.datos.cuf
            console.log({ fecha })
            const formater = fecha.split('/')
            const day = formater[0]
            const month = formater[1]
            const yearTime = formater[2]
            const yearFomater = yearTime.split(' ')
            const year = yearFomater[0]
            console.log({ day, month, year })
            if (year.length > 4) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error en el formateo de la fecha: linea 360`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'error al formateo de la fecha', year })
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
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error al procesar la solicitud patchEntrega: ${responsePatchEntrega.errorMessage.value || "No definido"}, U_B_cuf: ${cuf || ''}, U_B_em_date: ${fechaFormater || 'No definido'} ,NumAtCard: ${nroFactura || 'No definido'}, delivery: ${deliveryData || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `error en la solicitud patch entrega ${responsePatchEntrega.errorMessage.value || ''}`, responsePatchEntrega, deliveryData, U_B_cuf: `${cuf}`, U_B_em_date: `${fechaFormater}`, NumAtCard: `${nroFactura}` })
            }

            const responseHana = await entregaDetallerFactura(+deliveryData, cuf, +nroFactura, fechaFormater)
            if (responseHana.message) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}, cuf: ${cuf || ''}, fechaFormater: ${fechaFormater || ''}, nroFactura: ${nroFactura || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `Error al procesar entregaDetallerFactura: ${responseHana.message || ""}`, responseHana, deliveryData, cuf, nroFactura, fechaFormater })
            }
            const DocumentLinesHana = [];
            let cabezeraHana = [];

            let DocumentAdditionalExpenses = [];
            let total = 0
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
                        // { ExpenseCode: ExpenseCode1, LineTotal: +LineTotal1, TaxCode: 'IVA_EXE' },
                        // { ExpenseCode: ExpenseCode2, LineTotal: +LineTotal2, TaxCode: 'IVA_EXE' },
                        // { ExpenseCode: ExpenseCode3, LineTotal: +LineTotal3, TaxCode: 'IVA_EXE' },
                        // { ExpenseCode: ExpenseCode4, LineTotal: +LineTotal4, TaxCode: 'IVA_EXE' },
                    ]

                }
                DocumentLinesHana.push({
                    LineNum,
                    BaseType,
                    BaseEntry,
                    BaseLine,
                    ItemCode,
                    Quantity: Number(Quantity),
                    GrossPrice: Number(GrossPrice),
                    GrossTotal: Math.round((Number(GrossTotal) / usd) * 100) / 100,
                    WarehouseCode,
                    AccountCode,
                    TaxCode: 'IVA_EXE',
                    MeasureUnit,
                    UnitsOfMeasurment: Number(UnitsOfMeasurment),
                    U_DESCLINEA: 0
                })
                total += Math.round((Number(GrossTotal) / usd) * 100) / 100
            }

            const responseHanaB = {
                ...cabezeraHana,
                U_B_doctype: 3,
                DocTotal: total,
                ControlAccount: 1120201,
                DocumentLines: DocumentLinesHana,
                DocumentAdditionalExpenses
            }

            const invoiceResponse = await postInvoice(responseHanaB)
            console.log({ invoiceResponse })
            if (invoiceResponse.status == 400) {
                const setOrderResponse = await setOrderState(id, '') // pendiente 
                if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                    endTime = Date.now();
                    grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                    return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
                }
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `Error al procesar la solicitud: postInvoice: ${invoiceResponse.errorMessage.value || ""}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: `error del SAP ${invoiceResponse.errorMessage.value || ''}`, invoiceResponse, responseHanaB })
            }
            const response = {
                status: invoiceResponse.status || {},
                statusText: invoiceResponse.statusText || {},
                idInvoice: invoiceResponse.idInvoice,
                delivery: deliveryData,
                cuf
            }
            console.log({ response })
            const setOrderResponse = await setOrderState(id, 'R') // Procesada 
            if (setOrderResponse.length > 0 && setOrderResponse[0].response !== 200) {
                endTime = Date.now();
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
                return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse })
            }
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.json({ ...response, cuf, responseProsin, dataProsin, responsePatchEntrega, responseHana, responseHanaB })
        }
    } catch (error) {
        console.log(JSON.stringify({ error }, null, 2))
        const setOrderResponse = await setOrderState(+idData, '') // pendiente 
        const response = setOrderResponse[0]
        if (response == 404) {
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Exportacion", `error: No se pudo cambiar el estado de la orden , ID : ${id || 0}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar-exportacion", process.env.PRD)
            return res.status(400).json({ mensaje: 'No se pudo cambiar el estado de la orden ', setOrderResponse, BodyToProsin })
        }
        return res.status(500).json({
            mensaje: `Error en el controlador. ${error.message || 'no definido'}`,
            error,
            idData,
            setOrderResponse,
            BodyToProsin
        })
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

const getUnpaidFromPreviousMonthsController = async (req, res) => {
    try {
        const data = await getUnpaidFromPreviousMonths()
        return res.json(data)
    } catch (error) {
        console.log('error en getUnpaidFromPreviousMonthsController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const processUnpaidController = async (req, res) => {
    try {
        const { DocEntry, Cuf, CardCode, LicTradNum, CardFName, } = req.body
        let { SalesDocEntry, ReturnDocEntry, CreditNoteDocEntry, ReconciliationID } = req.body
        let responseReturn = {}
        let responseCreditNotes = {}
        const user = req.usuarioAutorizado
        const idSap = user.ID_SAP || 0

        if (!DocEntry) {
            return res.status(404).json({ mensaje: 'no existe el Doc Entry en la peticion' })
        }

        if (idSap == 0) {
            return res.status(401).json({ mensaje: 'El usuario no esta autorizado a realizar esta operacion ya que no tiene ID SAP' })
        }

        if (!ReturnDocEntry) {
            const details = await getPaidDeliveryDetails(DocEntry);
            if (details.length == 0) {
                return res.status(404).json({ mensaje: 'no se encontraron detalles de la entrega' })
            }
            const newDetails = groupBatchesByLineNum(details)
            const bodyReturns = buildBodyReturn(CardCode, LicTradNum, CardFName, Cuf, newDetails)
            
            responseReturn = await postReturn(bodyReturns)

            if (responseReturn.status > 300) {
                console.log({ errorMessage: responseReturn.errorMessage })
                let mensaje = responseReturn.errorMessage || 'Mensaje no definido'
                if (mensaje.value)
                    mensaje = mensaje.value
                return res.status(400).json({
                    mensaje: `Error en postReturn: ${mensaje}`, bodyReturns
                })
            }
            ReturnDocEntry = responseReturn.orderNumber
            await setSyncSalesReturnProcess(DocEntry, ReturnDocEntry, null, null)
            return res.json({responseReturn,bodyReturns})
        }

        if (!CreditNoteDocEntry) {
            const devolucionDetalle = await obtenerDevolucionDetalle(ReturnDocEntry)
            const bodyCreditNotes = buildBodyCreditNotes(ReturnDocEntry, DocEntry, devolucionDetalle)
            console.log(JSON.stringify({ bodyCreditNotes }, null, 2))
            responseCreditNotes = await postCreditNotes(bodyCreditNotes)
            if (responseCreditNotes.status > 299) {
                let mensaje = responseCreditNotes.errorMessage
                if (typeof mensaje != 'string' && mensaje.lang) {
                    mensaje = mensaje.value
                }
                mensaje = `Error en creditNote: ${mensaje}. Factura Nro: ${ReturnDocEntry}`
                grabarLog(user.USERCODE, user.USERNAME, `Inventario DEvolucion Valorado`, mensaje, 'postCreditNotes', `inventario/dev-valorado-dif-art`, process.env.PRD)
                return res.status(400).json({
                    mensaje,
                    bodyCreditNotes,
                    ReturnDocEntry,
                })
            }
            const { orderNumber: CreditNoteDocEntry, TransNum } = responseCreditNotes
            await setSyncSalesReturnProcess(DocEntry, ReturnDocEntry, CreditNoteDocEntry, null)
        }


        return res.json({ mensaje: 'Proceso concluido con exito', SalesDocEntry, ReturnDocEntry, CreditNoteDocEntry, responseReturn,responseCreditNotes})

    } catch (error) {
        console.log('error en processUnpaidController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
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
    entregasSinFacturasController,
    cancelarOrdenController,
    pedidosInstitucionesController,
    facturacionInstitucionesController,
    facturacionVehiculo,
    cancelarParaRefacturarController,
    obtenerDevolucionesController,
    obtenerDevolucionDetallerController,
    clientesByCardNameController,
    ofertaDelPedidoController,
    reporteFacturasSiatController,
    clientesExportacionController,
    almacenesController,
    articulosExportacionController,
    crearPedidoExportacionController,
    pedidosExportacionController,
    getIncoterm,
    facturarExportacionController,
    getClienteByCardCodeController,
    setStatusFacturaController,
    facturacionAllStatusListController,
    actualizarEstadoPedidoController,
    cancelToProsinNDCController,
    getUnpaidFromPreviousMonthsController,
    processUnpaidController,
}