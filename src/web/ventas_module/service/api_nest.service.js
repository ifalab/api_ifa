const httpClient = require('../../service/httpClient');

const apiNestService = {
    async facturacionPedido(docStatus) {
        try {
            // Realiza la solicitud HTTP GET con parámetros en la URL
            const response = await httpClient.get('/lapp/facturacion/pedidos', {
                params: { docStatus },
            });

            return {
                statusCode: response.status, // Código de estado de la respuesta
                data: response.data, // Datos de la respuesta
            };
        } catch (error) {
            // Maneja los errores y propaga el error al controlador
            if (error.response) {
                // Error específico de la API
                throw {
                    statusCode: error.response.status,
                    message: error.response.data || 'Error en la solicitud GET',
                };
            }

            // Otros errores (como errores de red)
            throw {
                statusCode: 500,
                message: error.message || 'Error desconocido en la solicitud GET',
            };
        }
    },
};

module.exports = apiNestService;
