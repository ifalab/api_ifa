/**
 * Controlador para probar las APIs del Banco Ganadero
 * Basado en especificación técnica Cobros & Pagos con QR v1.10
 */

const bancoQrClient = require('../services/banco-qr-client');

/**
 * Autenticar con el banco y obtener token
 * GET: /test/autenticar
 */
const testAutenticarController = async (req, res) => {
    try {
        //sexo
        const resultado = await bancoQrClient.autenticarConBanco();

        return res.status(200).json({
            result: resultado.result,
            message: resultado.message,
            token: resultado.token
            // token: resultado.token ? resultado.token.substring(0, 20) + '...' : null
        });
    } catch (error) {
        console.error('Error en testAutenticarController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al autenticar con el banco: ' + error.message
        });
    }
};

/**
 * Generar una orden de cobro QR
 * POST: /test/generar-qr
 */
/**
 * Generar una orden de cobro QR
 * POST: /test/generar-qr
 * Soporta formato=json o formato=imagen en query params
 */
const testGenerarQRController = async (req, res) => {
    try {
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
            guardarImagenQR: true
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
        console.error('Error en testGenerarQRController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al generar orden QR: ' + error.message
        });
    }
};

/**
 * Anular una orden de cobro QR
 * POST: /test/anular-qr
 */
const testAnularQRController = async (req, res) => {
    try {
        const { qrId } = req.body;

        if (!qrId) {
            return res.status(400).json({
                result: 'COD001',
                message: 'El identificador del QR es requerido'
            });
        }

        const resultado = await bancoQrClient.anularOrdenQR(qrId);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en testAnularQRController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al anular QR: ' + error.message
        });
    }
};

/**
 * Listar órdenes de cobro/pago
 * POST: /test/listar-ordenes
 */
const testListarOrdenesController = async (req, res) => {
    try {
        let { fechaInicio, fechaFin } = req.body;

        // Si no se proporcionan fechas, usar el día actual
        if (!fechaInicio || !fechaFin) {
            const hoy = new Date();
            const dia = String(hoy.getDate()).padStart(2, '0');
            const mes = String(hoy.getMonth() + 1).padStart(2, '0');
            const anio = hoy.getFullYear();

            fechaInicio = fechaFin = `${dia}${mes}${anio}`;
        }

        const resultado = await bancoQrClient.listarOrdenesQR(fechaInicio, fechaFin);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en testListarOrdenesController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al listar órdenes: ' + error.message
        });
    }
};

/**
 * Consultar estado de una orden QR
 * POST: /test/estado-qr
 */
const testConsultarEstadoController = async (req, res) => {
    try {
        const { qrId } = req.body;

        if (!qrId) {
            return res.status(400).json({
                result: 'COD001',
                message: 'El identificador del QR es requerido'
            });
        }

        const resultado = await bancoQrClient.consultarEstadoQR(qrId);

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error en testConsultarEstadoController:', error);
        return res.status(500).json({
            result: 'COD003',
            message: 'Error al consultar estado: ' + error.message
        });
    }
};

module.exports = {
    testAutenticarController,
    testGenerarQRController,
    testAnularQRController,
    testListarOrdenesController,
    testConsultarEstadoController
};