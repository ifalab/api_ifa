/**
 * Controlador para probar las APIs del Banco Ganadero
 * Basado en especificación técnica Cobros & Pagos con QR v1.10
 */
const bancoQrClient = require('../services/banco-qr-client-prod');

/**
 * Autenticar con el banco y obtener token
 * GET: /autenticar
 */
const autenticarController = async (req, res) => {
    try {
        const resultado = await bancoQrClient.autenticarConBanco();

        if (!resultado || !resultado.result || !resultado.token) {
            return res.status(500).json({
                result: 'COD003',
                message: 'Error al autenticar con el banco: respuesta inválida'
            });
        }

        return res.status(200).json({
            result: resultado.result,
            message: resultado.message,
            token: resultado.token
        });
    } catch (error) {
        console.error('Error en autenticarController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al autenticar con el banco: ' + error.message
        });
    }
};

/**
 * Generar una orden de cobro QR
 * POST: /generar-qr
 * Soporta formato=json o formato=imagen en query params
 */
const generarQRController = async (req, res) => {
    try {
        // El token ya fue verificado por el middleware
        const token = req.bancoToken;

        if (!token) {
            return res.status(401).json({
                result: 'COD001',
                message: 'Token de autenticación requerido'
            });
        }

        const { monto, moneda, referencia, glosa, fechaExpiracion, usoUnico } = req.body;
        const formato = req.query.formato || 'json'; // Formato por defecto: JSON

        // Validar monto
        if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
            return res.status(400).json({
                result: 'COD001',
                message: 'El monto debe ser un número positivo'
            });
        }

        const datosOrden = {
            monto: parseFloat(monto),
            moneda: moneda || 'BOB',
            referencia,
            glosa,
            fechaExpiracion,
            usoUnico: usoUnico !== undefined ? parseInt(usoUnico) : 1,
            guardarImagenQR: formato.toLowerCase() === 'imagen',
            token: token // Pasar el token extraído, no el header completo
        };

        const resultado = await bancoQrClient.generarOrdenQR(datosOrden);

        // Si el formato es imagen y tenemos la imagen QR, la devolvemos directamente
        if (formato.toLowerCase() === 'imagen' && resultado.qrImage) {
            // Extraer la imagen base64 (quitando el prefijo si existe)
            const base64Data = resultado.qrImage.replace(/^data:image\/png;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // Devolver la imagen
            res.set('Content-Type', 'image/png');
            return res.send(imageBuffer);
        }

        // Por defecto, devolvemos el JSON completo
        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en generarQRController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al generar orden QR: ' + error.message
        });
    }
};

/**
 * Anular una orden de cobro QR
 * POST: /anular-qr
 */
const anularQRController = async (req, res) => {
    try {
        // El token ya fue verificado por el middleware
        const token = req.bancoToken;

        const { qrId } = req.body;

        if (!qrId) {
            return res.status(400).json({
                result: 'COD001',
                message: 'El identificador del QR es requerido'
            });
        }

        const resultado = await bancoQrClient.anularOrdenQR(qrId, token);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en anularQRController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al anular QR: ' + error.message
        });
    }
};

/**
 * Listar órdenes de cobro/pago
 * POST: /listar-ordenes
 */
const listarOrdenesController = async (req, res) => {
    try {
        // El token ya fue verificado por el middleware
        const token = req.bancoToken;

        let { fechaInicio, fechaFin } = req.body;

        // Si no se proporcionan fechas, usar el día actual
        if (!fechaInicio || !fechaFin) {
            const hoy = new Date();
            const dia = String(hoy.getDate()).padStart(2, '0');
            const mes = String(hoy.getMonth() + 1).padStart(2, '0');
            const anio = hoy.getFullYear();

            fechaInicio = fechaFin = `${dia}${mes}${anio}`;
        }

        const resultado = await bancoQrClient.listarOrdenesQR(fechaInicio, fechaFin, token);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en listarOrdenesController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al listar órdenes: ' + error.message
        });
    }
};

/**
 * Consultar estado de una orden QR
 * POST: /estado-qr
 */
const consultarEstadoController = async (req, res) => {
    try {
        const token = req.bancoToken;

        const { qrId } = req.body;

        const resultado = await bancoQrClient.consultarEstadoQR(qrId, token);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en consultarEstadoController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al consultar estado: ' + error.message
        });
    }
};



const registrarPagoModuloController = async (req, res) => {
    try {
        const { qrId, idSap, idUser, nombreModulo, isPaid } = req.body;
        console.log('testRegistrarPagoController - Datos >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>:', req.body);

        if (!qrId || !idSap || !idUser || !nombreModulo) {
            return res.status(400).json({
                mensaje: 'Todos los campos son requeridos'
            });
        }
        await bancoQrClient.registrarPagoMoludo(qrId, idSap, idUser, nombreModulo, isPaid);
        return res.status(200).json({
            mensaje: 'Pago registrado correctamente',
        });
    } catch (error) {
        console.error('Error en registrarPagoModuloController:', error);
        return res.status(500).json({
            message: 'Error al registrar pago: ' + error.message
        });
    }
};

const actualizarPagoModuloController = async (req, res) => {
    try {
        const { qrId, transactionId, payDate, isPaid } = req.body;
        if (!qrId || transactionId || payDate || !isPaid) {
            return res.status(400).json({
                mensaje: 'Todos los campos son requeridos'
            });
        }
        await bancoQrClient.actualizarPagoModulo(qrId, transactionId, payDate, isPaid);
        return res.status(200).json({
            mensaje: 'Pago actualizado correctamente',
        });
    } catch (error) {
        console.error('Error en actualizarPagoModuloController:', error);
        return res.status(500).json({
            mensaje: 'Error al actualizar el  pago: ' + error.message
        });
    }
};

module.exports = {
    autenticarController,
    generarQRController,
    anularQRController,
    listarOrdenesController,
    consultarEstadoController,
    registrarPagoModuloController,
    actualizarPagoModuloController
};