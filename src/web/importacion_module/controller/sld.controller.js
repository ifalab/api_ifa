const axios = require('axios');
const https = require('https');
/////////////////////////////////////////////

// Configura el agente para deshabilitar la verificación del certificado
const agent = new https.Agent({ rejectUnauthorized: false });

let session = null
const REQUEST_TIMEOUT = 65000; 

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

const postReserveInvoice = async (id,responseJson) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/PurchaseInvoices`;
        const sapResponse = await axios.post(url, responseJson, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });

        return {
            status: sapResponse.status,
            data: sapResponse.data,
            message: sapResponse.message || ''
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud patch';
        console.error('Error en la solicitud patch para patchPersons:', error.response?.data || error.message);
        return {
            status: error.status || 400,
            message: errorMessage}
    }
};

module.exports = {
    postReserveInvoice
}