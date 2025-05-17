const httpClient = require('../../service/httpClient');

const sapService = {
    async sendRendiciones(body) {
        try {
            // Realiza la solicitud HTTP
            console.log({body})
            const response = await httpClient.post('lapp/rendicion', body);

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
    async createAsiento(body) {
        try {
            console.log({body})
            const response = await httpClient.post('/contabilidad/asiento', body);
            return {
                statusCode: response.status,
                data: response.data,
            };
        } catch (error) {
            
            if (error.response) {
                
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
    async createAsientoCC(body) {
      try {
          console.log({body})
          const response = await httpClient.post('/contabilidad/centro-costo/asiento', body, {
            headers: {
                'x-custom-lang': 'es',  // o el idioma que quieras enviar
            },
          });
          console.log(response);
          return {
              statusCode: response.data.status,
              message: response.data.message,
              id: response.data.id,
          };
      } catch (error) {
          
          if (error.response) {
              
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
    async actualizarAsientoCC(body, id) {
        try {
            console.log({body})
            const response = await httpClient.patch(`/contabilidad/centro-costo/asiento/${id}`, body);
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
    async actualizarAsientoPreliminarCC(body, id) {
        try {
            console.log({body})
            const response = await httpClient.patch(`/contabilidad/centro-costo/asiento/preliminar/${id}`, body);
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
    }
};


module.exports = sapService;
