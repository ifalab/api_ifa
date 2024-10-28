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
            CompanyDB: process.env.DBSAPTEST,
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


// Controlador para manejar la solicitud POST de salida de inventario
const asientoContable = async (data) => {
    try {
        // Verifica o genera una sesión
        // console.log('sld data -----------------------------------------------')
        console.log({ ...data })
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const url = 'https://srvhana:50000/b1s/v1/JournalEntries';

        // Configura los encabezados para la solicitud
        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
        };

        // Realiza la solicitud POST
        const response = await axios.post(url, { ...data }, {
            httpsAgent: agent,
            headers: headers
        });

        // Retorna la respuesta en caso de éxito
        console.log({ response })
        const status = response.status
        const location = response.headers.location
        const locationHeader = response.headers.location;
        const orderNumberMatch = locationHeader.match(/\((\d+)\)$/);
        const orderNumber = orderNumberMatch ? orderNumberMatch[1] : 'Desconocido';
        // console.log({location})
        // // console.log({response})
        // console.log({status})
        // // if(response.statusCode){}else{}
        return { status, orderNumber };
    } catch (error) {
        // Centraliza el manejo de errores
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud POST para  asientoContable:', errorMessage);
        return errorMessage
        // throw new Error(errorMessage);
    }
};

const findOneAsientoContable = async (id_asiento) => {
    try {
        // Verifica o genera una sesión
        // console.log('sld id_asiento -----------------------------------------------')
        console.log({id_asiento:+id_asiento })
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const url = `https://srvhana:50000/b1s/v1/JournalEntries(${+id_asiento})`;

        // Configura los encabezados para la solicitud
        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
        };

        // Realiza la solicitud POST
        const response= await axios.get(url,{
            httpsAgent: agent,
            headers: headers
        });
        // console.log({response})
        const value = response.lang
        const data = response.data
        if(value) return response.data
        return data;
    } catch (error) {
        // Centraliza el manejo de errores
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud GET para  findOneAsientoContable:', errorMessage);
        return errorMessage
        // throw new Error(errorMessage);
    }
}
module.exports = {
    asientoContable,
    findOneAsientoContable,
}