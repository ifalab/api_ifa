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
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Se consulto obtenerEntregaDetalle,  deliveryData: ${deliveryData || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE( ${deliveryData || ''})`, process.env.PRD)
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
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Se al consulto facturacionByIdSld,  id: ${id || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "https://srvhana:50000/b1s/v1/Orders(${id})", process.env.PRD)
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
            //TODO --------------------------------------------------------------  ENTREGA DELIVERY NOTES
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Se envio postEntrega,  CardCode: ${finalDataEntrega.CardCode || ''}, U_UserCode: ${finalDataEntrega.U_UserCode || ''}, U_NIT: ${finalDataEntrega.U_NIT || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `https://srvhana:50000/b1s/v1/DeliveryNotes`, process.env.PRD)
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
            endTime = Date.now()
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", "Factura creada con exito", `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)

            return res.json({ ...response, cuf })

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
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error el tipo de identificacion es ${dataToProsin.tipo_identificacion || 'No definido'}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `No existe el tipo de identificacion o es distinto de 1 y 5 . valor: ${dataToProsin.tipo_identificacion || 'No definido'} `, dataToProsin, bodyFinalFactura })
            }

            if (dataToProsin.correo == null || dataToProsin.correo == '') {
                endTime = Date.now()
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `error no hay datos en CORREO. codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || 'No definido'}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
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
                grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturar", `Error Prosin: ${dataProsin.mensaje || dataProsin.estado || ""}, codigo_cliente: ${bodyFinalFactura.codigo_cliente_externo || ''}`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturar", process.env.PRD)
                return res.status(400).json({ mensaje: `error de prosin ${dataProsin.mensaje || ''}`, dataProsin, dataToProsin, bodyFinalFactura })
            }
            if (dataProsin.mensaje != null) {
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
            if (invoiceResponse.status == 400) {
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