const { Router } = require('express');
const {
    autenticarController,
    generarQRController,
    anularQRController,
    listarOrdenesController,
    consultarEstadoController,
    registrarPagoModuloController,
    actualizarPagoModuloController
} = require('../controller/banco-qr-prod.controller');
const { verificarTokenDelBanco } = require('../middlewares/auth-ifa-to-bg.middleware');
const { validarToken } = require('../../../middleware/validar_token.middleware');


const router = Router();

// Ruta de autenticación - no requiere token previo
router.get('/autenticar', autenticarController);

// Para estas rutas, primero verificamos que tengamos token del banco
router.post('/generar-qr', [verificarTokenDelBanco, validarToken], generarQRController);
router.post('/anular-qr', [verificarTokenDelBanco, validarToken], anularQRController);
router.post('/listar-ordenes', [verificarTokenDelBanco], listarOrdenesController);
router.post('/estado-qr', [verificarTokenDelBanco, validarToken], consultarEstadoController);

router.post('/registrar-pago', [validarToken], registrarPagoModuloController);
router.post('/actualizar-pago', [validarToken], actualizarPagoModuloController);

module.exports = router;