const { facturacionById, facturacionPedido } = require("../service/apiFacturacion")
const { lotesArticuloAlmacenCantidad } = require("./hana.controller")
const { postEntrega } = require("./sld.controller")

const facturacionController = async (req, res) => {
    try {
        const { id } = req.body
        if (!id || id == '') return res.status(400).json({ mensaje: 'debe haber un ID valido' })
        const { data } = await facturacionById(id)
        if (!data) return res.status(400).json({ mensaje: 'Hubo un error al facturar' })
        const { DocumentLines, ...restData } = data
        if (!DocumentLines) return res.status(400).json({ mensaje: 'No existe los DocumentLines en la facturacio por ID ' })

        let batchNumbers = []
        let newDocumentLines = []
        for (const line of DocumentLines) {
            let newLine = {}
            const { ItemCode, WarehouseCode, Quantity, LineNum, ...restLine } = line;
            const batchData = await lotesArticuloAlmacenCantidad(ItemCode, WarehouseCode, Quantity);

            if (!batchData || batchData.length === 0) {
                return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}` });
            }
            console.log({ batchData })
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
            DocumentLines:docLines,
            ...restNewData
        } = newData;

        const finalData = {
            DocDate,
            DocDueDate,
            CardCode,
            DocumentLines:docLines,
        }
        const responseSapEntrega = await postEntrega(finalData)
        console.log('response post entrega ejecutado')
        return res.json({ responseSapEntrega })
    } catch (error) {
        console.log({ error })
        const { statusCode } = error
        // if (statusCode) {
        //     return res.status(statusCode).json({ mensaje: 'Error en el controlador', sapMessage: `${error.message.message.value || 'No definido'}`, error:error.message })
        // }
        return res.status(500).json({ mensaje: 'Error en el controlador', sapMessage: `${error.message.error || 'No definido'}`, error })
    }
}
const facturacionStatusController = async(req,res)=>{
    try { 
        const {opcion } = req.query;
        const response  = await facturacionPedido(opcion)
        return res.json({response})
        
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