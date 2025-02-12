const { Router } = require('express')
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
    detalleOfertaController
} = require('../controller/venta.controller')

const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const { listaArticuloCadenas } = require('../controller/hana.controller')
const router = Router()

router.get('/sucursales', [validarToken, validarCampos], ventasPorSucursalController)
router.get('/normales', [validarToken, validarCampos], ventasNormalesController)
router.get('/cadenas', [validarToken, validarCampos], ventasCadenasController)
router.get('/instituciones', [validarToken, validarCampos], ventasInstitucionesController)
router.get('/ifavet', [validarToken, validarCampos], ventasIFAVETController)
router.get('/masivo', [validarToken, validarCampos], ventasMasivoController)
router.post('/supervisor', [validarToken, validarCampos], ventasPorSupervisorController)

router.get('/sucursales-mes-anterior', [validarToken, validarCampos], ventasPorSucursalControllerMesAnterior)
router.get('/normales-mes-anterior', [validarToken, validarCampos], ventasNormalesControllerMesAnterior)
router.get('/cadenas-mes-anterior', [validarToken, validarCampos], ventasCadenasControllerMesAnterior)
router.get('/instituciones-mes-anterior', [validarToken, validarCampos], ventasInstitucionesControllerMesAnterior)
router.get('/ifavet-mes-anterior', [validarToken, validarCampos], ventasIFAVETControllerMesAnterior)
router.get('/masivo-mes-anterior', [validarToken, validarCampos], ventasMasivoControllerMesAnterior)

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
router.get('/oferta-unidad-medida', [validarToken, validarCampos], unidadMedidaController)
router.get('/lista-articulo-cadenas', [validarToken, validarCampos], listaArticuloCadenasController)
router.get('/clientes-instituciones', [validarToken, validarCampos], clientesInstitucionesController)
router.get('/cliente-institucion-by-cardcode', [validarToken, validarCampos],clienteInstitucionByCardCodeController)

router.post('/vendedor-sucursal', [validarToken, validarCampos],vendedoresPorSucursalController)
router.get('/ofertas-instituciones', [validarToken, validarCampos],obtenerOfertasInstitucionesController)
router.get('/detalle-oferta', [validarToken, validarCampos], detalleOfertaController)

module.exports = router