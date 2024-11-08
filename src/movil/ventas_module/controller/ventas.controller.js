const { response, json } = require("express");
const { getLotes, getDocDueDate, getUsuarios, descuentosPorArticulo, descuentosPorCondicion, descuentosPorLinea } = require("./hana.controller");
const { postOrden, postEntrega, postInvoice, findOneInvoice, updateInvoice, findAllIncomingPayment, findOneIncomingPayment, findOneByCardCodeIncomingPayment, createIncomingPayment, cancelIncomingPayment } = require("./sld.controller");
const fs = require('fs');
const path = require('path');
const { syncBuiltinESMExports } = require("module");

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
        return res.json({ ...response })
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
        return res.json({ ...response })
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
            const batchData = await getLotes(ItemCode, WarehouseCode, Quantity);

            if (!batchData || batchData.length === 0) {
                return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}` });
            }

            const batchNumbers = batchData.map(batch => ({
                BaseLineNumber: baseLineCounter.toString(),
                BatchNumber: batch.BatchNum,
                Quantity: Number(batch.Quantity).toFixed(6),        // Formato de cantidad
                ItemCode: batch.ItemCode//,

            }));

            const processedLine = {
                BaseType: -1,
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
        return res.json({ ...response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en postEntregaController' })
    }
}

const postInvoiceController = async (req, res) => {
    try {
        const { CardCode, DocumentLines } = req.body
        const sapResponse = await postInvoice(CardCode, DocumentLines)
        console.log({ sapResponse })
        if (sapResponse.value) {
            return res.status(400).json({ messageSap: `${sapResponse.value}` })
        }
        const response = {
            status: sapResponse.status || {},
            statusText: sapResponse.statusText || {},
        }
        return res.json({ ...response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en postEntregaController' })
    }
}

const findOneInvoiceController = async (req, res) => {
    try {
        const id = req.params.id;
        const sapResponse = await findOneInvoice(id);

        // Extrae solo las propiedades esenciales
        const response = {
            // Asume que `data` contiene solo la información necesaria
            data: sapResponse.data || {},
        };

        return res.json(response);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en findOneInvoiceController' })
    }
}
const updateInvoiceController = async (req, res) => {
    try {
        const { list } = req.body

        console.log(list)
        const filePath = path.join(__dirname, 'static', 'patchfacturassapv2.txt');
        if (!fs.existsSync(filePath)) {
            console.error("El archivo no existe:", filePath);
            return res.json('El archivo no existe');
        } else {
            const data = fs.readFileSync(filePath, 'utf-8');

            // Dividir el contenido en líneas
            const lines = data.trim().split('\n');

            // Crear una lista para almacenar los objetos
            const invoiceList = [];

            // Saltar la primera línea (asumiendo que es el encabezado) y procesar el resto
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    // Dividir cada línea por espacios o tabulación
                    const [id, DocDueDate] = line.split(/\s+/);

                    // Agregar el objeto a la lista
                    invoiceList.push({ id: parseInt(id, 10), DocDueDate });
                }
            }
            let listResponse = []
            await Promise.all(invoiceList.map(async (item) => {
                const { id, DocDueDate } = item;
                console.log({ item });
                console.log({ id });
                console.log({ DocDueDate });

                const sapResponse = await updateInvoice(id, DocDueDate);
                console.log({ sapResponse });
                if (!sapResponse.status) {
                    if (sapResponse.value) {
                        listResponse.push({ value: sapResponse.value, item });
                    }
                }

            }));
            return res.json({ cantidadErrores: listResponse.length, listaErrores: listResponse });
        }
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en findOneInvoiceController' })
    }
}

const findAllIncomingPaymentController = async (req, res) => {
    try {
        const response = await findAllIncomingPayment()
        console.log({ response })
        const sapResponse = {
            // Asume que `data` contiene solo la información necesaria
            data: response.data || {},
        };
        return res.json({ ...sapResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en all incomming controller' })
    }
}

const findOneIncomingPaymentController = async (req, res) => {
    try {
        const id = req.params.id
        const response = await findOneIncomingPayment(id)
        console.log({ response })
        if (response.value) {
            return res.status(400).json({ menssageSap: `${response.value}` })
        }
        const sapResponse = {
            data: response.data || {},
        };
        return res.json({ ...sapResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en one incomming controller' })
    }
}

const findOneByCardCodeIncomingPaymentController = async (req, res) => {
    try {
        const id = req.params.id
        console.log({ id })
        const response = await findOneByCardCodeIncomingPayment(id)
        const sapResponse = {
            data: response.data || {},
        };
        if (sapResponse.data.value.length == 0) return res.status(404).json({ messageSap: 'CardCode not found' })
        return res.json({ ...sapResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en one By CardCode Incoming Payment Controller' })
    }
}

const createIncomminPaymentController = async (req, res) => {
    try {
        const {
            DocDate,
            CardCode,
            CashAccount,
            TransferAccount,
            TransferSum,
            TransferDate,
            TransferReference,
            Remarks,
            JournalRemarks,
            Series,
            U_OSLP_ID,
            U_Sucursal_Interna,
            U_ORIGIN,
            PaymentInvoices,
        } = req.body

        let CashSum = 0

        PaymentInvoices.map((item) => {
            CashSum = +CashSum + (+item.SumApplied)
        })

        const sapResponse = await createIncomingPayment({
            DocDate,
            CardCode,
            CashAccount,
            CashSum,
            TransferAccount,
            TransferSum,
            TransferDate,
            TransferReference,
            Remarks,
            JournalRemarks,
            Series,
            U_OSLP_ID,
            U_Sucursal_Interna,
            U_ORIGIN,
            PaymentInvoices,
        })
        if (sapResponse.value) {
            return res.status(404).json({ messageSap: `${sapResponse.value}` })
        }
        const location = sapResponse.headers.location
        const [, value] = location.split('(')
        const [id,] = value.split(')')
        const createIncoming = await findOneIncomingPayment(id)
        if (createIncoming.value) {
            return res.status(400).json({ menssageSap: `${createIncoming.value}` })
        }
        const response = {
            data: createIncoming.data || {}
        }
        return res.json({ ...response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en create Incoming Payment Controller' })
    }
}

const cancelIncomingPaymentController = async (req, res) => {
    try {
        const id = req.params.id
        const sapResponse = await cancelIncomingPayment(id)
        console.log({ sapResponse })

        if (sapResponse.value) {
            const value = sapResponse.value
            if (value.includes('No matching records found')) {
                return res.status(404).json({ messageSap: `${value}` })
            }
            return res.status(400).json({ messageSap: `${value}` })
        }

        const response = {
            data: sapResponse.data || {},
            status: 200,
            statusText: sapResponse.statusText || 'Success',
        }
        return res.json({ ...response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el cancel incoming payment controller' })
    }
}

const descuentosPorArticuloController = async (req, res) => {
    try {
        const response = await descuentosPorArticulo()
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500), json({ mensaje: 'error en descuentosPorArticuloController' })
    }
}

const descuentosPorCondicionController = async (req, res) => {
    try {
        const response = await descuentosPorCondicion()
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500), json({ mensaje: 'error en descuentosPorArticuloController' })
    }
}

const descuentosPorLineaController = async (req, res) => {
    try {
        const response = await descuentosPorLinea()
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500), json({ mensaje: 'error en descuentosPorArticuloController' })
    }
}

module.exports = {
    getUsuariosController,
    getLotesController,
    getDocDueDateController,
    postOrdenController,
    postInvoiceController,
    postEntregaController,
    findOneInvoiceController,
    updateInvoiceController,
    findAllIncomingPaymentController,
    findOneIncomingPaymentController,
    findOneByCardCodeIncomingPaymentController,
    createIncomminPaymentController,
    cancelIncomingPaymentController,
    descuentosPorArticuloController,
    descuentosPorCondicionController,
    descuentosPorLineaController,
}
