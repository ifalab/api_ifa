const axios = require('axios');
const https = require('https');
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
        const response = await axios.post(url, data, { httpsAgent: agent });
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

const patchBusinessPartners = async (cardCode, body) => {

    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        console.error({ cardCode, body })
        const url = `https://srvhana:50000/b1s/v1/BusinessPartners('${cardCode}')`
        const sapResponse = await axios.patch(url, { ...body }, {
            httpsAgent: agent,
            headers: headers
        });

        return {
            message: 'Patch Business Partners grabada con éxito',
            status: sapResponse.status || 200,
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Patch Business Partners';
        console.error('Error en la solicitud Patch Business Partners:', error.response?.data || error.message);
        return {
            errorMessage,
            status: 400,
        }
    }
};

const getBusinessPartners = async (cardCode) => {

    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        console.error({ cardCode })
        const url = `https://srvhana:50000/b1s/v1/BusinessPartners('${cardCode}')`
        const sapResponse = await axios.get(url, {
            httpsAgent: agent,
            headers: headers
        });
        console.log({ sapResponse })
        return {
            message: 'get Business Partners grabada con éxito',
            status: sapResponse.status || 200,
            data:sapResponse.data||{}
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud get Business Partners';
        console.error('Error en la solicitud get Business Partners:', error.response?.data || error.message);
        return {
            errorMessage,
            status: 400,
        }
    }
};



const patchItems = async (itemCode, payload) => {
    try {
        const currentSession = await validateSession(); // Obtiene la sesión actual
        const sessionSldId = currentSession.SessionId;

        const headers = {
            'Content-Type': 'application/json', // Indispensable para enviar el body JSON
            'Cookie': `B1SESSION=${sessionSldId}`,
            'Prefer': 'return-no-content' // Le indica a B1S que no envíe el objeto completo en la respuesta
            // NOTA: 'x-csrf-token' NO incluido aquí, siguiendo tu ejemplo.
            // Si experimentas errores 403 Forbidden o CSRF, este será el primer lugar a revisar.
        };
        
        // La URL debe apuntar a la entidad Items con el ItemCode
        const url = `https://srvhana:50000/b1s/v1/Items('${itemCode}')`; // <-- URL para actualizar un artículo

        console.log(`Intentando PATCH al artículo: ${itemCode} con payload:`, payload);

        // Realiza la petición PATCH con axios
        const sapResponse = await axios.patch(url, payload, { // El payload (LineItemCode, SubLineItemCode) va aquí
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });

        console.log('Respuesta de SAP B1 Service Layer (PATCH):', sapResponse.status);

        // Si la operación es exitosa con 'Prefer: return-no-content', el status será 204 No Content
        return {
            status: sapResponse.status, 
            data: sapResponse.data || {}, // Estará vacío si se usa 'return-no-content'
            message: 'Artículo actualizado con éxito en SAP Business One.'
        };

    } catch (error) {
        // Manejo de errores detallado
        const errorMessage = error.response?.data?.error?.message?.value || error.message || 'Error desconocido al actualizar el artículo.';
        console.error('Error en la solicitud PATCH para el artículo:', error.response?.data || error.message);
        return {
            status: error.response?.status || 500, // Usa el status de la respuesta de error de SAP si está disponible
            message: errorMessage
        };
    }
};

module.exports = {
    patchBusinessPartners,
    getBusinessPartners,
    patchItems
}
