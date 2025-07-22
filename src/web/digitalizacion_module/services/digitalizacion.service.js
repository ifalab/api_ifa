const axios = require('axios');
const FormData = require('form-data'); // Ya incluido con axios
const fs = require('fs');
const path = require('path');

//quitar
const jsonVisitadores = require('./visitadores.json');
const bcrypt = require('bcryptjs')
const { createUser, addRolUser, addUsuarioDimensionUno, addUsuarioDimensionDos, addUsuarioDimensionTres, addUsuarioDimensionSublinea } = require("../../auth_module/controllers/hana.controller")


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
    },

    /**
     * Actualiza la imagen de una cabecera existente
     * @param {Number} id - ID de la cabecera a actualizar
     * @param {Object} reqData - Datos de la solicitud con la nueva imagen
     * @param {Boolean} deletePrevious - Si debe eliminarse la imagen anterior (true por defecto)
     */
    async updateCabeceraImage(id, reqData, deletePrevious = true) {
        try {
            console.log(`Actualizando imagen de cabecera ${id}:`, Object.keys(reqData));

            // Verificar que tengamos un archivo válido
            if (!reqData.file || !reqData.file.buffer) {
                throw new Error('Archivo no válido o vacío');
            }

            // Crear un objeto FormData simplificado como un objeto normal
            const formDataAsObject = {
                delete_previous: deletePrevious.toString()
            };

            // Agregar campos opcionales si existen
            if (reqData.quality !== undefined) {
                formDataAsObject.quality = reqData.quality.toString();
            }

            if (reqData.output_format !== undefined) {
                formDataAsObject.output_format = reqData.output_format;
            }

            if (reqData.target_size_kb !== undefined) {
                formDataAsObject.target_size_kb = reqData.target_size_kb.toString();
            }

            if (reqData.grayscale !== undefined) {
                formDataAsObject.grayscale = reqData.grayscale.toString();
            }

            // Método 1: Guardar temporalmente el archivo en el servidor
            const tempFilePath = path.join(__dirname, `../../../temp_${Date.now()}_${reqData.file.originalname}`);
            try {
                fs.writeFileSync(tempFilePath, reqData.file.buffer);

                // Crear un FormData real usando el archivo temporal
                const form = new FormData();

                // Agregar todos los campos al formulario
                Object.keys(formDataAsObject).forEach(key => {
                    form.append(key, formDataAsObject[key]);
                });

                // Agregar el archivo al formulario
                form.append('file', fs.createReadStream(tempFilePath), {
                    filename: reqData.file.originalname,
                    contentType: reqData.file.mimetype
                });

                // Realizar la petición PUT a la API de Python
                const response = await apiClient.put(`/update/cabecera/${id}`, form, {
                    headers: {
                        ...form.getHeaders()
                    }
                });

                // Eliminar el archivo temporal después de usarlo
                fs.unlinkSync(tempFilePath);

                return {
                    statusCode: response.status,
                    data: response.data
                };
            } catch (error) {
                // Si hay algún error, asegurarnos de eliminar el archivo temporal
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
                throw error;
            }
        } catch (error) {
            handleError(error, `Error al actualizar imagen de cabecera ${id}`);
        }
    },

    /**
     * Actualiza la imagen de un detalle existente
     * @param {Number} id - ID del detalle a actualizar
     * @param {Object} reqData - Datos de la solicitud con la nueva imagen
     * @param {Boolean} deletePrevious - Si debe eliminarse la imagen anterior (true por defecto)
     */
    async updateDetalleImage(id, reqData, deletePrevious = true) {
        try {
            console.log(`Actualizando imagen de detalle ${id}:`, Object.keys(reqData));

            // Verificar que tengamos un archivo válido
            if (!reqData.file || !reqData.file.buffer) {
                throw new Error('Archivo no válido o vacío');
            }

            // Crear un objeto FormData simplificado como un objeto normal
            const formDataAsObject = {
                delete_previous: deletePrevious.toString()
            };

            // Agregar campos opcionales si existen
            if (reqData.quality !== undefined) {
                formDataAsObject.quality = reqData.quality.toString();
            }

            if (reqData.output_format !== undefined) {
                formDataAsObject.output_format = reqData.output_format;
            }

            if (reqData.target_size_kb !== undefined) {
                formDataAsObject.target_size_kb = reqData.target_size_kb.toString();
            }

            if (reqData.grayscale !== undefined) {
                formDataAsObject.grayscale = reqData.grayscale.toString();
            }

            // Método 1: Guardar temporalmente el archivo en el servidor
            const tempFilePath = path.join(__dirname, `../../../temp_${Date.now()}_${reqData.file.originalname}`);
            try {
                fs.writeFileSync(tempFilePath, reqData.file.buffer);

                // Crear un FormData real usando el archivo temporal
                const form = new FormData();

                // Agregar todos los campos al formulario
                Object.keys(formDataAsObject).forEach(key => {
                    form.append(key, formDataAsObject[key]);
                });

                // Agregar el archivo al formulario
                form.append('file', fs.createReadStream(tempFilePath), {
                    filename: reqData.file.originalname,
                    contentType: reqData.file.mimetype
                });

                // Realizar la petición PUT a la API de Python
                const response = await apiClient.put(`/update/detalle/${id}`, form, {
                    headers: {
                        ...form.getHeaders()
                    }
                });

                // Eliminar el archivo temporal después de usarlo
                fs.unlinkSync(tempFilePath);

                return {
                    statusCode: response.status,
                    data: response.data
                };
            } catch (error) {
                // Si hay algún error, asegurarnos de eliminar el archivo temporal
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
                throw error;
            }
        } catch (error) {
            handleError(error, `Error al actualizar imagen de detalle ${id}`);
        }
    },

    /**
     * Elimina la imagen de una cabecera (opcional si la API Python lo soporta directamente)
     * @param {Number} id - ID de la cabecera cuya imagen se eliminará
     */
    async deleteCabeceraImage(id) {
        try {
            // Verificar primero si la API Python soporta esta operación
            const response = await apiClient.delete(`/delete/cabecera/image/${id}`);

            return {
                statusCode: response.status,
                data: response.data
            };
        } catch (error) {
            handleError(error, `Error al eliminar imagen de cabecera ${id}`);
        }
    },

    /**
     * Elimina la imagen de un detalle (opcional si la API Python lo soporta directamente)
     * @param {Number} id - ID del detalle cuya imagen se eliminará
     */
    async deleteDetalleImage(id) {
        try {
            // Verificar primero si la API Python soporta esta operación
            const response = await apiClient.delete(`/delete/detalle/image/${id}`);

            return {
                statusCode: response.status,
                data: response.data
            };
        } catch (error) {
            handleError(error, `Error al eliminar imagen de detalle ${id}`);
        }
    },


    /**
     * Procesa múltiples imágenes, la primera como cabecera y las demás como anexos
     * @param {Object} reqData - Datos de la solicitud incluyendo los archivos y parámetros
     * @param {Object} user - Información del usuario autenticado
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async processMultipleImages(reqData, user) {
        try {
            // Extraer los archivos y otros parámetros
            const { files, ...otherParams } = reqData;

            if (!files || files.length === 0) {
                throw new Error('No se han proporcionado imágenes');
            }

            console.log(`Procesando ${files.length} imágenes con el endpoint /compress-multiple-images`);

            // Crear un FormData para enviar los archivos y parámetros a Python
            const formData = new FormData();

            // Añadir cada archivo al FormData
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i].buffer, {
                    filename: files[i].originalname,
                    contentType: files[i].mimetype
                });
            }

            console.log(`Archivos añadidos al FormData: ${files.map(f => f.originalname).join(', ')}`);

            // Añadir los parámetros requeridos
            formData.append('nro_asiento', otherParams.nro_asiento);
            formData.append('prefijo', otherParams.prefijo);
            formData.append('id_usuario_sap', user && user.ID_SAP ? user.ID_SAP : otherParams.id_usuario_sap);

            // Añadir parámetros opcionales
            if (otherParams.quality) formData.append('quality', otherParams.quality);
            if (otherParams.grayscale) formData.append('grayscale', otherParams.grayscale);
            if (otherParams.output_format) formData.append('output_format', otherParams.output_format);
            if (otherParams.target_size_kb) formData.append('target_size_kb', otherParams.target_size_kb);
            if (otherParams.save_locally !== undefined) formData.append('save_locally', otherParams.save_locally);
            if (otherParams.save_to_share !== undefined) formData.append('save_to_share', otherParams.save_to_share);

            // Enviar la solicitud al endpoint Python que procesa múltiples imágenes
            console.log('Enviando solicitud a /compress-multiple-images');
            const response = await apiClient.post('/compress-multiple-images', formData, {
                headers: {
                    ...formData.getHeaders()
                }
            });

            return {
                statusCode: response.status,
                data: response.data
            };

        } catch (error) {
            return handleError(error, 'Error al procesar múltiples imágenes');
        }
    },


    // ... imports y configuración igual

    async createUserVisita() {
        try {
            let visitadoresData = jsonVisitadores; // Array de todos los usuarios a procesar

            let results = [];
            for (const visitador of visitadoresData) {
                try {
                    // Desestructurar los datos del usuario
                    let {
                        usercode,
                        username,
                        codemp,
                        pass,
                        confirm_pass,
                        superuser,
                        etiqueta,
                        dimensionUno,
                        dimensionDos,
                        dimensionTres,
                        dimensionSublinea,
                        externalClient,
                        roles
                    } = visitador;

                    // Validación de contraseña
                    if (pass !== confirm_pass) {
                        results.push({
                            username,
                            success: false,
                            message: 'Las contraseñas son distintas',
                            error: 400
                        });
                        continue;
                    }

                    // Crear usuario en BD
                    const salt = bcrypt.genSaltSync();
                    const encryptPassword = bcrypt.hashSync(pass, salt);

                    // SIEMPRE crea uno a uno y espera la respuesta antes de seguir
                    const result = await createUser(
                        usercode,
                        username,
                        codemp,
                        encryptPassword,
                        superuser,
                        etiqueta,
                        externalClient = false
                    );
                    const response = result[0];
                    const value = response["response"];
                    const id = response["id"];

                    if (value == 409) {
                        results.push({
                            username,
                            success: false,
                            message: `El usuario con el usercode: ${usercode}, ya existe`,
                            error: 409
                        });
                        continue;
                    }

                    if (value == 200) {
                        // Procesar roles uno a uno
                        if (Array.isArray(roles) && roles.length > 0) {
                            for (const id_rol of roles) {
                                const responseRol = await addRolUser(id, id_rol);
                                const statusCode = responseRol[0]?.response;
                                if (statusCode !== 200) {
                                    console.log({ mensaje: 'conflicto ya existe roles y usuario' });
                                } else {
                                    console.log({ mensaje: 'ok rol' });
                                }
                            }
                        }

                        // Procesar dimensionUno uno a uno
                        if (Array.isArray(dimensionUno) && dimensionUno.length > 0) {
                            for (const item of dimensionUno) {
                                const id_dim = item.ID;
                                const responseDim = await addUsuarioDimensionUno(id, id_dim);
                                const valueDim = responseDim["response"];
                                console.log({ valueDim });
                                if (valueDim == 409) {
                                    console.log({ mensaje: 'conflicto ya existe dim1 y usuario' });
                                } else {
                                    console.log({ mensaje: 'ok dim1' });
                                }
                            }
                        }

                        // Procesar dimensionDos uno a uno
                        if (Array.isArray(dimensionDos) && dimensionDos.length > 0) {
                            for (const item of dimensionDos) {
                                const id_dim = item.ID;
                                const responseDim = await addUsuarioDimensionDos(id, id_dim);
                                const valueDim = responseDim["response"];
                                console.log({ valueDim });
                                if (valueDim == 409) {
                                    console.log({ mensaje: 'conflicto ya existe dim2 y usuario' });
                                } else {
                                    console.log({ mensaje: 'ok dim2' });
                                }
                            }
                        }

                        // Procesar dimensionTres uno a uno
                        if (Array.isArray(dimensionTres) && dimensionTres.length > 0) {
                            for (const item of dimensionTres) {
                                const id_dim = item.ID;
                                const responseDim = await addUsuarioDimensionTres(id, id_dim);
                                const valueDim = responseDim["response"];
                                console.log({ valueDim });
                                if (valueDim == 409) {
                                    console.log({ mensaje: 'conflicto ya existe dim3 y usuario' });
                                } else {
                                    console.log({ mensaje: 'ok dim3' });
                                }
                            }
                        }

                        // Procesar dimensionSublinea uno a uno
                        if (Array.isArray(dimensionSublinea) && dimensionSublinea.length > 0) {
                            for (const item of dimensionSublinea) {
                                const id_dim = item.ID;
                                const responseDim = await addUsuarioDimensionSublinea(id, id_dim);
                                const valueDim = responseDim["response"];
                                console.log({ valueDim });
                                if (valueDim == 409) {
                                    console.log({ mensaje: 'conflicto ya existe dim sublinea y usuario' });
                                } else {
                                    console.log({ mensaje: 'ok dim sublinea' });
                                }
                            }
                        }

                        console.log(`Usuario creado con éxito: ${username}`);
                        results.push({
                            username,
                            success: true,
                            message: 'Usuario creado exitosamente',
                            data: response
                        });
                    } else {
                        results.push({
                            username,
                            success: false,
                            message: 'Error no controlado',
                            error: 500
                        });
                    }
                } catch (error) {
                    console.error(`Error al crear visitador ${visitador.username}:`, error.message);
                    results.push({
                        username: visitador.username,
                        success: false,
                        message: error.message || 'Error desconocido',
                        error: error.statusCode || 500
                    });
                }
            }

            // Generar resumen de resultados
            const summary = {
                total: visitadoresData.length,
                success: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                details: results
            };

            console.log(`Finalizado: ${summary.success} exitosos, ${summary.failed} fallidos`);

            return {
                statusCode: 200,
                data: summary
            };
        } catch (error) {
            return handleError(error, 'Error al procesar la creación de usuarios visitadores');
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