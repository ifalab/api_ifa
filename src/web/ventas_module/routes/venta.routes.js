const { Router } = require('express')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
    ventasPorSucursalController,
    ventasNormalesController,
    ventasCadenasController,
    ventasInstitucionesController,
    ventasUsuarioController,
    ventasIFAVETController,
    ventasMasivoController,
    ventasPorSucursalControllerMesAnterior,
    ventasCadenasControllerMesAnterior,
    ventasIFAVETControllerMesAnterior,
    ventasInstitucionesControllerMesAnterior,
    ventasMasivoControllerMesAnterior,
    ventasNormalesControllerMesAnterior,
    ventasPorSupervisorController,
    ventasVendedorPorZona,
    ventasHistoricoSucursalController,
    ventasHistoricoNormalesController,
    ventasHistoricoCadenasController,
    ventasHistoricoIfaVetController,
    ventasHistoricoMasivosController,
    ventasHistoricoInstitucionesController,
    vendedorPorZonaMesAntController,
    facturacionController,
    marcarAsistenciaController,
    getAsistenciasVendedorController,
    pruebaBatchController,
    listaAlmacenesController,
    listaAsistenciaDiaController,
    ofertaPrecioItemCodeController,
    descripcionArticuloController,
    listaOfertasController,
    detalleOfertaCadenaController,
    unidadMedidaController,
    listaArticuloCadenasController,
    clientesInstitucionesController,
    clienteInstitucionByCardCodeController,
    vendedoresPorSucursalController,
    obtenerOfertasInstitucionesController,
    detalleOfertaController,
    crearSolicitudPlantaController,
    obtenerOfertasVendedoresController,
    obtenerPedidosDetalleController,
    obtenerOfertasPorSucursalController,
    detalleOfertaCadenaPendController,
    listaClienteEmpleadosController,
    ClienteEmpleadosController,
    obtenerArticulosVehiculoController,
    searchVendedoresController,
    listaPrecioSucController,
    listaPrecioInstController,
    ventasPedidoPorSlpCodeController,
    cantidadVentasPorZonaController,
    cantidadVentasPorZonaMesAnteriosController,
    insertarUbicacionClienteController,
    obtenerClientesSinUbicacionController,
    clienteByVendedorController,
    lineasController,
    reporteVentasClienteLineas,
    clienteByCardCodeController,
    clientesSinUbicacionSupervisorController,
    allCampaignFilterController,
    getYTDByVendedorController,
    getYTDDelVendedorController, getYTDDelVendedorMontoController, getYTDMontoByVendedorController,
    createCampaignController,
    ReporteOfertaPDFController,
    getCoberturaController, clientesNoVentaController, clientesNoVentaPorVendedorController,
    getVendedoresThatHasClientsController,
    facturasMoraByClientController,
    clientesMoraController,
    vendedorPorSucCodeController,
    excelClientesMoraController,
    allCampaignController,
    allAgenciesController,
    campaignByIdController,
    sublineasController,
    reporteUbicacionClienteController,
    agregarSolicitudDeDescuentoController, actualizarStatusSolicitudDescuentoController,
    getVendedoresSolicitudDescByStatusController, getSolicitudesDescuentoByStatusController,
    actualizarSolicitudDescuentoController, actualizarVariosStatusSolicitudDescuentoController,
    actualizarSolicitudesDescuentoController, deleteSolicitudDescuentoController,
    getClientNameController,
    notificationSubscriptionController,
    sendNotificationController
} = require('../controller/venta.controller')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware');
const { validarArchivoExcel } = require('../../../middleware/validarExcel.middleware');

const router = Router()

router.post('/sucursales', [validarToken, validarCampos], ventasPorSucursalController)
router.post('/normales', [validarToken, validarCampos], ventasNormalesController)
router.post('/cadenas', [validarToken, validarCampos], ventasCadenasController)
router.post('/instituciones', [validarToken, validarCampos], ventasInstitucionesController)
router.post('/ifavet', [validarToken, validarCampos], ventasIFAVETController)
router.post('/masivo', [validarToken, validarCampos], ventasMasivoController)
router.post('/supervisor', [validarToken, validarCampos], ventasPorSupervisorController)

router.post('/sucursales-mes-anterior', [validarToken, validarCampos], ventasPorSucursalControllerMesAnterior)
router.post('/normales-mes-anterior', [validarToken, validarCampos], ventasNormalesControllerMesAnterior)
router.post('/cadenas-mes-anterior', [validarToken, validarCampos], ventasCadenasControllerMesAnterior)
router.post('/instituciones-mes-anterior', [validarToken, validarCampos], ventasInstitucionesControllerMesAnterior)
router.post('/ifavet-mes-anterior', [validarToken, validarCampos], ventasIFAVETControllerMesAnterior)
router.post('/masivo-mes-anterior', [validarToken, validarCampos], ventasMasivoControllerMesAnterior)

router.get('/historico-sucursales', [validarToken, validarCampos], ventasHistoricoSucursalController)
router.get('/historico-normales', [validarToken, validarCampos], ventasHistoricoNormalesController)
router.get('/historico-cadenas', [validarToken, validarCampos], ventasHistoricoCadenasController)
router.get('/historico-ifavet', [validarToken, validarCampos], ventasHistoricoIfaVetController)
router.get('/historico-masivos', [validarToken, validarCampos], ventasHistoricoMasivosController)
router.get('/historico-instituciones', [validarToken, validarCampos], ventasHistoricoInstitucionesController)

router.get('/ventas-zona', [validarToken, validarCampos], ventasVendedorPorZona)
router.get('/ventas-zona-mes-ant', [validarToken, validarCampos], vendedorPorZonaMesAntController)
router.post('/marcar-asistencia', [validarToken, validarCampos], marcarAsistenciaController)
router.get('/asistencias-vendedor', [validarToken, validarCampos], getAsistenciasVendedorController)
router.post('/asistencia-dia', [validarToken, validarCampos], listaAsistenciaDiaController)
router.post('/prueba', [validarToken, validarCampos], pruebaBatchController)


router.post('/usuario', [validarToken, validarCampos], ventasUsuarioController)
router.post('/lista-almacenes', [validarToken, validarCampos], listaAlmacenesController)
router.get('/oferta-precio-itemcode', [validarToken, validarCampos], ofertaPrecioItemCodeController)
router.get('/oferta-descripcion-articulo', [validarToken, validarCampos], descripcionArticuloController)
router.get('/lista-ofertas', [validarToken, validarCampos], listaOfertasController)
router.get('/detalle-oferta-cadena', [validarToken, validarCampos], detalleOfertaCadenaController)
router.get('/detalle-oferta-cadena-pend', [validarToken, validarCampos], detalleOfertaCadenaPendController)
router.get('/oferta-unidad-medida', [validarToken, validarCampos], unidadMedidaController)
router.get('/lista-articulo-cadenas', [validarToken, validarCampos], listaArticuloCadenasController)
router.post('/clientes-instituciones', [validarToken, validarCampos], clientesInstitucionesController)
router.get('/cliente-institucion-by-cardcode', [validarToken, validarCampos], clienteInstitucionByCardCodeController)
router.post('/vendedor-sucursal', [validarToken, validarCampos], vendedoresPorSucursalController)
router.get('/ofertas-instituciones', [validarToken, validarCampos], obtenerOfertasInstitucionesController)
router.get('/detalle-oferta', [validarToken, validarCampos], detalleOfertaController)
router.post('/solicitud-planta', [validarToken, validarCampos], crearSolicitudPlantaController)
router.get('/ofertas-vendedores', [validarToken, validarCampos], obtenerOfertasVendedoresController)
router.post('/pedidos-detalle', [validarToken, validarCampos], obtenerPedidosDetalleController)
router.get('/ofertas-sucursal', [validarToken, validarCampos], obtenerOfertasPorSucursalController)
router.get('/lista-empleado-cliente', [validarToken, validarCampos], listaClienteEmpleadosController)
router.get('/empleado-cliente', [validarToken, validarCampos], ClienteEmpleadosController)
router.post('/articulos-vehiculo', [validarToken, validarCampos], obtenerArticulosVehiculoController)
router.post('/search-vendedores', [validarToken, validarCampos], searchVendedoresController)

router.get('/lista-precio-suc', [validarToken, validarCampos], listaPrecioSucController)
router.get('/lista-precio-inst', [validarToken, validarCampos], listaPrecioInstController)
router.get('/reporte-ventas-vendedor', [validarToken, validarCampos], ventasPedidoPorSlpCodeController)

router.post('/cant-ventas-zona', [validarToken, validarCampos], cantidadVentasPorZonaController)
router.post('/cant-ventas-zona-mes-ant', [validarToken, validarCampos], cantidadVentasPorZonaMesAnteriosController)
router.post('/clientes-by-vendedor', [validarToken, validarCampos], clienteByVendedorController)
router.get('/lineas', [validarToken, validarCampos], lineasController)
router.get('/sublineas', [validarToken, validarCampos], sublineasController)
router.get('/reporte-ventas-cliente-lineas', [validarToken, validarCampos], reporteVentasClienteLineas)
router.get('/cliente-by-cardcode', [validarToken, validarCampos], clienteByCardCodeController)

router.post('/ubicacion-cliente', [validarToken, validarCampos], insertarUbicacionClienteController)
router.get('/clientes_sin_ubi', [validarToken, validarCampos], obtenerClientesSinUbicacionController)
router.get('/clientes-sin-ubi-sup', [validarToken, validarCampos], clientesSinUbicacionSupervisorController)
router.get('/all-campaign-filter', [validarToken, validarCampos], allCampaignFilterController)
router.get('/all-campaign', [validarToken, validarCampos], allCampaignController)
router.get('/one-campaign', [validarToken, validarCampos], campaignByIdController)
router.get('/all-agencies', [validarToken, validarCampos], allAgenciesController)
router.post('/create-campaign', [
    validarToken,
    validarCampos,
    upload.single('archivo'),
    // validarArchivoExcel,
], createCampaignController)


router.post('/ytd', [validarToken, validarCampos], getYTDByVendedorController)
router.post('/ytd-vendedor', [validarToken, validarCampos,], getYTDDelVendedorController)
router.post('/ytd-vendedor-monto', [validarToken, validarCampos], getYTDDelVendedorMontoController)
router.post('/ytd-monto', [validarToken, validarCampos], getYTDMontoByVendedorController)
router.get('/reporte-oferta-pdf', [validarToken, validarCampos], ReporteOfertaPDFController)

router.post('/cobertura', [validarToken, validarCampos], getCoberturaController)
router.post('/clientes-no-venta', [validarToken, validarCampos], clientesNoVentaPorVendedorController)
router.get('/vendedores-clientes', [validarToken, validarCampos], getVendedoresThatHasClientsController)
router.get('/facturas-mora-by-clientes', [validarToken, validarCampos], facturasMoraByClientController)
router.post('/clientes-mora-by-sucode-slpcode', [validarToken, validarCampos], clientesMoraController)
router.get('/vendedores-by-sucode', [validarToken, validarCampos], vendedorPorSucCodeController)
router.get('/excel-clientes-mora', [validarToken, validarCampos], excelClientesMoraController)

router.get('/reporte-ubicacion-cliente', [validarToken, validarCampos], reporteUbicacionClienteController)
router.get('/client-name', [validarToken, validarCampos], getClientNameController)

//Solicitud Descuento
router.post('/solicitar-descuento', [validarToken, validarCampos], agregarSolicitudDeDescuentoController)
router.get('/vendedores-solicitud-desc', [validarToken, validarCampos], getVendedoresSolicitudDescByStatusController)
router.post('/solicitud-desc-vendedor', [validarToken, validarCampos], getSolicitudesDescuentoByStatusController)
router.post('/actualizar-solicitud-desc', [validarToken, validarCampos], actualizarSolicitudDescuentoController)
router.post('/cambiar-status-solicitud-desc', [validarToken, validarCampos], actualizarStatusSolicitudDescuentoController)
router.post('/cambiar-status-solicitudes-desc', [validarToken, validarCampos], actualizarVariosStatusSolicitudDescuentoController)
router.post('/actualizar-solicitudes-desc', [validarToken, validarCampos], actualizarSolicitudesDescuentoController)
router.get('/delete-solicitud-desc', [validarToken, validarCampos], deleteSolicitudDescuentoController)

router.post('/notification-subscribe', [validarToken, validarCampos], notificationSubscriptionController)
router.post('/send-notification', [validarToken, validarCampos], sendNotificationController)

module.exports = router