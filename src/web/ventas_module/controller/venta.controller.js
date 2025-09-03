const { request, response } = require("express")
const puppeteer = require('puppeteer');
const fs = require('fs')
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
const path = require('path');
const webpush = require('web-push');
const {
    ventaPorSucursal,
    ventasNormales,
    ventasCadena,
    ventasInstitucion,
    ventasUsuario,
    ventasIfaVet,
    ventasMasivo,
    ventaPorSucursalMesAnterior,
    ventasNormalesMesAnterior,
    ventasCadenaMesAnterior,
    ventasInstitucionMesAnterior,
    ventasIfaVetMesAnterior,
    ventasMasivoMesAnterior,
    ventasPorSupervisor,
    ventasPorZonasVendedor,
    ventasHistoricoSucursal,
    ventasHistoricoNormales,
    ventasHistoricoIfaVet,
    ventasHistoricoCadenas,
    ventasHistoricoMasivos,
    ventasHistoricoInstituciones,
    ventasPorZonasVendedorMesAnt,
    marcarAsistencia,
    getAsistenciasVendedor,
    pruebaaaBatch, prueba2Batch, prueba3Batch,
    listaAlmacenes,
    listaAsistenciaDia,
    ofertaPrecioPorItemCode,
    descripcionArticulo,
    obtenerOfertas,
    detalleOfertaCadena,
    unidadMedida,
    listaArticuloCadenas,
    clientesInstituciones,
    clientesInstitucionByCardCode,
    vendedoresPorSucursal,
    obtenerOfertasInstituciones,
    detalleOferta,
    obtenerOfertasVendedores,
    obtenerPedidosDetalle,
    obtenerOfertasPorSucursal,
    detalleOfertaPendCadena,
    listaClienteEmpleado,
    clienteEmpleado,
    obtenerArticulosVehiculo,
    searchVendedores,
    listaPrecioSuc,
    listaPrecioInst,
    ventasPedidoPorVendedor,
    cantidadVentasPorZonasVendedor,
    cantidadVentasPorZonasMesAnt,
    clienteByVendedor,
    lineas,
    analisisVentas,
    clienteByCardCode,
    insertarUbicacionCliente,
    obtenerClientesSinUbicacion,
    clientesSinUbicacionSupervisor,
    allCampaignFilter,
    getYTDByVendedor,
    getYTDDelVendedor, getYTDDelVendedorMonto, getYTDMontoByVendedor,
    reporteOfertaPDF, getCoberturaVendedor, getCobertura,
    clientesNoVenta, clientesNoVentaPorVendedor, vendedoresAsignedWithClientsBySucursal,
    facturasMoraByClients,
    clientesConMora,
    vendedorPorSucCode,
    createCampaign,
    validateZona,
    validateItem,
    rollBackCampaignById,
    bannedCampaign,
    createDetailsCampaign,
    allCampaign,
    allAgencies,
    agencyBySucCode,
    oneCampaignById,
    allLineas,
    sublineas,
    reporteSinUbicacionCliente,
    reporteConUbicacionCliente,
    searchVendedorByIDSAP,
    getVentasPrespuestosSubLinea,
    getVentasPrespuestosSubLineaAnterior,
    agregarSolicitudDeDescuento,
    actualizarStatusSolicitudDescuento, getVendedoresSolicitudDescByStatus,
    getSolicitudesDescuentoByStatus, actualizarSolicitudDescuento,
    deleteSolicitudDescuento, notificationSubscription, getSubscriptions,
    getClientName, getSolicitudesDescuentoByVendedor, getNotifications, insertNotification,
    deleteNotification, notificationUnsubscribe, getVendedoresSolicitudDescuento, getVendedorByCode,
    getDescuentosDeVendedoresParaPedido, ventasPorZonasVendedor2, getUbicacionClientesByVendedor,
    getVentasZonaSupervisor, ventasPorZonasVendedorMesAnt2, getVendedoresSolicitudDescByStatusSucursal,
    getVentasZonaAntSupervisor, clientesZonaBloqueadosPorcentaje, getVentasLineaSupervisor,
    getVentasTipoSupervisor, clientesVendedorBloqueadosPorcentaje, clientesZonaBloqueadosPorGrupo,
    getVentasLineaSupervisorAnt, getVentasTipoSupervisorAnt, getVentasLineaSucursalSupervisor,
    ventasVendedoresByLineasSucursal,
    ventasZonasVendedoresByLineasSucursal,
    reportePendienteCadenas,
    clientesCadenasParent,
    searchClientesCadenasParent,
    ventasPendientes,
    reportePendienteByItem,
    ventasPendientesByItem,
    findBlockedClientsByZoneOrSuc,
    findBlockedClients,
    findBlockedClientsByZoneAndSuc,
    clientesVendedorBloqueados,
    clientesBloqueadoByGroup,
    clientExpiryPolicy,
    selectionBatchByItemWhsCode,
    clientesCreadosPorSucursal,
    ventasClientesPorSucursal,
    clientesAcumuladosPorSucursalGrupo,
    consulta1,
    consulta2,
    consulta3,
    getVendedores,
    getZonas,
    getSucursales,
    getTiposClientes,
    reportePendienteUngroupByItem,
    getSalesOperationalEfficiencyDashboard,
    reportePendienteBySucursalesResume
} = require("./hana.controller")
const { facturacionPedido } = require("../service/api_nest.service")
const { grabarLog } = require("../../shared/controller/hana.controller");
const { postInventoryTransferRequests } = require("./sld.controller");
const { validarExcel } = require("../../../helpers/validacionesExcel");
const { Console, group } = require("console");
const { isatty } = require("tty");
const { groupBySucursal } = require("../utils/formatBlockedClients");
const { groupBySucursalYVendedor } = require("../utils/groupBySuc&Seller");
const { kpiEstadosSpeacking } = require("./sql_genesis_speacking.controller");
const { agruparPorAgencia } = require("../helper/agruparPorAgencia.helper");
const { agruparPorEstado } = require("../helper/agruparPorEstado.helper");
const { agruparDetallePorAgencia } = require("../helper/agruparDetallePorAgencia.helper");

const ventasPorSucursalController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventaPorSucursal()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })

        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }

        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasPorSucursalController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasNormalesController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasNormales()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasNormalesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasCadenasController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasCadena()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })

        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasCadenasController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasInstitucionesController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasInstitucion()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasIFAVETController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasIfaVet()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasMasivoController = async (req, res) => {
    try {
        const { listSuc } = req.body

        const responseData = await ventasMasivo()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasUsuarioController = async (req, res) => {
    try {
        const { userCode, dim1, dim2, dim3, groupBy } = req.body
        let totalPresupuesto = 0, totalVentas = 0, totalCump = 0
        let responses = [];
        for (const itemDim2 of dim2) {
            const response = await ventasUsuario(
                userCode,
                dim1,
                itemDim2,
                dim3,
                groupBy,
            )
            responses.push(...response)
        }
        let response = []
        responses.forEach((item) => {
            const item2 = response.findIndex((item2) => item2.Sucursal == item.Sucursal)
            console.log({ item2 })
            if (item2 != -1) {
                response[item2].Ventas += Number(item.Ventas)
                response[item2].Cump += Number(item.Cump)
                response[item2].Ppto += Number(item.Ppto)
            } else {
                response.push({
                    Sucursal: item.Sucursal,
                    Ppto: Number(item.Ppto),
                    Ventas: Number(item.Ventas),
                    Cump: Number(item.Cump)
                })
            }
        })

        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalVentas += +item.Ventas
        })
        if (totalVentas > 0 && totalPresupuesto > 0) {
            totalCump = totalVentas / totalPresupuesto
        }
        if (totalPresupuesto == 0) {
            totalCump = 1
        }
        return res.status(200).json({ response, totalPresupuesto, totalVentas, totalCump })
        // return res.status(200).json(response)
    } catch (error) {
        console.log('error en ventasUsuarioController')
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const ventasPorSucursalControllerMesAnterior = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventaPorSucursalMesAnterior()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })

        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }

        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasPorSucursalController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasNormalesControllerMesAnterior = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasNormalesMesAnterior()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasNormalesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasCadenasControllerMesAnterior = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasCadenaMesAnterior()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasCadenasController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasInstitucionesControllerMesAnterior = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasInstitucionMesAnterior()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasIFAVETControllerMesAnterior = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasIfaVetMesAnterior()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {

            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasMasivoControllerMesAnterior = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await ventasMasivoMesAnterior()
        let response = []
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        responseData.map((item) => {
            if (listSuc.length > 0) {
                if (listSuc.includes(item.SucName)) {
                    response.push(item)
                    totalPresupuesto += +item.Ppto
                    totalDocTotal += +item.DocTotal
                }
            } else {
                response.push(item)
                totalPresupuesto += +item.Ppto
                totalDocTotal += +item.DocTotal
            }
        })
        if (totalDocTotal > 0 && totalPresupuesto > 0) {
            totalCump = totalDocTotal / totalPresupuesto
        }
        return res.status(200).json({ response, totalPresupuesto, totalDocTotal, totalCump })
    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasVendedorPorZona = async (req = request, res = response) => {
    const { username, line, groupBy } = req.query;
    try {
        if (!username && typeof username != "string") {
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        }
        console.log({
            username, line, groupBy
        })
        const response = await ventasPorZonasVendedor(username, line, groupBy);

        const data = response.map(r => ({
            ...r,
            cumplimiento: r.Quota == 0 ? 0 : r.Sales / r.Quota
        }))
        return res.status(200).json({
            response: data,
            mensaje: "Todas las zonas del usuario"
        });
    } catch (err) {
        console.log('error en ventasVendedorPorZona')
        console.log({ err })
        return res.status(500).json({ mensaje: `Error en ventasVendedorPorZona: ${err.message}` })
    }
}

const ventasPorSupervisorController = async (req, res) => {
    try {
        console.log('post/ ventasPorSupervisorController excute')
        const { userCode, dim1, dim2, dim3, groupBy } = req.body
        let totalPresupuesto = 0, totalVentas = 0, totalCump = 0
        let listResponse = []
        for (const itemDim of dim1) {
            const response = await ventasPorSupervisor(
                userCode,
                itemDim,
                dim2,
                dim3,
                groupBy,
            )

            listResponse.push(response)
            // response.map((item) => {
            //     listResponse.push(item)
            // })
        }

        listResponse.map((item) => {
            item.map((itemResponse) => {
                totalPresupuesto += +itemResponse.Ppto
                totalVentas += +itemResponse.Ventas
            })

        })
        if (totalVentas > 0 && totalPresupuesto > 0) {
            totalCump = totalVentas / totalPresupuesto
        }
        if (totalPresupuesto == 0) {
            totalCump = 1
        }

        // return res.status(200).json({ listResponse })
        return res.status(200).json({ listResponse, totalPresupuesto, totalVentas, totalCump })

    } catch (error) {
        console.log('error en ventasPorSupervisorController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud', error: error.message })
    }
}

const ventasHistoricoSucursalController = async (req, res) => {
    try {
        const data = await ventasHistoricoSucursal()
        // Mapa de nombres de meses
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Agrupar datos por SucName
        const groupedResponse = data.reduce((acc, item) => {
            const sucursalIndex = acc.findIndex(suc => suc.SucName === item.SucName);

            const itemWithMonthName = {
                ...item,
                MonthName: monthNames[item.Month - 1] // Asigna el nombre del mes
            };

            if (sucursalIndex === -1) {
                // Si la sucursal no existe, agregarla
                acc.push({
                    SucName: item.SucName,
                    meses: [itemWithMonthName]
                });
            } else {
                // Si ya existe, agregar el mes a la lista
                acc[sucursalIndex].meses.push(itemWithMonthName);
            }

            return acc;
        }, []);

        // Ordenar los meses dentro de cada sucursal
        groupedResponse.forEach(sucursal => {
            sucursal.meses.sort((a, b) => a.Month - b.Month);
        });
        // Retornar la respuesta agrupada
        return res.json({ response: groupedResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en ventas historicos controller' })
    }
}

const ventasHistoricoNormalesController = async (req, res) => {
    try {
        const data = await ventasHistoricoNormales()
        // Mapa de nombres de meses
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Agrupar datos por SucName
        const groupedResponse = data.reduce((acc, item) => {
            const sucursalIndex = acc.findIndex(suc => suc.SucName === item.SucName);

            const itemWithMonthName = {
                ...item,
                MonthName: monthNames[item.Month - 1] // Asigna el nombre del mes
            };

            if (sucursalIndex === -1) {
                // Si la sucursal no existe, agregarla
                acc.push({
                    SucName: item.SucName,
                    meses: [itemWithMonthName]
                });
            } else {
                // Si ya existe, agregar el mes a la lista
                acc[sucursalIndex].meses.push(itemWithMonthName);
            }

            return acc;
        }, []);

        // Ordenar los meses dentro de cada sucursal
        groupedResponse.forEach(sucursal => {
            sucursal.meses.sort((a, b) => a.Month - b.Month);
        });
        // Retornar la respuesta agrupada
        return res.json({ response: groupedResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en ventas historicos controller' })
    }
}

const ventasHistoricoCadenasController = async (req, res) => {
    try {
        const data = await ventasHistoricoCadenas()
        // Mapa de nombres de meses
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Agrupar datos por SucName
        const groupedResponse = data.reduce((acc, item) => {
            const sucursalIndex = acc.findIndex(suc => suc.SucName === item.SucName);

            const itemWithMonthName = {
                ...item,
                MonthName: monthNames[item.Month - 1] // Asigna el nombre del mes
            };

            if (sucursalIndex === -1) {
                // Si la sucursal no existe, agregarla
                acc.push({
                    SucName: item.SucName,
                    meses: [itemWithMonthName]
                });
            } else {
                // Si ya existe, agregar el mes a la lista
                acc[sucursalIndex].meses.push(itemWithMonthName);
            }

            return acc;
        }, []);

        // Ordenar los meses dentro de cada sucursal
        groupedResponse.forEach(sucursal => {
            sucursal.meses.sort((a, b) => a.Month - b.Month);
        });
        // Retornar la respuesta agrupada
        return res.json({ response: groupedResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en ventas historicos controller' })
    }
}

const ventasHistoricoIfaVetController = async (req, res) => {
    try {
        const data = await ventasHistoricoIfaVet()
        // Mapa de nombres de meses
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Agrupar datos por SucName
        const groupedResponse = data.reduce((acc, item) => {
            const sucursalIndex = acc.findIndex(suc => suc.SucName === item.SucName);

            const itemWithMonthName = {
                ...item,
                MonthName: monthNames[item.Month - 1] // Asigna el nombre del mes
            };

            if (sucursalIndex === -1) {
                // Si la sucursal no existe, agregarla
                acc.push({
                    SucName: item.SucName,
                    meses: [itemWithMonthName]
                });
            } else {
                // Si ya existe, agregar el mes a la lista
                acc[sucursalIndex].meses.push(itemWithMonthName);
            }

            return acc;
        }, []);

        // Ordenar los meses dentro de cada sucursal
        groupedResponse.forEach(sucursal => {
            sucursal.meses.sort((a, b) => a.Month - b.Month);
        });
        // Retornar la respuesta agrupada
        return res.json({ response: groupedResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en ventas historicos controller' })
    }
}


const ventasHistoricoMasivosController = async (req, res) => {
    try {
        const data = await ventasHistoricoMasivos()
        // Mapa de nombres de meses
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Agrupar datos por SucName
        const groupedResponse = data.reduce((acc, item) => {
            const sucursalIndex = acc.findIndex(suc => suc.SucName === item.SucName);

            const itemWithMonthName = {
                ...item,
                MonthName: monthNames[item.Month - 1] // Asigna el nombre del mes
            };

            if (sucursalIndex === -1) {
                // Si la sucursal no existe, agregarla
                acc.push({
                    SucName: item.SucName,
                    meses: [itemWithMonthName]
                });
            } else {
                // Si ya existe, agregar el mes a la lista
                acc[sucursalIndex].meses.push(itemWithMonthName);
            }

            return acc;
        }, []);

        // Ordenar los meses dentro de cada sucursal
        groupedResponse.forEach(sucursal => {
            sucursal.meses.sort((a, b) => a.Month - b.Month);
        });
        // Retornar la respuesta agrupada
        return res.json({ response: groupedResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en ventas historicos controller' })
    }
}

const ventasHistoricoInstitucionesController = async (req, res) => {
    try {
        const data = await ventasHistoricoInstituciones()
        // Mapa de nombres de meses
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Agrupar datos por SucName
        const groupedResponse = data.reduce((acc, item) => {
            const sucursalIndex = acc.findIndex(suc => suc.SucName === item.SucName);

            const itemWithMonthName = {
                ...item,
                MonthName: monthNames[item.Month - 1] // Asigna el nombre del mes
            };

            if (sucursalIndex === -1) {
                // Si la sucursal no existe, agregarla
                acc.push({
                    SucName: item.SucName,
                    meses: [itemWithMonthName]
                });
            } else {
                // Si ya existe, agregar el mes a la lista
                acc[sucursalIndex].meses.push(itemWithMonthName);
            }

            return acc;
        }, []);

        // Ordenar los meses dentro de cada sucursal
        groupedResponse.forEach(sucursal => {
            sucursal.meses.sort((a, b) => a.Month - b.Month);
        });
        // Retornar la respuesta agrupada
        return res.json({ response: groupedResponse })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en ventas historicos controller' })
    }
}

const vendedorPorZonaMesAntController = async (req, res) => {
    const { username, line, groupBy } = req.query;
    try {
        if (!username && typeof username != "string") {
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        }
        console.log({
            username, line, groupBy
        })
        const response = await ventasPorZonasVendedorMesAnt(+username, line, groupBy);

        const data = response.map(r => ({
            ...r,
            cumplimiento: r.Quota == 0 ? 0 : r.Sales / r.Quota
        }))
        return res.status(200).json({
            response: data,
            mensaje: "Todas las zonas del usuario"
        });
    } catch (err) {
        console.log('error en ventasInstitucionesController')
        console.log({ err })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const facturacionController = async (req, res) => {
    try {
        const { opcion } = req.query;
        const response = await facturacionPedido(opcion)
        return res.json({ response })

    } catch (error) {
        console.log('error en ventasInstitucionesController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const marcarAsistenciaController = async (req, res) => {
    try {
        console.log(req.body)
        const { ID_VENDEDOR_SAP, FECHA, HORA, MENSAJE, LATITUD, LONGITUD } = req.body
        if (LATITUD == '' || LONGITUD == '') {
            return res.status(400).json({ mensaje: 'No hay latitud/longitud, active la ubicacion GPS de su dispositivo o intente nuevamente' })
        }
        const usuario = req.usuarioAutorizado
        const asistencia = await marcarAsistencia(ID_VENDEDOR_SAP, FECHA, HORA, MENSAJE, LATITUD, LONGITUD)
        console.log(asistencia.response)


        if (asistencia.response.lang) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta marcar aistencia", `${asistencia.response.value || 'Error en la solicitud marcarAsistencia'}`, asistencia.query, "venta/marcar-asistencia", process.env.PRD)
            return res.status(400).json({ mensaje: asistencia.response.value || 'Error en la solicitud marcarAsistencia' })
        }
        console.log(asistencia.query)
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta marcar aistencia", "Marcado con exito", asistencia.query, "venta/marcar-asistencia", process.env.PRD)

        return res.json(asistencia.response == 1 ? true : false)
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado
        let mensaje = error.message || 'error en el controlador:marcarAsistenciaController'
        const query = error.query || "No disponible"
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta marcar aistencia", mensaje, query, "venta/marcar-asistencia", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const getAsistenciasVendedorController = async (req, res) => {
    try {
        const id_vendedor_sap = req.query.id
        // const usuario = req.usuarioAutorizado
        const asistencias = await getAsistenciasVendedor(id_vendedor_sap)
        console.log(asistencias.response)
        if (asistencias.response.lang) {
            // grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta get asistencias vendedor", `${asistencias.response.value || 'Error en getAsistenciasVendedor'}`, asistencias.query, "venta/asistencias-vendedor", process.env.PRD)
            return res.status(400).json({ mensaje: asistencias.response.value })
        }
        // console.log(asistencias.query)
        // grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta get asistencias vendedor", "Datos obtenidos con exito", asistencias.query, "venta/asistencias-vendedor", process.env.PRD)

        return res.json({ asistencias: asistencias.response })
    } catch (error) {
        console.log({ error })
        // const usuario = req.usuarioAutorizado
        let mensaje = error.message || 'error en el controlador:getAsistenciasVendedorController'
        // const query = error.query || "No disponible"
        // grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta get asistencias vendedor", mensaje, query, "venta/asistencias-vendedor", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const listaAsistenciaDiaController = async (req, res) => {
    try {
        const { fecha, id_sap } = req.body
        const { response } = await listaAsistenciaDia(fecha, id_sap)
        const filteredResponse = Object.values(response.reduce((acc, item) => {
            if (!acc[item.MENSAJE]) {
                acc[item.MENSAJE] = item;
            }
            return acc;
        }, {}));

        return res.json(filteredResponse);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const pruebaBatchController = async (req, res) => {
    try {
        const { articulo, almacen, cantidad } = req.body;
        const response = await pruebaaaBatch(articulo, almacen, cantidad)
        const todosDatos = await prueba2Batch(articulo, almacen);
        const tablaOIBT = await prueba3Batch(articulo, almacen)
        console.log({ response })
        return res.json({ response, tablaOIBT, todosDatos })

    } catch (error) {
        console.log('error en pruebaBatchController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud: pruebaBatchController' })
    }
}

const listaAlmacenesController = async (req, res) => {
    try {

        const { listSuc } = req.body
        let listAlmacenes = []
        for (const element of listSuc) {
            const response = await listaAlmacenes(element)
            listAlmacenes.push(...response)
        }
        return res.json(listAlmacenes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador no definido' })
    }
}

const ofertaPrecioItemCodeController = async (req, res) => {
    try {
        const nroLista = req.query.nroLista
        const itemCode = req.query.itemCode
        const response = await ofertaPrecioPorItemCode(nroLista, itemCode)
        if (response.length == 0) {
            return res.status(400).json({ mensaje: 'no hay el articulo' })
        }
        const precio = response[0]
        return res.json(precio)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador : ofertaPrecioItemCode' })
    }
}

const descripcionArticuloController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const response = await descripcionArticulo(itemCode)
        if (response.length == 0) return res.status(404).json({ mensaje: 'El articulo no fue encontrado' })
        return res.json({ ItemName: response[0].ItemName })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en descripcionArticuloController'}` })
    }
}

const listaOfertasController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode ?? ''
        const sucCode = req.query.sucCode
        const response = await obtenerOfertas(sucCode, cardCode)
        if (response.status == 400) return res.status(400).json({ mensaje: response.message || 'Error en obtenerOfertas' })
        const { data } = response
        data.forEach((element) => {
            element.DocDate = element.DocDate.split(' ')[0]
            element.DocTime = element.DocTime.slice(0, 2) + ':' + element.DocTime.slice(2)
            element.Price = parseFloat(element.DocTotal).toFixed(2);
        })

        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en listaOfertasController ${error.message || ''}` })
    }
}

const detalleOfertaCadenaController = async (req, res) => {
    try {
        const id = req.query.id
        const response = await detalleOfertaCadena(id)
        if (response.status == 400) return res.status(400).json({ mensaje: response.message || 'Error en detalleOfertaCadena' })
        const { data } = response
        data.forEach((row) => {
            const subtotal = row.subTotal
            row.Quantity = Number(row.Quantity)
            row.PendQuantity = Number(row.PendQuantity)
            row.Stock = Number(row.Stock)
            row.subTotal = Number(subtotal)
            row.DiscPrcnt = row.DiscPrcnt == null ? 0 : Number(row.DiscPrcnt)
            row.cantidadMod = row.Stock < row.PendQuantity ? row.Stock : row.PendQuantity
        })
        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en detalleOfertaCadenaController ${error.message || ''}` })
    }
}

const detalleOfertaCadenaPendController = async (req, res) => {
    try {
        const id = req.query.id
        const response = await detalleOfertaPendCadena(id)
        // return res.json(response)
        if (response.status == 400) return res.status(400).json({ mensaje: response.message || 'Error en detalleOfertaCadena' })
        const { data } = response
        data.forEach((row) => {
            const subtotal = row.subTotal
            // const { BatchNum } = row
            row.Quantity = Number(row.Quantity)
            row.PendQuantity = Number(row.PendQuantity)
            row.Stock = Number(row.Stock)
            row.subTotal = Number(subtotal)
            row.DiscPrcnt = row.DiscPrcnt == null ? 0 : Number(row.DiscPrcnt)
            row.cantidadMod = row.Stock < row.PendQuantity ? row.Stock : row.PendQuantity
            // if (BatchNum && BatchNum !== '') {
            //     row.BatchDataSelect = {
            //         BatchNum,
            //         ExpDate: row.ExpDate || null,
            //         NumInSale: Number(row.NumPerMsr) || null,
            //     }
            //     row.BatchDataSelectBatchNum = BatchNum
            //     row.BatchDataSelectBatcExpDate = row.ExpDate
            // }
        })
        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en detalleOfertaCadenaController ${error.message || ''}` })
    }
}

const unidadMedidaController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const response = await unidadMedida(itemCode)
        console.log({ response })
        if (response.length == 0) return res.status(404).json({ mensaje: 'La unidad de medida no fue encontrada' })
        return res.json({ SalUnitMsr: response[0].SalUnitMsr })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en unidadMedidaController'}` })
    }
}

const listaArticuloCadenasController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const listNum = req.query.listNum
        const response = await listaArticuloCadenas(cardCode, listNum)
        let data = []
        response.map((item) => {
            if (item.PriceMax == null) {
                item.PriceMax = 0
            } else {
                item.PriceMax = Number(item.PriceMax)
            }
            data.push(item)
        })

        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const clientesInstitucionesController = async (req, res) => {
    try {
        const { listSucCode } = req.body
        let clientesResponse = []
        const clientes = await clientesInstituciones()
        listSucCode.map((suCode) => {
            const filter = clientes.filter(unCliente => unCliente.SucCode === suCode)
            clientesResponse = [...clientesResponse, ...filter]
        })
        return res.json(clientesResponse)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}`, error })
    }
}

const clienteInstitucionByCardCodeController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const response = await clientesInstitucionByCardCode(cardCode)
        if (response.length == 0) return res.status(400).json({ mensaje: 'no se encontro el cliente' })
        const cliente = response[0]
        return res.json(cliente)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}`, error })
    }
}

const vendedoresPorSucursalController = async (req, res) => {
    try {
        const { sucursales } = req.body
        let responses = []
        for (const suc of sucursales) {
            console.log(suc)
            const response = await vendedoresPorSucursal(suc)
            responses.push(...response)
        }
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const obtenerOfertasInstitucionesController = async (req, res) => {
    try {
        const response = await obtenerOfertasInstituciones()
        if (response.status == 400) {
            return res.status(400).json({ mensaje: response.message || 'Error en obtenerOfertasInstituciones' })
        }
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const detalleOfertaController = async (req, res) => {
    try {
        const id = req.query.id
        const response = await detalleOferta(id)
        if (response.status == 400)
            return res.status(400).json({ mensaje: response.message || 'Error en detalleOferta' })

        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en detalleOfertaController: ${error.message || ''}` })
    }
}

const crearSolicitudPlantaController = async (req, res) => {
    try {
        const {
            Series,
            Reference1,
            Reference2,
            Comments,
            JournalMemo,
            FromWarehouse,
            ToWarehouse,
            StockTransferLines,
        } = req.body
        console.log(JSON.stringify({
            Series,
            Reference1,
            Reference2,
            Comments,
            JournalMemo,
            FromWarehouse,
            ToWarehouse,
            StockTransferLines,
        }, null, 2))
        const sapResponse = await postInventoryTransferRequests({
            Series,
            Reference1,
            Reference2,
            Comments,
            JournalMemo,
            FromWarehouse,
            ToWarehouse,
            StockTransferLines,
        })
        console.log({ sapResponse })

        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        if (sapResponse.lang) {
            grabarLog(user.USERCODE, user.USERNAME, "Instituciones Solicitud Planta", sapResponse.value, 'postInventoryTransferRequests', "venta/solicitud-planta", process.env.PRD)
            return res.status(400).json({ mensaje: sapResponse.value })
        }
        return res.json(sapResponse)
    } catch (error) {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(user.USERCODE, user.USERNAME, "Instituciones Solicitud Planta", `Error en el controlador crearSolicitudPlantaController: ${error.message}`, 'catch del controller', "venta/solicitud-planta", process.env.PRD)
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador crearSolicitudPlantaController: ${error.message}` })
    }
}

const obtenerOfertasVendedoresController = async (req, res) => {
    try {
        const id = req.query.id
        const response = await obtenerOfertasVendedores(id)
        if (response.status == 400) {
            return res.status(400).json({ mensaje: response.message || 'Error en obtenerOfertasVendedores' })
        }
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const obtenerOfertasPorSucursalController = async (req, res) => {
    try {
        const { sucCode } = req.query
        const response = await obtenerOfertasPorSucursal(sucCode)
        if (response.status == 400) {
            return res.status(400).json({ mensaje: response.message || 'Error en obtenerOfertasPorSucursal' })
        }
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const obtenerPedidosDetalleController = async (req, res) => {
    try {
        const { baseEntry } = req.body
        console.log({ body: req.body })
        const response = await obtenerPedidosDetalle(baseEntry)
        if (response.status == 400) {
            return res.status(400).json({ mensaje: response.message || 'Error en obtenerPedidosDetalle' })
        }
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const listaClienteEmpleadosController = async (req, res) => {
    try {
        const sucCode = req.query.sucCode
        const response = await listaClienteEmpleado(sucCode)
        if (response.status == 400) {
            return res.status(400).json({ mensaje: response.message || 'Error en listaClienteEmpleados' })
        }
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const ClienteEmpleadosController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const response = await clienteEmpleado(cardCode)
        if (response.status == 400) {
            return res.status(400).json({ mensaje: response.message || 'Error en listaClienteEmpleados' })
        }
        console.log({ response })
        if (response.data.length == 0) {
            return res.status(400).json({ mensaje: `No se encontro el usuario con el carCode: ${cardCode}` })
        }
        return res.json(response.data[0])
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const obtenerArticulosVehiculoController = async (req, res) => {
    try {
        const { cadena } = req.body
        const response = await obtenerArticulosVehiculo(cadena)
        if (response.status == 400) {
            return res.status(400).json({ mensaje: response.message || 'Error en obtenerArticulosVehiculo' })
        }
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const searchVendedoresController = async (req, res) => {
    try {
        const { cadena } = req.body
        const response = await searchVendedores(cadena)
        if (response.status == 400) {
            return res.status(400).json({ mensaje: response.message || 'Error en searchVendedores' })
        }
        return res.json(response.data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador searchVendedoresController: ${error.message}` })
    }
}

const listaPrecioSucController = async (req, res) => {
    try {
        const sucCode = req.query.sucCode
        const response = await listaPrecioSuc(sucCode)
        const lista = response.data
        return res.json(lista)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const listaPrecioInstController = async (req, res) => {
    try {

        const response = await listaPrecioInst()
        const lista = response.data
        return res.json(lista)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const ventasPedidoPorSlpCodeController = async (req, res) => {
    try {
        const slpCode = req.query.slpCode
        const starDate = req.query.starDate
        const endDate = req.query.endDate
        const response = await ventasPedidoPorVendedor(slpCode, starDate, endDate)
        const data = response.data
        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const cantidadVentasPorZonaController = async (req = request, res = response) => {
    try {
        const { username, line, groupBy } = req.body;
        console.log({ username, line, groupBy })
        if (!username && typeof username != "string") {
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        }
        console.log({
            username, line, groupBy
        })
        const response = await cantidadVentasPorZonasVendedor(+username, line, groupBy);
        console.log({ response })
        const data = response.map(r => ({
            ...r,
            cumplimiento: r.Quota == 0 ? 0 : r.Sales / r.Quota
        }))
        console.log({ data })
        return res.status(200).json({
            response: data,
            mensaje: "Todas las zonas del usuario"
        });
    } catch (err) {
        console.log('error en cantidadVentasPorZonaController')
        console.log({ err })
        return res.status(500).json({ mensaje: `Error en cantidadVentasPorZonaController: ${err.message}` })
    }
}

const cantidadVentasPorZonaMesAnteriosController = async (req = request, res = response) => {
    try {
        const { username, line, groupBy } = req.body;
        console.log({ username, line, groupBy })
        if (!username && typeof username != "string") {
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        }
        console.log({
            username, line, groupBy
        })
        const response = await cantidadVentasPorZonasMesAnt(username, line, groupBy);
        console.log({ response })
        const data = response.map(r => ({
            ...r,
            cumplimiento: r.Quota == 0 ? 0 : r.Sales / r.Quota
        }))
        console.log({ data })
        return res.status(200).json({
            response: data,
            mensaje: "Todas las zonas del usuario"
        });
    } catch (err) {
        console.log('error en cantidadVentasPorZonaMesAnteriosController')
        console.log({ err })
        return res.status(500).json({ mensaje: `Error en cantidadVentasPorZonaMesAnteriosController: ${err.message}` })
    }
}

const clienteByVendedorController = async (req, res) => {
    try {
        const { listSuc } = req.body
        let listClientes = []

        for (const element of listSuc) {
            const clientes = await clienteByVendedor(element)
            listClientes = [...listClientes, ...clientes]
        }

        return res.json(listClientes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const lineasController = async (req, res) => {
    try {
        const lineaslist = await lineas()
        let list = []
        for (const element of lineaslist) {
            list.push({
                LineItemCode: +element.LineItemCode,
                LineItemName: element.LineItemName
            })
        }
        return res.json(list)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en lineasController' })
    }
}

const sublineasController = async (req, res) => {
    try {
        const lineaslist = await sublineas()
        return res.json(lineaslist)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en sublineasController' })
    }
}

const reporteVentasClienteLineas = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const dimensionCCode = req.query.dimensionCCode
        const startDate = req.query.startDate
        const endDate = req.query.endDate
        const analisis = await analisisVentas(cardCode, dimensionCCode, startDate, endDate)
        let listAnalisis = []
        for (const element of analisis) {
            const { SalesNetTotal, ReturnedNetTotal, ...restData } = element
            const ventaNeta = Number(SalesNetTotal) - Number(ReturnedNetTotal)
            listAnalisis.push({
                ...element,
                ventaNeta
            })
        }
        return res.json(listAnalisis)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const clienteByCardCodeController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const cliente = await clienteByCardCode(cardCode)
        if (cliente.length == 0) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' })
        }
        const client = cliente[0]
        return res.json(client)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const insertarUbicacionClienteController = async (req, res) => {
    try {
        const { cliente, latitud, longitud, id_vendedor_sap } = req.body;
        const response = await insertarUbicacionCliente(cliente, latitud, longitud, id_vendedor_sap)

        if (response.status == 400) {
            return res.status(400).json({ mensaje: `${response.message}`, response })
        }

        return res.json(response.data)
    } catch (error) {
        console.log('error en insertarUbicacionClienteController')
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en insertarUbicacionClienteController: ${error.message}` })
    }
}

const obtenerClientesSinUbicacionController = async (req, res) => {
    try {
        const id_vendedor_sap = req.query.id_vendedor_sap
        const response = await obtenerClientesSinUbicacion(id_vendedor_sap)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador obtenerClientesSinUbicacionController: ${error.message}` })
    }
}

const getYTDByVendedorController = async (req, res) => {
    try {
        const { codVendedor, tipo, linea, sublinea, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2 } = req.body
        console.log({ body: req.body })
        const response = await getYTDByVendedor(codVendedor, tipo, linea, sublinea, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const getYTDDelVendedorController = async (req, res) => {
    try {
        const { sucCode, linea, sublinea, fechaInicio1, fechaFin1 } = req.body
        console.log({ body: req.body })
        const response = await getYTDDelVendedor(sucCode, linea, sublinea, fechaInicio1, fechaFin1)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getYTDDelVendedorController: ${error.message}` })
    }
}

const clientesSinUbicacionSupervisorController = async (req, res) => {
    try {
        const clientes = await clientesSinUbicacionSupervisor()
        return res.json(clientes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en el controlador',
            error,
        })
    }
}

const allCampaignFilterController = async (req, res) => {
    try {
        const idCampaign = req.query.idCampaign
        const agrupar = req.query.agrupar
        const codAgencia = req.query.codAgencia
        const codVendedor = req.query.codVendedor
        const codLinea = req.query.codLinea
        const allCampaign = await allCampaignFilter(idCampaign, agrupar, codAgencia, codVendedor, codLinea)
        // return res.json(allCampaign)
        const transformed = transformData(allCampaign)
        transformed.forEach(item => {
            item.Periods.sort((a, b) => {
                const dateA = new Date(a.year, a.month - 1);
                const dateB = new Date(b.year, b.month - 1);
                return dateA - dateB;
            });
        });
        return res.json(transformed)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'Error en el controlador',
            error,
        })
    }
}

function transformData(data) {
    const allPeriodsSet = new Set();
    const grouped = {};
    for (const item of data) {

        const [monthStr, yearStr] = item.Period.split('-');
        const year = parseInt(yearStr, 10);
        const month = monthStr.padStart(2, '0')
        const periodKey = `${month}-${year}`;
        allPeriodsSet.add(periodKey);

        const groupKey = item.ItemCode;

        if (!grouped[groupKey]) {
            grouped[groupKey] = {
                SucName: item.SucName || '',
                ZoneName: item.ZoneName || '',
                SalesPerson: item.SalesPerson || '',
                LineItemName: item.LineItemName || '',
                SubLineItemName: item.SubLineItemName || '',
                ItemCode: item.ItemCode,
                ItemName: item.ItemName,
                periodsMap: new Map()
            };
        }

        grouped[groupKey].periodsMap.set(periodKey, {
            month,
            year,
            SalesQuantity: item.SalesQuantity,
            QuotaSalesQuantity: item.CampSalesQuantity ?? null
        });
    }

    const allPeriods = Array.from(allPeriodsSet).map(p => {
        const [month, year] = p.split('-');
        return { month, year: parseInt(year, 10) };
    });

    const result = Object.values(grouped).map(group => {
        const periods = allPeriods.map(({ month, year }) => {
            const key = `${month}-${year}`;
            const found = group.periodsMap.get(key);
            return found || {
                month,
                year,
                SalesQuantity: null,
                QuotaSalesQuantity: null
            };
        });

        delete group.periodsMap;
        return { ...group, Periods: periods };
    });

    return result;
}

const createCampaignController = async (req, res) => {
    try {
        const { name, descrip, sucCode, starDate, endDate } = req.body
        if (!req.file) {
            console.log({ files: req.file });
            return res.status(400).json({
                mensaje: 'Archivo no obtenido',
                file: req.file
            });
        }

        console.log({ file: req.file })
        const { path, originalname } = req.file;
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length == 0) {
            return res.status(400).json({
                mensaje: 'No hay datos para insertar en la campaña'
            })
        }

        const { valido, error } = validarExcel(jsonData)
        if (!valido) {
            return res.json({ valido, mensaje: error })
        }

        const createCampaignResponse = await createCampaign(name, descrip, sucCode, starDate, endDate)
        console.log({ jsonData, name, descrip, sucCode, starDate, endDate })

        if (createCampaignResponse.length == 0) {
            return res.status(400).json({
                mensaje: 'Hubo un error al intentar crear la campaña'
            })
        }

        const id = createCampaignResponse[0].ID
        let idx = 0
        for (const element of jsonData) {
            const { codigoZona, itemCode, cantidad } = element
            const validacionZona = await validateZona(+codigoZona)
            const validacionItem = await validateItem(itemCode)
            if (validacionZona.length == 0 || validacionItem.length == 0) {
                const bannedCampaignExecute = await bannedCampaign(id)
                const rollBack = await rollBackCampaignById(id)
                let mensaje = `Hubo un Error en la validacion. `
                mensaje += (validacionZona.length == 0)
                    ? `Verifique el codigo de la zona : ${codigoZona}, con el item : ${itemCode}, en el indice : ${idx + 2}`
                    : `Verifique el codigo del Item : ${itemCode}, con el codigo de zona: ${codigoZona}, en el indice : ${idx + 2}`
                return res.status(400).json({
                    mensaje,
                    element,
                    bannedCampaignExecute,
                    rollBack,
                    id
                })
            }

            const createDetailsResponse = await createDetailsCampaign(id, codigoZona, itemCode, cantidad)
            idx++
        }
        return res.json({
            id,
            name,
            descrip,
            sucCode,
            starDate,
            endDate,
            jsonData,
        });

    } catch (error) {
        console.log({ error })
        let mensaje = 'Error al Crear una Campaña. '
        if (error.message) {
            const errorDataBase = error.message
            switch (true) {
                case errorDataBase.includes('unique'):
                    mensaje += 'El nombre de la Campaña debe ser Unico';
                    break;
                case errorDataBase.includes('Error en createCampaign: error en la consulta: sql syntax'):
                    mensaje += 'La sucursal no es un numero';
                    break;
                case errorDataBase.includes('Error en validateItem: error en la consulta: sql syntax'):
                    mensaje += 'El codigo del item no es valido';
                    break;
                case errorDataBase.includes('string is longer than the maximum length (100)'):
                    mensaje += 'El nombre de la Campaña excede la logitud permitida (100)';
                    break;

                default:
                    mensaje += error.message;
                    break;
            }

        }
        return res.status(500).json({ mensaje, error })
    }
}

const allCampaignController = async (req, res) => {
    try {
        const campaigns = await allCampaign()
        let data = []
        for (const element of campaigns) {
            const { AGENYCODE, ...restData } = element
            const agencyData = await agencyBySucCode(+AGENYCODE)
            if (agencyData.length !== 0) {
                console.log({ agencyData, element })
                const sucName = agencyData[0].SucName
                data.push({ ...restData, AGENCYCODE: AGENYCODE, AGENCYNAME: sucName })
            } else {
                data.push({ ...restData, AGENCYCODE: AGENYCODE, AGENCYNAME: '' })
            }
        }

        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador', error })
    }
}

const allAgenciesController = async (req, res) => {
    try {
        const campaigns = await allAgencies()
        return res.json(campaigns)
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error en el controlador', error })
    }
}

const campaignByIdController = async (req, res) => {
    try {
        const id = req.query.id
        const data = await oneCampaignById(id)
        if (data.length == 0) {
            return res.status(404).json({ mensaje: 'La campaña no se encontro' })
        }
        const { AGENYCODE, ...rest } = data[0]
        const agencyData = await agencyBySucCode(+AGENYCODE)
        console.log({ agencyData })
        const campaignFormatted = { ...rest, AGENCYCODE: AGENYCODE, AGENCYNAME: agencyData[0].SucName }
        return res.json(campaignFormatted)
    } catch (error) {
        console.log({ error })
        return res.json({
            mensaje: 'Error en el controlador',
            error
        })
    }
}

const getYTDMontoByVendedorController = async (req, res) => {
    try {
        const { codVendedor, tipo, linea, sublinea, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2 } = req.body
        console.log({ body: req.body })
        const response = await getYTDMontoByVendedor(codVendedor, tipo, linea, sublinea, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const getYTDDelVendedorMontoController = async (req, res) => {
    try {
        const { sucCode, linea, sublinea, fechaInicio1, fechaFin1 } = req.body
        console.log({ body: req.body })
        const response = await getYTDDelVendedorMonto(sucCode, linea, sublinea, fechaInicio1, fechaFin1)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getYTDDelVendedorMontoController: ${error.message}` })
    }
}

const ReporteOfertaPDFController = async (req, res) => {
    let browser;
    try {
        const id = req.query.id

        const response = await reporteOfertaPDF(id)
        if (response.length == 0) {
            return res.status(400).json({ mensaje: `No se encontraron datos de la oferta` })
        }
        const dataHeader = response[0]
        const listDetails = []

        const { ItemCode, CodeBars, Dscription, UomCode, Quantity, Price, LineTotal, DescLinea, ...header } = dataHeader

        for (const element of response) {
            const { ItemCode, CodeBars, Dscription, UomCode, Quantity, Price, LineTotal, DescLinea } = element
            listDetails.push({
                ItemCode,
                CodeBars,
                Dscription,
                UomCode,
                Quantity: +Quantity,
                Price: parseFloat(Price).toFixed(2),
                LineTotal: parseFloat(LineTotal).toFixed(2),
                DescLinea: parseFloat(DescLinea).toFixed(2),
            })
        }
        const data = {
            ...header,
            detalle: listDetails
        }
        data.DocTotal = parseFloat(data.DocTotal).toFixed(2)
        data.DocDate = data.DocDate.split(' ')[0]
        const time = data.DocTime
        const time1 = `${time[0]}${time[1]}:${time[2]}${time[3]}`
        const time2 = `0${time[0]}:${time[1]}${time[2]}`
        data.DocTime = (time.length == 4) ? time1 : time2
        // return res.json({ data })
        const ejs = require('ejs');
        const htmlTemplate = path.join(__dirname, './pdf/template.ejs'); // Ruta del archivo template.ejs
        const htmlContent = await ejs.renderFile(htmlTemplate, {
            data,
            staticBaseUrl: process.env.STATIC_BASE_URL,
        });


        browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        console.log('PDF Buffer Size:', pdfBuffer.length);

        const fileName = `${data.CardName}_${new Date()}.pdf`.replace(' ', '').trim()

        await browser.close();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        return res.end(pdfBuffer);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
    finally {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error("Error al cerrar el navegador:", err.message);
            }
        }
    }
}

const getCoberturaController = async (req, res) => {
    try {
        const { sucCode, mes, año } = req.body
        console.log({ body: req.body })
        const response = await getCobertura(sucCode, mes, año)
        response.sort((a, b) => a.SlpCode - b.SlpCode);
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getCoberturaVendedorController: ${error.message}` })
    }
}

const clientesNoVentaController = async (req, res) => {
    try {
        const { sucCode } = req.body
        console.log({ body: req.body })
        const response = await clientesNoVenta(sucCode)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en clientesNoVentaController: ${error.message}` })
    }
}

const clientesNoVentaPorVendedorController = async (req, res) => {
    try {
        const { vendedorCode } = req.body
        console.log({ body: req.body })
        const response = await clientesNoVentaPorVendedor(vendedorCode)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en clientesNoVentaPorVendedorController: ${error.message}` })
    }
}

const getVendedoresThatHasClientsController = async (req, res) => {
    try {
        const { sucCode } = req.query
        const response = await vendedoresAsignedWithClientsBySucursal(sucCode)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getVendedoresThatHasClientsController: ${error.message}` })
    }
}

const facturasMoraByClientController = async (req, res) => {
    try {
        const { cardCode } = req.query
        const response = await facturasMoraByClients(cardCode)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en facturasMoraByClientController: ${error.message}` })
    }
}

const clientesMoraController = async (req, res) => {
    try {
        const { listSucCode, slpCode } = req.body
        console.log({ listSucCode, slpCode })
        let listResult = []
        for (const sucCode of listSucCode) {
            const response = await clientesConMora(sucCode, slpCode)
            // console.log({response})
            const cardMap = new Map();
            response.map((item) => {
                if (item.CardCode && item.CardCode !== '') {
                    const {
                        LicTradNum,
                        Comments,
                        JrnlMemo,
                        DocTotal,
                        DocEntry,
                        DocNum,
                        U_RAZSOC,
                        NumAtCard,
                        FiscalDate,
                        U_B_cuf,
                        U_B_path,
                        ...restData
                    } = item

                    const {
                        PymntGroup,
                        CardCode,
                        CardName,
                        GroupName,
                        SucName,
                        AreaName,
                        ZoneName,
                        SlpNameCli,
                        CardFName,
                        DaysDue
                    } = restData

                    if (cardMap.has(CardCode)) {
                        const existing = cardMap.get(CardCode);
                        if (DaysDue > existing.DaysDue) {
                            cardMap.set(CardCode, {
                                PymntGroup,
                                CardCode,
                                CardName,
                                GroupName,
                                SucName,
                                AreaName,
                                ZoneName,
                                SlpNameCli,
                                CardFName,
                                DaysDue,
                                Facturas: []
                            });
                        }
                    } else {
                        cardMap.set(CardCode, {
                            PymntGroup,
                            CardCode,
                            CardName,
                            GroupName,
                            SucName,
                            AreaName,
                            ZoneName,
                            SlpNameCli,
                            CardFName,
                            DaysDue,
                            Facturas: []
                        });
                    }
                }
            })

            const listCardCode = Array.from(cardMap.values())

            listCardCode.map((itemData) => {

                const listDataFacturas = response
                    .filter(item => item.CardCode === itemData.CardCode)
                    .map(item => {
                        const {
                            LicTradNum,
                            Comments,
                            JrnlMemo,
                            DocTotal,
                            DocEntry,
                            DocNum,
                            U_RAZSOC,
                            NumAtCard,
                            FiscalDate,
                            U_B_cuf,
                            U_B_path,
                            DaysDue,
                        } = item;

                        return {
                            LicTradNum,
                            Comments,
                            JrnlMemo,
                            DocTotal,
                            DocEntry,
                            DocNum,
                            U_RAZSOC,
                            NumAtCard,
                            FiscalDate,
                            U_B_cuf,
                            DaysDue,
                            U_B_path,
                        }
                    })

                itemData.Facturas = listDataFacturas
            })
            listResult = [...listResult, ...listCardCode]
        }

        return res.json(listResult)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en facturasMoraByClientController: ${error.message}` })
    }
}

const vendedorPorSucCodeController = async (req, res) => {
    try {
        const { sucCode } = req.query
        const response = await vendedorPorSucCode(sucCode)
        const data = response.filter((vendedor) => vendedor.SlpCode !== -1)
        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en vendedorPorSucCodeController: ${error.message}` })
    }
}

const vendedorPorListSucCodeController = async (req, res) => {
    try {
        const { listSuc } = req.body
        console.log({ listSuc })
        let responseData = []

        for (const element of listSuc) {
            const response = await vendedorPorSucCode(element)
            const data = response.filter((vendedor) => vendedor.SlpCode !== -1)
            responseData = [...responseData, ...data]
        }

        return res.json(responseData)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en vendedorPorSucCodeController: ${error.message}` })
    }
}

const excelClientesMoraController = async (req, res) => {
    try {
        const { sucCode, slpCode } = req.query
        const response = await clientesConMora(sucCode, slpCode)
        const cardMap = new Map();
        response.map((item) => {
            if (item.CardCode && item.CardCode !== '') {
                const {
                    LicTradNum,
                    Comments,
                    JrnlMemo,
                    DocTotal,
                    DocEntry,
                    DocNum,
                    U_RAZSOC,
                    NumAtCard,
                    FiscalDate,
                    U_B_cuf,
                    U_B_path,
                    ...restData
                } = item

                const {
                    PymntGroup,
                    CardCode,
                    CardName,
                    GroupName,
                    SucName,
                    AreaName,
                    ZoneName,
                    SlpNameCli,
                    CardFName,
                    DaysDue
                } = restData

                if (cardMap.has(CardCode)) {
                    const existing = cardMap.get(CardCode);
                    if (DaysDue > existing.DaysDue) {
                        cardMap.set(CardCode, {
                            PymntGroup,
                            CardCode,
                            CardName,
                            GroupName,
                            SucName,
                            AreaName,
                            ZoneName,
                            SlpNameCli,
                            CardFName,
                            DaysDue,
                            Facturas: []
                        });
                    }
                } else {
                    cardMap.set(CardCode, {
                        PymntGroup,
                        CardCode,
                        CardName,
                        GroupName,
                        SucName,
                        AreaName,
                        ZoneName,
                        SlpNameCli,
                        CardFName,
                        DaysDue,
                        Facturas: []
                    });
                }
            }
        })

        const listCardCode = Array.from(cardMap.values())

        listCardCode.map((itemData) => {

            const listDataFacturas = response
                .filter(item => item.CardCode === itemData.CardCode)
                .map(item => {
                    const {
                        LicTradNum,
                        Comments,
                        JrnlMemo,
                        DocTotal,
                        DocEntry,
                        DocNum,
                        U_RAZSOC,
                        NumAtCard,
                        FiscalDate,
                        U_B_cuf,
                        U_B_path,
                        DaysDue,
                    } = item;
                    // const dataFormated = FiscalDate.split
                    return {
                        LicTradNum,
                        Comments,
                        JrnlMemo,
                        DocTotal,
                        DocEntry,
                        DocNum,
                        U_RAZSOC,
                        NumAtCard,
                        FiscalDate: `${FiscalDate.split(' ')[0] || ''}`,
                        U_B_cuf,
                        DaysDue,
                        U_B_path,
                    }
                })

            itemData.Facturas = listDataFacturas
        })

        // return res.json(listCardCode)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Clientes y Facturas');

        worksheet.columns = [
            { header: 'Codigo', key: 'CardCode', width: 15 },
            { header: 'Nombre', key: 'CardName', width: 30 },
            { header: 'Zona', key: 'ZoneName', width: 20 },
            { header: 'Factura Nro', key: 'DocNum', width: 15 },
            { header: 'Monto Total', key: 'DocTotal', width: 15 },
            { header: 'Fecha Fiscal', key: 'FiscalDate', width: 20 },
            { header: 'CUF', key: 'U_B_cuf', width: 60 },
        ];

        for (const cliente of listCardCode) {
            const clienteRow = worksheet.addRow({
                CardCode: cliente.CardCode,
                CardName: cliente.CardName,
                ZoneName: cliente.ZoneName,
            });

            clienteRow.font = { bold: true };
            clienteRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD9E1F2' },
            };

            for (const factura of cliente.Facturas) {
                worksheet.addRow({
                    CardCode: '',
                    CardName: '',
                    ZoneName: '',
                    DocNum: factura.DocNum,
                    DocTotal: +factura.DocTotal,
                    FiscalDate: factura.FiscalDate,
                    U_B_cuf: factura.U_B_cuf,
                });
            }

            worksheet.addRow({});
        }

        const filePath = path.join(__dirname, './excel/Clientes_Facturas.xlsx');
        await workbook.xlsx.writeFile(filePath);

        res.download(filePath, 'Clientes_Facturas.xlsx', (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
                return res.status(500).json({ mensaje: 'Error al enviar el archivo.' });
            }

            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error al eliminar el archivo:', unlinkErr);
                }
            });
        });

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en excelClientesMoraController: ${error.message}` })
    }
}

const reporteUbicacionClienteController = async (req, res) => {
    try {
        const { sucCode, SlpCode } = req.query
        console.log({ sucCode, SlpCode })
        let responseConUbi = await reporteConUbicacionCliente(sucCode)
        let responseSinUbi = await reporteSinUbicacionCliente(sucCode)

        if (SlpCode && SlpCode !== '0') {
            console.log({ SlpCode })
            responseConUbi = responseConUbi.filter((item) => item.SlpCodeCli == +SlpCode)
            responseSinUbi = responseSinUbi.filter((item) => item.SlpCodeCli == +SlpCode)
        }
        return res.json({
            responseConUbi,
            responseSinUbi,
            totalUbi: responseConUbi.length,
            totalSinUbi: responseSinUbi.length
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en reporteUbicacionClienteController: ${error.message}` })
    }
}

const agregarSolicitudDeDescuentoController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { solicitudes, p_SlpCode, p_SlpName, p_CreatedBy } = req.body
        let responses = []
        for (const solicitud of solicitudes) {
            let { p_ClientCode, p_ClientName, p_ItemCode, p_ItemName, p_CantMin, p_DescPrct, p_FechaIni, p_FechaFin } = solicitud
            if (!p_FechaIni || p_FechaIni === '') {
                const fecha = new Date()
                p_FechaIni = fecha.toISOString()
            }
            if (!p_FechaFin || p_FechaFin === '') {
                const fechaIni = new Date(p_FechaIni)
                fechaIni.setDate(fechaIni.getDate() + 3)
                p_FechaFin = fechaIni.toISOString()
            }
            const response = await agregarSolicitudDeDescuento(p_SlpCode, p_SlpName, p_ClientCode, p_ClientName,
                p_ItemCode, p_ItemName, p_CantMin, p_DescPrct, p_FechaIni, p_FechaFin, p_CreatedBy)

            console.log({ response })
            responses.push({ response })
        }
        grabarLog(user.USERCODE, user.USERNAME, "Venta Solicitar Descuento", `Exito al solicitar un descuento`, 'ifa_crm_solicitar_descuento',
            "venta/solicitar-descuento", process.env.PRD)

        return res.json({
            responses
        })
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Venta Solicitar Descuento", `${error.message || 'Error en agregarSolicitudDeDescuentoController'}`, 'ifa_crm_solicitar_descuento',
            "venta/solicitar-descuento", process.env.PRD)
        return res.status(500).json({ mensaje: `Error en agregarSolicitudDeDescuentoController: ${error.message}` })
    }
}

const getClientNameController = async (req, res) => {
    try {
        const { cardCode } = req.body
        let response = await getClientName(cardCode)
        if (response.length > 0) {
            return res.json(response[0].CardName)
        } else {
            return res.status(400).json({ mensaje: 'No se encontró el cliente' })
        }
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getClientNameController: ${error.message}` })
    }
}

const actualizarStatusSolicitudDescuentoController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { id, status, p_CreatedBy, p_SlpCode, p_ClientCode, p_ItemCode } = req.body
        const response = await actualizarStatusSolicitudDescuento(id ?? -1, status, p_CreatedBy, p_SlpCode ?? -1, p_ClientCode, p_ItemCode)
        grabarLog(user.USERCODE, user.USERNAME, "Venta Actualizar Status Descuento", `Exito al actualizar el status de la solicitud de descuento`, 'IFA_CRM_ACTUALIZAR_STATUS_SOLICITUD_DESCUENTO',
            "venta/cambiar-status-solicitud-des", process.env.PRD)
        return res.json(
            response
        )
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Venta Actualizar Status Descuento", `${error.message || 'Error en actualizarStatusSolicitudDescuentoController'}`, 'IFA_CRM_ACTUALIZAR_STATUS_SOLICITUD_DESCUENTO',
            "venta/cambiar-status-solicitud-des", process.env.PRD)
        return res.status(500).json({ mensaje: `Error en actualizarStatusSolicitudDescuentoController: ${error.message}` })
    }
}

const actualizarVariosStatusSolicitudDescuentoController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { ids, status, p_CreatedBy } = req.body
        const responses = []
        for (const id of ids) {
            const response = await actualizarStatusSolicitudDescuento(id ?? -1, status, p_CreatedBy, -1, '', '')
            responses.push(response)
        }
        grabarLog(user.USERCODE, user.USERNAME, "Venta Actualizar Status Descuento", `Exito al actualizar el status de la solicitud de descuento`, 'IFA_CRM_ACTUALIZAR_STATUS_SOLICITUD_DESCUENTO',
            "venta/cambiar-status-solicitudes-des", process.env.PRD)
        return res.json(
            responses
        )
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Venta Actualizar Status Descuento", `${error.message || 'Error en actualizarStatusSolicitudDescuentoController'}`, 'IFA_CRM_ACTUALIZAR_STATUS_SOLICITUD_DESCUENTO',
            "venta/cambiar-status-solicitudes-des", process.env.PRD)
        return res.status(500).json({ mensaje: `Error en actualizarStatusSolicitudDescuentoController: ${error.message}` })
    }
}

const getVendedoresSolicitudDescByStatusController = async (req, res) => {
    try {
        const { status } = req.query
        const response = await getVendedoresSolicitudDescByStatus(status)
        console.log({ response })
        return res.json(
            response
        )
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getVendedoresSolicitudDescByStatusController: ${error.message}` })
    }
}

const getVendedoresSolicitudDescByStatusSucursalController = async (req, res) => {
    try {
        const { status, sucursal } = req.query
        let response
        if (sucursal == 0)
            response = await getVendedoresSolicitudDescByStatus(status)
        else
            response = await getVendedoresSolicitudDescByStatusSucursal(status, sucursal)
        console.log({ response })
        return res.json(
            response
        )
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getVendedoresSolicitudDescByStatusSucursalController: ${error.message}` })
    }
}

const getSolicitudesDescuentoByStatusController = async (req, res) => {
    try {
        const { status, slpCode } = req.body
        const response = await getSolicitudesDescuentoByStatus(status, slpCode)
        return res.json(
            response
        )
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getSolicitudesDescuentoByStatusController: ${error.message}` })
    }
}

const actualizarSolicitudDescuentoController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { id, p_FechaIni, p_FechaFin, p_CantMin, p_DescPrct } = req.body
        const response = await actualizarSolicitudDescuento(id, p_FechaIni, p_FechaFin, p_CantMin, p_DescPrct)
        console.log({ response })
        grabarLog(user.USERCODE, user.USERNAME, "Venta Editar Descuento", `Exito al editar la solicitud de descuento`, 'IFA_CRM_EDITAR_SOLICITUD_DESCUENTO',
            "venta/actualizar-solicitud-desc", process.env.PRD)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Venta Editar Descuento", `${error.message || 'Error en actualizarSolicitudDescuentoController'}`,
            'IFA_CRM_EDITAR_SOLICITUD_DESCUENTO', "venta/actualizar-solicitud-desc", process.env.PRD)
        return res.status(500).json({ mensaje: `Error en actualizarSolicitudDescuentoController: ${error.message}` })
    }
}

const actualizarSolicitudesDescuentoController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { solicitudes } = req.body
        const responses = []
        for (const solicitud of solicitudes) {
            const { id, p_FechaIni, p_FechaFin, p_CantMin, p_DescPrct } = solicitud
            const response = await actualizarSolicitudDescuento(id, p_FechaIni, p_FechaFin, p_CantMin, p_DescPrct)
            console.log({ response })
            responses.push(response)
        }
        grabarLog(user.USERCODE, user.USERNAME, "Venta Editar Descuentos", `Exito al editar las solicitudes de descuento`, 'IFA_CRM_EDITAR_SOLICITUD_DESCUENTO',
            "venta/actualizar-solicitudes-desc", process.env.PRD)
        return res.json(responses)
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Venta Editar Descuentoa", `${error.message || 'Error en actualizarSolicitudesDescuentoController'}`,
            'IFA_CRM_EDITAR_SOLICITUD_DESCUENTO', "venta/actualizar-solicitudes-desc", process.env.PRD)
        return res.status(500).json({ mensaje: `Error en actualizarSolicitudesDescuentoController: ${error.message}` })
    }
}

const deleteSolicitudDescuentoController = async (req, res) => {
    try {
        const { id } = req.query
        const response = await deleteSolicitudDescuento(id)
        console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en deleteSolicitudDescuentoController: ${error.message}` })
    }
}

// const notificationSubscriptionController = async (req, res) => {
//     let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
//     try {
//         const subscription = JSON.stringify(req.body);
//         const response = await notificationSubscription(subscription)
//         console.log({ response })
//         return res.json(response)
//     } catch (error) {
//         console.log({ error })
//         grabarLog(user.USERCODE, user.USERNAME, "Subscripcion Notificacion", `${error.message || 'Error en notificationSubscriptionController'}`, 'PUSH_SUBSCRIPTIONS',
//             "venta/notification-subscribe", process.env.PRD)
//         return res.status(500).json({ mensaje: `Error en notificationSubscriptionController: ${error.message}` })
//     }
// }

// const notificationUnsubscribeController = async (req, res) => {
//     try {
//         const subscription = JSON.stringify(req.body);
//         const response = await notificationUnsubscribe(subscription)
//         console.log({ response })
//         return res.json(response)
//     } catch (error) {
//         console.log({ error })
//         return res.status(500).json({ mensaje: `Error en notificationUnsubscribeController: ${error.message}` })
//     }
// }

// webpush.setVapidDetails(
//     'mailto:',
//     process.env.VAPID_KEY_PUBLIC,
//     process.env.VAPID_KEY_PRIVATE
// );
// const sendNotificationController = async (req, res) => {
//     let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
//     try {
//         const { title, body, vendedor, rol, excludeEndpoint, usuario } = req.body
//         console.log({ excludeEndpoint })
//         const date = new Date()
//         let dato = {
//             title: `${title}`,
//             body: `${body}`,
//             created_at: date,
//             vendedor: vendedor,
//         }
//         const rows = await getSubscriptions()
//         console.log({ rows })


//         const responseInsert = await insertNotification(title, body, vendedor, rol, date.toISOString(), usuario)
//         console.log({ responseInsert })
//         //{ status: 200,
//         //  result: [ { V_ID_NOTIFICACION: 4 } ]
//         //}
//         if (responseInsert.status == 200)
//             dato.id = responseInsert.result[0].V_ID_NOTIFICACION

//         rows.forEach(row => {
//             const sub = JSON.parse(row.Subscription);
//             if (sub.endpoint !== excludeEndpoint) {
//                 webpush.sendNotification(sub, JSON.stringify(dato)).catch(err => console.error('Push error:', err));
//             } else {
//                 console.log('Excluded', sub.endpoint);
//             }
//         });
//         grabarLog(user.USERCODE, user.USERNAME, "Enviar Notificacion", `Exito al enviar la notificacion`, 'INSERTAR_NOTIFICACION',
//             "venta/send-notification", process.env.PRD)
//         return res.send(dato);
//     } catch (error) {
//         console.log({ error })
//         grabarLog(user.USERCODE, user.USERNAME, "Enviar Notificacion", `${error.message || 'Error en sendNotificationController'}`, 'INSERTAR_NOTIFICACION',
//             "venta/send-notification", process.env.PRD)
//         return res.status(500).json({ mensaje: `Error en sendNotificationController: ${error.message}` })
//     }
// }

// const getNotificationController = async (req, res) => {
//     try {
//         const { vendedor, usuario } = req.body

//         const response = await getNotifications(vendedor, usuario)
//         return res.json(response);
//     } catch (error) {
//         console.error({ error })
//         return res.status(500).json({ mensaje: `Error en el controlador getNotificationController: ${error.message || ''}` })
//     }
// }

// const deleteNotificationController = async (req, res) => {
//     try {
//         const { id_notification, id_usuario } = req.body
//         const response = await deleteNotification(id_notification, id_usuario)
//         console.log(response)
//         return res.json(response);
//     } catch (error) {
//         console.error({ error })
//         return res.status(500).json({ mensaje: `Error en el controlador deleteNotificationController: ${error.message || ''}` })
//     }
// }

const ventasPresupuestoSubLinea = async (req, res) => {
    try {
        let response = await getVentasPrespuestosSubLinea();
        const resultado = [];
        // console.log(response);
        // return res.status(200).json(response);

        for (const item of response) {
            const {
                DimensionACode,
                DimensionA,
                DimensionBCode,
                DimensionB,
                DimensionC,
                DimensionCCode,
                DimensionC1Code,
                DimensionC1,
                Sales,
                Quota
            } = item;

            // Nivel A
            let grupoA = resultado.find(a => a.DimensionACode === DimensionACode);
            if (!grupoA) {
                grupoA = {
                    DimensionACode,
                    DimensionA,
                    data: []
                };
                resultado.push(grupoA);
            }

            // Nivel B dentro de A
            let grupoB = grupoA.data.find(b => b.DimensionBCode === DimensionBCode);
            if (!grupoB) {
                grupoB = {
                    DimensionBCode,
                    DimensionB,
                    data: []
                };
                grupoA.data.push(grupoB);
            }

            // Nivel C1 dentro de B
            let grupoC = grupoB.data.find(c => c.DimensionCCode === DimensionCCode);
            if (!grupoC) {
                grupoC = {
                    DimensionC,
                    DimensionCCode,
                    children: []
                };
                grupoB.data.push(grupoC);
            }

            // Nivel C1 dentro de C
            let grupoC1 = grupoC.children.find(c1 => c1.DimensionC1Code === DimensionC1Code);
            if (!grupoC1) {
                grupoC1 = {
                    DimensionC1,
                    DimensionC1Code,
                    Sales: 0,
                    Quota: 0
                };
                grupoC.children.push(grupoC1);
            }

            grupoC1.Sales += parseFloat(Sales);
            grupoC1.Quota += parseFloat(Quota);
        }
        return res.status(200).json(resultado);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en ventasPresupuestoSubLinea: ${error.message}` })
    }
}

const ventasPresupuestoSubLineaAnterior = async (req, res) => {
    try {
        let response = await getVentasPrespuestosSubLineaAnterior();
        const resultado = [];
        console.log(response);

        for (const item of response) {
            const {
                DimensionACode,
                DimensionA,
                DimensionBCode,
                DimensionB,
                DimensionC,
                DimensionCCode,
                DimensionC1Code,
                DimensionC1,
                Sales,
                Quota
            } = item;

            // Nivel A
            let grupoA = resultado.find(a => a.DimensionACode === DimensionACode);
            if (!grupoA) {
                grupoA = {
                    DimensionACode,
                    DimensionA,
                    data: []
                };
                resultado.push(grupoA);
            }

            // Nivel B dentro de A
            let grupoB = grupoA.data.find(b => b.DimensionBCode === DimensionBCode);
            if (!grupoB) {
                grupoB = {
                    DimensionBCode,
                    DimensionB,
                    data: []
                };
                grupoA.data.push(grupoB);
            }

            let grupoC = grupoB.data.find(c => c.DimensionCCode === DimensionCCode);
            if (!grupoC) {
                grupoC = {
                    DimensionC,
                    DimensionCCode,
                    children: []
                };
                grupoB.data.push(grupoC);
            }

            // Nivel C1 dentro de C
            let grupoC1 = grupoC.children.find(c1 => c1.DimensionC1Code === DimensionC1Code);
            if (!grupoC1) {
                grupoC1 = {
                    DimensionC1,
                    DimensionC1Code,
                    Sales: 0,
                    Quota: 0
                };
                grupoC.children.push(grupoC1);
            }

            // Sumar valores
            grupoC1.Sales += parseFloat(Sales);
            grupoC1.Quota += parseFloat(Quota);
        }
        return res.status(200).json(resultado);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en ventasPresupuestoSubLinea: ${error.message}` })
    }
}

const getSolicitudesDescuentoByVendedorController = async (req, res) => {
    try {
        const { id } = req.query
        const response = await getSolicitudesDescuentoByVendedor(id)
        console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getSolicitudesDescuentoByVendedorController: ${error.message}` })
    }
}

const getVendedoresSolicitudDescuentoController = async (req, res) => {
    try {
        const response = await getVendedoresSolicitudDescuento()
        console.log(response)
        return res.json(response);
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador getVendedoresSolicitudDescuentoController'}` })
    }
}

const getVendedorByCodeController = async (req, res) => {
    try {
        const { id } = req.query
        const response = await getVendedorByCode(id)
        if (response.length == 0)
            return res.status(400).json({ mensaje: `No existe vendedor con ese codigo` })
        return res.json(response[0]);
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador getVendedorByCodeController'}` })
    }
}

const getDescuentosDelVendedorParaPedidoController = async (req, res) => {
    try {

        const { cliente, vendedor } = req.body;
        const fecha = new Date()
        const month = `${fecha.getMonth() + 1}`
        const day = `${fecha.getDate()}`
        const data = `${fecha.getFullYear()}${month.padStart(2, '0')}${day.padStart(2, '0')}`
        console.log('cliente, vendedor, data', cliente, vendedor, data);
        const response = await getDescuentosDeVendedoresParaPedido(cliente, vendedor, data)
        console.log('respuestaaa',response)
        return res.json(response);
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador getDescuentosDelVendedorParaPedidoController'}` })
    }
}

const ventasPorZonasVendedor2Controller = async (req, res) => {
    try {
        const { usercode, isAnt } = req.body;
        console.log({ usercode, isAnt })

        const dateNow = new Date();
        const dateMesAnterior = new Date(dateNow);
        dateMesAnterior.setMonth(dateMesAnterior.getMonth() - 1);

        // console.log("end point ----------------- ventasPorZonasVendedor2Controller")
        let response
        if (isAnt == true) {
            console.log('isAnt')
            response = await ventasPorZonasVendedor2(dateMesAnterior.getFullYear(), dateMesAnterior.getMonth() + 1, usercode)
        } else {
            response = await ventasPorZonasVendedor2(dateNow.getFullYear(), dateNow.getMonth() + 1, usercode)
        }
        // console.log(response)

        let LineItemCode = ''
        let totalQuotaByLineItem = {};
        let totalSalesByLineItem = {};
        // let grandTotalQuota = 0;
        // let grandTotalSales = 0;
        // console.log('length', response.length)

        const results = []
        response.forEach((r, index) => {
            if (r.LineItemCode == LineItemCode) {
                const res1 = r
                res1.cumplimiento = +r.cumplimiento
                res1.hide = true
                results.push(res1)

                totalQuotaByLineItem[r.LineItemCode] += +r.Quota;
                totalSalesByLineItem[r.LineItemCode] += +r.Sales;
                // console.log('index', index)
                if ((response.length - 1) == index) {
                    const res = {
                        LineItemCode: `Total ${r.LineItemCode}`,
                        Quota: +totalQuotaByLineItem[r.LineItemCode],
                        Sales: +totalSalesByLineItem[r.LineItemCode],
                        cumplimiento: (+totalSalesByLineItem[r.LineItemCode] / +totalQuotaByLineItem[r.LineItemCode]) * 100,
                        isSubtotal: true,
                        hide: false
                    }
                    results.push(res)
                }
            } else {
                LineItemCode = r.LineItemCode;
                totalQuotaByLineItem[r.LineItemCode] = +r.Quota;
                totalSalesByLineItem[r.LineItemCode] = +r.Sales;

                if (index > 0) {
                    const res = {
                        LineItemCode: `Total ${response[index - 1].LineItemCode}`,
                        Quota: +totalQuotaByLineItem[response[index - 1].LineItemCode],
                        Sales: +totalSalesByLineItem[response[index - 1].LineItemCode],
                        cumplimiento: (+totalSalesByLineItem[response[index - 1].LineItemCode] / +totalQuotaByLineItem[response[index - 1].LineItemCode]) * 100,
                        isSubtotal: true,
                        hide: false
                    }
                    results.push(res)
                }
                const res1 = r
                res1.cumplimiento = +r.cumplimiento
                res1.hide = false
                results.push(res1)

                // console.log('index', index)
                if ((response.length - 1) == index) {
                    const res = {
                        LineItemCode: `Total ${r.LineItemCode}`,
                        Quota: +totalQuotaByLineItem[r.LineItemCode],
                        Sales: +totalSalesByLineItem[r.LineItemCode],
                        cumplimiento: (+totalSalesByLineItem[r.LineItemCode] / +totalQuotaByLineItem[r.LineItemCode]) * 100,
                        isSubtotal: true,
                        hide: false
                    }
                    results.push(res)
                }
            }
            // grandTotalQuota += +r.Quota;
            // grandTotalSales += +r.Sales;
        });
        // console.log({ results })
        return res.json(results);
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador ventasPorZonasVendedor2Controller'}` })
    }
}

const getUbicacionClientesByVendedorController = async (req, res) => {
    try {
        const { id } = req.query;
        const response = await getUbicacionClientesByVendedor(id)
        console.log(response)
        return res.json(response);
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador getUbicacionClientesByVendedorController'}` })
    }
}

const getVentasZonaSupervisorController = async (req, res) => {
    try {
        const { sucursales, isMesAnterior } = req.body
        // console.log({ sucursales, isMesAnterior })
        const user = req.usuarioAutorizado
        const supCode = user.ID_VENDEDOR_SAP || 0
        const dateNow = new Date()
        const dateMesAnterior = new Date(dateNow);
        dateMesAnterior.setMonth(dateMesAnterior.getMonth() - 1)
        console.log({ month: dateNow.getMonth() })
        console.log({ monthAnterior: dateMesAnterior.getMonth() })
        let response = []
        if (isMesAnterior == true || isMesAnterior == 'true') {
            console.log('is mes anterior')
            response = await getVentasZonaSupervisor(dateMesAnterior.getFullYear(), dateMesAnterior.getMonth() + 1, supCode)
        } else {
            console.log('is mes actual')
            response = await getVentasZonaSupervisor(dateNow.getFullYear(), dateNow.getMonth() + 1, supCode)
        }
        // console.log({ response })
        let SucCode = ''
        let totalQuotaByLineItem = {};
        let totalSalesByLineItem = {};

        const results = []
        response.forEach((r, index) => {
            if (r.SucCode == SucCode) {
                const res1 = r
                res1.cumplimiento = +r.cumplimiento
                res1.hide = true
                results.push(res1)

                totalQuotaByLineItem[r.SucCode] += +r.Quota;
                totalSalesByLineItem[r.SucCode] += +r.Sales;
                if ((response.length - 1) == index) {
                    const res = {
                        SucName: `Total ${r.SucName}`,
                        Quota: +totalQuotaByLineItem[r.SucCode],
                        Sales: +totalSalesByLineItem[r.SucCode],
                        cumplimiento: (+totalSalesByLineItem[r.SucCode] / +totalQuotaByLineItem[r.SucCode]) * 100,
                        isSubtotal: true,
                        hide: false
                    }
                    results.push(res)
                }
            } else {
                SucCode = r.SucCode;
                totalQuotaByLineItem[r.SucCode] = +r.Quota;
                totalSalesByLineItem[r.SucCode] = +r.Sales;

                if (index > 0) {
                    const res = {
                        SucName: `Total ${response[index - 1].SucName}`,
                        Quota: +totalQuotaByLineItem[response[index - 1].SucCode],
                        Sales: +totalSalesByLineItem[response[index - 1].SucCode],
                        cumplimiento: (+totalSalesByLineItem[response[index - 1].SucCode] / +totalQuotaByLineItem[response[index - 1].SucCode]) * 100,
                        isSubtotal: true,
                        hide: false
                    }
                    results.push(res)
                }
                const res1 = r
                res1.cumplimiento = +r.cumplimiento
                res1.hide = false
                results.push(res1)

                if ((response.length - 1) == index) {
                    const res = {
                        SucName: `Total ${r.SucName}`,
                        Quota: +totalQuotaByLineItem[r.SucCode],
                        Sales: +totalSalesByLineItem[r.SucCode],
                        cumplimiento: (+totalSalesByLineItem[r.SucCode] / +totalQuotaByLineItem[r.SucCode]) * 100,
                        isSubtotal: true,
                        hide: false
                    }
                    results.push(res)
                }
            }
        });
        return res.json(results);
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador getVentasZonaSupervisorController'}` })
    }
}

const clientesBloqueadosPorcentajeController = async (req, res) => {
    try {
        const { sucursales, grupo } = req.body;
        let response
        if (grupo) {
            console.log('con grupo')
            response = await clientesZonaBloqueadosPorGrupo(sucursales.toString(), grupo);
        } else {
            console.log('sin grupo');
            response = await clientesZonaBloqueadosPorcentaje(sucursales.toString());
        }
        console.log({ response })
        let SucCode = ''
        let ZoneCode = ''
        let totalBloqueadosBySucCode = {};
        let totalUniBySucCode = {};
        let totalBloqueados = 0
        let totalUniversal = 0

        const results = []
        response.forEach((r, index) => {
            if (r.SucCode == SucCode) {
                const res1 = r
                res1.Porcentaje = +r.Porcentaje
                res1.hide = true
                res1.hideZona = ZoneCode == r.ZoneCode
                results.push(res1)
                if (ZoneCode != r.ZoneCode) {
                    ZoneCode = r.ZoneCode
                    totalBloqueadosBySucCode[r.SucCode] += +r.Bloqueados;
                    totalUniBySucCode[r.SucCode] += +r.Universal;
                }


                if ((response.length - 1) == index) {
                    const res = {
                        SucName: `Total ${r.SucName}`,
                        Bloqueados: +totalBloqueadosBySucCode[r.SucCode],
                        Universal: +totalUniBySucCode[r.SucCode],
                        Porcentaje: (+totalBloqueadosBySucCode[r.SucCode] / +totalUniBySucCode[r.SucCode]),
                        isSubtotal: true,
                        hide: false,
                        hideZona: false
                    }
                    results.push(res)
                }
            } else {
                SucCode = r.SucCode;
                totalBloqueadosBySucCode[r.SucCode] = +r.Bloqueados;
                totalUniBySucCode[r.SucCode] = +r.Universal;

                if (index > 0) {
                    const res = {
                        SucName: `Total ${response[index - 1].SucName}`,
                        Universal: +totalUniBySucCode[response[index - 1].SucCode],
                        Bloqueados: +totalBloqueadosBySucCode[response[index - 1].SucCode],
                        Porcentaje: (+totalBloqueadosBySucCode[response[index - 1].SucCode] / +totalUniBySucCode[response[index - 1].SucCode]),
                        isSubtotal: true,
                        hide: false,
                        hideZona: false
                    }
                    results.push(res)
                }
                const res1 = r
                res1.Porcentaje = +r.Porcentaje
                res1.hide = false
                res1.hideZona = ZoneCode == r.ZoneCode
                results.push(res1)

                if ((response.length - 1) == index) {
                    const res = {
                        SucName: `Total ${r.SucName}`,
                        Universal: +totalUniBySucCode[r.SucCode],
                        Bloqueados: +totalBloqueadosBySucCode[r.SucCode],
                        Porcentaje: (+totalBloqueadosBySucCode[r.SucCode] / +totalUniBySucCode[r.SucCode]),
                        isSubtotal: true,
                        hide: false,
                        hideZona: false
                    }
                    results.push(res)
                }
            }
            if (ZoneCode != r.ZoneCode) {
                ZoneCode = r.ZoneCode;
                totalBloqueados += +r.Bloqueados
                totalUniversal += +r.Universal
            }

        });
        const totales = {
            totalBloqueados, totalUniversal,
            totalPrct: totalUniversal == 0 ? 0 : totalBloqueados / totalUniversal
        }
        return res.json({ results, totales });
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador clientesBloqueadosPorcentajeController'}` })
    }
}

const ventasLineaSupervisorController = async (req, res) => {
    try {
        const { sucursales, isMesAnterior } = req.body
        console.log({ sucursales, isMesAnterior })
        let response = []
        if (isMesAnterior == true || isMesAnterior == 'true') {
            console.log('is mes anterior')
            response = await getVentasLineaSupervisorAnt(sucursales.toString());
        } else {
            console.log('is mes actual')
            response = await getVentasLineaSupervisor(sucursales.toString());
        }
        console.log({ response });

        let SucCode = null;
        let LineName = '';
        let totalSalesBySucCode = {};
        let totalUniBySucCode = {};
        let totalSales = 0;
        let totalQuota = 0;

        const results = [];

        response.forEach((r, index) => {
            const currentSuc = r.SucCode;
            const currentLine = r.LineName;

            // Inicializar acumuladores si no existen
            if (!totalSalesBySucCode[currentSuc]) totalSalesBySucCode[currentSuc] = 0;
            if (!totalUniBySucCode[currentSuc]) totalUniBySucCode[currentSuc] = 0;

            if (currentSuc === SucCode) {
                // MISMA SUCURSAL
                const res1 = { ...r };
                res1.cumplimiento = +r.cumplimiento;
                res1.hide = true;
                res1.hideLine = LineName === currentLine;
                results.push(res1);

                totalSalesBySucCode[currentSuc] += +r.Sales;
                totalUniBySucCode[currentSuc] += +r.Quota;

                // Último elemento
                if (index === response.length - 1) {
                    results.push({
                        SucName: `Total ${r.SucName}`,
                        Sales: +totalSalesBySucCode[currentSuc],
                        Quota: +totalUniBySucCode[currentSuc],
                        cumplimiento: totalUniBySucCode[currentSuc] === 0 ? 0 : (+totalSalesBySucCode[currentSuc] / +totalUniBySucCode[currentSuc]),
                        isSubtotal: true,
                        hide: false,
                        hideLine: false
                    });
                }
            } else {
                // NUEVA SUCURSAL

                // Agregar subtotal anterior si no es el primer elemento
                if (index > 0) {
                    const prevSuc = response[index - 1].SucCode;
                    const prevName = response[index - 1].SucName;

                    results.push({
                        SucName: `Total ${prevName}`,
                        Quota: +totalUniBySucCode[prevSuc],
                        Sales: +totalSalesBySucCode[prevSuc],
                        cumplimiento: totalUniBySucCode[prevSuc] === 0 ? 0 : (+totalSalesBySucCode[prevSuc] / +totalUniBySucCode[prevSuc]),
                        isSubtotal: true,
                        hide: false,
                        hideLine: false
                    });
                }

                const res1 = { ...r };
                res1.cumplimiento = +r.cumplimiento;
                res1.hide = false;
                res1.hideLine = LineName === currentLine;
                results.push(res1);

                // Reiniciar acumuladores para nueva sucursal
                totalSalesBySucCode[currentSuc] = +r.Sales;
                totalUniBySucCode[currentSuc] = +r.Quota;

                // Si es el último
                if (index === response.length - 1) {
                    results.push({
                        SucName: `Total ${r.SucName}`,
                        Quota: +totalUniBySucCode[currentSuc],
                        Sales: +totalSalesBySucCode[currentSuc],
                        cumplimiento: totalUniBySucCode[currentSuc] === 0 ? 0 : (+totalSalesBySucCode[currentSuc] / +totalUniBySucCode[currentSuc]),
                        isSubtotal: true,
                        hide: false,
                        hideLine: false
                    });
                }
            }

            // Actualizar totales generales
            totalSales += +r.Sales;
            totalQuota += +r.Quota;

            // Actualizar estado actual
            SucCode = currentSuc;
            LineName = currentLine;
        });

        const totales = {
            totalSales,
            totalQuota,
            totalPrct: totalQuota === 0 ? 0 : totalSales / totalQuota
        };

        return res.json({ results, totales });

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador ventasLineaSupervisorController'}` })
    }
}

const ventasLineaSucursalSupervisorController = async (req, res) => {
    try {
        const { sucursales, isMesAnterior } = req.body
        console.log('Body', req.body);
        console.log({ sucursales, isMesAnterior })
        console.log('Ventas por lineas')
        const user = req.usuarioAutorizado
        const supCode = user.ID_VENDEDOR_SAP || 0
        const dateNow = new Date();
        const dateMesAnterior = new Date(dateNow);
        dateMesAnterior.setMonth(dateMesAnterior.getMonth() - 1);
        let response = {}
        if (isMesAnterior == true) {
            response = await getVentasLineaSucursalSupervisor(dateMesAnterior.getFullYear(), dateMesAnterior.getMonth() + 1, supCode);
        } else {
            response = await getVentasLineaSucursalSupervisor(dateNow.getFullYear(), dateNow.getMonth() + 1, supCode);
        }
        // console.log({ response })
        // return res.json({response,})
        let LineItemName = '';
        let totalSalesByLineName = {};
        let totalUniByLineName = {};
        let totalSales = 0;
        let totalQuota = 0;

        const results = [];

        response.forEach((r, index) => {
            const currentLine = r.LineItemName;

            // Inicializar acumuladores si no existen
            if (!totalSalesByLineName[currentLine]) totalSalesByLineName[currentLine] = 0;
            if (!totalUniByLineName[currentLine]) totalUniByLineName[currentLine] = 0;

            if (currentLine === LineItemName) {
                // MISMA SUCURSAL
                const res1 = { ...r };
                res1.cumplimiento = +r.cumplimiento;
                res1.hide = true;
                results.push(res1);

                totalSalesByLineName[currentLine] += +r.Sales;
                totalUniByLineName[currentLine] += +r.Quota;

                // Último elemento
                if (index === response.length - 1) {
                    results.push({
                        LineItemName: `Total ${r.LineItemName}`,
                        Sales: +totalSalesByLineName[currentLine],
                        Quota: +totalUniByLineName[currentLine],
                        cumplimiento: totalUniByLineName[currentLine] === 0 ? 0 : (+totalSalesByLineName[currentLine] / +totalUniByLineName[currentLine]),
                        isSubtotal: true,
                        hide: false
                    });
                }
            } else {
                // NUEVA SUCURSAL

                // Agregar subtotal anterior si no es el primer elemento
                if (index > 0) {
                    const prevName = response[index - 1].LineItemName;

                    results.push({
                        LineItemName: `Total ${prevName}`,
                        Quota: +totalUniByLineName[prevName],
                        Sales: +totalSalesByLineName[prevName],
                        cumplimiento: totalUniByLineName[prevName] === 0 ? 0 : (+totalSalesByLineName[prevName] / +totalUniByLineName[prevName]),
                        isSubtotal: true,
                        hide: false
                    });
                }

                const res1 = { ...r };
                res1.cumplimiento = +r.cumplimiento;
                res1.hide = false;
                results.push(res1);

                // Reiniciar acumuladores para nueva sucursal
                totalSalesByLineName[currentLine] = +r.Sales;
                totalUniByLineName[currentLine] = +r.Quota;

                // Si es el último
                if (index === response.length - 1) {
                    results.push({
                        LineItemName: `Total ${r.LineItemName}`,
                        Quota: +totalUniByLineName[currentLine],
                        Sales: +totalSalesByLineName[currentLine],
                        cumplimiento: totalUniByLineName[currentLine] === 0 ? 0 : (+totalSalesByLineName[currentLine] / +totalUniByLineName[currentLine]),
                        isSubtotal: true,
                        hide: false
                    });
                }
            }

            // Actualizar totales generales
            totalSales += +r.Sales;
            totalQuota += +r.Quota;

            // Actualizar estado actual
            LineItemName = currentLine;
        });

        const totales = {
            totalSales,
            totalQuota,
            totalPrct: totalQuota === 0 ? 0 : totalSales / totalQuota
        };

        return res.json({ results, totales });

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador ventasLineaSucursalSupervisorController'}` })
    }
}

const ventasTipoSupervisorController = async (req, res) => {
    try {
        const { sucursal, linea, isMesAnterior } = req.body;
        let response
        if (isMesAnterior == true || isMesAnterior == 'true') {
            console.log('is mes anterior')
            response = await getVentasTipoSupervisorAnt(sucursal, linea);
        } else {
            console.log('is mes actual')
            response = await getVentasTipoSupervisor(sucursal, linea);
        }
        console.log({ response });

        let totalSales = 0;
        let totalQuota = 0;

        response.map((r) => {
            totalSales += +r.Sales;
            totalQuota += +r.Quota;
        });

        const totales = {
            totalSales,
            totalQuota,
            totalPrct: totalQuota === 0 ? 0 : totalSales / totalQuota
        };

        return res.json({ response, totales });

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `${error.message || 'Error en el controlador ventasTipoSupervisorController'}` })
    }
}

const clientesVendedorBloqueadosPorcentajeController = async (req, res) => {
    try {
        const { slpCode } = req.query;
        const response = await clientesVendedorBloqueadosPorcentaje(slpCode)
        console.log({ response })
        let totalBloqueados = 0
        let totalUniversal = 0

        response.map((r) => {
            totalBloqueados += +r.Bloqueados
            totalUniversal += +r.Universal
        });

        const totales = {
            totalBloqueados,
            totalUniversal,
            totalPrct: totalUniversal === 0 ? 0 : totalBloqueados / totalUniversal
        };
        return res.json({ response, totales })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en clientesVendedorBloqueadosPorcentajeController: ${error.message}` })
    }
}

const excelClientesBloqueados = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { data, displayedColumns, grupo } = req.body;
        const bloqueados = await clientesBloqueadoByGroup(grupo);
        console.log(grupo);

        console.log({ data });
        console.log({ displayedColumns })
        console.log({ bloqueados });
        const fechaActual = new Date();
        const date = new Intl.DateTimeFormat('es-VE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(fechaActual);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Devoluciones');

        worksheet.columns = [
            { header: 'Sucursal', key: 'SucName', width: 20 },
            { header: 'Vendedor', key: 'SlpName', width: 40 },
            { header: 'Zona', key: 'ZoneName', width: 25 },
            { header: 'Universal', key: 'Universal', width: 15 },
            { header: 'Bloqueados', key: 'Bloqueados', width: 15 },
            { header: 'Monto Deuda', key: 'Deuda', width: 15 },
            { header: 'Porcentaje', key: 'Porcentaje', width: 12 }
        ];

        const morososSheet = workbook.addWorksheet('Clientes Morosos');

        morososSheet.columns = [
            { header: 'Sucursal', key: 'SucName', width: 20 },
            { header: 'Zona', key: 'ZoneName', width: 25 },
            { header: 'Grupo', key: 'GroupName', width: 20 },
            { header: 'Vendedor', key: 'SlpNames', width: 35 },
            { header: 'Cliente', key: 'CardName', width: 40 },
            { header: 'Facturas Vencidas', key: 'OverdueInvoicesCount', width: 20 },
            { header: 'Monto Deuda', key: 'TotalOverdueAmount', width: 18 }
        ];
        // Insertar filas antes del encabezado
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);

        worksheet.getCell('A1').value = `Clientes Bloqueados por Zona`;
        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A2').value = `Fecha de Impresión: ${date}`;
        worksheet.mergeCells('A2:G2');

        morososSheet.insertRow(1, []);
        morososSheet.insertRow(1, []);
        morososSheet.insertRow(1, []);

        morososSheet.getCell('A1').value = `Clientes Bloqueados por Zona`;
        morososSheet.mergeCells('A1:G1');
        morososSheet.getCell('A2').value = `Fecha de Impresión: ${date}`;
        morososSheet.mergeCells('A2:G2');

        if (grupo) {
            worksheet.getCell('A3').value = `Grupo: ${grupo}`;
            worksheet.mergeCells('A3:G3');

            morososSheet.getCell('A3').value = `Grupo: ${grupo}`;
            morososSheet.mergeCells('A3:G3');
        }

        // Estilizar cabecera
        const cellA = worksheet.getCell('A1');
        cellA.alignment = { vertical: 'middle', horizontal: 'center' };
        cellA.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' },
        };
        cellA.font = { bold: true, size: 14 };
        cellA.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };

        ['A2', 'A3'].forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.font = { bold: true, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'start' };
        });

        const cellMorosoA = morososSheet.getCell('A1');
        cellMorosoA.alignment = { vertical: 'middle', horizontal: 'center' };
        cellMorosoA.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' },
        };
        cellMorosoA.font = { bold: true, size: 14 };
        cellMorosoA.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };

        ['A2', 'A3'].forEach(cellAddress => {
            const cell = morososSheet.getCell(cellAddress);
            cell.font = { bold: true, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'start' };
        });

        // Agregar los datos
        bloqueados.forEach(cliente => {
            morososSheet.addRow({
                SucName: cliente.SucName,
                ZoneName: cliente.ZoneName,
                GroupName: cliente.GroupName,
                SlpNames: cliente.SlpNames || 'Vendedor no asignado',
                CardName: cliente.CardName,
                OverdueInvoicesCount: cliente.OverdueInvoicesCount,
                TotalOverdueAmount: parseFloat(cliente.TotalOverdueAmount)
            });
        });


        // Estilizar cabecera
        morososSheet.getRow(4).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        let currentRowIndex = 5;
        const rowRefs = [];

        const startRowMorosos = 4;
        mergeCellsByColumn(morososSheet, startRowMorosos + 1, 'SucName', bloqueados);
        mergeCellsByColumn(morososSheet, startRowMorosos + 1, 'ZoneName', bloqueados);
        mergeCellsByColumn(morososSheet, startRowMorosos + 1, 'SlpNames', bloqueados);

        data.forEach(sucursal => {
            const rows = sucursal.data;

            if (Array.isArray(rows) && rows.length > 0) {
                const startRow = currentRowIndex;
                const endRow = currentRowIndex + rows.length - 1;

                rows.forEach(item => {
                    const rowData = {
                        SucName: sucursal.SucName,
                        SlpName: item.SlpName,
                        ZoneName: item.ZoneName,
                        Universal: item.TotalClients,
                        Bloqueados: item.OverdueClientsCount,
                        Deuda: parseFloat(item.TotalOverdueAmount),
                        Porcentaje: item.Percent == 0 ? '0' : +((parseFloat(item.Percent) * 100).toFixed(2)),
                    };
                    const addedRow = worksheet.addRow(rowData);
                    rowRefs.push(addedRow);
                    currentRowIndex++;
                });

                // Fusionar la columna 'Sucursal' para esta sucursal
                if (rows.length >= 1) {
                    const sucCol = worksheet.getColumn('SucName');
                    const cellIndex = sucCol.number;

                    worksheet.mergeCells(startRow, cellIndex, endRow, cellIndex);
                    worksheet.getCell(startRow, cellIndex).alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                    };
                }
            }
        });
        // Apply formatting per row
        rowRefs.forEach(row => {
            row.eachCell(cell => {
                cell.border = {
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        morososSheet.getColumn('TotalOverdueAmount').numFmt = '[$Bs.]#,##0.00';

        worksheet.getRow(4).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        worksheet.lastRow.eachCell(cell => {
            cell.border = {
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            }
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=devoluciones.xlsx');

        //   grabarLog(user.USERCODE, user.USERNAME,`Inventario Excel Devolucion`, `Exito generando el Excel de devoluciones`,
        //     '', 'cobranza/excel-reporte', process.env.PRD
        //   );
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error({ error });
        //   grabarLog(user.USERCODE, user.USERNAME,`Inventario Excel Devolucion`, `Error generando el Excel de devoluciones ${error}`,
        //     'catch de excelReporte', 'cobranza/excel-reporte', process.env.PRD
        //   );
        return res.status(500).json({ mensaje: `Error generando el Excel de clientes bloqueados ${error}` });
    }
}

function mergeCellsByColumn(worksheet, startRowIndex, columnKey, data) {
    let i = 0;
    const ends = [];

    while (i < data.length) {
        let j = i + 1;

        while (
            j < data.length &&
            data[i][columnKey] === data[j][columnKey]
        ) {
            j++;
        }

        const span = j - i;
        if (span > 1) {
            const colIndex = worksheet.getColumn(columnKey).number;
            const start = startRowIndex + i;
            const end = startRowIndex + j - 1;

            worksheet.mergeCells(start, colIndex, end, colIndex);
            worksheet.getCell(start, colIndex).alignment = {
                vertical: 'middle',
                horizontal: 'center'
            };
        }

        ends.push(startRowIndex + j - 1);
        i = j;
    }

    return ends;
}

const ventasVendedoresByLineasSucursalController = async (req, res) => {
    try {
        const { year, month, sucCode, lineCode, listClientType } = req.body
        let data = []
        if (listClientType.length == 0) {
            const response = await ventasVendedoresByLineasSucursal(year, month, sucCode, null, lineCode,)
            data = [...data, ...response]

        } else {
            for (const clientType of listClientType) {
                const response = await ventasVendedoresByLineasSucursal(year, month, sucCode, clientType, lineCode)
                data = [...data, ...response]
            }
        }

        data = data.map((item) => {
            const Sales = Number(item.Sales)
            const Quota = Number(item.Quota)
            return {
                ...item,
                Cumplimiento: (Sales == 0 || Quota == 0) ? 0 : Sales / Quota
            }
        })
        return res.json(data)
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en ventasVendedoresByLineasSucursalController ${error.message || 'No definido'}` });
    }
}

const ventasZonasVendedoresByLineasSucursalController = async (req, res) => {
    try {
        const { year, month, sucCode, lineCode, listClientType, splCode } = req.body
        let data = []
        if (listClientType.length == 0) {
            const response = await ventasZonasVendedoresByLineasSucursal(year, month, sucCode, null, lineCode, splCode)
            data = [...data, ...response]

        } else {
            for (const clientType of listClientType) {
                const response = await ventasZonasVendedoresByLineasSucursal(year, month, sucCode, clientType, lineCode, splCode)
                data = [...data, ...response]
            }
        }
        data = data.map((item) => {
            const Sales = Number(item.Sales)
            const Quota = Number(item.Quota)
            return {
                ...item,
                Cumplimiento: (Sales == 0 || Quota == 0) ? 0 : Sales / Quota
            }
        })
        return res.json(data)
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en ventasZonasVendedoresByLineasSucursalController ${error.message || 'No definido'}` });
    }
}

const clientesCadenasParentController = async (req, res) => {
    try {
        const data = await clientesCadenasParent()
        return res.json(data)
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en clientesCadenasParentController ${error.message || 'No definido'}` });
    }
}

const searchClientesCadenasParentController = async (req, res) => {
    try {
        let parametro = req.query.parametro
        if (!parametro) {
            return res.json({ mensaje: 'Debe existir un parametro de busqueda' })
        }
        parametro = parametro.toString().toUpperCase()
        const data = await searchClientesCadenasParent(parametro)
        return res.json(data)
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en searchClientesCadenasParentController ${error.message || 'No definido'}` });
    }
}

const reportePendienteCadenasController = async (req, res) => {
    try {
        let fechaInicial = req.query.fechaInicial
        let fechaFinal = req.query.fechaFinal
        let tipo = req.query.tipo
        let groupCode = req.query.groupCode
        let cardCode = req.query.cardCode
        let headerParent = req.query.headerParent
        console.warn({
            fechaInicial,
            fechaFinal,
            tipo,
            groupCode,
            cardCode,
            headerParent,
        })
        if (!tipo || tipo == '') {
            tipo = null
        }
        if (!groupCode || groupCode == '') {
            groupCode = null
        }
        if (!cardCode || cardCode == '') {
            cardCode = null
        }
        if (!fechaInicial || fechaInicial == '') {
            fechaInicial = null
        }
        if (!fechaFinal || fechaFinal == '') {
            fechaFinal = null
        }
        if (!headerParent || headerParent == '') {
            headerParent = null
        }
        const response = await reportePendienteCadenas(fechaInicial, fechaFinal, tipo, groupCode, cardCode, headerParent)
        // return res.json({ response })
        const headers = [...new Set(response.map(item => {
            return `${item.Year}-${item.Month.toString().padStart(2, '0')}`;
        }))].sort();

        const grouped = {};
        for (const item of response) {
            const key = item.CardCode;
            const monthKey = `${item.Year}-${item.Month.toString().padStart(2, '0')}`;

            if (!grouped[key]) {
                grouped[key] = {
                    CardCode: item.CardCode,
                    CardName: item.CardName,
                    SucName: item.SucName,
                };

                headers.forEach(header => {
                    grouped[key][header] = { Quantity: null, Total: null };
                });
            }
            grouped[key][monthKey] = {
                Quantity: parseFloat(item.PendingQuantity),
                Total: parseFloat(item.PendingAmount)
            };
        }

        const data = Object.values(grouped)

        return res.json({ headers, data })

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en reportePendienteCadenasController ${error.message || 'No definido'}` });
    }
}

function agruparPorYearMonth(data) {
    const agrupado = data.reduce((acc, item) => {
        const key = `${item.Year}-${item.Month}`;

        if (!acc[key]) {
            acc[key] = {
                Year: item.Year,
                Month: item.Month,
                Total: 0, // Inicializar el total en 0
                Sales: [] // Cambiar "Sale" por "Sales" para mejor claridad
            };
        }

        // Convertir el total a número y sumarlo al total del mes
        const itemTotal = parseFloat(item.Total) || 0;
        acc[key].Total += itemTotal;

        // Añadir el objeto sin Year y Month
        acc[key].Sales.push({
            CardCode: item.CardCode,
            CardName: item.CardName,
            Total: Number(item.Total)
        });

        return acc;
    }, {});

    // Convertir el objeto agrupado a un array y redondear los totales
    return Object.values(agrupado).map(grupo => ({
        ...grupo,
        Total: parseFloat(grupo.Total.toFixed(2)) // Redondear a 2 decimales
    }));
}

const ventasPendienteController = async (req, res) => {
    try {
        let startDate = req.query.startDate
        let endDate = req.query.endDate
        let tipo = req.query.tipo
        let cardCode = req.query.cardCode
        let groupCode = req.query.groupCode
        let itemCode = req.query.itemCode


        if (!tipo || tipo == '') {
            tipo = null
        }
        if (!cardCode || cardCode == '') {
            cardCode = null
        }
        if (!startDate || startDate == '') {
            startDate = null
        }
        if (!endDate || endDate == '') {
            endDate = null
        }

        if (!itemCode || itemCode == '') {
            itemCode = null
        }

        if (!groupCode || groupCode == '') {
            groupCode = null
        }

        const data = await ventasPendientes(startDate, endDate, tipo, cardCode, itemCode, groupCode)
        return res.json(data)

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en ventasPendienteController ${error.message || 'No definido'}` });
    }
}

const searchBlockedClients = async (req, res) => {
    try {
        const tipoCliente = Number(req.query.tipoCliente);

        // Opcional: validar si es un número válido
        if (isNaN(tipoCliente)) {
            return res.status(400).json({
                mensaje: 'El parámetro tipoCliente debe ser un número válido.',
            });
        }

        const resultado = await findBlockedClients(tipoCliente);
        const filteredResult = resultado.filter(item => 
            item.ZoneCode !== null && 
            item.ZoneName !== null && 
            item.SlpCode !== null && 
            item.SlpName !== null
        );
        const agrupado = groupBySucursal(filteredResult);

        return res.json(agrupado);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            mensaje: `Error en searchBlockedClients: ${error.message || 'No definido'}`,
        });
    }
};

const searchBlockedClientsByZoneSucAndGroup = async (req, res) => {
    try {
        const suc = Number(req.params.suc);
        const zone = Number(req.params.zone);
        const group = Number(req.params.group);

        if (isNaN(suc) || isNaN(zone) || isNaN(group)) {
            return res.status(400).json({
                mensaje: 'Los parámetros suc, zone y group deben ser números válidos.',
            });
        }

        // Asumo que findBlockedClients ahora recibe estos parámetros:
        const resultado = await findBlockedClientsByZoneAndSuc(suc, zone, group);

        return res.json(resultado);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            mensaje: `Error en searchBlockedClients: ${error.message || 'No definido'}`,
        });
    }
};

const clientesVendedorBloqueadosController = async (req, res) => {
    try {
        const slpCodeRaw = req.params.slpCode; // Ej: "14 - 21"
        const groupCode = Number(req.params.groupCode);

        if (!slpCodeRaw || isNaN(groupCode)) {
            return res.status(400).json({ mensaje: 'Parámetros inválidos.' });
        }

        const slpCodes = slpCodeRaw
            .split('-')
            .map(code => Number(code.trim()))
            .filter(code => !isNaN(code));

        if (slpCodes.length === 0) {
            return res.status(400).json({ mensaje: 'Código(s) de vendedor inválido(s).' });
        }

        const response = await clientesVendedorBloqueados(groupCode, slpCodes);

        // Agrupar por sucursal y luego vendedor
        const agrupado = groupBySucursalYVendedor(response);

        return res.json(agrupado);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            mensaje: `Error en clientesVendedorBloqueadosController: ${error.message || 'No definido'}`
        });
    }
}


const clientesVendedorBloqueadosExcelController = async (req, res) => {
    try {
        const clientes = req.body;

        if (!Array.isArray(clientes) || clientes.length === 0) {
            return res.status(400).json({ mensaje: 'No se proporcionaron datos válidos.' });
        }

        // Crear libro y hoja
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Clientes Bloqueados');

        // Definir columnas
        worksheet.columns = [
            { header: 'Sucursal Código', key: 'SucCode', width: 15 },
            { header: 'Sucursal Nombre', key: 'SucName', width: 20 },
            { header: 'Zona Código', key: 'ZoneCode', width: 15 },
            { header: 'Zona Nombre', key: 'ZoneName', width: 20 },
            { header: 'Grupo Código', key: 'GroupCode', width: 15 },
            { header: 'Grupo Nombre', key: 'GroupName', width: 20 },
            { header: 'Vendedor', key: 'SlpNames', width: 25 },
            { header: 'Código Cliente', key: 'CardCode', width: 20 },
            { header: 'Nombre Cliente', key: 'CardName', width: 25 },
            { header: 'Facturas Vencidas', key: 'OverdueInvoicesCount', width: 20 },
            { header: 'Monto Vencido', key: 'TotalOverdueAmount', width: 20 },
        ];

        // Agregar filas
        clientes.forEach(cliente => {
            worksheet.addRow({
                ...cliente,
                TotalOverdueAmount: Number(cliente.TotalOverdueAmount), // 👈 Conversión explícita
            });
        });


        // Formato de cabecera
        worksheet.getRow(1).font = { bold: true };

        const startRowIndex = 2;

        // Ordenar clientes por las columnas que vas a mergear
        clientes.sort((a, b) => {
            return (
                a.SucCode - b.SucCode ||
                a.ZoneCode - b.ZoneCode ||
                a.GroupCode - b.GroupCode // si también quisieras esto
            );
        });

        // Hacer merge por las columnas deseadas
        mergeCellsByColumn(worksheet, startRowIndex, 'SucCode', clientes);
        mergeCellsByColumn(worksheet, startRowIndex, 'SucName', clientes);
        mergeCellsByColumn(worksheet, startRowIndex, 'ZoneCode', clientes);
        mergeCellsByColumn(worksheet, startRowIndex, 'ZoneName', clientes);

        worksheet.getColumn('TotalOverdueAmount').numFmt = '[$Bs.]#,##0.00';
        // Generar el buffer del Excel
        const buffer = await workbook.xlsx.writeBuffer();

        // Enviar como archivo
        res.setHeader('Content-Disposition', 'attachment; filename=clientes_bloqueados.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    } catch (error) {
        console.error('Error al generar Excel:', error);
        res.status(500).json({ mensaje: 'Error al generar Excel.' });
    }
}

// const searchBlockedClients = async (req, res) => {
//   try {
//     let { SucCode, ZoneCode } = req.query;

//     // Normalizamos
//     SucCode = isNaN(Number(SucCode)) ? null : Number(SucCode);
//     ZoneCode = isNaN(Number(ZoneCode)) ? null : Number(ZoneCode);

//     console.log('Buscando clientes bloqueados con:', { SucCode, ZoneCode });

//     const resultado = await findBlockedClientsByZoneOrSuc(SucCode, ZoneCode);
//     console.log(resultado);

//     if (SucCode === null && ZoneCode !== null) {
//         const zonasMap = new Map();

//         for (const item of resultado) {
//             const key = `${item.ZoneCode}-${item.ZoneName}`;

//             if (!zonasMap.has(key)) {
//             zonasMap.set(key, {
//                 ZoneCode: item.ZoneCode,
//                 ZoneName: item.ZoneName,
//                 clientes: [],
//             });
//             }

//             zonasMap.get(key).clientes.push({
//                 CardCode: item.CardCode,
//                 CardName: item.CardName,
//                 validFor: item.validFor,
//             });
//         }

//         const zonasArray = Array.from(zonasMap.values());

//         if (zonasArray.length === 0) {
//         // No hay datos, responde vacío o con algún mensaje
//         return res.json({ ZoneCode: null, ZoneName: null, data: [] });
//         }

//         const zona = zonasArray[0];

//         const response = {
//         ZoneCode: zona.ZoneCode,
//         ZoneName: zona.ZoneName,
//         data: zona.clientes,
//         };

//         return res.json(response);
//     }

//     if (SucCode !== null) {
//         // Agrupamos por Sucursal
//         const sucursalAgrupada = {
//             SucCode: resultado[0]?.SucCode ?? SucCode,
//             SucName: resultado[0]?.SucName ?? '',
//             data: [],
//         };

//         const zonasMap = new Map();

//         for (const item of resultado) {
//             const key = `${item.ZoneCode}-${item.ZoneName}`;

//             if (!zonasMap.has(key)) {
//                 zonasMap.set(key, {
//                     ZoneCode: item.ZoneCode,
//                     ZoneName: item.ZoneName,
//                     clientes: [],
//                 });
//             }

//             zonasMap.get(key).clientes.push({
//                 CardCode: item.CardCode,
//                 CardName: item.CardName,
//                 validFor: item.validFor,
//             });
//         }

//         sucursalAgrupada.data = Array.from(zonasMap.values());

//         return res.json(sucursalAgrupada);
//     }

//     return res.json(resultado);
//   } catch (error) {
//     console.error({ error });
//     return res.status(500).json({
//       mensaje: `Error en searchBlockedClients: ${error.message || 'No definido'}`,
//     });
//   }
// };




const ventasPendienteByItemController = async (req, res) => {
    try {
        let startDate = req.query.startDate
        let endDate = req.query.endDate
        let tipo = req.query.tipo
        let cardCode = req.query.cardCode
        let itemCode = req.query.itemCode
        let groupCode = req.query.groupCode

        if (!tipo || tipo == '') {
            tipo = null
        }
        if (!cardCode || cardCode == '') {
            cardCode = null
        }
        if (!startDate || startDate == '') {
            startDate = null
        }
        if (!endDate || endDate == '') {
            endDate = null
        }

        if (!itemCode || itemCode == '') {
            itemCode = null
        }

        if (!groupCode || groupCode == '') {
            groupCode = null
        }

        const data = await ventasPendientesByItem(startDate, endDate, tipo, cardCode, itemCode, groupCode)
        return res.json(data)

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en ventasPendienteByItemController ${error.message || 'No definido'}` });
    }
}

const reportePendienteByItemController = async (req, res) => {
    try {
        let fechaInicial = req.query.fechaInicial
        let fechaFinal = req.query.fechaFinal
        let tipo = req.query.tipo
        let groupCode = req.query.groupCode
        let cardCode = req.query.cardCode
        let headerParent = req.query.headerParent
        let itemCode = req.query.itemCode
        console.warn({
            fechaInicial,
            fechaFinal,
            tipo,
            groupCode,
            cardCode,
        })
        if (!tipo || tipo == '') {
            tipo = null
        }
        if (!groupCode || groupCode == '') {
            groupCode = null
        }
        if (!cardCode || cardCode == '') {
            cardCode = null
        }
        if (!fechaInicial || fechaInicial == '') {
            fechaInicial = null
        }
        if (!fechaFinal || fechaFinal == '') {
            fechaFinal = null
        }
        if (!headerParent || headerParent == '') {
            headerParent = null
        }
        if (!itemCode || itemCode == '') {
            itemCode = null
        }
        const response = await reportePendienteByItem(fechaInicial, fechaFinal, tipo, groupCode, cardCode, headerParent, itemCode)
        // return res.json({ response })
        const headers = [...new Set(response.map(item => {
            return `${item.Year}-${item.Month.toString().padStart(2, '0')}`;
        }))].sort();

        const grouped = {};
        for (const item of response) {
            // const key = item.CardCode;
            const key = `${item.CardCode}__${item.SucName}__${item.ItemCode}`;
            const monthKey = `${item.Year}-${item.Month.toString().padStart(2, '0')}`;

            if (!grouped[key]) {
                grouped[key] = {
                    CardCode: item.CardCode,
                    CardName: item.CardName,
                    SucName: item.SucName,
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                };

                headers.forEach(header => {
                    grouped[key][header] = { Quantity: null, Total: null };
                });
            }

            grouped[key][monthKey] = {
                Quantity: parseFloat(item.PendingQuantity),
                Total: parseFloat(item.PendingAmount)
            };
        }

        const data = Object.values(grouped)

        console.log({ headers, data })

        return res.json({ headers, data })

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en reportePendienteByItemController ${error.message || 'No definido'}` });
    }
}

const reportePendienteUngroupByItemController = async (req, res) => {
    try {
        let fechaInicial = req.query.fechaInicial
        let fechaFinal = req.query.fechaFinal
        let tipo = req.query.tipo
        let groupCode = req.query.groupCode
        let cardCode = req.query.cardCode
        let headerParent = req.query.headerParent
        let itemCode = req.query.itemCode
        console.warn({
            fechaInicial,
            fechaFinal,
            tipo,
            groupCode,
            cardCode,
        })
        if (!tipo || tipo == '') {
            tipo = null
        }
        if (!groupCode || groupCode == '') {
            groupCode = null
        }
        if (!cardCode || cardCode == '') {
            cardCode = null
        }
        if (!fechaInicial || fechaInicial == '') {
            fechaInicial = null
        }
        if (!fechaFinal || fechaFinal == '') {
            fechaFinal = null
        }
        if (!headerParent || headerParent == '') {
            headerParent = null
        }
        if (!itemCode || itemCode == '') {
            itemCode = null
        }
        const response = await reportePendienteUngroupByItem(fechaInicial, fechaFinal, tipo, groupCode, cardCode, headerParent, itemCode)
        return res.json(response)

        // const headers = [...new Set(response.map(item => {
        //     return `${item.Year}-${item.Month.toString().padStart(2, '0')}`;
        // }))].sort();

        // const grouped = {};
        // for (const item of response) {
        //     const key = item.CardCode;
        //     const monthKey = `${item.Year}-${item.Month.toString().padStart(2, '0')}`;

        //     if (!grouped[key]) {
        //         grouped[key] = {
        //             CardCode: item.CardCode,
        //             CardName: item.CardName,
        //         };

        //         headers.forEach(header => {
        //             grouped[key][header] = { Quantity: null, Total: null };
        //         });
        //     }

        //     grouped[key][monthKey] = {
        //         Quantity: parseFloat(item.PendingQuantity),
        //         Total: parseFloat(item.PendingAmount)
        //     };
        // }

        // const data = Object.values(grouped)

        // console.log({ headers, data })

        // return res.json({ headers, data })

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en reportePendienteUngroupByItemController ${error.message || 'No definido'}` });
    }
}

const reportePendienteBySucursalResumeController = async (req, res) => {
    try {
        let tipo = req.query.tipo
        console.warn({
            tipo,
        })
        if (!tipo || tipo == '') {
            tipo = null
        }
        const response = await reportePendienteBySucursalesResume(tipo);
        return res.json(response)
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en reportePendienteBySucursalResumeController ${error.message || 'No definido'}` });
    }
}

// const searchBlockedClientsByGroup = async (groupCode, res) => {
//     try {
//         const data = await clientesBloqueadoByGroup(groupCode);

//         if (!Array.isArray(data)) {
//             throw new Error('Formato inesperado de datos devueltos por HANA');
//         }

//         return res.status(200).json({ ok: true, data });

//     } catch (error) {
//         console.error('searchBlockedClientsByGroup error:', error);
//         return res.status(500).json({
//             ok: false,
//             mensaje: `Error en searchBlockedClientsByGroup: ${error.message || 'No definido'}`
//         });
//     }
// }

const clientExpiryPolicyController = async (req, res) => {
    try {
        let cardCode = req.query.cardCode

        if (!cardCode || cardCode == '') {
            cardCode = null
        }

        const response = await clientExpiryPolicy(cardCode)
        if (response.length == 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos', goToExpiry: false })
        }
        let data = response[0]
        return res.json({ data, goToExpiry: true })

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en clientExpiryPolicyController ${error.message || 'No definido'}` });
    }
}

const clientesCreadosPorSucursalController = async (req, res) => {
    try {
        const response = await clientesCreadosPorSucursal()
        if (response.length == 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos', goToExpiry: false })
        }
        return res.json(response)

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en clientesCreadosPorSucursalController ${error.message || 'No definido'}` });
    }
};

const procesarReporteFinalV3 = (
    datosAcumulados,
    datosVentas,
    vendedores,
    zonas,
    sucursales,
    tiposClientes
) => {
    // 1. Crear mapas de lookup para una búsqueda rápida
    const mapVendedores = new Map((vendedores || []).map(item => [item.SlpCode, item.SlpName]));
    const mapZonas = new Map((zonas || []).map(item => [item.ZoneCode, item.ZoneName]));
    const mapSucursales = new Map((sucursales || []).map(item => [String(item.SucCode), item.SucName]));
    const mapGrupos = new Map((tiposClientes || []).map(item => [item.GroupCode, item.GroupName]));

    const reporteFinal = {};

    // 2. Procesar datos acumulados para el nivel de grupo (Sucursal-Grupo)
    datosAcumulados.filter(item => item.Año >= 2024).forEach(item => {
        const {
            "Sucursal Código": SucCode,
            "Grupo Código": GroupCode,
            "Año": Year,
            "Mes": Month,
            "Clientes Vendidos": ClientesVendidos,
            "Clientes Asignados": ClientesAsignados
        } = item;

        const claveGrupo = `${SucCode}-${GroupCode}-${Year}-${Month}`;

        if (!reporteFinal[claveGrupo]) {
            reporteFinal[claveGrupo] = {
                SucCode,
                SucName: mapSucursales.get(String(SucCode)),
                GroupCode,
                GroupName: mapGrupos.get(GroupCode),
                Year,
                Month,
                ClientesAcumulados: 0,
                ClientesVendidos: 0,
                EfectividadTotal: "0.00",
                Vendedores: {}
            };
        }
        reporteFinal[claveGrupo].ClientesAcumulados += ClientesAsignados;
        reporteFinal[claveGrupo].ClientesVendidos += ClientesVendidos;
    });

    // 3. Procesar datos de ventas para el nivel de vendedores y zonas
    datosVentas.filter(item => item.Año >= 2024).forEach(item => {
        const {
            "Sucursal Código": SucCode,
            "Grupo Código": GroupCode,
            "Vendedor Código": SlpCode,
            "Zona Código": ZoneCode,
            "Año": Year,
            "Mes": Month,
            "Clientes Vendidos": ClientesVendidos,
            "Clientes Asignados": ClientesAsignados
        } = item;

        const claveGrupo = `${SucCode}-${GroupCode}-${Year}-${Month}`;
        const grupo = reporteFinal[claveGrupo];

        if (grupo) {
            if (!grupo.Vendedores[SlpCode]) {
                grupo.Vendedores[SlpCode] = {
                    SlpCode,
                    SlpName: mapVendedores.get(SlpCode),
                    ClientesVendidos: 0,
                    ClientesAsignados: 0,
                    EfectividadVentas: "0.00",
                    Zonas: {}
                };
            }
            const vendedor = grupo.Vendedores[SlpCode];

            vendedor.ClientesVendidos += ClientesVendidos;
            vendedor.ClientesAsignados += ClientesAsignados;

            if (!vendedor.Zonas[ZoneCode]) {
                vendedor.Zonas[ZoneCode] = {
                    ZoneCode,
                    ZoneName: mapZonas.get(ZoneCode),
                    ClientesVendidos: 0,
                    ClientesAsignados: 0,
                    EfectividadVentas: "0.00" // Añadimos la propiedad de efectividad por zona
                };
            }
            const zona = vendedor.Zonas[ZoneCode];

            zona.ClientesVendidos += ClientesVendidos;
            zona.ClientesAsignados += ClientesAsignados;
        }
    });

    // 4. Calcular la efectividad y limpiar la estructura
    Object.values(reporteFinal).forEach(grupo => {
        if (grupo.ClientesAcumulados > 0) {
            const efectividad = (grupo.ClientesVendidos / grupo.ClientesAcumulados) * 100;
            grupo.EfectividadTotal = efectividad.toFixed(2);
        }

        grupo.Vendedores = Object.values(grupo.Vendedores).map(vendedor => {
            if (vendedor.ClientesAsignados > 0) {
                const efectividadVendedor = (vendedor.ClientesVendidos / vendedor.ClientesAsignados) * 100;
                vendedor.EfectividadVentas = efectividadVendedor.toFixed(2);
            }

            // Calcular efectividad por zona
            vendedor.Zonas = Object.values(vendedor.Zonas).map(zona => {
                if (zona.ClientesAsignados > 0) {
                    const efectividadZona = (zona.ClientesVendidos / zona.ClientesAsignados) * 100;
                    zona.EfectividadVentas = efectividadZona.toFixed(2);
                }
                return zona;
            });
            return vendedor;
        });
    });

    return {
        data: Object.values(reporteFinal)
    };
};

// ---
// 
const ventasClientesPorSucursalController = async (req, res) => {
    try {
        // Asumiendo que estas funciones llaman a los procedimientos almacenados de HANA
        const datosAcumulados = await consulta1();
        const datosVentas = await consulta2();

        const vendedores = await getVendedores();

        const zonas = await getZonas();
        const sucursales = await getSucursales();


        const tiposClientes = await getTiposClientes();



        if (datosAcumulados.length === 0 && datosVentas.length === 0 && datosAsignados.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos', goToExpiry: false });
        }

        const groupedData = procesarReporteFinalV3(datosAcumulados, datosVentas, vendedores, zonas, sucursales, tiposClientes);

        const transformedData = transformarDatosVentas(groupedData.data);

        return res.json({
            data: transformedData
        });

    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `Error en ventasClientesPorSucursalController: ${error.message || 'No definido'}` });
    }
};


const transformarDatosVentas = (monthlyDataArray) => {
    // Usamos un Map para agrupar eficientemente los datos por Sucursal y Grupo.
    const groupedMap = new Map();

    // Iteramos sobre cada objeto de datos en el array de entrada (cada uno representa un mes).
    monthlyDataArray.forEach(data => {
        // Creamos una clave única para identificar la combinación de sucursal y grupo.
        const key = `${data.SucCode}-${data.GroupCode}`;

        // Si la clave no existe en el mapa, inicializamos la estructura para ese grupo/sucursal.
        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                Grupo: data.GroupName,
                Sucursal: data.SucName,
                isExpanded: false,
                monthlyData: {},
                nestedMetrics: []
            });
        }

        const groupEntry = groupedMap.get(key);
        const monthKey = `${data.Year}-${String(data.Month).padStart(2, '0')}`;

        // Llenamos el objeto monthlyData para la métrica principal (Efectividad Total).
        groupEntry.monthlyData[monthKey] = data.EfectividadTotal;

        // Definimos las métricas que se mostrarán en el primer nivel (bajo Sucursal/Grupo).
        const mainMetrics = [
            { name: "Clientes Acumulados", value: data.ClientesAcumulados },
            { name: "Clientes Vendidos", value: data.ClientesVendidos },
            { name: "Efectividad Total", value: data.EfectividadTotal },
            { name: "Clientes No Vendidos", value: data.ClientesAcumulados - data.ClientesVendidos }
        ];

        // Recorremos las métricas principales para agregarlas a la estructura de salida.
        mainMetrics.forEach(metric => {
            let existingMetric = groupEntry.nestedMetrics.find(m => m.nombre === metric.name);
            if (!existingMetric) {
                existingMetric = { nombre: metric.name, monthlyData: {}, nested: [] };
                groupEntry.nestedMetrics.push(existingMetric);
            }
            existingMetric.monthlyData[monthKey] = metric.value;
        });

        // Ahora, recorremos el array de vendedores para agregar sus datos.
        data.Vendedores.forEach(vendedor => {
            // Buscamos si el vendedor ya existe en el array nestedMetrics.
            let existingSeller = groupEntry.nestedMetrics.find(m => m.nombre === vendedor.SlpName);
            if (!existingSeller) {
                // Si no existe, creamos una nueva entrada para el vendedor.
                existingSeller = {
                    nombre: vendedor.SlpName,
                    monthlyData: {},
                    nested: []
                };
                groupEntry.nestedMetrics.push(existingSeller);
            }
            // Agregamos la efectividad de ventas del vendedor para el mes actual.
            existingSeller.monthlyData[monthKey] = vendedor.EfectividadVentas;

            // Definimos las métricas que se mostrarán bajo el vendedor.
            const sellerMetrics = [
                { name: "Clientes Vendidos", value: vendedor.ClientesVendidos },
                { name: "Clientes Asignados", value: vendedor.ClientesAsignados },
                { name: "Efectividad Ventas", value: vendedor.EfectividadVentas },
                { name: "Clientes No Vendidos", value: vendedor.ClientesAsignados - vendedor.ClientesVendidos }
            ];

            // Recorremos las métricas del vendedor para agregarlas.
            sellerMetrics.forEach(metric => {
                let existingSellerMetric = existingSeller.nested.find(m => m.nombre === metric.name);
                if (!existingSellerMetric) {
                    existingSellerMetric = { nombre: metric.name, monthlyData: {}, nested: [] };
                    existingSeller.nested.push(existingSellerMetric);
                }
                existingSellerMetric.monthlyData[monthKey] = metric.value;
            });


            // Recorremos el array de zonas dentro del vendedor.
            vendedor.Zonas.forEach(zona => {
                // Buscamos si la zona ya existe en el array nested del vendedor.
                let existingZone = existingSeller.nested.find(m => m.nombre === zona.ZoneName);
                if (!existingZone) {
                    // Si no existe, creamos una nueva entrada para la zona.
                    existingZone = {
                        nombre: zona.ZoneName,
                        monthlyData: {},
                        // Nuevo array nested para las métricas de la zona
                        nested: []
                    };
                    existingSeller.nested.push(existingZone);
                }
                // Agregamos la efectividad de ventas de la zona para el mes actual.
                existingZone.monthlyData[monthKey] = zona.EfectividadVentas;

                // AHORA se agregan las métricas anidadas a la zona
                const zoneMetrics = [
                    { name: "Clientes Vendidos", value: zona.ClientesVendidos },
                    { name: "Clientes Asignados", value: zona.ClientesAsignados },
                    { name: "Efectividad Ventas", value: zona.EfectividadVentas },
                    { name: "Clientes No Vendidos", value: zona.ClientesAsignados - zona.ClientesVendidos }
                ];

                zoneMetrics.forEach(metric => {
                    let existingZoneMetric = existingZone.nested.find(m => m.nombre === metric.name);
                    if (!existingZoneMetric) {
                        existingZoneMetric = { nombre: metric.name, monthlyData: {}, nested: [] };
                        existingZone.nested.push(existingZoneMetric);
                    }
                    existingZoneMetric.monthlyData[monthKey] = metric.value;
                });
            });
        });
    });

    // Convertimos el Map en un array para el resultado final.
    return Array.from(groupedMap.values());
};



const ventasEfectividadPorSucursalController = async (req, res) => {
    try {
        const sucursal = req.query.sucursal;

        if (!sucursal) {
            return res.status(400).json({ mensaje: 'Debe proporcionar el nombre de la sucursal', goToExpiry: false });
        }
        const rawData = await ventasClientesPorSucursal();


        const filtered = rawData.filter(row =>
            row.Year >= 2024 &&
            row.CLIENTESACUMULADOS !== null &&
            row.ClientesVendidosMes !== null &&
            row.CLIENTESACUMULADOS !== 0 &&
            row.ClientesVendidosMes !== 0
        );
        if (sucursal !== "TODAS") {
            const sucursalData = filtered.filter(row => row.SucName === sucursal);

            if (sucursalData.length === 0) {
                return res.status(404).json({ mensaje: 'No se encontraron datos para esa sucursal desde 2024 con ventas.', goToExpiry: false });
            }
            const sorted = sucursalData.sort((a, b) => {
                if (a.Year !== b.Year) {
                    return a.Year - b.Year;
                }
                return a.Month - b.Month;
            });
            const labels = sorted.map(row => `${row.Year}-${String(row.Month).padStart(2, '0')}`);
            const series = sorted.map(row => parseFloat(((row.ClientesVendidosMes / row.CLIENTESACUMULADOS) * 100).toFixed(2)));

            const detalle = sorted.map(row => ({
                total: row.CLIENTESACUMULADOS,
                vendidos: row.ClientesVendidosMes,
                noVendidos: row.CLIENTESACUMULADOS - row.ClientesVendidosMes
            }));

            return res.json({ sucursal, labels, series, detalle });
        }

        const agrupado = {};

        for (const row of filtered) {
            const mes = `${row.Year}-${String(row.Month).padStart(2, '0')}`;
            if (!agrupado[mes]) {
                agrupado[mes] = {
                    total: 0,
                    vendidos: 0,
                    vendidosno: 0,
                };
            }

            agrupado[mes].total += row.CLIENTESACUMULADOS;
            agrupado[mes].vendidos += row.ClientesVendidosMes;
            agrupado[mes].vendidosno += row.ClientesNoVendidosMes; // Suma ClientesNoVendidosMes directamente
        }

        const labels = Object.keys(agrupado).sort();
        const series = [];
        const detalle = [];
        for (const mes of labels) {
            const { total, vendidos, vendidosno } = agrupado[mes];
            const porcentaje = total > 0 ? parseFloat(((vendidos / total) * 100).toFixed(2)) : 0.00;
            series.push(porcentaje);
            detalle.push({ total, vendidos, noVendidos: vendidosno });
        }
        return res.json({ sucursal: 'TODAS', labels, series, detalle });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `Error en ventasEfectividadPorSucursalController: ${error.message || 'No definido'}` });
    }
};

const selectionBatchByItemWhsCodeController = async (req, res) => {
    try {
        let itemCode = req.query.itemCode
        let whsCode = req.query.whsCode

        if (!itemCode || itemCode == '') {
            itemCode = null
        }

        if (!whsCode || whsCode == '') {
            whsCode = null
        }

        const response = await selectionBatchByItemWhsCode(itemCode, whsCode)

        return res.json(response)

    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en selectionBatchByItemWhsCodeController ${error.message || 'No definido'}` });
    }
}

const getSalesOperationalEfficiencyDashboardController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const startDate = req.query.startDate
        const endDate = req.query.endDate

        const response = await getSalesOperationalEfficiencyDashboard(cardCode, startDate, endDate)
        return res.json(response)
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en selectionBatchByItemWhsCodeController ${error.message || 'No definido'}` });
    }
}

const dataFromSpeackingController = async (req, res) => {
    try {
        const tipoCliente = req.query.tipoCliente
        const startDate = req.query.startDate
        const endDate = req.query.endDate
        let tipo = ''
        if (tipoCliente !== undefined) {
            tipo = `${tipoCliente}`
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ mensaje: 'la fecha inicial y final son obligatorias' })
        }
        console.log({ startDate, endDate, tipo })
        const response = await kpiEstadosSpeacking(startDate, endDate, tipo)
        const data = agruparPorEstado(response)
        const dataDetail = agruparDetallePorAgencia(data)
        const sumatoriaTotales = dataDetail.reduce((acc, item) => {
            return acc + item.Total
        }, 0)

        const finalDetails = dataDetail.map((item) => {
            const { Total, ...rest } = item
            item.cumplimiento = Total / sumatoriaTotales
            return item
        })

        // const sumatoriaCumplimiento = dataDetail.reduce((acc, item) => {
        //     return acc + item.cumplimiento
        // }, 0)
        return res.json(finalDetails)
    } catch (error) {
        console.error({ error })
        return res.status(500).json({ mensaje: `Error en selectionBatchByItemWhsCodeController ${error.message || 'No definido'}` });
    }
}
module.exports = {
    ventasPorSucursalController,
    ventasNormalesController,
    ventasCadenasController,
    ventasInstitucionesController,
    ventasUsuarioController,
    ventasIFAVETController,
    ventasMasivoController,
    ventasPorSucursalControllerMesAnterior,
    ventasNormalesControllerMesAnterior,
    ventasCadenasControllerMesAnterior,
    ventasInstitucionesControllerMesAnterior,
    ventasIFAVETControllerMesAnterior,
    ventasMasivoControllerMesAnterior,
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
    vendedorPorSucCodeController,
    lineasController,
    reporteVentasClienteLineas,
    clienteByCardCodeController,
    clientesSinUbicacionSupervisorController,
    allCampaignFilterController,
    getYTDByVendedorController,
    getYTDDelVendedorController,
    getYTDDelVendedorMontoController, getYTDMontoByVendedorController,
    createCampaignController,
    ReporteOfertaPDFController,
    getCoberturaController,
    clientesNoVentaController, clientesNoVentaPorVendedorController,
    getVendedoresThatHasClientsController,
    facturasMoraByClientController,
    clientesMoraController,
    allCampaignController,
    allAgenciesController,
    excelClientesMoraController,
    campaignByIdController,
    sublineasController,
    reporteUbicacionClienteController,
    agregarSolicitudDeDescuentoController, actualizarStatusSolicitudDescuentoController,
    getVendedoresSolicitudDescByStatusController, getSolicitudesDescuentoByStatusController,
    actualizarSolicitudDescuentoController, actualizarVariosStatusSolicitudDescuentoController,
    actualizarSolicitudesDescuentoController, deleteSolicitudDescuentoController,
    getClientNameController,
    //  notificationSubscriptionController, 
    // sendNotificationController,
    getSolicitudesDescuentoByVendedorController,
    // getNotificationController,
    // deleteNotificationController,
    ventasPresupuestoSubLinea, ventasPresupuestoSubLineaAnterior,
    // notificationUnsubscribeController,
    getVendedoresSolicitudDescuentoController, getVendedorByCodeController, getDescuentosDelVendedorParaPedidoController,
    ventasPorZonasVendedor2Controller, getUbicacionClientesByVendedorController, getVentasZonaSupervisorController,
    getVendedoresSolicitudDescByStatusSucursalController,
    vendedorPorListSucCodeController, clientesBloqueadosPorcentajeController,
    ventasLineaSupervisorController, ventasTipoSupervisorController, clientesVendedorBloqueadosPorcentajeController,
    excelClientesBloqueados, ventasLineaSucursalSupervisorController,
    ventasVendedoresByLineasSucursalController,
    ventasZonasVendedoresByLineasSucursalController,
    reportePendienteCadenasController,
    clientesCadenasParentController,
    searchClientesCadenasParentController,
    ventasPendienteController,
    searchBlockedClients,
    searchBlockedClientsByZoneSucAndGroup,
    clientesVendedorBloqueadosController,
    clientesVendedorBloqueadosExcelController,
    reportePendienteByItemController,
    ventasPendienteByItemController,
    clientExpiryPolicyController,
    selectionBatchByItemWhsCodeController,
    clientesCreadosPorSucursalController,
    ventasClientesPorSucursalController,
    ventasEfectividadPorSucursalController,
    reportePendienteUngroupByItemController,
    getSalesOperationalEfficiencyDashboardController,
    dataFromSpeackingController,
    reportePendienteBySucursalResumeController
};
