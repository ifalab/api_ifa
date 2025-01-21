const axios = require('axios');
const https = require('https');

// Crear un agente HTTPS con rejectUnauthorized: false
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const httpProsin = axios.create({
    baseURL: process.env.API_PROSIN || 'https://api.example.com prosin',
    timeout: 70000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic SUZBOkdlbmVzaXM6eg==`
    },
    httpsAgent,
});
// Interceptor para manejar respuestas
httpProsin.interceptors.response.use(
    (response) => {
        // Puedes procesar la respuesta aquí si es necesario
        return response;
    },
    (error) => {
        // Manejo de errores centralizado
        if (error.response) {
            console.error(`[HTTP Error]: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
            console.error('[HTTP Error]: No response received from server CLIENT PROSIN');
        } else {
            console.error(`[HTTP Error]: ${error.message}`);
        }
        return Promise.reject(error);
    }
);

module.exports = httpProsin;