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


// Controlador para manejar la solicitud POST de salida de inventario
const postSalidaHabilitacion = async (data) => {
  try {
    // Verifica o genera una sesión
    const currentSession = await connectSLD();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = 'https://srvhana:50000/b1s/v1/InventoryGenExits';

    // Configura los encabezados para la solicitud
    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
    };

    // Realiza la solicitud POST
    const response = await axios.post(url, data, {
      httpsAgent: agent,
      headers: headers
    });

    // Retorna la respuesta en caso de éxito
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
    console.error('Error en la solicitud POST para Salida de Inventario:', errorMessage);
    return errorMessage
    // throw new Error(errorMessage);
  }
};

// Controlador para manejar la solicitud POST de salida de inventario
const postEntradaHabilitacion = async (data) => {
  try {
    // Verifica o genera una sesión
    const currentSession = await connectSLD();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = 'https://srvhana:50000/b1s/v1/InventoryGenEntries';

    // Configura los encabezados para la solicitud
    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
    };
    console.log('entrada habilitada - 2 ')
    // console.log({url})
    // console.log({headers})
    // console.log({agent})

    // Realiza la solicitud POST
    const response = await axios.post(url, { ...data }, {
      httpsAgent: agent,
      headers: headers
    });
    console.log('entrada habilitada - 3')
    console.log({ response })

    // Retorna la respuesta en caso de éxito
    const status = response.status
    const location = response.headers.location
    const locationHeader = response.headers.location;
    const orderNumberMatch = locationHeader.match(/\((\d+)\)$/);
    const orderNumber = orderNumberMatch ? orderNumberMatch[1] : 'Desconocido';
    console.log('entrada habilitada')
    console.log({ location })
    // // console.log({response})
    console.log({ status })
    // // if(response.statusCode){}else{}
    return { status, orderNumber };
  } catch (error) {
    // Centraliza el manejo de errores
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
    console.error('Error en la solicitud POST para Salida de Inventario:', errorMessage);
    // throw new Error(errorMessage);
    return errorMessage
  }
};

module.exports = {
  postSalidaHabilitacion,
  postEntradaHabilitacion
};