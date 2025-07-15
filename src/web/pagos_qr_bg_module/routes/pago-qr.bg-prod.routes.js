const { Router } = require('express');
const { validarToken } = require('../../../middleware/validar_token.middleware');
const { validarCampos } = require('../../../middleware/validar_campos.middleware');
const {
    autenticarBancoController,
    registrarPagoController,
    consultarEstadoOrdenController
} = require('../controller/pago-qr-bg-prod.controller');

// Middleware para verificar el token del banco
const validarTokenBanco = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            result: 'COD001',
            message: 'Token de autenticación requerido'
        });
    }

    const token = authHeader.substring(7);
    const pagoQrService = require('../services/pago-qr-bg-prod');
    const verificacion = pagoQrService.verificarTokenBanco(token);

    if (!verificacion.result) {
        return res.status(403).json({
            result: 'COD001',
            message: 'Token inválido o expirado'
        });
    }

    // Adjuntar información del usuario del banco al request
    req.bankUser = verificacion.userData;
    next();
};

const router = Router();

// Ruta de autenticación para el banco (punto 7 del documento)
router.post('/login', [validarCampos], autenticarBancoController);

// Ruta para registro de pagos (punto 8 del documento)
router.post('/payments', [validarTokenBanco, validarCampos], registrarPagoController);

// Ruta adicional para consultar estado de una orden (útil para implementación)
router.post('/estado-orden', [validarToken, validarCampos], consultarEstadoOrdenController);

module.exports = router;