const digitalizacionService = require('../services/digitalizacion.service');

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

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en compressCabeceraController:', error);
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

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en compressDetalleController:', error);
        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al procesar la imagen de detalle'
        });
    }
};

module.exports = {
    searchImagesController,
    getCabeceraImageController,
    getDetalleImageController,
    compressCabeceraController,
    compressDetalleController
};