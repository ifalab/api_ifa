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

// Controlador para manejar la solicitud POST
const postSalidaHabilitacion = async(data) => {

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

        try {
            const url = 'https://srvhana:50000/b1s/v1/InventoryGenExits';
        
            // Configura los encabezados para incluir la cookie y el encabezado Prefer
            const headers = {
                Cookie: `B1SESSION=${sessionSldId}`,
                Prefer: 'return-no-content'
            };
        
            // Realiza la solicitud POST a la API externa usando el agente y los encabezados
            const response = await axios.post(url, data, {
                httpsAgent: agent,
                headers: headers
            });

        
            // Envía una respuesta exitosa con mensaje personalizado
            return response
        
            } catch (error) {
            // Manejo de errores para la solicitud POST
            console.error('Error en la solicitud POST para Orden de Venta:', error.response?.data || error.message);
            res.status(error.response?.status || 500).json({ message: error.response?.data?.error?.message || 'Error en la solicitud POST para Orden de Venta' });
            }

        } catch (error) {
            throw new Error ('Error en post Salida por Habilitacion:',error)
    }
    
    }

module.exports = {
    postSalidaHabilitacion
}