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
            CompanyDB: process.env.DBSAPCOM,
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

const postInventoryEntries = async (data) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        // newOrderDate.Series = process.env.SAP_SERIES_ORDER
        data.Series = process.env.SAP_SERIES_INVENTORY_GEN_EXISTS
        const url = 'https://srvhana:50000/b1s/v1/InventoryGenEntries';
        const sapResponse = await axios.post(url, {...data}, {
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
module.exports = {
    postInventoryEntries,
}
