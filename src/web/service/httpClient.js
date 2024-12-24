const axios = require('axios');
const https = require('https');

// Crear una instancia personalizada de axios
const httpClient = axios.create({
    baseURL: process.env.API_NEST || 'https://api.example.com nest',
    timeout: 60000, // Tiempo de espera en milisegundos
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: `${process.env.TOKEN_NEST}`
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Permite certificados no verificados
    }),
});


// Interceptor para agregar un token de autenticación si es necesario
httpClient.interceptors.request.use(
    (config) => {

        console.log(`Token utilizado: ${process.env.TOKEN_NEST}`);
        console.log(`base url: ${process.env.API_NEST}`);
        return config; // Asegúrate de devolver la configuración
    },
    (error) => {

        console.log(`Token utilizado: ${process.env.TOKEN_NEST}`);
        console.log(`base url: ${process.env.API_NEST}`);
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
httpClient.interceptors.response.use(
    (response) => {
        // Puedes procesar la respuesta aquí si es necesario
        return response;
    },
    (error) => {
        // Manejo de errores centralizado
        if (error.response) {
            console.error(`[HTTP Error]: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
            console.error('[HTTP Error]: No response received from server');
        } else {
            console.error(`[HTTP Error]: ${error.message}`);
        }
        return Promise.reject(error);
    }
);

module.exports = httpClient;
