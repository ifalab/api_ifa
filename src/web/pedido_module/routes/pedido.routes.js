const { Router } = require('express')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { clientesVendedorController, clientesMoraController, moraController, catalogoController, descuentoArticuloController, listaPreciosOficilaController, descuentoCondicionController, sugeridosXZonaController, sugeridosXClienteController, findZonasXVendedorController, crearOrderController, whiteListController, pedidosPorVendedorPendientesController, pedidosPorVendedorFacturadosController, pedidosPorVendedorAnuladosController, pedidoLayoutController,
    pedidosPorVendedorHoyController,
    pedidoCadenaController,
    precioArticuloCadenaController,
    listaPrecioCadenasController,
    clientesSucursalController,
    pedidoInstitucionController,
    crearOrderCadenaController,
    getAllArticulosController,
    articuloDiccionarioController,
    stockInstitucionPorArticuloController,
    pedidoOfertaInstitucionesController,
    listaNegraDescuentosController,
    pedidosPorVendedorFacturadosOrdenadoController,
    patchQuotationsWhscodeController,
    descuentoCortoVencimientoController, findClienteController,
    listaPreciosOficilaCVController,
    listaPreciosIfaExternoController,
    crearOfertaIfaController,
    ofertaClienteExternoController} = require('../controller/pedido.controller')
const checkToken = require('../../../middleware/authMiddleware')
const router = Router()

router.post('/cliente-vendedor', [validarToken, validarCampos], clientesVendedorController)
router.get('/cliente-mora', [validarToken, validarCampos], clientesMoraController)
// TODO DEVOLUCION MAL ESTADO,......:
router.get('/mora', [validarToken, validarCampos], moraController)
// TODO ------------------------------
router.get('/catalogo', [validarToken, validarCampos], catalogoController)
router.get('/regla-articulo', [validarToken, validarCampos], descuentoArticuloController)
router.get('/regla-condicion', [validarToken, validarCampos], descuentoCondicionController)
router.get('/lista-precio', [validarToken, validarCampos], listaPreciosOficilaController)

router.get('/lista-precio-cv', [validarToken, validarCampos], listaPreciosOficilaCVController)

router.get('/sugerido-zona', [validarToken, validarCampos], sugeridosXZonaController)
router.get('/sugerido-cliente', [validarToken, validarCampos], sugeridosXClienteController)
router.get('/zonas-vendedor', [validarToken, validarCampos], findZonasXVendedorController)
router.post('/crear-orden', [validarToken, validarCampos], crearOrderController)
router.post('/crear-orden-cad', [validarToken, validarCampos], crearOrderCadenaController)
router.post('/crear-oferta', [validarToken, validarCampos], crearOrderController)
router.get('/white-list', [validarToken, validarCampos], whiteListController)
router.get('/pendientes-vendedor', [validarToken, validarCampos], pedidosPorVendedorPendientesController)
router.get('/facturados-vendedor', [validarToken, validarCampos], pedidosPorVendedorFacturadosController)
router.get('/anulados-vendedor', [validarToken, validarCampos], pedidosPorVendedorAnuladosController)
router.get('/pedido-layout', [validarToken, validarCampos], pedidoLayoutController)
router.get('/hoy-vendedor', [validarToken, validarCampos], pedidosPorVendedorHoyController)
router.post('/crear-oferta-venta', [validarToken, validarCampos], pedidoCadenaController)
router.post('/crear-oferta-venta-inst', [validarToken, validarCampos], pedidoOfertaInstitucionesController)
router.get('/precio-articulo-cadena', [validarToken, validarCampos], precioArticuloCadenaController)
router.get('/lista-precio-cadenas', [validarToken, validarCampos], listaPrecioCadenasController)
router.post('/clientes-sucursal', [validarToken, validarCampos], clientesSucursalController)
router.post('/pedido-institucion', [validarToken, validarCampos], pedidoInstitucionController)
router.get('/articulos', [validarToken, validarCampos], getAllArticulosController)
router.post('/articulo-diccionario', [validarToken, validarCampos], articuloDiccionarioController)
router.get('/stock-institucion', [validarToken, validarCampos], stockInstitucionPorArticuloController)
router.get('/lista-negra-desc', [validarToken, validarCampos], listaNegraDescuentosController)

router.get('/facturados-vendedor-ord', [validarToken, validarCampos], pedidosPorVendedorFacturadosOrdenadoController)
router.patch('/patch-quotation-whscode', [validarToken, validarCampos], patchQuotationsWhscodeController)
router.get('/descuento-corto-vencimiento', [validarToken, validarCampos], descuentoCortoVencimientoController)

router.post('/cliente-vendedor-cardcode', [validarToken, validarCampos], findClienteController)

//! CLIENTES EXTERNO --------------------:
router.get('/lista-precio-ifa', [validarToken, validarCampos], listaPreciosIfaExternoController)
router.post('/crear-oferta-ifa', [validarToken, validarCampos], crearOfertaIfaController)
router.get('/lista-ofertas-cliente-externo', [validarToken, validarCampos], ofertaClienteExternoController)
//! -------------------------------------


module.exports = router