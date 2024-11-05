const express = require('express');
const { validarCampos } = require('../../../middleware/validar_campos.middleware');
const { validarToken } = require('../../../middleware/validar_token.middleware');
const { getUsuariosController, getDocDueDateController, postOrdenController, postEntregaController } = require('../controller/ventas.controller');
const checkToken = require('../../../middleware/authMiddleware');
const router = express.Router();

router.get('/usuarios', [checkToken], getUsuariosController);
router.post('/get-due-date', [checkToken], getDocDueDateController)

router.post('/orden', [checkToken], postOrdenController);
router.post('/entrega', [checkToken], postEntregaController);

module.exports = router;