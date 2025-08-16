const axios = require('axios');
const https = require('https');
/////////////////////////////////////////////

// Configura el agente para deshabilitar la verificación del certificado
const agent = new https.Agent({ rejectUnauthorized: false });

// Variable para almacenar el estado de la sesión
let session = null;


const REQUEST_TIMEOUT = 30000; 

// Función para conectar y obtener la sesión
const connectSLD = async () => {
  try {
    const url = 'https://srvhana:50000/b1s/v1/Login';
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

const getSession = async () => {
  // Si no hay sesión, o si la sesión existente ha expirado o está a punto de expirar
  if (!session || !session.SessionId || Date.now() >= sessionExpirationTime) {
      console.log('Sesión no existente o expirada/a punto de expirar. Intentando reconectar...');
      return await connectSLD(); // Reconecta si es necesario
  }
  console.log('Usando sesión existente y válida.');
  return session; // Retorna la sesión existente
};


// Controlador para manejar la solicitud POST de salida de inventario
const postSalidaHabilitacion = async (data) => {
  try {
    // Verifica o genera una sesión
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = 'https://srvhana:50000/b1s/v1/InventoryGenExits';

    // Configura los encabezados para la solicitud
    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
    };

    // Realiza la solicitud POST
    data.Series = process.env.SAP_SERIES_INVENTORY_GEN_EXISTS
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
    console.log(JSON.stringify({ data }, null, 2))
    const currentSession = await validateSession();
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
    data.Series = process.env.SAP_SERIES_INVENTORY_GEN_ENTRY
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
    console.error('Error en la solicitud POST para postEntradaHabilitacion:', errorMessage);
    // throw new Error(errorMessage);
    return errorMessage
  }
};



const patchBatchNumberDetails = async (batchNumberId, payload) => {
    try {
        // 1. Obtiene la sesión actual
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        // 2. Define los encabezados
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': `B1SESSION=${sessionSldId}`,
            'Prefer': 'return-no-content'
        };
        
        // 3. Define la URL para el PATCH
        // La URL debe apuntar a la entidad BatchNumberDetails usando el ID del lote
        const url = `https://srvhana:50000/b1s/v1/BatchNumberDetails(${batchNumberId})`;

        console.log(`Intentando PATCH al lote con ID: ${batchNumberId} con payload:`, payload);

        // 4. Realiza la petición PATCH con axios
        const sapResponse = await axios.patch(url, payload, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT // Asegúrate de que esta constante esté definida
        });

        console.log('Respuesta de SAP B1 Service Layer (PATCH):', sapResponse.status);

        // 5. Retorna la respuesta
        return {
            status: sapResponse.status, 
            message: 'Lote actualizado con éxito en SAP Business One.'
        };

    } catch (error) {
        // 6. Manejo de errores
        const errorMessage = error.response?.data?.error?.message?.value || error.message || 'Error desconocido al actualizar el lote.';
        console.error('Error en la solicitud PATCH para el lote:', error.response?.data || error.message);
        return {
            status: error.response?.status || 500,
            message: errorMessage
        };
    }
};


const getBatchNumberDetails = async () => {
    try {
        // 1. Verifica o genera una sesión de SAP
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        // 2. Define la URL del endpoint
        const url = 'https://srvhana:50000/b1s/v1/BatchNumberDetails';

        // 3. Configura los encabezados, incluyendo la cookie de sesión
        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`
        };

        console.log('Intentando obtener la lista de BatchNumberDetails...');

        // 4. Realiza la solicitud GET con axios
        const response = await axios.get(url, {
            httpsAgent: agent,
            headers: headers
        });

        console.log(`Solicitud GET exitosa. Status: ${response.status}`);
        
        // 5. La respuesta de SAP B1 es un objeto con una propiedad 'value' que contiene el arreglo de datos.
        const batchNumberDetails = response.data.value;

        // 6. Retorna el arreglo de los detalles de los lotes
        return batchNumberDetails;

    } catch (error) {
        // Manejo de errores centralizado
        const errorMessage = error.response?.data?.error?.message?.value || error.message || 'Error desconocido en la solicitud GET para BatchNumberDetails.';
        console.error('Error al obtener los detalles de lotes:', errorMessage);
        
        // Retorna un objeto de error para ser manejado por el controller
        return {
            error: true,
            status: error.response?.status || 500,
            message: errorMessage
        };
    }
};



const postReturn = async (data) => {
  try {
    // Verifica o genera una sesión
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = 'https://srvhana:50000/b1s/v1/Returns';

    // Configura los encabezados para la solicitud
    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content', // Si deseas que la respuesta no incluya contenido
      timeout: REQUEST_TIMEOUT
    };
    // Realiza la solicitud POST
    data.Series = process.env.SAP_SERIES_RETURN
    const response = await axios.post(url, { ...data }, {
      httpsAgent: agent,
      headers: headers
    });
    console.log({ responseReturns: response })

    // Retorna la respuesta en caso de éxito
    const status = response.status
    const locationHeader = response.headers.location;
    const orderNumberMatch = locationHeader.match(/\((\d+)\)$/);
    const orderNumber = orderNumberMatch ? orderNumberMatch[1] : 'Desconocido';
    console.log('entrada habilitada')
    // console.log({ location })
    // console.log({response})
    console.log({ status })
    return { status, orderNumber};
  } catch (error) {
    // Centraliza el manejo de errores
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
    console.error('Error en la solicitud POST Returns:', errorMessage);
    // throw new Error(errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};

const postCreditNotes = async (data) => {
  try {
    // Verifica o genera una sesión
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    // console.log({ currentSession })

    const url = 'https://srvhana:50000/b1s/v1/CreditNotes';

    // Configura los encabezados para la solicitud
    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      //Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
    };
    // Realiza la solicitud POST
    data.Series = process.env.SAP_SERIES_CREDIT_NOTES
    const response = await axios.post(url, { ...data }, {
      httpsAgent: agent,
      headers: headers
    });
    // console.log({ responseCreditNotes: response })

    // Retorna la respuesta en caso de éxito
    const status = response.status
    const locationHeader = response.headers.location;
    const orderNumberMatch = locationHeader.match(/\((\d+)\)$/);
    const orderNumber = orderNumberMatch ? orderNumberMatch[1] : 'Desconocido';
    console.log({ CNnumber: orderNumber })

    const datos = response.data
    // console.log({ location })
    console.log({datos})
    console.log({ status })
    return { status, orderNumber, TransNum: datos.TransNum };
  } catch (error) {
    // Centraliza el manejo de errores
    console.log({ errorCreditNotes: error })
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST CreditNotes';
    console.error('Error en la solicitud POST CreditNotes:', errorMessage);
    // throw new Error(errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};

const patchReturn = async (data, id) => {
  try {
    // Verifica o genera una sesión
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = `https://srvhana:50000/b1s/v1/Returns(${id})`;

    // Configura los encabezados para la solicitud
    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
    };
    // Realiza la solicitud PATCH
    const response = await axios.patch(url, { ...data }, {
      httpsAgent: agent,
      headers: headers
    });
    console.log({ responseReturnsPatch: response })

    // Retorna la respuesta en caso de éxito
    // const status = response.status
    // const locationHeader = response.headers.location;
    // const orderNumberMatch = locationHeader.match(/\((\d+)\)$/);
    // const orderNumber = orderNumberMatch ? orderNumberMatch[1] : 'Desconocido';
    // console.log('entrada habilitada')
    // console.log({ location })
    // console.log({response})
    return response;
  } catch (error) {
    // Centraliza el manejo de errores
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud PATCH';
    console.error('Error en la solicitud PATCH Returns:', errorMessage);
    // throw new Error(errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};

const getCreditNote = async (id) => {
  try {
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;

    console.log({id})
    const url = `https://srvhana:50000/b1s/v1/CreditNotes(${id})`;

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
    };
    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: headers
    });
    console.log({ responseCreditNotes : response })

    return {
      status: 200,
      data: response.data
    };
  } catch (error) {
    console.log({errorCreditNotes: error})
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Get CreditNote';
    console.error('Error en la solicitud Get CreditNote:', errorMessage);
    // throw new Error(errorMessage);
    return {
      status: 400,
      errorMessage}
  }
};

const getCreditNotes = async () => {
  try {
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;

    const url = `https://srvhana:50000/b1s/v1/CreditNotes?$orderby=DocDate desc&$top=20`;

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' // Si deseas que la respuesta no incluya contenido
    };
    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: headers
    });
    console.log({ responseCreditNotes : response })

    return {
      status: 200,
      data: response.data.value
    }
  } catch (error) {
    console.log({errorCreditNotes: error})
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Get CreditNotes';
    console.error('Error en la solicitud Get CreditNotes:', errorMessage);
    // throw new Error(errorMessage);
    return {
      status: 400,
      errorMessage}
  }
};


const postReconciliacion = async (data) => {
  try {
    // Verifica o genera una sesión
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    // console.log({ currentSession })

    const url = `https://srvhana:50000/b1s/v1/InternalReconciliations`;

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content'
    };
    
    const response = await axios.post(url, { ...data }, {
      httpsAgent: agent,
      headers: headers
    });
    console.log({ responseReconciliacion: response })

    // Retorna la respuesta en caso de éxito
    const status = response.status
    const locationHeader = response.headers.location;
    const orderNumberMatch = locationHeader.match(/\((\d+)\)$/);
    const idReconciliacion = orderNumberMatch ? orderNumberMatch[1] : 'Desconocido';
    console.log({ idReconciliacion })
    // console.log({ location })
    // console.log({response})
    console.log({ status })
    return { status, idReconciliacion };
  } catch (error) {
    // Centraliza el manejo de errores
    console.log({ errorCreditNotes: error })
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido';
    console.error('Error en la solicitud POST Reconciliacion:', errorMessage);
    // throw new Error(errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};

const getReturns = async () => {
  try {
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = `https://srvhana:50000/b1s/v1/Returns?$orderby=DocDate desc&$top=20`;
    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' 
    };

    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: headers
    });

    console.log({ responseReturns: response })
   
    return {
      status: 200,
      data: response.data.value
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Get';
    console.error('Error en la solicitud Get Returns:', errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};

const cancelReturn = async (id) => {
  try {
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = `https://srvhana:50000/b1s/v1/Returns(${id})/Cancel`;

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' 
    };

    const response = await axios.post(url, { }, {
      httpsAgent: agent,
      headers: headers
    });

    console.log({ responseReturns: response })
   
    return { status: response.status };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Cancel';
    console.error('Error en la solicitud Cancel Returns:', errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};


const cancelEntrega = async (id) => {
  try {
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = `https://srvhana:50000/b1s/v1/DeliveryNotes(${id})/Cancel`;

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' 
    };

    const response = await axios.post(url, { }, {
      httpsAgent: agent,
      headers: headers
    });

    console.log({ responseReturns: response })
   
    return { status: response.status };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Cancel';
    console.error('Error en la solicitud Cancel Entrega:', errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};

const cancelCreditNotes = async (id) => {
  try {
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = `https://srvhana:50000/b1s/v1/CreditNotes(${id})/Cancel`;

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' 
    };

    const response = await axios.post(url, { }, {
      httpsAgent: agent,
      headers: headers
    });

    console.log({ responseCreditNotes: response })
   
    return { status: response.status };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido';
    console.error('Error en la solicitud Cancel CreditNotes:', errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};


const cancelReconciliacion = async (id) => {
  try {
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;

    const url = `https://srvhana:50000/b1s/v1/InternalReconciliations(${id})/Cancel`;

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content'
    };
    const response = await axios.post(url, { }, {
      httpsAgent: agent,
      headers: headers
    });
    console.log({ responseReconciliacion: response })

    return { status: response.status , data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido';
    console.error('Error en la solicitud POST Reconciliacion:', errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};
const cancelInvoice = async (id) => {
  try {
    const currentSession = await validateSession();
    const sessionSldId = currentSession.SessionId;
    console.log({ currentSession })

    const url = `https://srvhana:50000/b1s/v1/Invoices(${id})/Cancel`;

    const headers = {
      Cookie: `B1SESSION=${sessionSldId}`,
      Prefer: 'return-no-content' 
    };

    const response = await axios.post(url, { }, {
      httpsAgent: agent,
      headers: headers
    });

    console.log({ responseReturns: response })
   
    return { status: response.status };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Cancel';
    console.error('Error en la solicitud Cancel Invoice:', errorMessage);
    return {
      status: 400,
      errorMessage
    }
  }
};

module.exports = {
  postSalidaHabilitacion,
  postEntradaHabilitacion,
  postReturn,
  postCreditNotes,
  patchReturn,
  getCreditNote,
  getCreditNotes,
  postReconciliacion,
  cancelReturn, cancelEntrega, cancelCreditNotes,
  getReturns,
  cancelReconciliacion, cancelInvoice,
  patchBatchNumberDetails,getBatchNumberDetails
};