const { Router } = require('express');
const {
    testAutenticarController,
    testGenerarQRController,
    testAnularQRController,
    testListarOrdenesController,
    testConsultarEstadoController
} = require('../controller/banco-qr-test.controller');
const bancoQrClient = require('../services/banco-qr-client');

// Middleware para verificar el token recibido por el banco
const verificarTokenDelBanco = async (req, res, next) => {
    try {
        // Si no tenemos token en el cliente, intentamos autenticar
        if (!bancoQrClient.getToken()) {
            console.log('[MIDDLEWARE] No hay token del banco, intentando autenticar...');
            const authResult = await bancoQrClient.autenticarConBanco();

            if (!authResult || authResult.result !== 'COD000') {
                console.log('[MIDDLEWARE] Falló la autenticación con el banco');
                return res.status(401).json({
                    result: 'ERROR',
                    message: 'No se pudo autenticar con el banco'
                });
            }
            console.log('[MIDDLEWARE] Autenticación exitosa con el banco');
        }

        // Si llegamos aquí, tenemos un token válido del banco
        next();
    } catch (error) {
        console.error('[MIDDLEWARE] Error al verificar token del banco:', error);
        return res.status(500).json({
            result: 'ERROR',
            message: 'Error al verificar autenticación con el banco'
        });
    }
};

const router = Router();

// Rutas para pruebas del banco - Rediseñadas para flujo correcto
router.get('/autenticar', testAutenticarController);

// Para estas rutas, primero verificamos que tengamos token del banco
router.post('/generar-qr', verificarTokenDelBanco, testGenerarQRController);
router.post('/anular-qr', verificarTokenDelBanco, testAnularQRController);
router.post('/listar-ordenes', verificarTokenDelBanco, testListarOrdenesController);
router.post('/estado-qr', verificarTokenDelBanco, testConsultarEstadoController);

module.exports = router;