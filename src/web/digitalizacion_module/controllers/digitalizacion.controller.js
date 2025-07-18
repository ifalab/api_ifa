const digitalizacionService = require('../services/digitalizacion.service');
const { grabarLog } = require("../../shared/controller/hana.controller");
const {
    reporteEntregaDigitalizacion
} = require('../controllers/hana.controller');

const ExcelJS = require('exceljs');

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


const getDeliveryDigitalizedController = async (req, res) => {
    try {
        // Obtener parámetros de la consulta
        const { startDate, endDate, search, page = 1, limit = 10, sucCode } = req.query;
        const skip = parseInt(page - 1) * parseInt(limit);

        // Formatear fechas
        // Por defecto usar la fecha de hoy si no se proporcionan fechas
        const now = new Date();

        let actualStartDate = null;
        let actualEndDate = null;

        // Si las fechas son vacías, null o undefined, usar valores por defecto
        if (startDate && startDate.trim() !== '') {
            actualStartDate = startDate;
        } else {
            // Inicio del día actual
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            actualStartDate = startOfDay.toISOString().slice(0, 19).replace('T', ' ');
        }

        if (endDate && endDate.trim() !== '') {
            actualEndDate = endDate;
        } else {
            // Final del día actual
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            actualEndDate = endOfDay.toISOString().slice(0, 19).replace('T', ' ');
        }

        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };

        // Procesar la solicitud
        const result = await reporteEntregaDigitalizacion(
            actualStartDate,
            actualEndDate,
            search || '',
            skip,
            limit,
            sucCode
        );

        // Registrar la operación exitosa en el log
        grabarLog(
            usuario.USERCODE,
            usuario.USERNAME,
            "Digitalización - Reporte Entregas",
            `Reporte de entregas digitalizadas generado exitosamente`,
            JSON.stringify({
                startDate: actualStartDate,
                endDate: actualEndDate,
                search,
                skip,
                limit
            }),
            "digitalizacion/reporte/entregas",
            process.env.PRD || 'DEV'
        );

        const total = result.length > 0 ? result[0].TotalCount : 0;
        const totalPages = Math.ceil(total / limit);

        // Devolver respuesta
        return res.status(200).json({
            reporte: result,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages,
            }
        });
    } catch (error) {
        console.error('Error en getDeliveryDigitalizedController:', error);

        // Registrar el error en el log
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };
        const mensaje = `Error al generar reporte de entregas digitalizadas: ${error.message || ''}`;

        grabarLog(
            usuario.USERCODE,
            usuario.USERNAME,
            "Digitalización - Reporte Entregas",
            mensaje,
            JSON.stringify({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                search: req.query.search,
                skip: req.query.skip,
                limit: req.query.limit
            }),
            "digitalizacion/reporte/entregas",
            process.env.PRD || 'DEV'
        );

        return res.status(500).json({
            error: true,
            mensaje: mensaje
        });
    }
};


const excelEntregasDigitalizadasController = async (req, res) => {
    try {
        const { data, fechaInicio, fechaFin } = req.body;

        // Obtener fecha actual formateada
        const fechaActual = new Date();
        const date = new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(fechaActual);

        // Crear workbook y worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Entregas Digitalizadas');

        // Definir columnas exactamente como en la imagen
        worksheet.columns = [
            { header: 'Nro.', key: 'RowNumber', width: 5 },
            { header: 'Sucursal', key: 'SucName', width: 20 },
            { header: 'Fecha Documento', key: 'DocDate', width: 18 },
            { header: 'Número Doc.', key: 'DocNum', width: 15 },
            { header: 'Código Cliente', key: 'CardCode', width: 15 },
            { header: 'Nombre Cliente', key: 'CardName', width: 30 },
            { header: 'Total', key: 'DocTotal', width: 15 },
            { header: 'Despachador', key: 'DeliveryName', width: 25 },
            { header: 'Fecha Digitalización', key: 'CreateDate', width: 20 }
        ];

        // Insertar filas de cabecera
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);

        // Agregar contenido a las filas de cabecera
        worksheet.getCell('A1').value = 'REPORTE DE ENTREGAS DIGITALIZADAS';
        worksheet.getCell('A2').value = `Período: ${fechaInicio} - ${fechaFin}`;
        worksheet.getCell('A3').value = `Fecha de impresión: ${date}`;

        // Fusionar celdas para cabecera
        worksheet.mergeCells('A1:I1');
        worksheet.mergeCells('A2:I2');
        worksheet.mergeCells('A3:I3');

        // Estilizar cabecera
        const headerRow = worksheet.getRow(1);
        headerRow.height = 30;
        headerRow.getCell(1).font = { bold: true, size: 16, color: { argb: '004D76' } };
        headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.getRow(2).getCell(1).font = { bold: true, size: 12 };
        worksheet.getRow(2).getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.getRow(3).getCell(1).font = { bold: true, size: 12 };
        worksheet.getRow(3).getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Estilizar encabezados de columnas (fila 4)
        const columnsRow = worksheet.getRow(4);
        columnsRow.height = 20;
        columnsRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'BA005C' } // Color corporativo IFA
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            };
        });

        // Agregar datos reales o filas vacías
        const numRows = 20; // Número de filas a generar (ajustar según necesario)
        const startRow = 5; // La primera fila de datos es la 5

        if (data && data.length > 0) {
            // Usar datos reales
            data.forEach((item, index) => {
                const rowData = {
                    RowNumber: index + 1,
                    ...item,
                    DocDate: item.DocDate ? new Date(item.DocDate) : null,
                    CreateDate: item.CreateDate ? new Date(item.CreateDate) : null,
                    DocTotal: item.DocTotal ? parseFloat(item.DocTotal) : 0
                };

                const row = worksheet.addRow(rowData);
                row.getCell('DocTotal').numFmt = '"Bs" #,##0.00';

                // Aplicar bordes y formatos
                applyFormatToRow(row);
            });
        } else {
            // Crear filas vacías con bordes
            for (let i = 0; i < numRows; i++) {
                const row = worksheet.addRow({
                    RowNumber: i + 1,
                    SucName: '',
                    DocDate: '',
                    DocNum: '',
                    CardCode: '',
                    CardName: '',
                    DeliveryName: '',
                    CreateDate: '',
                    DocTotal: 0,
                });

                row.getCell('DocTotal').numFmt = '"Bs" #,##0.00';

                // Aplicar bordes y formatos
                applyFormatToRow(row);
            }
        }

        // Calcular total general
        const totalGeneral = data && data.length > 0
            ? data.reduce((acc, item) => acc + (parseFloat(item.DocTotal) || 0), 0)
            : 0;

        // Agregar fila de total al final (como en la imagen)
        const totalRowIndex = startRow + numRows;
        const totalRow = worksheet.addRow(['', '', '', '', '', '', '', 'TOTAL GENERAL:', totalGeneral]);

        // Estilizar fila de total
        applyFormatToRow(totalRow, true);

        // Formato específico para el total
        totalRow.getCell('CardName').font = { bold: true };
        totalRow.getCell('CardName').alignment = { horizontal: 'right' };
        totalRow.getCell('DocTotal').font = { bold: true };
        totalRow.getCell('DocTotal').numFmt = '"Bs" #,##0.00';
        totalRow.getCell('DocTotal').alignment = { horizontal: 'right' };

        // Configuración de respuesta
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=entregas_digitalizadas.xlsx');

        // Generar y enviar el Excel
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generando Excel:', error);
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };

        // Registrar el error en el log
        grabarLog(
            user.USERCODE,
            user.USERNAME,
            'Reporte de Entregas Digitalizadas',
            `Error generando el Excel: ${error}`,
            'catch de excelEntregasDigitalizadas',
            'digitalizacion/excel-entregas',
            process.env.PRD
        );

        return res.status(500).json({
            mensaje: `Error al generar el Excel: ${error.message || 'Error desconocido'}`
        });
    }
};

// Función auxiliar para aplicar formato a todas las celdas de una fila
function applyFormatToRow(row, isTotal = false) {
    // Determinar el estilo de borde que se usará
    const borderStyle = isTotal ? 'double' : 'thin';

    // Aplicar bordes a TODAS las celdas de la fila
    for (let i = 1; i <= 9; i++) { // 9 columnas en total
        const cell = row.getCell(i);

        // Asegurarnos de que la celda tenga un valor (aunque sea vacío)
        if (cell.value === undefined || cell.value === null) {
            cell.value = '';
        }

        // Aplicar bordes con color negro explícito
        cell.border = {
            top: { style: borderStyle, color: { argb: '000000' } },
            bottom: { style: borderStyle, color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
        };

        // Aplicar alineación específica por tipo de columna
        if (i === 7) { // DocTotal
            cell.alignment = { horizontal: 'right' };
        } else if (i === 3 || i === 9) { // Fechas
            cell.alignment = { horizontal: 'center' };
        }
    }
}

const compressMultipleImagesController = async (req, res) => {
    try {
        // Verificar que se hayan cargado archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: true,
                message: 'No se han proporcionado imágenes'
            });
        }

        const user = req.usuarioAutorizado;

        // Obtener los datos del formulario
        const formData = {
            ...req.body,
            files: req.files
        };

        // Procesar la solicitud usando el nuevo servicio
        const result = await digitalizacionService.processMultipleImages(formData, user);

        // Registrar la operación exitosa en el log
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Carga Múltiple",
                `Imágenes procesadas exitosamente - Cabecera ID: ${result.data?.data?.cabecera?.ID || 'N/A'}, Anexos: ${result.data?.data?.anexos?.length || 0}`,
                JSON.stringify({
                    nro_asiento: formData.nro_asiento,
                    prefijo: formData.prefijo,
                    cantidad_imagenes: req.files.length
                }),
                "digitalizacion/multiple",
                process.env.PRD || 'DEV'
            );
        }

        // Devolver respuesta
        res.status(200).json(result.data);
    } catch (error) {
        console.error('Error en compressMultipleImagesController:', error);

        // Registrar el error en el log
        const user = req.usuarioAutorizado;
        if (user) {
            await grabarLog(
                user.USERCODE || 'SYSTEM',
                user.USERNAME || 'SISTEMA',
                "Digitalización - Carga Múltiple",
                `Error al procesar imágenes: ${error.message || 'Error desconocido'}`,
                JSON.stringify({
                    nro_asiento: req.body.nro_asiento,
                    prefijo: req.body.prefijo,
                    cantidad_imagenes: req.files?.length || 0
                }),
                "digitalizacion/multiple",
                process.env.PRD || 'DEV'
            );
        }

        res.status(error.statusCode || 500).json({
            error: true,
            message: error.message || 'Error al procesar las imágenes'
        });
    }
};

const createUserVisitaController = async (req, res) => {
    try {
        await digitalizacionService.createUserVisita();
    } catch (error) {
        throw new Error('Error al crear usuarios visita: ' + error);
    }
}


module.exports = {
    searchImagesController,
    getCabeceraImageController,
    getDetalleImageController,
    compressCabeceraController,
    compressDetalleController,
    updateCabeceraImageController,
    updateDetalleImageController,
    deleteCabeceraImageController,
    deleteDetalleImageController,
    getDeliveryDigitalizedController,
    excelEntregasDigitalizadasController,
    compressMultipleImagesController,
    createUserVisitaController
};