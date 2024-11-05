const { getLotes, getDocDueDate, getUsuarios } = require("./hana.controller");
const { postOrden, postEntrega } = require("./sld.controller");

const postOrdenController = async (req, res) => {
    try {

        // Datos a enviar en la solicitud POST
        const orderData = req.body;
        // console.log(orderData)

        const { DocDate, PaymentGroupCode } = orderData
        // return res.json({ orderData })
        const docDueDate = await getDocDueDate(DocDate, PaymentGroupCode)

        // return res.json({ docDueDate })
        const DocDueDate = docDueDate[0]
        console.log({ DocDueDate })
        if (DocDueDate == {}) return res.status(404).json({ mensaje: 'Error al obtener el DocDueDate' })
        // return res.json({ DocDueDate })
        const newOrderDate = { ...DocDueDate, ...orderData }
        const response = await postOrden(newOrderDate)
        const responseValue = response.value
        if (responseValue.includes('Customer record not found')) return res.status(404).json({ mensaje: 'No se encontró el registro del cliente' })
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en post orden' })
    }
}

const getUsuariosController = async (req, res) => {
    try {
        const users = await getUsuarios()
        return res.json({ users })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en post orden' })
    }
}

const getLotesController = async (req, res) => {
    try {
        const { itemCode, warehouseCode, quantity } = req.body
        const response = await getLotes(itemCode, warehouseCode, quantity)
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ error })
    }
}

const getDocDueDateController = async (req, res) => {
    try {

        const { docDate, paymentGroupCode } = req.body
        const response = await getDocDueDate(docDate, paymentGroupCode)
        const DocDueDate = response[0].DocDueDate
        return res.json({ DocDueDate })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en getDocDueDate' })
    }
}

const postEntregaController = async (req, res) => {
    try {
        const { CardCode, DocDate, DocDueDate, DocumentLines } = req.body;
        if (!DocumentLines || DocumentLines.length === 0) {
            return res.status(400).json({ message: 'DocumentLines no puede estar vacío' });
        }

        const processedLines = [];

        let baseLineCounter = 0;

        for (const line of DocumentLines) {
            const { ItemCode, WarehouseCode, Quantity, UnitPrice, TaxCode } = line;

            // Obtener datos de batch desde hanaController
            const batchData = await getLotes(ItemCode, WarehouseCode, Quantity);

            if (!batchData || batchData.length === 0) {
                return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}` });
            }

            // Formato del batch ajustado para cumplir con los requisitos de SAP
            const batchNumbers = batchData.map(batch => ({
                BaseLineNumber: baseLineCounter.toString(),
                BatchNumber: batch.BatchNum,
                //ExpiryDate: `${batch.ExpDate} 00:00:00.000000000`,  // Formato de fecha
                Quantity: Number(batch.Quantity).toFixed(6),        // Formato de cantidad
                ItemCode: batch.ItemCode//,
                //WarehouseCode: line.WarehouseCode
            }));

            const processedLine = {
                BaseType: -1,
                //BaseEntry: 0,
                //BaseLine: baseLineCounter, // Incrementamos el valor de BaseLine para cada línea
                LineNum: baseLineCounter,  // También ajustamos LineNum para que sea único
                ItemCode: ItemCode,
                Quantity: Quantity,
                TaxCode: TaxCode,
                UnitPrice: UnitPrice,
                WarehouseCode: WarehouseCode,
                BatchNumbers: batchNumbers
            };

            processedLines.push(processedLine);
            baseLineCounter++; // Incrementamos el contador para la siguiente línea
        }
        const responseJson = {
            CardCode,
            DocDate,
            DocDueDate,
            DocumentLines: processedLines
        };

        console.log('Datos a enviar a SAP:', JSON.stringify(responseJson, null, 2));
        const response = await postEntrega(responseJson)
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en postEntregaController' })
    }
}
module.exports = {
    getUsuariosController,
    getLotesController,
    getDocDueDateController,
    postOrdenController,
    postEntregaController
}