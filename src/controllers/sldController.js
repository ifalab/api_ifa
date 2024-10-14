const axios = require('axios');
const https = require('https');
/////////////////////////////////////////////
const hanaController = require('./hanaController.js');
///////////////////////////////////////

// Configura el agente para deshabilitar la verificación del certificado
const agent = new https.Agent({ rejectUnauthorized: false });

// Variable para almacenar el estado de la sesión
let session = null;

// Función para conectar y obtener la sesión
const connectSLD = async () => {
  try {
    const url = 'https://172.16.11.25:50000/b1s/v1/Login';
    const data = {
      CompanyDB: process.env.DBSAP,
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

// Controlador para manejar la solicitud POST
exports.postOrden = async (req, res) => {
  try {
    let sessionSldId = null;

    // Verifica si ya hay una sesión activa
    if (session && session.SessionId) {
      console.log('Session', session);
      sessionSldId = session.SessionId;
    } else {
      // Si no hay sesión activa, llama a connectSLD para crear una nueva sesión
      const newSession = await connectSLD();
      console.log('Nueva session', newSession);
      sessionSldId = newSession.SessionId;
    }

    // Datos a enviar en la solicitud POST
    const orderData = req.body;
    // console.log(orderData)

    const { DocDate, PaymentGroupCode } = orderData


    const docDueDate = await hanaController.getDocDueDate(DocDate, PaymentGroupCode)
    const DocDueDate = docDueDate[0]
    const newOrderDate = { ...DocDueDate, ...orderData }

    // //! PRUEBA JSON, ELIMINAR DESPUES:
    // return res.status(200).json({newOrderDate})
    // //! ------------------------------

    try {
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

      // Envía una respuesta exitosa con mensaje personalizado
      res.status(201).json({
        message: 'Orden grabada con éxito',
        orderNumber: orderNumber,
        status: response.status,
        statusText: response.statusText
      });

      console.log('Nueva Orden: #', orderNumber)

    } catch (error) {
      // Manejo de errores para la solicitud POST
      console.error('Error en la solicitud POST para Orden de Venta:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ message: error.response?.data?.error?.message || 'Error en la solicitud POST para Orden de Venta' });
    }

  } catch (error) {
    // Manejo de errores
    console.error('Error en postOrden:', error.message);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};

/////////////////////////////////////////////////////////////////////////////


// Controlador para manejar la solicitud POST de consulta de batch
exports.postEntrega = async (req, res) => {
  try {
    const { CardCode, DocDate, DocDueDate, DocumentLines } = req.body;

    if (!DocumentLines || DocumentLines.length === 0) {
      return res.status(400).json({ message: 'DocumentLines no puede estar vacío' });
    }

    const processedLines = [];

    let baseLineCounter = 0;  // Contador para BaseLine y LineNum

    for (const line of DocumentLines) {
      const { ItemCode, WarehouseCode, Quantity, UnitPrice, TaxCode } = line;

      // Obtener datos de batch desde hanaController
      const batchData = await hanaController.getLotes(ItemCode, WarehouseCode, Quantity);

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

    // JSON final a enviar a SAP
    const responseJson = {
      CardCode,
      DocDate,
      DocDueDate,
      DocumentLines: processedLines
    };

    console.log('Datos a enviar a SAP:', JSON.stringify(responseJson, null, 2));

    // Manejar la sesión SLD
    let sessionSldId = session && session.SessionId ? session.SessionId : null;

    if (!sessionSldId) {
      const newSession = await connectSLD();
      sessionSldId = newSession.SessionId;
    }

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content'
    };


    // Intentar hacer la solicitud POST a SAP
    try {
      const url = 'https://srvhana:50000/b1s/v1/DeliveryNotes';
      const sapResponse = await axios.post(url, responseJson, {
        httpsAgent: agent,
        headers: headers
      });

      const locationHeader = sapResponse.headers.location;
      const deliveryNumberMatch = locationHeader.match(/\((\d+)\)$/);
      const deliveryNumber = deliveryNumberMatch ? deliveryNumberMatch[1] : 'Desconocido';

      res.status(201).json({
        message: 'Entrega grabada con éxito',
        deliveryN44umber: deliveryNumber,
        status: sapResponse.status,
        statusText: sapResponse.statusText,
        //requestData: req.body,
        responseData: responseJson
      });

      console.log('Nueva Entrega: #', deliveryNumber);

    } catch (error) {
      console.error('Error en la solicitud POST para Entrega:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ message: error.response?.data || 'Error en la solicitud POST para Entrega' });
    }

  } catch (error) {
    console.error('Error en postEntrega:', error.message);
    res.status(500).json({ message: error.message });
  }
};