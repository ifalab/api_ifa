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
    async crearPlantilla(body, userSign) {
        try {
            const { account, lineid, dimensiones, fechaContabilizacion, transId, debe, SourceID } = body.body;

            // Log de control opcional
            console.log({ account, lineid, dimensiones,fechaContabilizacion });

            const response = await httpClient.post(`/centro-costo/plantilla`, {
                account,
                lineId: +lineid,
                userSign: userSign,
                transId: +transId,
                debe: +debe,
                fechaContabilizacion: fechaContabilizacion,
                dimensiones,
                SourceID
            });

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

            throw {
                statusCode: 500,
                message: error.message || 'Error desconocido en la solicitud POST',
            };
        }
    },

    async crearPlantillaMasiva(body, userSign) {
        try {
            // Aquí envías el body completo a tu endpoint masivo de Nest
            const response = await httpClient.post(`/centro-costo/plantilla/masiva`, {
                ...body,
                userSign
            });

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

            throw {
            statusCode: 500,
            message: error.message || 'Error desconocido en la solicitud POST',
            };
        }
    },
};


module.exports = sapService;