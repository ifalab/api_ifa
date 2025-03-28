const axios = require('axios');
const https = require('https');
const { obtenerEntregaDetalle } = require("./hana.controller");
const { Console } = require('console');

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

const postEntrega = async (responseJson) => {

    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = 'https://srvhana:50000/b1s/v1/DeliveryNotes';
        const sapResponse = await axios.post(url, responseJson, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });

        const locationHeader = sapResponse.headers.location;
        const deliveryNumberMatch = locationHeader.match(/\((\d+)\)$/);
        const deliveryNumber = deliveryNumberMatch ? deliveryNumberMatch[1] : 'Desconocido';
        // console.log({ sapResponse })
        const responseHana = await obtenerEntregaDetalle(deliveryNumber);
        console.log('Nueva Entrega: #', deliveryNumber);
        return {
            message: 'Entrega grabada con éxito',
            deliveryN44umber: deliveryNumber,
            status: sapResponse.status,
            statusText: sapResponse.statusText,
            responseData: responseHana,
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud POST para Entrega:', error.response?.data || error.message);
        return errorMessage
    }
};

const patchEntrega = async (delivery, responseJson) => {

    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;
        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/DeliveryNotes(${delivery})`
        const sapResponse = await axios.patch(url, responseJson, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });

        return {
            message: 'Patch Entrega grabada con éxito',
            status: sapResponse.status || 200,
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        console.error('Error en la solicitud PATCH para Entrega. ', error.response?.data || error.message ||'');
        return {
            errorMessage,
            status: 400,
        }
    }
};
const getEntrega = async (id) => {

    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/DeliveryNotes(${id})`;
        const sapResponse = await axios.get(url, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });
        return {
            status: sapResponse.status,
            statusText: sapResponse.statusText,
            data: sapResponse.data
        }

    } catch (error) {
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud Get';
        console.error('Error en la solicitud get para Entrega:', error.response?.data || error.message);
        return errorMessage
    }
};


const postInvoice = async (body) => {
    try {
        // const responseJson = { CardCode, DocumentLines }
        // return responseJson
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            //Prefer: 'return-no-content'
        };
        const url = 'https://172.16.11.25:50000/b1s/v1/Invoices';
        const sapResponse = await axios.post(url, body, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });
        const locationHeader = sapResponse.headers.location;
        const invoiceID = locationHeader.match(/\((\d+)\)$/);
        const idInvoice = invoiceID ? invoiceID[1] : 'Desconocido';

        const data = sapResponse.data
        console.log({dataInvoice: data})
        return { status: 200,
            // sapResponse,
            idInvoice, TransNum: data.TransNum }
    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message|| error.message|| 'Error desconocido en la solicitud POST';
        return {
            status: 400,
            errorMessage}
    }
}

const facturacionByIdSld = async (id) => {
    try {

        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/Orders(${id})`
        const sapResponse = await axios.get(url, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });
        return { data: sapResponse.data }
    } catch (error) {
        console.log({ error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        return errorMessage
    }
}

const cancelInvoice = async (id) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/Invoices(${id})/Cancel`
        const sapResponse = await axios.post(url, {}, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });
        console.log(sapResponse)
        return { data: sapResponse.data }
    } catch (error) {
        console.log("Error sld controller ", { error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        return errorMessage
    }
}

const cancelDeliveryNotes = async (id) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;

        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/DeliveryNotes(${id})/Cancel`
        const sapResponse = await axios.post(url, {}, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });
        console.log(sapResponse)
        return { data: sapResponse.data, status: 200 }
    } catch (error) {
        console.log("Error sld controller ", { error })
        const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido en la solicitud POST';
        return { errorMessage, status: 400, }
    }
}

const cancelOrder = async (id) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;
        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/Orders(${id})/Cancel`
        const sapResponse = await axios.post(url, {}, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });
        // console.log(sapResponse)
        return { data: sapResponse.data, status: 200 }
    } catch (error) {
        console.log("Error sld controller cancelOrder", { error })
        const errorMessage = error.response?.data?.error?.message || error.message || error.error.message || 'Error desconocido en la solicitud POST';
        return { errorMessage, status: 400 }
    }
}

const closeQuotations = async (id) => {
    try {
        const currentSession = await validateSession();
        const sessionSldId = currentSession.SessionId;
        const headers = {
            Cookie: `B1SESSION=${sessionSldId}`,
            Prefer: 'return-no-content'
        };
        const url = `https://srvhana:50000/b1s/v1/Quotations(${id})/Close`
        const sapResponse = await axios.post(url, {}, {
            httpsAgent: agent,
            headers: headers,
            timeout: REQUEST_TIMEOUT
        });
        
        return { data: sapResponse.data, status: 200 }
    } catch (error) {
        console.log("Error sld controller closeQuotations", { error })
        const errorMessage = error.response?.data?.error?.message || error.message || error.error.message || 'Error desconocido en la solicitud POST';
        return { errorMessage, status: 400, }
    }
}

module.exports = {
    postEntrega,
    postInvoice,
    patchEntrega,
    facturacionByIdSld,
    cancelInvoice,
    cancelDeliveryNotes,
    cancelOrder,
    closeQuotations,
    getEntrega
}