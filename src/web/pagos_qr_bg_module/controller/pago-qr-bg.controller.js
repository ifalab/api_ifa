/**
 * Controlador para API de Pagos QR BG
 * Basado en especificación técnica Cobros & Pagos con QR v1.10
 */

const pagoQrService = require('../services/pago-qr-bg');

/**
 * Valida que una fecha esté en formato ddmmyyyy
 * @param {string} fecha - Fecha a validar
 * @returns {boolean} true si el formato es correcto
 */
const validarFecha = (fecha) => {
    if (!fecha || typeof fecha !== 'string' || fecha.length !== 8) {
        return false;
    }

    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-2])(\d{4})$/;
    if (!dateRegex.test(fecha)) {
        return false;
    }

    // Validación adicional para asegurar que la fecha sea válida
    const day = parseInt(fecha.substring(0, 2), 10);
    const month = parseInt(fecha.substring(2, 4), 10);
    const year = parseInt(fecha.substring(4, 8), 10);

    // Crear fecha y verificar que es válida
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
};

/**
 * Controlador para la autenticación del banco (Punto 7 del documento)
 * POST: /login
 */
const autenticarBancoController = async (req, res) => {
    try {
        const { userName, password } = req.body;
        console.log(`[PAGO-QR] Autenticando banco: ${userName}, ${password}`);

        // Validar campos requeridos
        if (!userName || !password) {
            return res.status(400).json({
                result: 'COD001',
                message: 'Parámetros de entrada insuficientes'
            });
        }

        // Llamar al servicio para autenticar al banco
        const resultado = await pagoQrService.autenticarBanco(userName, password);

        if (!resultado.result) {
            return res.status(401).json({
                result: 'COD001',
                message: resultado.message || 'Credenciales inválidas'
            });
        }

        return res.status(200).json({
            result: 'OCD000',
            message: 'Autenticación exitosa',
            token: resultado.token
        });
    } catch (error) {
        console.error('Error en autenticarBancoController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Problemas de procesamiento, vuelva a intentar'
        });
    }
};

/**
 * Controlador para registrar pagos de órdenes de cobro (Punto 8 del documento)
 * POST: /payments
 */
const registrarPagoController = async (req, res) => {
    try {
        const { qrId, transactionId, payDate } = req.body;

        // Validar campos requeridos
        if (!qrId || !transactionId || !payDate) {
            return res.status(400).json({
                result: 'COD001',
                message: 'Parámetros de entrada insuficientes'
            });
        }

        // Registrar los datos recibidos para debugging
        console.log(`[PAGO-QR] Recibida notificación: QR=${qrId}, Transacción=${transactionId}, Fecha=${payDate}`);

        // Validar formato de fecha (ddmmyyyy)
        if (!validarFecha(payDate)) {
            return res.status(400).json({
                result: 'COD002',
                message: 'El formato de fecha es incorrecto (ddmmyyyy)'
            });
        }

        // Llamar al servicio para registrar el pago
        const resultado = await pagoQrService.registrarPago(qrId, transactionId, payDate);

        if (!resultado.result) {
            return res.status(500).json({
                result: 'COD003',
                message: resultado.message || 'Error al registrar el pago'
            });
        }

        return res.status(200).json({
            result: 'COD000',
            message: 'Pago registrado correctamente'
        });
    } catch (error) {
        console.error('Error en registrarPagoController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Problemas de procesamiento, vuelva a intentar'
        });
    }
};

/**
 * Controlador para consultar el estado de una orden
 * POST: /estado-orden
 */
const consultarEstadoOrdenController = async (req, res) => {
    try {
        const { qrId } = req.body;

        if (!qrId) {
            return res.status(400).json({
                result: 'COD001',
                message: 'Parámetros de entrada insuficientes'
            });
        }

        const resultado = await pagoQrService.consultarEstadoOrden(qrId);

        if (!resultado.result) {
            return res.status(400).json({
                result: 'COD003',
                message: resultado.message || 'Error al consultar el estado'
            });
        }

        // Proporcionar respuesta con información detallada
        const respuesta = {
            result: 'COD000',
            message: 'Consulta exitosa',
            orderState: resultado.orderState
        };

        // Si hay notificaciones, incluirlas en la respuesta
        if (resultado.notificaciones) {
            respuesta.notificaciones = resultado.notificaciones;
        }

        return res.status(200).json(respuesta);
    } catch (error) {
        console.error('Error en consultarEstadoOrdenController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Problemas de procesamiento, vuelva a intentar'
        });
    }
};

/**
 * Controlador para listar todas las notificaciones de pago
 * GET: /notificaciones
 */
const listarNotificacionesPagoController = async (req, res) => {
    try {
        const resultado = await pagoQrService.listarNotificacionesPago();

        if (!resultado.result) {
            return res.status(500).json({
                result: 'COD003',
                message: resultado.message || 'Error al listar notificaciones'
            });
        }

        return res.status(200).json({
            result: 'COD000',
            message: 'Consulta exitosa',
            notificaciones: resultado.notificaciones || []
        });
    } catch (error) {
        console.error('Error en listarNotificacionesPagoController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Problemas de procesamiento, vuelva a intentar'
        });
    }
};

module.exports = {
    autenticarBancoController,
    registrarPagoController,
    consultarEstadoOrdenController,
    listarNotificacionesPagoController
};