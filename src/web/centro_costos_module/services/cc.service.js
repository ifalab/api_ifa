const httpClient = require('../../service/httpClient');

const sapService = {
    async actualizarAsientoPreliminarCC(body, id) {
        try {
            console.log({body})
            const response = await httpClient.patch(`/centro-costo/preliminar/${id}`, body);
            console.log(response);
            return {
                statusCode: response.status,
                data: response.data,
            };
        } catch (error) {
            
          if (error.response) {
              
                throw {
                    statusCode: error.response.status,
                    message: error.response.data || 'Error en la solicitud PATCH',
                };
            }

            // Otros errores (como errores de red)
            throw {
                statusCode: 500,
                message: error.message || 'Error desconocido en la solicitud PATCH',
            };
        }
    },
};


module.exports = sapService;