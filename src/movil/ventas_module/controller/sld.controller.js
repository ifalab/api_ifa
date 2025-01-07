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
            CompanyDB: process.env.DBSAPPRD,
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
        console.log({newOrderDate})
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
        return {
            message: 'Hubo un problema en la solicitud',
            status: 400,
            errorMessage
        }
    }

};

/////////////////////////////////////////////////////////////////////////////
// Controlador para manejar la solicitud POST de consulta de batch
const postEntrega = async (responseJson) => {

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

        console.log('Nueva Entrega: #', deliveryNumber);
        return {
            message: 'Entrega grabada con éxito',
            deliveryN44umber: deliveryNumber,
            status: sapResponse.status,
            statusText: sapResponse.statusText,
            responseData: responseJson
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud POST para Entrega:', error.response?.data || error.message);
        return errorMessage
    }
};

const postInvoice = async (CardCode, DocumentLines) => {
    try {
        const responseJson = { CardCode, DocumentLines }
        // return responseJson
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = 'https://srvhana:50000/b1s/v1/Invoices';
        const sapResponse = await axios.post(url, responseJson, {
            httpsAgent: agent,
            headers: headers
        });
        return sapResponse
    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        return errorMessage
    }
}

const findOneInvoice = async (id) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/Invoices(${id})`
        const sapResponse = await axios.get(url, {
            httpsAgent: agent,
            headers: headers
        });
        return sapResponse
    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud GET';
        return errorMessage
    }
}

const updateInvoice = async (id, DocDueDate) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/Invoices(${id})`
        const sapResponse = await axios.patch(url, { DocDueDate }, {
            httpsAgent: agent,
            headers: headers
        });
        return sapResponse
    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud GET';
        return errorMessage
    }
}

const findAllIncomingPayment = async () => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/IncomingPayments`
        const sapResponse = await axios.get(url, {
            httpsAgent: agent,
            headers: headers
        });
        return sapResponse

    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud GET';
        return errorMessage
    }
}

const findOneIncomingPayment = async (id) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/IncomingPayments(${id})`
        const sapResponse = await axios.get(url, {
            httpsAgent: agent,
            headers: headers
        });
        return sapResponse

    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud GET';
        return errorMessage
    }
}

const findOneByCardCodeIncomingPayment = async (code) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        // console.log({ code })
        const url = `https://srvhana:50000/b1s/v1/IncomingPayments?$filter=CardCode eq '${code}'`
        console.log({ url })
        const sapResponse = await axios.get(url, {
            httpsAgent: agent,
            headers: headers
        });
        return sapResponse

    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud GET';
        return errorMessage
    }
}

const createIncomingPayment = async (data) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };

        const url = `https://srvhana:50000/b1s/v1/IncomingPayments`
        console.log({ url })
        console.log({ data })
        const sapResponse = await axios.post(url, data, {
            httpsAgent: agent,
            headers: headers
        });
        return sapResponse

    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud GET';
        return errorMessage
    }
}

const cancelIncomingPayment = async (id) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };

        const url = `https://srvhana:50000/b1s/v1/IncomingPayments(${id})/Cancel`
        
        const sapResponse = await axios.post(url,{}, {
            httpsAgent: agent,
            headers: headers
        });
        return sapResponse
    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud GET';
        return errorMessage
    }
}
module.exports = {
    postOrden,
    postEntrega,
    postInvoice,
    findOneInvoice,
    updateInvoice,
    findAllIncomingPayment,
    findOneIncomingPayment,
    findOneByCardCodeIncomingPayment,
    createIncomingPayment,
    cancelIncomingPayment
}
