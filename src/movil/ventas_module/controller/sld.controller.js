const axios = require('axios');
const https = require('https');

// Configura el agente para deshabilitar la verificación del certificado
const agent = new https.Agent({ rejectUnauthorized: false });

// Variable para almacenar el estado de la sesión
let session = null;

// Función para conectar y obtener la sesión
const connectSLD = async () => {
    try {
        const url = 'https://172.16.11.25:50000/b1s/v1/Login';
        const data = {
            CompanyDB: process.env.DBSAPDEV,
            UserName: process.env.USERSAP,
            Password: process.env.PASSSAP
        };

        // Realiza la solicitud POST a la API externa usando el agente
        const response = await axios.post(url, data, { httpsAgent: agent });

        // Guarda la sesión en la variable global
        session = response.data;

        return response.data;
    } catch (error) {
        // Manejo de errores
        console.error('Error de logueo al SLD', error.message);
        throw new Error('Error de logueo al SLD');
    }
};
// Verifica si la sesión sigue siendo válida
const validateSession = async () => {
    if (!session || !session.SessionId) {
        return await connectSLD();
    }
    // Puedes implementar una validación adicional si lo deseas, como hacer una solicitud de prueba aquí.
    return session;
};
// Controlador para manejar la solicitud POST
const postOrden = async (newOrderDate) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const url = 'https://srvhana:50000/b1s/v1/Orders';

        // Configura los encabezados para incluir la cookie y el encabezado Prefer
        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };

        // Realiza la solicitud POST a la API externa usando el agente y los encabezados
        const response = await axios.post(url, newOrderDate, {
            httpsAgent: agent,
            headers: headers
        });

        // Extrae el número del encabezado location
        const locationHeader = response.headers.location;
        const orderNumberMatch = locationHeader.match(/\((\d+)\)$/);
        const orderNumber = orderNumberMatch ? orderNumberMatch[1] : 'Desconocido';

        console.log('Nueva Orden: #', orderNumber)
        // Envía una respuesta exitosa con mensaje personalizado
        return {
            message: 'Orden grabada con éxito',
            orderNumber: orderNumber,
            status: response.status,
            statusText: response.statusText
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud POST para Entrega:', error.response?.data || error.message);
        return errorMessage
    }

};

/////////////////////////////////////////////////////////////////////////////


// Controlador para manejar la solicitud POST de consulta de batch
const postEntrega = async (responseJson) => {

    // const { CardCode, DocDate, DocDueDate, DocumentLines } = req.body;

    // if (!DocumentLines || DocumentLines.length === 0) {
    //     return res.status(400).json({ message: 'DocumentLines no puede estar vacío' });
    // }

    // const processedLines = [];

    // let baseLineCounter = 0;  // Contador para BaseLine y LineNum

    // for (const line of DocumentLines) {
    //     const { ItemCode, WarehouseCode, Quantity, UnitPrice, TaxCode } = line;

    //     // Obtener datos de batch desde hanaController
    //     const batchData = await hanaController.getLotes(ItemCode, WarehouseCode, Quantity);

    //     if (!batchData || batchData.length === 0) {
    //         return res.status(404).json({ message: `No se encontraron datos de batch para los parámetros proporcionados en la línea con ItemCode: ${ItemCode}` });
    //     }

    //     // Formato del batch ajustado para cumplir con los requisitos de SAP
    //     const batchNumbers = batchData.map(batch => ({
    //         BaseLineNumber: baseLineCounter.toString(),
    //         BatchNumber: batch.BatchNum,
    //         //ExpiryDate: `${batch.ExpDate} 00:00:00.000000000`,  // Formato de fecha
    //         Quantity: Number(batch.Quantity).toFixed(6),        // Formato de cantidad
    //         ItemCode: batch.ItemCode//,
    //         //WarehouseCode: line.WarehouseCode
    //     }));

    //     const processedLine = {
    //         BaseType: -1,
    //         //BaseEntry: 0,
    //         //BaseLine: baseLineCounter, // Incrementamos el valor de BaseLine para cada línea
    //         LineNum: baseLineCounter,  // También ajustamos LineNum para que sea único
    //         ItemCode: ItemCode,
    //         Quantity: Quantity,
    //         TaxCode: TaxCode,
    //         UnitPrice: UnitPrice,
    //         WarehouseCode: WarehouseCode,
    //         BatchNumbers: batchNumbers
    //     };

    //     processedLines.push(processedLine);
    //     baseLineCounter++; // Incrementamos el contador para la siguiente línea
    // }

    // JSON final a enviar a SAP
    // const responseJson = {
    //     CardCode,
    //     DocDate,
    //     DocDueDate,
    //     DocumentLines: processedLines
    // };

    // console.log('Datos a enviar a SAP:', JSON.stringify(responseJson, null, 2));

    // Manejar la sesión SLD



    // Intentar hacer la solicitud POST a SAP
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = 'https://srvhana:50000/b1s/v1/DeliveryNotes';
        const sapResponse = await axios.post(url, responseJson, {
            httpsAgent: agent,
            headers: headers
        });

        const locationHeader = sapResponse.headers.location;
        const deliveryNumberMatch = locationHeader.match(/\((\d+)\)$/);
        const deliveryNumber = deliveryNumberMatch ? deliveryNumberMatch[1] : 'Desconocido';
        console.log({ sapResponse })
        // res.status(201).json({
        //     message: 'Entrega grabada con éxito',
        //     deliveryN44umber: deliveryNumber,
        //     status: sapResponse.status,
        //     statusText: sapResponse.statusText,
        //     //requestData: req.body,
        //     responseData: responseJson
        // });
        console.log('Nueva Entrega: #', deliveryNumber);
        return {
            message: 'Entrega grabada con éxito',
            deliveryN44umber: deliveryNumber,
            status: sapResponse.status,
            statusText: sapResponse.statusText,
            //requestData: req.body,
            responseData: responseJson
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud POST para Entrega:', error.response?.data || error.message);
        return errorMessage
    }
};

module.exports = {
    postOrden,
    postEntrega,
}