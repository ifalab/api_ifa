const jwt = require('jsonwebtoken');
const hanaController = require('../controller/hana.controller');

// Configuración para JWT y autenticación
const JWT_SECRET = process.env.JWT_SECRET || 'o3fbuiepqfhu3irflnp3n';
const BANK_USERNAME = process.env.BANK_USERNAME || "BANCO GANADERO";
const BANK_PASSWORD = process.env.BANK_PASSWORD || "bg_ifa345@@";

/**
 * Servicio para autenticar al banco y generar token JWT
 * @param {string} userName - Nombre de usuario del banco
 * @param {string} password - Contraseña del banco
 * @returns {Object} Resultado de la autenticación
 */
const autenticarBanco = async (userName, password) => {
    try {
        if (userName !== BANK_USERNAME || password !== BANK_PASSWORD) {
            return {
                result: false,
                message: 'Credenciales inválidas'
            };
        }

        const token = jwt.sign(
            { userName, role: 'BANCO_BG' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            result: true,
            message: 'Autenticación exitosa',
            token
        };
    } catch (error) {
        console.error('Error en autenticarBanco:', error);
        return {
            result: false,
            message: 'Error al autenticar'
        };
    }
};

/**
 * Servicio para registrar el pago de una orden de cobro
 * @param {string} qrId - Identificador del QR
 * @param {string} transactionId - Número de transacción
 * @param {string} payDate - Fecha de pago en formato ddmmyyyy
 * @returns {Object} Resultado del registro de pago
 */
const registrarPago = async (qrId, transactionId, payDate) => {
    try {
        // Convertir fecha de ddmmyyyy a formato ISO para almacenar en DB
        const day = payDate.substring(0, 2);
        const month = payDate.substring(2, 4);
        const year = payDate.substring(4, 8);
        const fechaPago = `${year}-${month}-${day}`;

        // Registrar la notificación en la base de datos usando el controlador HANA
        console.log(`[PAGO-qr] Registrando pago: QR='${qrId}', Transacción=${transactionId}, Fecha=${fechaPago}`);

        const resultado = await hanaController.registrarNotificacionPago(qrId, transactionId, fechaPago);

        if (!resultado.result) {
            return resultado; // Retornar el error si ocurrió
        }

        // Registramos el evento de pago
        console.log(`[PAGO-QR] Pago registrado: QR=${qrId}, Transacción=${transactionId}, Fecha=${fechaPago}`);

        return {
            result: true,
            message: 'Pago registrado correctamente'
        };
    } catch (error) {
        console.error('Error en registrarPago:', error);
        return {
            result: false,
            message: 'Error al registrar el pago'
        };
    }
};

/**
 * Consultar el estado de una orden de cobro
 * @param {string} qrId - Identificador del QR
 * @returns {Object} Estado de la orden
 */
const consultarEstadoOrden = async (qrId) => {
    try {
        // Consultar notificaciones para este QR usando el controlador HANA
        const resultado = await hanaController.consultarNotificacionesPorQR(qrId);

        if (!resultado.result) {
            return resultado;
        }

        const { notificaciones } = resultado;

        if (notificaciones && notificaciones.length > 0) {
            return {
                result: true,
                orderState: 2,
                message: 'Orden encontrada con pagos registrados',
                notificaciones
            };
        } else {
            // Si no hay notificaciones, podríamos considerar que está registrada pero no pagada
            return {
                result: true,
                orderState: 1, // 1=Registrado según el documento
                message: 'Orden sin pagos registrados'
            };
        }
    } catch (error) {
        console.error('Error en consultarEstadoOrden:', error);
        return {
            result: false,
            message: 'Error al consultar estado de orden'
        };
    }
};

/**
 * Listar todas las notificaciones de pago
 * @returns {Object} Lista de notificaciones
 */
const listarNotificacionesPago = async () => {
    try {
        // Usar el controlador HANA para listar notificaciones
        return await hanaController.listarNotificacionesPago();
    } catch (error) {
        console.error('Error en listarNotificacionesPago:', error);
        return {
            result: false,
            message: 'Error al listar notificaciones de pago'
        };
    }
};

/**
 * Verificar el token JWT del banco
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Resultado de la verificación
 */
const verificarTokenBanco = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // console.log('[PAGO-QR] Token verificado:', decoded);
        // console.log("[VERIFICAR_TOKEN_BANCO] Token verificado:", decoded);
        return {
            result: true,
            userData: decoded
        };
    } catch (error) {
        console.error('Error verificando token:', error);
        return {
            result: false,
            message: 'Token inválido o expirado'
        };
    }
};

module.exports = {
    autenticarBanco,
    registrarPago,
    consultarEstadoOrden,
    verificarTokenBanco,
    listarNotificacionesPago
};