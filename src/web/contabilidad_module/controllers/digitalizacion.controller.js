const digitalizacionService = require('../services/digitalizacion.service');
const { grabarLog } = require("../../shared/controller/hana.controller");

/**
 * Busca imágenes según criterios proporcionados
 */
const searchImagesController = async (req, res) => {
    try {
        const user = req.usuarioAutorizado;

        // Obtener los parámetros de búsqueda
        const params = req.query;

        console.log('Parámetros de búsqueda:', params);


        // Si tienes acceso al usuario, usarlo para filtrar resultados
        if (user && user.ID_SAP) {
            params.id_usuario_sap = user.ID_SAP;
        }

        console.log('Parámetros de búsqueda:', params);
        // Llamar al servicio
        const result = await digitalizacionService.searchImages(params);

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en searchImagesController:', error);
        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al buscar imágenes'
        });
    }
};

/**
 * Obtiene y muestra una imagen de cabecera
 */
const getCabeceraImageController = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: 'ID de cabecera inválido'
            });
        }

        const result = await digitalizacionService.getCabeceraImage(id);

        // Enviar la imagen como respuesta
        res.set('Content-Type', result.contentType || 'image/jpeg');
        res.status(200).send(result.data);
    } catch (error) {
        console.error('Error en getCabeceraImageController:', error);
        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al obtener imagen de cabecera'
        });
    }
};

/**
 * Obtiene y muestra una imagen de detalle
 */
const getDetalleImageController = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: 'ID de detalle inválido'
            });
        }

        const result = await digitalizacionService.getDetalleImage(id);

        // Enviar la imagen como respuesta
        res.set('Content-Type', result.contentType || 'image/jpeg');
        res.status(200).send(result.data);
    } catch (error) {
        console.error('Error en getDetalleImageController:', error);
        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al obtener imagen de detalle'
        });
    }
};

/**
 * Procesa una solicitud para comprimir y guardar imagen de cabecera
 * Este controlador requiere que el middleware multer se haya ejecutado antes
 */
const compressCabeceraController = async (req, res) => {
    try {
        // Verificar que se haya cargado un archivo
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: 'No se ha proporcionado ninguna imagen'
            });
        }

        const user = req.usuarioAutorizado;

        // Recopilar todos los datos del formulario y el archivo
        const reqData = {
            ...req.body,
            file: req.file
        };

        // Procesar la solicitud
        const result = await digitalizacionService.processCabeceraTransaccion(reqData, user);

        // Registrar la operación exitosa en el log
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Carga Imagen",
                `Imagen de cabecera registrada exitosamente - ID: ${result.data?.data?.cabecera?.ID || 'N/A'}`,
                JSON.stringify({
                    nro_asiento: reqData.nro_asiento,
                    prefijo: reqData.prefijo,
                    filename: req.file.originalname
                }),
                "digitalizacion/cabecera",
                process.env.PRD || 'DEV'
            );
        }

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en compressCabeceraController:', error);

        // Registrar el error en el log
        const user = req.usuarioAutorizado;
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Carga Imagen",
                `Error al registrar imagen de cabecera: ${error.message}`,
                JSON.stringify({
                    nro_asiento: req.body.nro_asiento,
                    prefijo: req.body.prefijo,
                    filename: req.file?.originalname || 'N/A'
                }),
                "digitalizacion/cabecera",
                process.env.PRD || 'DEV'
            );
        }

        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al procesar la imagen de cabecera'
        });
    }
};

/**
 * Procesa una solicitud para comprimir y guardar imagen de detalle
 * Este controlador requiere que el middleware multer se haya ejecutado antes
 */
const compressDetalleController = async (req, res) => {
    try {
        // Verificar que se haya cargado un archivo
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: 'No se ha proporcionado ninguna imagen'
            });
        }

        const user = req.usuarioAutorizado;

        // Recopilar todos los datos del formulario y el archivo
        const reqData = {
            ...req.body,
            file: req.file
        };

        // Procesar la solicitud
        const result = await digitalizacionService.processDetalleTransaccion(reqData, user);

        // Registrar la operación exitosa en el log
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Carga Imagen Detalle",
                `Imagen de detalle registrada exitosamente - ID: ${result.data?.data?.detalle_cabecera?.ID || 'N/A'}`,
                JSON.stringify({
                    id_cabecera: reqData.id_cabecera,
                    id_tipo_detalle: reqData.id_tipo_detalle,
                    nro: reqData.nro,
                    prefijo: reqData.prefijo,
                    filename: req.file.originalname
                }),
                "digitalizacion/detalle",
                process.env.PRD || 'DEV'
            );
        }

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en compressDetalleController:', error);

        // Registrar el error en el log
        const user = req.usuarioAutorizado;
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Carga Imagen Detalle",
                `Error al registrar imagen de detalle: ${error.message}`,
                JSON.stringify({
                    id_cabecera: req.body.id_cabecera,
                    id_tipo_detalle: req.body.id_tipo_detalle,
                    nro: req.body.nro,
                    prefijo: req.body.prefijo,
                    filename: req.file?.originalname || 'N/A'
                }),
                "digitalizacion/detalle",
                process.env.PRD || 'DEV'
            );
        }

        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al procesar la imagen de detalle'
        });
    }
};


/**
 * Actualiza la imagen de una cabecera existente
 * Este controlador requiere que el middleware multer se haya ejecutado antes
 */
const updateCabeceraImageController = async (req, res) => {
    try {
        // Verificar que se haya cargado un archivo
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: 'No se ha proporcionado ninguna imagen'
            });
        }

        // Obtener el ID de la cabecera a actualizar
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: 'ID de cabecera inválido'
            });
        }

        const user = req.usuarioAutorizado;

        // Obtener el parámetro de eliminación de imagen anterior
        const deletePrevious = req.body.delete_previous !== 'false';

        // Recopilar todos los datos del formulario y el archivo
        const reqData = {
            ...req.body,
            file: req.file
        };

        // Procesar la solicitud
        const result = await digitalizacionService.updateCabeceraImage(id, reqData, deletePrevious);

        // Registrar la operación exitosa en el log - sin bloquear la respuesta
        if (user) {
            try {
                grabarLog(
                    user.USERCODE || 'SYSTEM',
                    user.USERNAME || 'SISTEMA',
                    "Digitalización - Actualización Imagen",
                    `Imagen de cabecera actualizada exitosamente - ID: ${id}`,
                    JSON.stringify({
                        id_cabecera: id,
                        delete_previous: deletePrevious,
                        filename: req.file.originalname,
                        old_file_deleted: result.data?.data?.old_file_deleted
                    }),
                    "digitalizacion/update/cabecera",
                    process.env.PRD || 'DEV'
                ).catch(logError => {
                    console.error('Error al grabar log de éxito:', logError);
                });
            } catch (logError) {
                console.error('Error al intentar grabar log de éxito:', logError);
            }
        }

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en updateCabeceraImageController:', error);

        // Registrar el error en el log - sin bloquear la respuesta de error
        const user = req.usuarioAutorizado;
        if (user) {
            try {
                grabarLog(
                    user.USERCODE || 'SYSTEM',
                    user.USERNAME || 'SISTEMA',
                    "Digitalización - Actualización Imagen",
                    `Error al actualizar imagen de cabecera: ${error.message || 'Error desconocido'}`,
                    JSON.stringify({
                        id_cabecera: req.params.id,
                        delete_previous: req.body.delete_previous,
                        filename: req.file?.originalname || 'N/A'
                    }),
                    "digitalizacion/update/cabecera",
                    process.env.PRD || 'DEV'
                ).catch(logError => {
                    console.error('Error al grabar log de error:', logError);
                });
            } catch (logError) {
                console.error('Error al intentar grabar log de error:', logError);
            }
        }

        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al actualizar la imagen de cabecera'
        });
    }
};

/**
 * Actualiza la imagen de un detalle existente
 * Este controlador requiere que el middleware multer se haya ejecutado antes
 */
const updateDetalleImageController = async (req, res) => {
    try {
        // Verificar que se haya cargado un archivo
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: 'No se ha proporcionado ninguna imagen'
            });
        }

        // Obtener el ID del detalle a actualizar
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: 'ID de detalle inválido'
            });
        }

        const user = req.usuarioAutorizado;

        // Obtener el parámetro de eliminación de imagen anterior
        const deletePrevious = req.body.delete_previous !== 'false';

        // Recopilar todos los datos del formulario y el archivo
        const reqData = {
            ...req.body,
            file: req.file
        };

        // Procesar la solicitud
        const result = await digitalizacionService.updateDetalleImage(id, reqData, deletePrevious);

        // Registrar la operación exitosa en el log
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Actualización Imagen Detalle",
                `Imagen de detalle actualizada exitosamente - ID: ${id}`,
                JSON.stringify({
                    id_detalle: id,
                    delete_previous: deletePrevious,
                    filename: req.file.originalname,
                    old_file_deleted: result.data?.data?.old_file_deleted
                }),
                "digitalizacion/update/detalle",
                process.env.PRD || 'DEV'
            );
        }

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en updateDetalleImageController:', error);

        // Registrar el error en el log
        const user = req.usuarioAutorizado;
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Actualización Imagen Detalle",
                `Error al actualizar imagen de detalle: ${error.message}`,
                JSON.stringify({
                    id_detalle: req.params.id,
                    delete_previous: req.body.delete_previous,
                    filename: req.file?.originalname || 'N/A'
                }),
                "digitalizacion/update/detalle",
                process.env.PRD || 'DEV'
            );
        }

        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al actualizar la imagen de detalle'
        });
    }
};

/**
 * Elimina la imagen de una cabecera
 */
const deleteCabeceraImageController = async (req, res) => {
    try {
        // Obtener el ID de la cabecera
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: 'ID de cabecera inválido'
            });
        }

        const user = req.usuarioAutorizado;

        // Procesar la solicitud
        const result = await digitalizacionService.deleteCabeceraImage(id);

        // Registrar la operación exitosa en el log
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Eliminación Imagen",
                `Imagen de cabecera eliminada exitosamente - ID: ${id}`,
                JSON.stringify({
                    id_cabecera: id
                }),
                "digitalizacion/delete/cabecera",
                process.env.PRD || 'DEV'
            );
        }

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en deleteCabeceraImageController:', error);

        // Registrar el error en el log
        const user = req.usuarioAutorizado;
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Eliminación Imagen",
                `Error al eliminar imagen de cabecera: ${error.message}`,
                JSON.stringify({
                    id_cabecera: req.params.id
                }),
                "digitalizacion/delete/cabecera",
                process.env.PRD || 'DEV'
            );
        }

        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al eliminar la imagen de cabecera'
        });
    }
};

/**
 * Elimina la imagen de un detalle
 */
const deleteDetalleImageController = async (req, res) => {
    try {
        // Obtener el ID del detalle
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({
                error: true,
                message: 'ID de detalle inválido'
            });
        }

        const user = req.usuarioAutorizado;

        // Procesar la solicitud
        const result = await digitalizacionService.deleteDetalleImage(id);

        // Registrar la operación exitosa en el log
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Eliminación Imagen Detalle",
                `Imagen de detalle eliminada exitosamente - ID: ${id}`,
                JSON.stringify({
                    id_detalle: id
                }),
                "digitalizacion/delete/detalle",
                process.env.PRD || 'DEV'
            );
        }

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en deleteDetalleImageController:', error);

        // Registrar el error en el log
        const user = req.usuarioAutorizado;
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Eliminación Imagen Detalle",
                `Error al eliminar imagen de detalle: ${error.message}`,
                JSON.stringify({
                    id_detalle: req.params.id
                }),
                "digitalizacion/delete/detalle",
                process.env.PRD || 'DEV'
            );
        }

        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al eliminar la imagen de detalle'
        });
    }
};


module.exports = {
    searchImagesController,
    getCabeceraImageController,
    getDetalleImageController,
    compressCabeceraController,
    compressDetalleController,
    updateCabeceraImageController,
    updateDetalleImageController,
    deleteCabeceraImageController,
    deleteDetalleImageController
};