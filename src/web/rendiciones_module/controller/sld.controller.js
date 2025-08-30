const axios = require('axios');
const https = require('https');
/////////////////////////////////////////////

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


const cancelJournalEntry = async (ID) => {
    try {
        // 1. Obtiene la sesión actual
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        // 2. Define los encabezados
        const headers = {
            'Cookie': `B1SESSION=${sessionSldId}`,
            'Prefer': 'return-no-content'
        };
        
        // La URL debe apuntar a la entidad JournalEntries usando el ID 
        const url = `https://srvhana:50000/b1s/v1/JournalEntries(${ID})/Cancel`;

        console.log(`Intentando Cancelar al JournalEntry con ID: ${ID}`);
        console.log("URL:", url);
        console.log("HEADERS:", headers);
        // 4. Realiza la petición Post con axios
        const sapResponse = await axios.post(url, {}, {
            httpsAgent: agent,
            headers: headers
          
          });

        console.log('Respuesta de SAP B1 Service Layer (POST):', sapResponse.status);

        // 5. Retorna la respuesta
        return {
            status: sapResponse.status, 
            message: 'JournalEntry actualizado con éxito en SAP Business One.'
        };

    } catch (error) {
        // 6. Manejo de errores
        const errorMessage = error.response?.data?.error?.message?.value || error.message || 'Error desconocido al actualizar el lote.';
        console.error('Error en revertir el JournalEntry:', error.response?.data || error.message);
        return {
            status: error.response?.status || 500,
            message: errorMessage
        };
    }

};





module.exports = {
cancelJournalEntry
};