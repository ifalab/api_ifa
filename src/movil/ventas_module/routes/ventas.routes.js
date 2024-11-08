const express = require('express');
const { validarCampos } = require('../../../middleware/validar_campos.middleware');
const { validarToken } = require('../../../middleware/validar_token.middleware');
const { getUsuariosController, getDocDueDateController, postOrdenController, postEntregaController, postInvoiceController, findOneInvoiceController, updateInvoiceController, findAllIncomingPaymentController, findOneIncomingPaymentController, findOneByCardCodeIncomingPaymentController, createIncomminPaymentController, cancelIncomingPaymentController, descuentosPorArticuloController, descuentosPorCondicionController, descuentosPorLineaController } = require('../controller/ventas.controller');
const checkToken = require('../../../middleware/authMiddleware');
const router = express.Router();

router.get('/usuarios', [checkToken], getUsuariosController)
router.post('/get-due-date', [checkToken], getDocDueDateController)
router.post('/orden', [checkToken], postOrdenController)
router.post('/entrega', [checkToken], postEntregaController)
router.get('/descuento-articulo', [checkToken], descuentosPorArticuloController)
router.get('/descuento-condicion', [checkToken], descuentosPorCondicionController)
router.get('/descuento-linea', [checkToken], descuentosPorLineaController)
//?------------------------------------------------------------------------------------------
router.post('/invoice', [checkToken], postInvoiceController)
router.get('/invoice/:id', [checkToken], findOneInvoiceController)
router.patch('/execute-update-invoice/', [checkToken],updateInvoiceController )
//?------------------------------------------------------------------------------------------
router.post('/create-incoming-payments', [checkToken],createIncomminPaymentController )
router.get('/find-all-incoming-payments', [checkToken],findAllIncomingPaymentController )
router.get('/find-one-incoming-payments/:id', [checkToken],findOneIncomingPaymentController )
router.get('/find-one-by-card-code-incoming-payments/:id', [checkToken],findOneByCardCodeIncomingPaymentController )
router.delete('/cancel-incoming-payments/:id', [checkToken],cancelIncomingPaymentController )

module.exports = router;