const { Router } = require('express');
const {
    testAutenticarController,
    testGenerarQRController,
    testAnularQRController,
    testListarOrdenesController,
    testConsultarEstadoController,
    testRegistrarPagoModuloController,
    testActualizarPagoModuloController
} = require('../controller/banco-qr-test.controller');
const { verificarTokenDelBanco } = require('../middlewares/auth-ifa-to-bg.middleware');
const { validarToken } = require('../../../middleware/validar_token.middleware');


const router = Router();

// Ruta de autenticación - no requiere token previo
router.get('/autenticar', testAutenticarController);

// Para estas rutas, primero verificamos que tengamos token del banco
router.post('/generar-qr', [verificarTokenDelBanco, validarToken], testGenerarQRController);
router.post('/anular-qr', [verificarTokenDelBanco, validarToken], testAnularQRController);
router.post('/listar-ordenes', [verificarTokenDelBanco, validarToken], testListarOrdenesController);
router.post('/estado-qr', [verificarTokenDelBanco, validarToken], testConsultarEstadoController);

router.post('/registrar-pago', [validarToken], testRegistrarPagoModuloController);
router.post('/actualizar-pago', [validarToken], testActualizarPagoModuloController);

module.exports = router;