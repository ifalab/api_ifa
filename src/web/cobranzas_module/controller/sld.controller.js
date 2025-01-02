const axios = require('axios');
const https = require('https');
/////////////////////////////////////////////

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

//TODO --------------------------------------------- CONEXION A OTRA BD DEL SLD
// Variable para almacenar el estado de la sesión
let sessionCC = null;

// Función para conectar y obtener la sesión
const connectSLDCC = async () => {
    try {
        const url = 'https://172.16.11.25:50000/b1s/v1/Login';
        const data = {
            CompanyDB: process.env.DBSAPCCQA,
            UserName: process.env.USERSAP,
            Password: process.env.PASSSAP
        };

        // Realiza la solicitud POST a la API externa usando el agente
        const response = await axios.post(url, data, { httpsAgent: agent });

        // Guarda la sesión en la variable global
        sessionCC = response.data;

        return response.data;
    } catch (error) {
        // Manejo de errores
        console.error('Error de logueo al SLD', error.message);
        throw new Error('Error de logueo al SLD');
    }
};


// Verifica si la sesión sigue siendo válida
const validateSessionCC = async () => {
    if (!sessionCC || !sessionCC.SessionId) {
        return await connectSLDCC();
    }
    // Puedes implementar una validación adicional si lo deseas, como hacer una solicitud de prueba aquí.
    return sessionCC;
};
//TODO----------------------------------------------
const postIncommingPayments = async (body) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const url = `https://172.16.11.25:50000/b1s/v1/IncomingPayments`;

        // Configura los encabezados para la solicitud
        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
        };

        // Realiza la solicitud POST
        const response = await axios.post(url, body, {
            httpsAgent: agent,
            headers: headers
        });
        return {
            status: 200,
            data: response.data,
            response,
        };
    } catch (error) {
        // Centraliza el manejo de errores
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud POST para  postIncommingPayments:', errorMessage);
        return {
            status: 400,
            errorMessage
        }
    }
}
module.exports = {
    postIncommingPayments,
}