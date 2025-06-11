const axios = require('axios');
const FormData = require('form-data'); // Ya incluido con axios

// Configuración base para Axios
const apiClient = axios.create({
    baseURL: process.env.API_DIGITALZIACION_PY, // URL de tu API Python
    timeout: 30000 // 30 segundos para operaciones con imágenes
});

// Configurar el tipo de respuesta según la ruta
apiClient.interceptors.request.use(config => {
    if (config.url.includes('/preview/')) {
        config.responseType = 'arraybuffer';
    }
    return config;
});

const digitalizacionService = {
    /**
     * Busca imágenes según criterios especificados
     */
    async searchImages(params) {
        try {
            const response = await apiClient.get('/search/images', {
                params,
                responseType: 'json'
            });
            return {
                statusCode: response.status,
                data: response.data
            };
        } catch (error) {
            handleError(error, 'Error al buscar imágenes');
        }
    },

    /**
     * Obtiene una imagen de cabecera por su ID
     */
    async getCabeceraImage(id) {
        try {
            const response = await apiClient.get(`/preview/cabecera/${id}`, {
                responseType: 'arraybuffer'
            });
            return {
                statusCode: response.status,
                data: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            handleError(error, 'Error al obtener imagen de cabecera');
        }
    },

    /**
     * Obtiene una imagen de detalle por su ID
     */
    async getDetalleImage(id) {
        try {
            const response = await apiClient.get(`/preview/detalle/${id}`, {
                responseType: 'arraybuffer'
            });
            return {
                statusCode: response.status,
                data: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            handleError(error, 'Error al obtener imagen de detalle');
        }
    },

    /**
     * Procesa una solicitud multipart para cabecera
     * @param {Object} reqData - Datos de la solicitud procesada
     * @param {Object} user - Información del usuario autenticado
     */
    async processCabeceraTransaccion(reqData, user) {
        try {
            // Crear un nuevo FormData para enviar a Python
            const formData = new FormData();

            // Añadir todos los campos incluyendo el archivo
            for (const [key, value] of Object.entries(reqData)) {
                // Si es un archivo, añadirlo con el contenido correcto
                if (key === 'file' && value.buffer) {
                    formData.append('file', value.buffer, {
                        filename: value.originalname,
                        contentType: value.mimetype
                    });
                } else {
                    // Campos normales
                    formData.append(key, value);
                }
            }

            // Añadir el ID del usuario si está disponible y no se ha proporcionado
            if (user && user.ID_SAP && !reqData.id_usuario_sap) {
                formData.append('id_usuario_sap', user.ID_SAP);
            }

            // Realizar la petición a la API de Python
            console.log('Enviando datos a Python:', Object.keys(reqData));
            const response = await apiClient.post('/compress-cabecera-transaccion', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            return {
                statusCode: response.status,
                data: response.data
            };
        } catch (error) {
            handleError(error, 'Error al procesar imagen de cabecera');
        }
    },

    /**
     * Procesa una solicitud multipart para detalle
     * @param {Object} reqData - Datos de la solicitud procesada
     * @param {Object} user - Información del usuario autenticado
     */
    async processDetalleTransaccion(reqData, user) {
        try {
            // Crear un nuevo FormData para enviar a Python
            const formData = new FormData();

            // Añadir todos los campos incluyendo el archivo
            for (const [key, value] of Object.entries(reqData)) {
                // Si es un archivo, añadirlo con el contenido correcto
                if (key === 'file' && value.buffer) {
                    formData.append('file', value.buffer, {
                        filename: value.originalname,
                        contentType: value.mimetype
                    });
                } else {
                    // Campos normales
                    formData.append(key, value);
                }
            }

            // Añadir el ID del usuario si está disponible y no se ha proporcionado
            if (user && user.ID_SAP && !reqData.id_usuario_sap) {
                formData.append('id_usuario_sap', user.ID_SAP);
            }

            // Realizar la petición a la API de Python
            console.log('Enviando datos a Python:', Object.keys(reqData));
            const response = await apiClient.post('/compress-detalle-transaccion', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            return {
                statusCode: response.status,
                data: response.data
            };
        } catch (error) {
            handleError(error, 'Error al procesar imagen de detalle');
        }
    }
};

/**
 * Maneja errores de manera consistente
 */
function handleError(error, defaultMessage) {
    console.error(`${defaultMessage}:`, error);

    if (error.response) {
        const statusCode = error.response.status;
        let errorMessage = defaultMessage;

        if (error.response.data) {
            try {
                // Si viene como arraybuffer, convertir a texto
                if (error.response.config.responseType === 'arraybuffer') {
                    const decoder = new TextDecoder('utf-8');
                    const errorData = decoder.decode(error.response.data);
                    try {
                        const parsed = JSON.parse(errorData);
                        errorMessage = parsed.detail || parsed.message || defaultMessage;
                    } catch (e) {
                        errorMessage = errorData || defaultMessage;
                    }
                } else {
                    if (typeof error.response.data === 'object' && error.response.data.detail) {
                        errorMessage = JSON.stringify(error.response.data.detail);
                    } else {
                        errorMessage = error.response.data.message || error.response.data || defaultMessage;
                    }
                }
            } catch (e) {
                console.error('Error al parsear respuesta de error:', e);
            }
        }

        throw {
            statusCode,
            message: errorMessage
        };
    }

    throw {
        statusCode: 500,
        message: error.message || defaultMessage
    };
}

module.exports = digitalizacionService;