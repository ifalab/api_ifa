const httpClientProsin = require('../../service/httpClientProsin');
const { grabarLog } = require('../../shared/controller/hana.controller');

const apiFacturacionProsin = {
    async facturacionProsin(body, user) {
        const startTime = Date.now();
        let endTime = Date.now();
        try {

            const response = await httpClientProsin.post('/api/sfl/FacturaCompraVenta', body);
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturacion tiempo de respuesta con exito", 'tiempo de espera: '+`[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturacion", process.env.PRD)
            console.log({response})
            return {
                statusCode: response.status,
                data: response.data,
            };
        } catch (error) {
            console.log({ error })
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Facturacion tiempo de respuesta con error", 'tiempo de espera: '+`[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/facturacion", process.env.PRD)
            if (error.response) {
                // Error específico de la API
                throw {
                    statusCode: error.response.status,
                    message: error.response.statusText + '. _currentUrl: https://lab2.laboratoriosifa.com:96/api/sfl/FacturaCompraVenta' || 'Error en la solicitud facturacionProsin POST',
                };
            }

            // Otros errores (como errores de red)
            throw {
                statusCode: 500,
                message: error.message + '. _currentUrl: https://lab2.laboratoriosifa.com:96/api/sfl/FacturaCompraVenta' || 'Error desconocido en la solicitud facturacionProsin POST',
            };
        }
    },
    async anulacionFacturacion(body, user) {
        const startTime = Date.now();
        let endTime = Date.now();
        try {
            console.log({ body })
            const response = await httpClientProsin.post('/api/sfl/AnulacionDocumento', { ...body });
            console.log({response})
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anulacion tiempo de respuesta con exito", 'tiempo de espera: '+`[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/anulacion", process.env.PRD)
            return {
                statusCode: response.status,
                data: response.data,
                query: 'https://lab2.laboratoriosifa.com:96/api/sfl/AnulacionDocumento'
            };
        } catch (error) {
            // Maneja los errores y propaga el error al controlador
            console.log({ error })
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Anulacion tiempo de respuesta con error", 'tiempo de espera: '+`[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/anulacion", process.env.PRD)
            if (error.response) {
                // Error específico de la API
                throw {
                    statusCode: error.response.status,
                    message: error.response.data + ' _currentUrl: https://lab2.laboratoriosifa.com:96/api/sfl/AnulacionDocumento' || 'Error en la solicitud anulacionFacturacion POST',
                };
            }

            // Otros errores (como errores de red)
            throw {
                statusCode: 500,
                message: error.message + ' _currentUrl: https://lab2.laboratoriosifa.com:96/api/sfl/AnulacionDocumento' || 'Error desconocido en la solicitud anulacionFacturacion POST',
            };
        }
    },

    async notaDebitoCredito(body, user) {
        const startTime = Date.now();
        let endTime = Date.now();
        try {
            console.log({ body })
            const response = await httpClientProsin.post('/api/sfl/NotaCreditoDebito', { ...body });
            console.log({response})
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Nota Debido Credito tiempo de respuesta con exito", 'tiempo de espera: '+`[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/NotaCreditoDebito", process.env.PRD)
            return {
                statusCode: response.data.estado,
                data: response.data,
                query: 'https://lab2.laboratoriosifa.com:96/api/sfl/NotaCreditoDebito'
            };
        } catch (error) {
            // Maneja los errores y propaga el error al controlador
            console.log({ error })
            endTime = Date.now();
            grabarLog(user.USERCODE, user.USERNAME, "Facturacion Nota Debido Credito de respuesta con error", 'tiempo de espera: '+`[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, `[${new Date().toISOString()}] Respuesta recibida. Tiempo transcurrido: ${endTime - startTime} ms`, "facturacion/NotaCreditoDebito", process.env.PRD)
            if (error.response) {
                // Error específico de la API
                throw {
                    statusCode: error.response.status,
                    message: error.response.data || 'Error en la solicitud NotaCreditoDebito POST',
                    query: 'https://lab2.laboratoriosifa.com:96/api/sfl/NotaCreditoDebito'
                };
            }

            // Otros errores (como errores de red)
            throw {
                statusCode: 500,
                message: error.message || 'Error desconocido en la solicitud NotaCreditoDebito POST',
                query: 'https://lab2.laboratoriosifa.com:96/api/sfl/NotaCreditoDebito'
            };
        }
    },
};

module.exports = apiFacturacionProsin;
