/**
 * Controlador para API de Pagos QR BG
 * Basado en especificación técnica Cobros & Pagos con QR v1.10
 */

const pagoQrService = require('../services/pago-qr-bg');
const { grabarLog } = require("../../shared/controller/hana.controller")


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
        // console.log(`[PAGO-QR] Autenticando banco: ${userName}, ${password}`);

        // Validar campos requeridos
        if (!userName || !password) {
            const mensaje = 'Error Parámetros de entrada insuficientes';
            await grabarLog('BANCO GANADERO', userName || 'anonymous', "Pagos QR - Autenticación", mensaje, '', "/pago-qr-bg/test/login", process.env.PRD);
            return res.status(400).json({
                result: 'COD001',
                message: mensaje
            });
        }

        // Llamar al servicio para autenticar al banco
        const resultado = await pagoQrService.autenticarBanco(userName, password);

        if (!resultado.result) {
            const mensaje = `${'Error' + resultado.message}` || 'Error Credenciales inválidas';
            await grabarLog('BANCO GANADERO', userName, "Pagos QR - Autenticación", mensaje, '', "/pago-qr-bg/test/login", process.env.PRD);
            return res.status(401).json({
                result: 'COD001',
                message: mensaje
            });
        }

        await grabarLog('BANCO GANADERO', userName, "Pagos QR - Autenticación", 'Autenticación exitosa', '', "/pago-qr-bg/test/login", process.env.PRD);
        return res.status(200).json({
            result: 'COD000',
            message: 'Autenticación exitosa',
            token: resultado.token
        });
    } catch (error) {
        console.error('Error en autenticarBancoController:', error);
        const mensaje = 'Error Problemas de procesamiento, vuelva a intentar';
        await grabarLog('BANCO GANADERO', req.body?.userName || 'anonymous', "Pagos QR - Autenticación", `Error: ${error.message}`, '', "/pago-qr-bg/test/login", process.env.PRD);
        return res.status(500).json({
            result: 'COD003',
            message: mensaje
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
        const username = req.user?.USERNAME || 'BANCO GANADERO';
        const userCode = req.user?.USERCODE || 'BANCO GANADERO';

        // Validar campos requeridos
        if (!qrId || !transactionId || !payDate) {
            const mensaje = 'Error Parámetros de entrada insuficientes';
            await grabarLog(userCode, username, "Pagos QR - Registro Pago", mensaje, '', "/pago-qr-bg/test/payments", process.env.PRD);
            return res.status(400).json({
                result: 'COD001',
                message: mensaje
            });
        }

        // Registrar los datos recibidos para debugging
        console.log(`[PAGO-QR] Recibida notificación: QR=${qrId}, Transacción=${transactionId}, Fecha=${payDate}`);

        // Validar formato de fecha (ddmmyyyy)
        if (!validarFecha(payDate)) {
            const mensaje = 'Error El formato de fecha es incorrecto (ddmmyyyy)';
            await grabarLog(userCode, username, "Pagos QR - Registro Pago", mensaje, '', "/pago-qr-bg/test/payments", process.env.PRD);
            return res.status(400).json({
                result: 'COD002',
                message: mensaje
            });
        }

        // Llamar al servicio para registrar el pago
        const resultado = await pagoQrService.registrarPago(qrId, transactionId, payDate);

        if (!resultado.result) {
            const mensaje = `${'Error' + resultado.message}` || 'Error al registrar el pago';
            await grabarLog(userCode, username, "Pagos QR - Registro Pago", mensaje, '', "/pago-qr-bg/test/payments", process.env.PRD);
            return res.status(500).json({
                result: 'COD003',
                message: mensaje
            });
        }

        await grabarLog(userCode, username, "Pagos QR - Registro Pago", 'Pago registrado correctamente', '', "/pago-qr-bg/test/payments", process.env.PRD);
        return res.status(200).json({
            result: 'COD000',
            message: 'Pago registrado correctamente'
        });
    } catch (error) {
        console.error('Error en registrarPagoController:', error);
        const mensaje = 'Error Problemas de procesamiento, vuelva a intentar';
        const username = req.user?.USERNAME || 'system';
        const userCode = req.user?.USERCODE || 'BANCO GANADERO';
        await grabarLog(userCode, username, "Pagos QR - Registro Pago", `Error: ${error.message}`, '', "/pago-qr-bg/test/payments", process.env.PRD);
        return res.status(500).json({
            result: 'COD003',
            message: mensaje
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
        const username = req.user?.USERNAME || 'BANCO GANADERO';
        const userCode = req.user?.USERCODE || 'BANCO GANADERO';

        if (!qrId) {
            const mensaje = 'Error Parámetros de entrada insuficientes';
            await grabarLog(userCode, username, "Pagos QR - Consulta Estado", mensaje, '', "/pago-qr-bg/test/estado-orden", process.env.PRD);
            return res.status(400).json({
                result: 'COD001',
                message: mensaje
            });
        }

        const resultado = await pagoQrService.consultarEstadoOrden(qrId);

        if (!resultado.result) {
            const mensaje = resultado.message || 'Error al consultar el estado';
            await grabarLog(userCode, username, "Pagos QR - Consulta Estado", mensaje, '', "/pago-qr-bg/test/estado-orden", process.env.PRD);
            return res.status(400).json({
                result: 'COD003',
                message: mensaje
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

        await grabarLog(userCode, username, "Pagos QR - Consulta Estado", 'Consulta exitosa', '', "/pago-qr-bg/test/estado-orden", process.env.PRD);
        return res.status(200).json(respuesta);
    } catch (error) {
        console.error('Error en consultarEstadoOrdenController:', error);
        const mensaje = 'Error Problemas de procesamiento, vuelva a intentar';
        const username = req.user?.USERNAME || 'system';
        const userCode = req.user?.USERCODE || 'BANCO GANADERO';
        await grabarLog(userCode, username, "Pagos QR - Consulta Estado", `Error: ${error.message}`, '', "/pago-qr-bg/test/estado-orden", process.env.PRD);
        return res.status(500).json({
            result: 'COD003',
            message: mensaje
        });
    }
};


/**
 * Controlador para listar todas las notificaciones de pago
 * GET: /notificaciones
 */
const listarNotificacionesPagoController = async (req, res) => {
    try {
        const username = req.user?.USERNAME || 'BANCO GANADERO';
        const userCode = req.user?.USERCODE || 'BANCO GANADERO';

        const resultado = await pagoQrService.listarNotificacionesPago();

        if (!resultado.result) {
            const mensaje = resultado.message || 'Error al listar notificaciones';
            await grabarLog(userCode, username, "Pagos QR - Listar Notificaciones", mensaje, '', "/pago-qr-bg/test/notificaciones", process.env.PRD);
            return res.status(500).json({
                result: 'COD003',
                message: mensaje
            });
        }

        await grabarLog(userCode, username, "Pagos QR - Listar Notificaciones", 'Consulta exitosa', '', "/pago-qr-bg/test/notificaciones", process.env.PRD);
        return res.status(200).json({
            result: 'COD000',
            message: 'Consulta exitosa',
            notificaciones: resultado.notificaciones || []
        });
    } catch (error) {
        console.error('Error en listarNotificacionesPagoController:', error);
        const mensaje = 'Problemas de procesamiento, vuelva a intentar';
        const username = req.user?.USERNAME || 'system';
        const userCode = req.user?.USERCODE || 'BANCO GANADERO';
        await grabarLog(userCode, username, "Pagos QR - Listar Notificaciones", `Error: ${error.message}`, '', "/pago-qr-bg/test/notificaciones", process.env.PRD);
        return res.status(500).json({
            result: 'COD003',
            message: mensaje
        });
    }
};


module.exports = {
    autenticarBancoController,
    registrarPagoController,
    consultarEstadoOrdenController,
    listarNotificacionesPagoController
};