/**
 * Cliente para interactuar con las APIs del Banco Ganadero para pagos QR
 * Basado en especificación técnica Cobros & Pagos con QR v1.10
 */

const axios = require('axios');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configuración del cliente
const config = {
    baseUrl: 'https://api.bg.com.bo/bgqa/ws-servicio-codigo-qr-empresas',
    apiKey: process.env.X_API_KEY,
    username: process.env.QR_USERNAME,
    password: process.env.QR_PASSWORD,
    accountReference: process.env.ACCOUNT_REFERENCE
};

let authToken = null; // Token de autenticación

/**
 * Autenticar con el banco y obtener token (Punto 2 del documento)
 * @returns {Promise<Object>} Resultado de la autenticación
 */
const autenticarConBanco = async () => {
    try {
        console.log('[BANCO-QR] Iniciando autenticación con el banco...');
        console.log('[BANCO-QR] Usuario:', config.username);

        // URL completa para autenticación
        const authUrl = `${config.baseUrl}/service/v1/qrcode/access`;
        console.log('[BANCO-QR] URL de autenticación:', authUrl);

        const response = await axios({
            method: 'post',
            url: authUrl,
            data: {
                userName: config.username,
                password: config.password
            },
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': config.apiKey
            }
        });

        // console.log('[BANCO-QR] Respuesta de autenticación:', response.data);

        // if (response.data.result === 'COD000') {
        //     authToken = response.data.token;
        //     console.log('[BANCO-QR] Token recibido y almacenado');
        // }

        return response.data;
    } catch (error) {
        console.error('[BANCO-QR] Error en autenticación:', error.message);
        if (error.response) {
            console.error('[BANCO-QR] Detalles del error:', error.response.data);
            console.error('[BANCO-QR] Status:', error.response.status);
        }
        throw error;
    }
};

/**
 * Generar orden de cobro QR (Punto 3 del documento)
 * @param {Object} ordenData - Datos de la orden de cobro
 * @returns {Promise<Object>} Resultado de la generación del QR
 */
const generarOrdenQR = async (ordenData) => {
    try {
        if (!authToken) {
            console.log('[BANCO-QR] No hay token, autenticando primero...');
            await autenticarConBanco();
        }

        console.log('[BANCO-QR] Generando orden de cobro QR...');

        // URL completa para generar QR
        const qrUrl = `${config.baseUrl}/service/v1/qrcode/collections`;
        console.log('[BANCO-QR] URL para generar QR:', qrUrl);

        // Datos obligatorios según la documentación
        const datosOrden = {
            accountReference: config.accountReference,
            amount: ordenData.monto,
            currency: ordenData.moneda || 'BOB',
            expirationDate: ordenData.fechaExpiracion || obtenerFechaExpiracion(),
            userName: config.username,
            apiKey: config.apiKey,
            // Datos opcionales
            reference: ordenData.referencia || '',
            transactionId: ordenData.transaccionId || '',
            gloss: ordenData.glosa || '',
            singleUse: ordenData.usoUnico !== undefined ? ordenData.usoUnico : 1
        };

        const response = await axios({
            method: 'post',
            url: qrUrl,
            data: datosOrden,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        // console.log('[BANCO-QR] Respuesta de generación QR:', response.data);

        // // Guardar imagen QR si está disponible
        // if (response.data.qrImage && ordenData.guardarImagenQR) {
        //     guardarImagenQR(response.data.qrImage, ordenData.rutaGuardar || './qr-pago.png');
        // }

        return response.data;
    } catch (error) {
        console.error('[BANCO-QR] Error al generar QR:', error.message);
        if (error.response) {
            console.error('[BANCO-QR] Detalles del error:', error.response.data);
        }
        throw error;
    }
};

/**
 * Anular orden de cobro QR (Punto 4 del documento)
 * @param {string} qrId - Identificador del QR
 * @returns {Promise<Object>} Resultado de la anulación
 */
const anularOrdenQR = async (qrId) => {
    try {
        if (!authToken) {
            console.log('[BANCO-QR] No hay token, autenticando primero...');
            await autenticarConBanco();
        }

        console.log(`[BANCO-QR] Anulando orden de cobro QR: ${qrId}`);

        // URL completa para anular QR
        const cancelUrl = `${config.baseUrl}/service/v1/qrcode/cancellations`;
        console.log('[BANCO-QR] URL para anular QR:', cancelUrl);

        const response = await axios({
            method: 'post',
            url: cancelUrl,
            data: {
                qrId,
                userName: config.username,
                apiKey: config.apiKey
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        // console.log('[BANCO-QR] Respuesta de anulación:', response.data);
        return response.data;
    } catch (error) {
        console.error('[BANCO-QR] Error al anular QR:', error.message);
        if (error.response) {
            console.error('[BANCO-QR] Detalles del error:', error.response.data);
        }
        throw error;
    }
};

/**
 * Listar órdenes de cobro/pago diario (Punto 5 del documento)
 * @param {string} fechaInicio - Fecha inicial en formato ddmmyyyy
 * @param {string} fechaFin - Fecha final en formato ddmmyyyy
 * @returns {Promise<Object>} Lista de órdenes
 */
const listarOrdenesQR = async (fechaInicio, fechaFin) => {
    try {
        if (!authToken) {
            console.log('[BANCO-QR] No hay token, autenticando primero...');
            await autenticarConBanco();
        }

        console.log(`[BANCO-QR] Listando órdenes de cobro/pago: ${fechaInicio} - ${fechaFin}`);

        // URL completa para listar órdenes
        const listUrl = `${config.baseUrl}/service/v1/qrcode/transactions`;
        console.log('[BANCO-QR] URL para listar órdenes:', listUrl);

        const response = await axios({
            method: 'post',
            url: listUrl,
            data: {
                userName: config.username,
                startDate: fechaInicio,
                endDate: fechaFin,
                apiKey: config.apiKey
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        // console.log('[BANCO-QR] Respuesta de listado de órdenes:', response.data);
        return response.data;
    } catch (error) {
        console.error('[BANCO-QR] Error al listar órdenes:', error.message);
        if (error.response) {
            console.error('[BANCO-QR] Detalles del error:', error.response.data);
        }
        throw error;
    }
};

/**
 * Consultar estado de una orden QR (Punto 6 del documento)
 * @param {string} qrId - Identificador del QR
 * @returns {Promise<Object>} Estado de la orden
 */
const consultarEstadoQR = async (qrId) => {
    try {
        if (!authToken) {
            console.log('[BANCO-QR] No hay token, autenticando primero...');
            await autenticarConBanco();
        }

        console.log(`[BANCO-QR] Consultando estado del QR: ${qrId}`);

        // URL completa para consultar estado
        const statusUrl = `${config.baseUrl}/service/v1/qrcode/status`;
        console.log('[BANCO-QR] URL para consultar estado:', statusUrl);

        const response = await axios({
            method: 'post',
            url: statusUrl,
            data: {
                qrId,
                userName: config.username,
                apiKey: config.apiKey
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        // console.log('[BANCO-QR] Respuesta de consulta de estado:', response.data);

        // Interpretar estado según documentación
        let estadoTexto = 'Desconocido';
        if (response.data.orderState) {
            switch (response.data.orderState) {
                case '1': estadoTexto = 'Registrado'; break;
                case '2': estadoTexto = 'Pagado'; break;
                case '3': estadoTexto = 'Anulado'; break;
            }
            console.log(`[BANCO-QR] Estado de la orden: ${estadoTexto} (${response.data.orderState})`);
        }

        return response.data;
    } catch (error) {
        console.error('[BANCO-QR] Error al consultar estado del QR:', error.message);
        if (error.response) {
            console.error('[BANCO-QR] Detalles del error:', error.response.data);
        }
        throw error;
    }
};

/**
 * Generar una fecha de expiración por defecto (un mes a partir de hoy)
 * @returns {string} Fecha en formato ddmmyyyy
 */
const obtenerFechaExpiracion = () => {
    const hoy = new Date();
    const unMesDespues = new Date(hoy);
    unMesDespues.setMonth(hoy.getMonth() + 1);

    const dia = String(unMesDespues.getDate()).padStart(2, '0');
    const mes = String(unMesDespues.getMonth() + 1).padStart(2, '0');
    const anio = unMesDespues.getFullYear();

    return `${dia}${mes}${anio}`;
};

/**
 * Guardar imagen QR en un archivo
 * @param {string} imagenBase64 - Imagen en formato base64
 * @param {string} ruta - Ruta donde guardar el archivo
 */
const guardarImagenQR = (imagenBase64, ruta) => {
    try {
        const fs = require('fs');
        const base64Data = imagenBase64.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(ruta, Buffer.from(base64Data, 'base64'));
        console.log(`[BANCO-QR] Imagen QR guardada en: ${ruta}`);
    } catch (error) {
        console.error('[BANCO-QR] Error al guardar imagen QR:', error);
    }
};

/**
 * Obtener el token actual
 * @returns {string|null} Token actual o null si no existe
 */
const getToken = () => {
    return authToken;
};

module.exports = {
    autenticarConBanco,
    generarOrdenQR,
    anularOrdenQR,
    listarOrdenesQR,
    consultarEstadoQR,
    getToken
};