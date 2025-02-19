const axios = require('axios');
const https = require('https');
const { obtenerEntregaDetalle } = require("./hana.controller")

const agent = new https.Agent({ rejectUnauthorized: false })

let session = null
const REQUEST_TIMEOUT = 65000; 

const connectSLD = async () => {
    try {
        const url = 'https://172.16.11.25:50000/b1s/v1/Login';
        const data = {
            CompanyDB: process.env.DBSAPPRD,
            UserName: process.env.USERSAP,
            Password: process.env.PASSSAP
        }
        const response = await axios.post(url, data, { 
            httpsAgent: agent,
            timeout: REQUEST_TIMEOUT
         });
        session = response.data;

        return response.data;
    } catch (error) {
        console.error('Error de logueo al SLD', error.message);
        throw new Error('Error de logueo al SLD');
    }
}

const validateSession = async () => {
    if (!session || !session.SessionId) {
        return await connectSLD();
    }
    return session;
};

const postInventoryTransferRequests = async (responseJson) => {

    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = 'https://srvhana:50000/b1s/v1/InventoryTransferRequests';
        const sapResponse = await axios.post(url, responseJson, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });
        console.log({postResponse: sapResponse})
        const locationHeader = sapResponse.headers.location;
        const deliveryNumberMatch = locationHeader.match(/\((\d+)\)$/);
        const deliveryNumber = deliveryNumberMatch ? deliveryNumberMatch[1] : 'Desconocido';
        return {
            message: 'Solicitud grabada con éxito',
            status: sapResponse.status,
            statusText: sapResponse.statusText,
            deliveryNumber: deliveryNumber,
        }
    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud POST InventoryTransferRequests:', error.response?.data || error.message);
        return errorMessage
    }
};

module.exports = {
    postInventoryTransferRequests
}