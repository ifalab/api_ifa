const { entregaDetallerFactura } = require("../../inventarios/controller/hana.controller")
const { facturacionById, facturacionPedido } = require("../service/apiFacturacion")
const { facturacionProsin } = require("../service/apiFacturacionProsin")
const { lotesArticuloAlmacenCantidad } = require("./hana.controller")
const { postEntrega } = require("./sld.controller")

const facturacionController = async (req, res) => {
    let body = {}
    try {
        const { id } = req.body
        // return {id}
        if (!id || id == '') return res.status(400).json({ mensaje: 'debe haber un ID valido' })
        const { data } = await facturacionById(id)
        if (!data) return res.status(400).json({ mensaje: 'Hubo un error al facturar' })
        const { DocumentLines, ...restData } = data
        if (!DocumentLines) return res.status(400).json({ mensaje: 'No existe los DocumentLines en la facturacio por ID ' })

        let batchNumbers = []
        let newDocumentLines = []
        // return res.json({data})
        for (const line of DocumentLines) {
            let newLine = {}
            const { ItemCode, WarehouseCode, Quantity, LineNum, ...restLine } = line;
            const batchData = await lotesArticuloAlmacenCantidad(ItemCode, WarehouseCode, Quantity);

            if (!batchData || batchData.length === 0) {
                return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}` });
            }
            //console.log({ batchData })
            batchNumbers = batchData.map(batch => ({
                BaseLineNumber: LineNum,
                BatchNumber: batch.BatchNum,
                Quantity: Number(batch.Quantity).toFixed(6),
                ItemCode: batch.ItemCode
            }))

            newLine = {
                ItemCode,
                WarehouseCode,
                Quantity,
                LineNum,
                ...restLine,
                BatchNumbers: batchNumbers
            }

            newDocumentLines.push(newLine)

        }
        let newData = {
            ...restData,
            DocumentLines: newDocumentLines
        }

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
            DocumentLines: docLines,
        }
        // return {finalData}
        const responseSapEntrega = await postEntrega(finalData)
        console.log('response post entrega ejecutado')

        const { responseData } = responseSapEntrega
        const delivery = responseSapEntrega.deliveryN44umber
        if (!delivery) return res.status(400).json({ mensaje: 'error del sap, no se pudo crear la entrega' })
        // return res.json({ delivery })
        const detalle = [];
        const cabezera = [];
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
        console.log({ responseProsin })
        const { data: dataProsin } = responseProsin
        if (dataProsin && dataProsin.estado != 200) return res.status(400).json({ mensaje: dataProsin, bodyFinalFactura })
        if (dataProsin.mensaje != null) return res.status(400).json({ mensaje: dataProsin, bodyFinalFactura })
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
        const responseHana = await entregaDetallerFactura(+delivery,cuf, +nroFactura,fechaFormater )
        return res.json({ responseHana })
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

module.exports = {
    facturacionController,
    facturacionStatusController
}