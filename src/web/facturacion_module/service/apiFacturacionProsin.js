const httpClientProsin = require('../../service/httpClientProsin');

const apiFacturacionProsin = {
    async facturacionProsin(body) {
        try {
            
            const response = await httpClientProsin.post('/api/sfl/FacturaCompraVenta', body);
            // return response;
            return {
                statusCode: response.status,
                data: response.data,
            };
        } catch (error) {
            // Maneja los errores y propaga el error al controlador
            if (error.response) {
                // Error específico de la API
                throw {
                    statusCode: error.response.status,
                    message: error.response.data || 'Error en la solicitud POST',
                };
            }

            // Otros errores (como errores de red)
            throw {
                statusCode: 500,
                message: error.message || 'Error desconocido en la solicitud POST',
            };
        }
    },
};

module.exports = apiFacturacionProsin;
