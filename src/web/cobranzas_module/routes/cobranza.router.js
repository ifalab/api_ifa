const { Router } = require('express')
const { cobranzaGeneralController, cobranzaPorSucursalController, cobranzaNormalesController, cobranzaCadenaController, cobranzaIfavetController, cobranzaIfavetMesAnteriorController, cobranzaCadenaMesAnteriorController, cobranzaNormalesMesAnteriorController, cobranzaPorSucursalMesAnteriorController, cobranzaMasivosController, cobranzaInstitucionesController, cobranzaMasivosMesAnteriorController, cobranzaInstitucionesMesAnteriorController, cobranzaPorSupervisorController, cobranzasPorZonasController, cobranzaHistoricoNacionalController, cobranzaHistoricoNormalesController, cobranzaHistoricoCadenasController, cobranzaHistoricoIfavetController, cobranzaHistoricoInstitucionesController, cobranzaHistoricoMasivosController, cobranzasPorZonasMesAntController, cobranzaClientePorVendedorController, cobranzaFacturaPorClienteController, clientesInstitucionesSaldoDeudorController, saldoDeudorInstitucionesController, realizarCobroController, comprobanteController, comprobantePDFController, resumenCobranzasController, cobrosRealizadosController, clientesPorSucursalController, cobranzaFacturaPorCliDespController, cobranzaClientePorVendedorIDController, clientesPorDespachadorController, cobranzaFacturaPorClienteDespachadorController,
    detalleFacturaController, cobranzaPorSucursalesYTiposController, cobranzaPorSucursalYTiposController,
    getCobradoresController,
    saldoDeudorIfavetController,
    getVendedoresBySucursalesController,
    getAllSublinesController,
    getAllLinesController,
    getCobradoresBySucursalController,
    getYearToDayController,
    getYTDCobradorController, getPendientesBajaPorCobradorController, darDeBajaController,
    getCuentasParaBajaController,getCuentasBancoParaBajaCobranzaController,comprobanteContableController, 
    darVariasDeBajaController, getBajasByUserController, anularBajaController,
    reporteBajaCobranzasController, getCobradoresBySucursalesController
} = require('../controller/cobranzas.controller')
const { validarToken } = require('../../../middleware/validar_token.middleware')
const { validarCampos } = require('../../../middleware/validar_campos.middleware')
const router = Router()

router.get('/generales',[validarToken, validarCampos],cobranzaGeneralController)
router.post('/sucursales',[validarToken, validarCampos],cobranzaPorSucursalController)
router.post('/normales',[validarToken, validarCampos],cobranzaNormalesController)
router.post('/cadenas',[validarToken, validarCampos],cobranzaCadenaController)
router.post('/ifavet',[validarToken, validarCampos],cobranzaIfavetController)
router.post('/masivos',[validarToken, validarCampos],cobranzaMasivosController)
router.post('/instituciones',[validarToken, validarCampos],cobranzaInstitucionesController)
router.post('/supervisor',[validarToken, validarCampos],cobranzaPorSupervisorController)

router.post('/sucursales-mes-anterior',[validarToken, validarCampos],cobranzaPorSucursalMesAnteriorController)
router.post('/normales-mes-anterior',[validarToken, validarCampos],cobranzaNormalesMesAnteriorController)
router.post('/cadenas-mes-anterior',[validarToken, validarCampos],cobranzaCadenaMesAnteriorController)
router.post('/ifavet-mes-anterior',[validarToken, validarCampos],cobranzaIfavetMesAnteriorController)
router.post('/masivos-mes-anterior',[validarToken, validarCampos],cobranzaMasivosMesAnteriorController)
router.post('/instituciones-mes-anterior',[validarToken, validarCampos],cobranzaInstitucionesMesAnteriorController)

router.get('/cobranzas-zona',[validarToken, validarCampos], cobranzasPorZonasController)
router.get('/cobranzas-zona-mes-ant',[validarToken, validarCampos], cobranzasPorZonasMesAntController)

router.get('/historico-nacional',[validarToken, validarCampos], cobranzaHistoricoNacionalController)
router.get('/historico-normales',[validarToken, validarCampos], cobranzaHistoricoNormalesController)
router.get('/historico-cadenas',[validarToken, validarCampos], cobranzaHistoricoCadenasController)
router.get('/historico-ifavet',[validarToken, validarCampos], cobranzaHistoricoIfavetController)
router.get('/historico-instituciones',[validarToken, validarCampos], cobranzaHistoricoInstitucionesController)
router.get('/historico-masivos',[validarToken, validarCampos], cobranzaHistoricoMasivosController)
router.get('/clientes-vendedor',[validarToken, validarCampos], cobranzaClientePorVendedorController)
router.get('/clientes-vendedor-id',[validarToken, validarCampos], cobranzaClientePorVendedorIDController)
router.get('/facturas-cliente',[validarToken, validarCampos], cobranzaFacturaPorClienteController)
router.get('/facturas-cliente-despachador',[validarToken, validarCampos],cobranzaFacturaPorClienteDespachadorController)
// router.get('/facturas-cliente-despachador',[validarToken, validarCampos],cobranzaFacturaPorClienteDespachadorController)
router.get('/facturas-cliente-desp',[validarToken, validarCampos], cobranzaFacturaPorCliDespController)

router.get('/cliente-instituciones',[validarToken, validarCampos], clientesInstitucionesSaldoDeudorController)
router.get('/saldo-deudor-instituciones',[validarToken, validarCampos], saldoDeudorInstitucionesController)
router.post('/realizar-cobro',[validarToken, validarCampos],realizarCobroController)
router.get('/comprobante',[validarToken, validarCampos],comprobanteController)
router.get('/comprobante-pdf',[validarToken, validarCampos],comprobantePDFController)
router.get('/resumen',[validarToken, validarCampos],resumenCobranzasController)
router.get('/cobros-realizados',[validarToken, validarCampos],cobrosRealizadosController)
router.post('/clientes-sucursal',[validarToken, validarCampos],clientesPorSucursalController)
router.get('/clientes-despachador',[validarToken, validarCampos],clientesPorDespachadorController)
router.get('/detalle-factura',[validarToken, validarCampos],detalleFacturaController)
router.post('/cob-sucursales-tipos',[validarToken, validarCampos],cobranzaPorSucursalesYTiposController)
router.post('/cob-sucursal-tipos',[validarToken, validarCampos],cobranzaPorSucursalYTiposController)
router.get('/get-cobradores',[validarToken, validarCampos],getCobradoresController)
router.patch('/get-cobradores-by-suc',[validarToken, validarCampos],getVendedoresBySucursalesController)
router.get('/saldo-deudor-ifavet',[validarToken, validarCampos], saldoDeudorIfavetController)
router.get('/sublineas',[validarToken, validarCampos], getAllSublinesController)
router.get('/lineas',[validarToken, validarCampos], getAllLinesController)
router.get('/cobradores-by-suc',[validarToken, validarCampos],getCobradoresBySucursalController)
router.post('/ytd',[validarToken, validarCampos], getYearToDayController)
router.post('/ytd-cobrador',[validarToken, validarCampos], getYTDCobradorController)
router.get('/pendientes-baja',[validarToken, validarCampos], getPendientesBajaPorCobradorController)
router.post('/baja',[validarToken, validarCampos], darDeBajaController)
router.get('/cuentas-baja',[validarToken, validarCampos], getCuentasParaBajaController)
router.get('/cuentas-banco-baja',[validarToken, validarCampos], getCuentasBancoParaBajaCobranzaController)
router.get('/comprobante-contable',[validarToken, validarCampos], comprobanteContableController)
router.post('/baja-varias',[validarToken, validarCampos], darVariasDeBajaController)
router.get('/get-bajas',[validarToken, validarCampos], getBajasByUserController)
router.get('/anular-baja',[validarToken, validarCampos], anularBajaController)

router.post('/reporte-baja',[validarToken, validarCampos], reporteBajaCobranzasController)
router.post('/cobradores-sucursales',[validarToken, validarCampos], getCobradoresBySucursalesController)

module.exports = router