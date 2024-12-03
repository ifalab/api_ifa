const httpClient = require('./httpClient');

const sapService = {
    async sendRendiciones(body) {
        try {
            // Realiza la solicitud HTTP
            const response = await httpClient.post('/rendicion', body);

            // Retorna un objeto con el código de estado y los datos
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

module.exports = sapService;
