const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const { request, response } = require("express")
const ExcelJS = require('exceljs');
const { cobranzaGeneral, cobranzaPorSucursal, cobranzaNormales, cobranzaCadenas, cobranzaIfavet, cobranzaPorSucursalMesAnterior, cobranzaNormalesMesAnterior, cobranzaCadenasMesAnterior, cobranzaIfavetMesAnterior, cobranzaMasivo, cobranzaInstituciones, cobranzaMasivoMesAnterior, cobranzaPorSupervisor, cobranzaPorZona, cobranzaHistoricoNacional, cobranzaHistoricoNormales, cobranzaHistoricoCadenas, cobranzaHistoricoIfaVet, cobranzaHistoricoInstituciones, cobranzaHistoricoMasivos, cobranzaPorZonaMesAnt, cobranzaSaldoDeudor, clientePorVendedor, clientesInstitucionesSaldoDeudor, saldoDeudorInstituciones, cobroLayout, resumenCobranzaLayout, cobrosRealizados, clientesPorVendedor, clientesPorSucursal, clientePorVendedorId, cobranzaSaldoDeudorDespachador, clientesPorDespachador, cobranzaSaldoAlContadoDeudor,
    detalleFactura, cobranzaNormalesPorSucursal, cobranzaPorSucursalYTipo, getVendedores,
    getCobradores, getCobradoresBySucursales,
    saldoDeudorIfavet,
    getAllSublines,
    getAllLines,
    getVendedoresBySuc,
    getYearToDayBySuc, getYearToDayByCobrador, getYtdCobradores, getPendientesBajaPorCobrador,
    cuentasParaBajaCobranza, cuentasBancoParaBajaCobranza, getBaja, getLayoutComprobanteContable,
    getBajasByUser, reporteBajaCobranzas,
    getClienteById,
    getComprobantesBajasByUser,
    getClientes,
    getEstadoCuentaCliente,
    auditoriaSaldoDeudor, obtenerBajasFacturas, findCliente, cobranzaPorZonaSupervisor,
    cobranzaPorZonaNoUser,
    getCobranzaDocNumPorDocEntry
} = require("./hana.controller")
const { postIncommingPayments, cancelIncommingPayments } = require("./sld.controller");
const { syncBuiltinESMExports } = require('module');
const { grabarLog } = require("../../shared/controller/hana.controller");
const { aniadirDetalleVisita } = require('../../planificacion_module/controller/hana.controller');
const formatData = require('../utils/formatEstadoCuenta');
const { getSucursales } = require('../../datos_maestros_module/controller/hana.controller');


const cobranzaGeneralController = async (req, res) => {
    try {

        const response = await cobranzaGeneral()
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaGeneralController',
            error
        })
    }
}

const cobranzasPorZonasController = async (req = request, res = response) => {
    const { username } = req.query;
    try {
        console.log({ username })
        if (!username && typeof username != "string") {
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        }
        const response = await cobranzaPorZona(username);
        if (!response) {
            return res.status(400).json({ mensaje: 'error al traer las cobranzas' })
        }
        console.log({ response })
        // if (response.length == 0) {
        //     return res.status(400).json({ mensaje: 'Ingrese un usuario valido' })
        // }
        const data = response.map(r => ({
            ...r,
            cumplimiento: r.Quota == 0 ? 0 : r.Collection / r.Quota
        }))
        return res.status(200).json({
            response: data,
            mensaje: "Todas las zonas del usuario"
        });
    } catch (err) {
        console.log('error en ventasInstitucionesController')
        console.log({ err })
        return res.status(500).json({ mensaje: `${err.message || 'Error en cobranzasPorZonasController'}` })
    }
}


const cobranzaPorSucursalController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaPorSucursal()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaPorSucursalController',
            error
        })
    }
}

const cobranzaNormalesController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaNormales()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaNormalesController',
            error
        })
    }
}

const cobranzaCadenaController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaCadenas()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaCadenaController',
            error
        })
    }
}

const cobranzaIfavetController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaIfavet()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaIfavetController',
            error
        })
    }
}

const cobranzaPorSucursalMesAnteriorController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaPorSucursalMesAnterior()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaPorSucursalMesAnteriorController',
            error
        })
    }
}

const cobranzaNormalesMesAnteriorController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaNormalesMesAnterior()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaNormalesMesAnteriorController',
            error
        })
    }
}

const cobranzaCadenaMesAnteriorController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaCadenasMesAnterior()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaCadenaMesAnteriorController',
            error
        })
    }
}

const cobranzaIfavetMesAnteriorController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaIfavetMesAnterior()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaIfavetMesAnteriorController',
            error
        })
    }
}

const cobranzaMasivosController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaMasivo()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaMasivosController',
            error
        })
    }
}

const cobranzaInstitucionesController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaInstituciones()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaInstitucionesController',
            error
        })
    }
}

const cobranzaMasivosMesAnteriorController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaMasivoMesAnterior()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaMasivosMesAnteriorController',
            error
        })
    }
}

const cobranzaInstitucionesMesAnteriorController = async (req, res) => {
    try {
        const { listSuc } = req.body
        const responseData = await cobranzaMasivoMesAnterior()
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
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaInstitucionesMesAnteriorController',
            error
        })
    }
}

const cobranzaPorSupervisorController = async (req, res) => {
    try {
        const { userCode, dim1 } = req.body
        const listResponse = []
        let totalCobranza = 0, totalCump = 0, totalPresupuesto = 0
        for (const iteratorDim1 of dim1) {
            const response = await cobranzaPorSupervisor(userCode, iteratorDim1)
            listResponse.push(response)
        }
        listResponse.map((item) => {
            item.map((itemRes) => {
                totalCobranza += +itemRes.Cobranzas
            })
        })

        res.status(200).json({ listResponse, totalCobranza, totalCump, totalPresupuesto })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'problemas en cobranzaPorSupervisorController',
            error
        })
    }
}

const cobranzaHistoricoNacionalController = async (req, res) => {
    try {
        const data = await cobranzaHistoricoNacional()
        console.log({ data })
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
        return res.status(500).json({ mensaje: 'error en cobranzaHistoricoNacional controller' })
    }
}

const cobranzaHistoricoNormalesController = async (req, res) => {
    try {
        const data = await cobranzaHistoricoNormales()
        // console.log({data})
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
        return res.status(500).json({ mensaje: 'error en cobranzaHistoricoNacional controller' })
    }
}

const cobranzaHistoricoCadenasController = async (req, res) => {
    try {
        const data = await cobranzaHistoricoCadenas()
        // console.log({data})
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
        return res.status(500).json({ mensaje: 'error en cobranzaHistoricoNacional controller' })
    }
}

const cobranzaHistoricoIfavetController = async (req, res) => {
    try {
        const data = await cobranzaHistoricoIfaVet()
        // console.log({data})
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
        return res.status(500).json({ mensaje: 'error en cobranzaHistoricoNacional controller' })
    }
}

const cobranzaHistoricoInstitucionesController = async (req, res) => {
    try {
        const data = await cobranzaHistoricoInstituciones()
        // console.log({data})
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
        return res.status(500).json({ mensaje: 'error en cobranzaHistoricoNacional controller' })
    }
}

const cobranzaHistoricoMasivosController = async (req, res) => {
    try {
        const data = await cobranzaHistoricoMasivos()
        // console.log({data})
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
        return res.status(500).json({ mensaje: 'error en cobranzaHistoricoNacional controller' })
    }
}

const cobranzasPorZonasMesAntController = async (req = request, res = response) => {
    const { username } = req.query;
    try {
        const user = req.usuarioAutorizado
        if (!username && typeof username != "string")
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        const { ID_VENDEDOR_SAP } = user
        if (!ID_VENDEDOR_SAP || ID_VENDEDOR_SAP == 0) {
            return res.status(400).json({
                mensaje: 'Usted no tiene ID Vendedor SAP'
            })
        }
        const response = await cobranzaPorZonaMesAnt(ID_VENDEDOR_SAP);
        if (response.length == 0) {
            return res.status(400).json({ mensaje: 'Ingrese un usuario valido' })
        }
        const data = response.map(r => ({
            ...r,
            cumplimiento: r.Quota == 0 ? 0 : r.Collection / r.Quota
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

const cobranzaClientePorVendedorController = async (req, res) => {
    try {
        const nombre = req.query.nombre
        // console.log({nombre})
        if (!nombre) return res.status(400).json({ mensaje: 'no hay el nombre del vendedor' })
        // return res.json({nombre})
        const response = await clientePorVendedor(nombre, '')
        return res.json({ response })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const cobranzaClientePorVendedorIDController = async (req, res) => {
    try {
        const id = req.query.id
        if (!id) return res.status(400).json({ mensaje: 'no hay el id del vendedor' })
        const clientes = await clientesPorVendedor(id)
        return res.json({ clientes: clientes.data })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const cobranzaFacturaPorClienteController = async (req, res) => {
    try {
        const nombre = req.query.nombre
        const codigo = req.query.codigo
        // console.log({nombre})
        if (!codigo) return res.status(400).json({ mensaje: 'no hay el codigo del cliente' })
        if (!nombre) return res.status(400).json({ mensaje: 'no hay el nombre del vendedor' })
        // return res.json({nombre})
        const response = await cobranzaSaldoDeudor(nombre, codigo)
        return res.json({ response })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const cobranzaFacturaPorClienteDespachadorController = async (req, res) => {
    try {
        // const nombre = req.query.nombre
        const codigo = req.query.codigo
        // console.log({nombre})
        if (!codigo) return res.status(400).json({ mensaje: 'no hay el codigo del cliente' })
        // if (!nombre) return res.status(400).json({ mensaje: 'no hay el nombre del vendedor' })
        // return res.json({nombre})
        const response = await cobranzaSaldoAlContadoDeudor('', codigo)
        return res.json({ response })

    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const cobranzaFacturaPorCliDespController = async (req, res) => {
    try {
        const codigo = req.query.codigo
        if (!codigo) return res.status(400).json({ mensaje: 'no hay el codigo del cliente' })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response = await cobranzaSaldoDeudorDespachador(codigo)
        console.log({ response })
        if (response.statusCode != 200) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Despachador Facturas del cliente", `${response.message || 'Error en cobranzaSaldoDeudorDespachador'}`, `IFA_LAPP_COB_SALDO_DEUDOR_POR_CLIENTE`, "cobranza/facturas-cliente-desp", process.env.PRD)
            return res.status(400).json({ mensaje: `${response.message || 'Error en cobranzaSaldoDeudorDespachador'}` })
        }
        return res.json({ response: response.data })

    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Despachador Facturas del cliente", `Error en controller cobranzaFacturaPorCliDespController${error.message || ''}`, `IFA_LAPP_COB_SALDO_DEUDOR_POR_CLIENTE`, "cobranza/facturas-cliente-desp", process.env.PRD)

        return res.status(500).json({ mensaje: `Error en controller cobranzaFacturaPorCliDespController${error.message || ''}` })
    }
}

const clientesInstitucionesSaldoDeudorController = async (req, res) => {
    try {
        const clientes = await clientesInstitucionesSaldoDeudor()
        return res.json({ clientes })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'error en el controlador'
        })
    }
}

const saldoDeudorInstitucionesController = async (req, res) => {
    try {
        const cardCode = req.query.cardCode
        const response = await saldoDeudorInstituciones(cardCode)
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'error en el controlador'
        })
    }
}

const realizarCobroController = async (req, res) => {
    try {
        const { VisitID, CardName, ...body } = req.body
        let CashSum = body.CashSum
        const CashAccount = body.CashAccount
        let TransferSum = body.TransferSum
        const TransferAccount = body.TransferAccount
        const PaymentInvoices = body.PaymentInvoices
        let total = 0
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ usuario, body })
        if (!PaymentInvoices) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", 'Error: el PaymentInvoices es obligatorio', `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)
            return res.status(400).json({ mensaje: 'el PaymentInvoices es obligatorio' })
        }

        PaymentInvoices.map((item) => {
            const sum = item.SumApplied
            total += +sum
        })
        console.log({ total })
        total = Number(total.toFixed(2))

        if (TransferAccount || TransferAccount != null) {
            TransferSum = Number(TransferSum.toFixed(2))
            body.TransferSum = Number(TransferSum.toFixed(2))
            if (TransferSum !== total) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `el total es diferente al TransferSum, total: ${total || 'no definido'} , TransferSum: ${TransferSum || 'no definido'} `, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)

                return res.status(400).json({ mensaje: `el total es diferente al TransferSum, total: ${total || 'no definido'} , TransferSum: ${TransferSum || 'no definido'} ` })
            }
        }

        if (CashAccount || CashAccount != null) {
            CashSum = Number(CashSum.toFixed(2))
            body.CashSum = Number(CashSum.toFixed(2))
            if (CashSum !== total) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `el total es diferente al CashSum, total: ${total || 'no definido'} , CashSum: ${CashSum || 'no definido'} `, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)
                return res.status(400).json({ mensaje: `el total es diferente al CashSum, total: ${total || 'no definido'} , CashSum: ${CashSum || 'no definido'} ` })
            }
        }

        body.DocDate = null
        console.log({ body })
        const responseSap = await postIncommingPayments(body)
        if (responseSap.status !== 200) {
            let mensaje = `Error del SAP`
            if (responseSap.errorMessage && responseSap.errorMessage.value) {
                mensaje = `Error del SAP ${responseSap.errorMessage.value || ''}`
            }
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", mensaje, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)
            return res.status(400).json({ mensaje })
        }

        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", "Cobranza realizada con exito", `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)

        if (VisitID) {
            const responseAniadirVisita = await aniadirDetalleVisita(
                VisitID, body.CardCode, CardName, 'Cobranza',
                body.JournalRemarks, 0, total, body.U_OSLP_ID
            )
            console.log({ responseAniadirVisita })
            if (responseAniadirVisita.message) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `¡Error al añadir Visita a la Cobranza!. ${responseAniadirVisita.message}`, 'IFA_CRM_AGREGAR_VISIT_DETAIL', "cobranza/realizar-cobro", process.env.PRD)
            }
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `Exito al añadir Visita a la Cobranza.`, 'IFA_CRM_AGREGAR_VISIT_DETAIL', "cobranza/realizar-cobro", process.env.PRD)
        }

        return res.json({ ...responseSap, body })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ usuario })
        let mensaje = `Error en el controlador realizarCobroController ${error.message || ''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", mensaje, ``, "cobranza/realizar-cobro", process.env.PRD)

        return res.status(500).json({ mensaje })
    }
}

// const realizarCobroMultiController = async (req, res) => {
//     try {
//         // Verificar si el body es un array
//         const paymentsArray = Array.isArray(req.body) ? req.body : [req.body];
//         const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };

//         console.log({ usuario, paymentsCount: paymentsArray.length, paymentsArray });
//         // const { VisitID, CardName, ...body } = req.body
//         // console.log({ body })
//         // console.log("?????????????????????????????????", paymentsArray)

//         // Array para almacenar resultados de todas las transacciones
//         const results = [];
//         let allSuccess = true;

//         // Procesar cada pago en el array
//         for (const paymentData of paymentsArray) {
//             const { VisitID, CardName, ...body } = paymentData;
//             let CashSum = body.CashSum;
//             const CashAccount = body.CashAccount;
//             let TransferSum = body.TransferSum;
//             const TransferAccount = body.TransferAccount;
//             const PaymentInvoices = body.PaymentInvoices;
//             let total = 0;

//             // Validar PaymentInvoices
//             if (!PaymentInvoices) {
//                 grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", 'Error: el PaymentInvoices es obligatorio', `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

//                 results.push({
//                     success: false,
//                     message: 'el PaymentInvoices es obligatorio',
//                     body: body
//                 });

//                 allSuccess = false;
//                 continue; // Saltar a la siguiente iteración
//             }

//             // Calcular total
//             PaymentInvoices.map((item) => {
//                 const sum = item.SumApplied;
//                 total += +sum;
//             });

//             console.log({ total });
//             total = Number(total.toFixed(2));

//             // Validar transferencia
//             if (TransferAccount || TransferAccount != null) {
//                 TransferSum = Number(TransferSum.toFixed(2));
//                 body.TransferSum = Number(TransferSum.toFixed(2));
//                 if (TransferSum !== total) {
//                     const errorMsg = `el total es diferente al TransferSum, total: ${total || 'no definido'} , TransferSum: ${TransferSum || 'no definido'}`;

//                     grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", errorMsg, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

//                     results.push({
//                         success: false,
//                         message: errorMsg,
//                         body: body
//                     });

//                     allSuccess = false;
//                     continue; // Saltar a la siguiente iteración
//                 }
//             }

//             // Validar efectivo
//             if (CashAccount || CashAccount != null) {
//                 CashSum = Number(CashSum.toFixed(2));
//                 body.CashSum = Number(CashSum.toFixed(2));
//                 if (CashSum !== total) {
//                     const errorMsg = `el total es diferente al CashSum, total: ${total || 'no definido'} , CashSum: ${CashSum || 'no definido'}`;

//                     grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", errorMsg, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

//                     results.push({
//                         success: false,
//                         message: errorMsg,
//                         body: body
//                     });

//                     allSuccess = false;
//                     continue; // Saltar a la siguiente iteración
//                 }
//             }

//             // Procesar el pago con SAP
//             body.DocDate = null;
//             console.log({ body });

//             const responseSap = await postIncommingPayments(body);

//             if (responseSap.status !== 200) {
//                 let mensaje = `Error del SAP`;
//                 if (responseSap.errorMessage && responseSap.errorMessage.value) {
//                     mensaje = `Error del SAP ${responseSap.errorMessage.value || ''}`;
//                 }

//                 grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", mensaje, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

//                 results.push({
//                     success: false,
//                     message: mensaje,
//                     body: body,
//                     sapResponse: responseSap
//                 });

//                 allSuccess = false;
//                 continue; // Saltar a la siguiente iteración
//             }

//             grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", "Cobranza realizada con éxito", `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

//             // Procesar visita si es necesario
//             if (VisitID) {
//                 const responseAniadirVisita = await aniadirDetalleVisita(
//                     VisitID, body.CardCode, CardName, 'Cobranza',
//                     body.JournalRemarks, 0, total, body.U_OSLP_ID
//                 );

//                 console.log({ responseAniadirVisita });

//                 if (responseAniadirVisita.message) {
//                     grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `¡Error al añadir Visita a la Cobranza!. ${responseAniadirVisita.message}`, 'IFA_CRM_AGREGAR_VISIT_DETAIL', "cobranza/realizar-cobro", process.env.PRD);
//                 } else {
//                     grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `Éxito al añadir Visita a la Cobranza.`, 'IFA_CRM_AGREGAR_VISIT_DETAIL', "cobranza/realizar-cobro", process.env.PRD);
//                 }
//             }

//             // Agregar resultado exitoso
//             results.push({
//                 success: true,
//                 orderNumber: responseSap.DocNum || responseSap.DocEntry,
//                 sapResponse: responseSap,
//                 body: body
//             });
//         }

//         // Responder con todos los resultados
//         if (allSuccess) {
//             return res.json({
//                 success: true,
//                 message: "Todas las cobranzas fueron realizadas con éxito",
//                 results: results
//             });
//         } else {
//             // Si alguna falló, devolver código 207 (Multi-Status)
//             return res.status(207).json({
//                 success: false,
//                 message: "Algunas cobranzas fallaron",
//                 results: results
//             });
//         }

//     } catch (error) {
//         console.log({ error });
//         const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };
//         console.log({ usuario });
//         let mensaje = `Error en el controlador realizarCobroController ${error.message || ''}`;
//         grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", mensaje, ``, "cobranza/realizar-cobro", process.env.PRD);

//         return res.status(500).json({ mensaje });
//     }
// };

const realizarCobroMultiController = async (req, res) => {
    try {
        // Verificar si el body es un array
        const paymentsArray = Array.isArray(req.body) ? req.body : [req.body];
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };

        console.log({ usuario, paymentsCount: paymentsArray.length, paymentsArray });

        // Función para procesar un pago individual
        const processSinglePayment = async (paymentData) => {
            const { VisitID, CardName, ...body } = paymentData;
            let CashSum = body.CashSum;
            const CashAccount = body.CashAccount;
            let TransferSum = body.TransferSum;
            const TransferAccount = body.TransferAccount;
            const PaymentInvoices = body.PaymentInvoices;
            let total = 0;

            // Validar PaymentInvoices
            if (!PaymentInvoices) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", 'Error: el PaymentInvoices es obligatorio', `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

                return {
                    success: false,
                    message: 'el PaymentInvoices es obligatorio',
                    body: body
                };
            }

            // Calcular total
            PaymentInvoices.forEach((item) => {
                const sum = item.SumApplied;
                total += +sum;
            });

            console.log({ total });
            total = Number(total.toFixed(2));

            // Validar transferencia
            if (TransferAccount || TransferAccount != null) {
                TransferSum = Number(TransferSum.toFixed(2));
                body.TransferSum = Number(TransferSum.toFixed(2));
                if (TransferSum !== total) {
                    const errorMsg = `el total es diferente al TransferSum, total: ${total || 'no definido'} , TransferSum: ${TransferSum || 'no definido'}`;

                    grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", errorMsg, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

                    return {
                        success: false,
                        message: errorMsg,
                        body: body
                    };
                }
            }

            // Validar efectivo
            if (CashAccount || CashAccount != null) {
                CashSum = Number(CashSum.toFixed(2));
                body.CashSum = Number(CashSum.toFixed(2));
                if (CashSum !== total) {
                    const errorMsg = `el total es diferente al CashSum, total: ${total || 'no definido'} , CashSum: ${CashSum || 'no definido'}`;

                    grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", errorMsg, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

                    return {
                        success: false,
                        message: errorMsg,
                        body: body
                    };
                }
            }

            // Procesar el pago con SAP
            body.DocDate = null;
            console.log({ body });

            const responseSap = await postIncommingPayments(body);

            if (responseSap.status !== 200) {
                let mensaje = `Error del SAP`;
                if (responseSap.errorMessage && responseSap.errorMessage.value) {
                    mensaje = `Error del SAP ${responseSap.errorMessage.value || ''}`;
                }

                grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", mensaje, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

                return {
                    success: false,
                    message: mensaje,
                    body: body,
                    sapResponse: responseSap
                };
            }

            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", "Cobranza realizada con éxito", `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD);

            // Procesar visita si es necesario
            if (VisitID) {
                try {
                    const responseAniadirVisita = await aniadirDetalleVisita(
                        VisitID, body.CardCode, CardName, 'Cobranza',
                        body.JournalRemarks, 0, total, body.U_OSLP_ID
                    );

                    console.log({ responseAniadirVisita });

                    if (responseAniadirVisita.message) {
                        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `¡Error al añadir Visita a la Cobranza!. ${responseAniadirVisita.message}`, 'IFA_CRM_AGREGAR_VISIT_DETAIL', "cobranza/realizar-cobro", process.env.PRD);
                    } else {
                        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `Éxito al añadir Visita a la Cobranza.`, 'IFA_CRM_AGREGAR_VISIT_DETAIL', "cobranza/realizar-cobro", process.env.PRD);
                    }
                } catch (visitError) {
                    grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", `¡Error al añadir Visita a la Cobranza!. ${visitError.message}`, 'IFA_CRM_AGREGAR_VISIT_DETAIL', "cobranza/realizar-cobro", process.env.PRD);
                }
            }

            // Retornar resultado exitoso
            return {
                success: true,
                orderNumber: responseSap.DocNum || responseSap.DocEntry,
                sapResponse: responseSap,
                body: body
            };
        };

        // Procesar todos los pagos en paralelo con Promise.all
        const results = await Promise.all(
            paymentsArray.map(paymentData =>
                processSinglePayment(paymentData).catch(error => {
                    console.error("Error procesando pago:", error);
                    return {
                        success: false,
                        message: `Error inesperado al procesar pago: ${error.message}`,
                        body: paymentData
                    };
                })
            )
        );

        // Verificar si todas las transacciones fueron exitosas
        const allSuccess = results.every(result => result.success);

        // Responder con todos los resultados
        if (allSuccess) {
            return res.json({
                success: true,
                message: "Todas las cobranzas fueron realizadas con éxito",
                results: results
            });
        } else {
            // Si alguna falló, devolver código 207 (Multi-Status)
            return res.status(207).json({
                success: false,
                message: "Algunas cobranzas fallaron",
                results: results
            });
        }

    } catch (error) {
        console.log({ error });
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' };
        console.log({ usuario });
        let mensaje = `Error en el controlador realizarCobroController ${error.message || ''}`;
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", mensaje, ``, "cobranza/realizar-cobro", process.env.PRD);

        return res.status(500).json({ mensaje });
    }
};



const comprobanteController = async (req, res) => {
    try {
        const id = req.query.id
        const response = await cobroLayout(id)
        console.log({ response })
        // return res.json({response})
        const Facturas = [];
        const cabezera = [];
        for (const line of response) {
            const { DocNumInvoice, DocDateInvoice, NumAtCard, PymntGroup, SumAppliedCob, TotalDue, ...result } = line
            if (!cabezera.length) {
                cabezera.push({ ...result })
            }
            Facturas.push({
                DocNumInvoice, DocDateInvoice, NumAtCard, PymntGroup, SumAppliedCob, TotalDue
            })
        }
        const comprobante = {
            ...cabezera[0],
            Facturas
        }
        // return res.json({ comprobante })
        //TODO TXT
        const formattedDate = formatDate(comprobante.DocDatePayments);
        const cardName = comprobante.CardName.replace(/["\s]+/g, '');// Eliminar espacios del nombre y la doble comilla
        const fileName = `${cardName}_${formattedDate}.txt`;
        const finalDate = formattedDate.split(' ')

        let cpclContent = `
TEXT 4 0 30 30 LABORATORIOS IFA S.A.\r\n
LINE 30 80 570 80 2\r\n
TEXT 7 0 30 100 Comprobante: #${comprobante.DocNumPayments}\r\n
TEXT 7 0 30 120 Fecha: ${finalDate[0]}\r\n
TEXT 7 0 30 140 Hora: ${comprobante.DocTime[0]}${comprobante.DocTime[1]}:${comprobante.DocTime[2]}${comprobante.DocTime[3]}\r\n
TEXT 7 0 30 160 Codigo Cliente: ${comprobante.CardCode}\r\n
TEXT 7 0 30 180 Cliente: ${comprobante.CardName}\r\n
TEXT 7 0 30 200 Modalidad de Pago: ${comprobante.Modality.charAt(0).toUpperCase() + comprobante.Modality.slice(1)}\r\n
TEXT 7 0 30 250 Fecha        Nro.Fact          Total\r\n
LINE 30 270 570 270 2\r\n
`;

        // Añadir las facturas
        let yPosition = 280;
        comprobante.Facturas.forEach((factura) => {
            const { DocNumInvoice, DocDateInvoice, NumAtCard, SumAppliedCob, TotalDue } = factura;
            console.log({ DocDateInvoice })
            const formattedInvoiceDate = formattedDataInvoice(DocDateInvoice);
            cpclContent += `TEXT 7 0 30 ${yPosition} ${formattedInvoiceDate}   ${NumAtCard.padEnd(6)}   ---->   bs ${parseFloat(SumAppliedCob).toFixed(2)}\r\n` + `TEXT 7 0 30 ${yPosition + 30} Saldo Factura: ${parseFloat(TotalDue).toFixed(2)} bs\r\n`
            yPosition += 60;
        });

        // Línea divisoria y total
        cpclContent += `
LINE 30 ${yPosition} 570 ${yPosition} 1
TEXT 7 0 30 ${yPosition + 20} TOTAL:                      bs ${parseFloat(comprobante.DocTotal).toFixed(2)}\r\n
TEXT 7 0 30 ${yPosition + 40} Glosa: ${comprobante.JrnlMemo || ''}\r\n
TEXT 7 0 30 ${yPosition + 60} Vendedor: ${comprobante.ClpName || ''}\r\n
LINE 30 ${yPosition + 80} 570 ${yPosition + 80} 2
TEXT 7 0 30 ${yPosition + 100} Saldo Cliente: ${parseFloat(comprobante.Balance).toFixed(2) || ''} bs\r\n
TEXT 7 0 30 ${yPosition + 120} Firma                  Sello\r\n
LINE 30 ${yPosition + 270} 200 ${yPosition + 270} 2
LINE 350 ${yPosition + 270} 520 ${yPosition + 270} 2
LINE 0 ${yPosition + 350} 570 ${yPosition + 350} 2
FORM\r\n
PRINT\r\n
`;

        const filePath = path.join(__dirname, 'comprobantes', fileName);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, cpclContent);
        const safeFileName = encodeURIComponent(fileName);
        res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
        const ress = res.sendFile(filePath)
        res.on('finish', () => {
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            }
        });
        return ress
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el comprobanteController' })
    }
}

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    // Formatear la fecha y reemplazar caracteres no válidos
    return new Intl.DateTimeFormat('es-ES', options)
        .format(date)
        .replace(/[/]/g, '-') // Reemplazar "/" por "-"
        .replace(/:/g, '-')   // Reemplazar ":" por "-"
        .replace(',', '');    // Eliminar la coma
};

const formattedDataInvoice = (invoiceData) => {
    console.log({ invoiceData })
    const data = invoiceData.split(' ')
    return data[0]
}

const comprobantePDFController = async (req, res) => {
    let browser;
    try {
        const id = req.query.id
        const response = await cobroLayout(id)
        console.log({ response })
        // return res.json({response})
        const Facturas = [];
        const cabezera = [];
        for (const line of response) {
            const { DocNumInvoice, DocDateInvoice, NumAtCard, PymntGroup, SumAppliedCob, Modality, TotalDue, Balance, ...result } = line
            if (!cabezera.length) {
                cabezera.push({ ...result, Modality: Modality.charAt(0).toUpperCase() + Modality.slice(1), Balance: parseFloat(Balance).toFixed(2) })
            }
            Facturas.push({
                DocNumInvoice, DocDateInvoice, NumAtCard, PymntGroup, SumAppliedCob, TotalDue
            })
        }
        let comprobante = {
            ...cabezera[0],
            Facturas
        }
        const formattedDate = formattedDataInvoice(comprobante.DocDatePayments)
        comprobante = {
            ...comprobante,
            DocDatePayments: formattedDate,
            DocTotal: parseFloat(comprobante.DocTotal).toFixed(2)
        }
        const facturasItem = []
        comprobante.Facturas.map((item) => {
            const newData = {
                ...item,
                SumAppliedCob: parseFloat(item.SumAppliedCob).toFixed(2),
                DocDateInvoice: formattedDataInvoice(item.DocDateInvoice),
                TotalDue: parseFloat(item.TotalDue).toFixed(2),
            }
            facturasItem.push(newData)
        })

        comprobante = {
            ...comprobante,
            Facturas: facturasItem
        }
        // return res.json({comprobante})
        const qrCodeData = await QRCode.toDataURL(JSON.stringify(comprobante.Qr));
        const ejs = require('ejs');
        const htmlTemplate = path.join(__dirname, './pdf/template.ejs'); // Ruta del archivo template.ejs
        const htmlContent = await ejs.renderFile(htmlTemplate, {
            comprobante,
            qrCodeData,
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

        const fileName = `${comprobante.CardName}_${new Date()}.pdf`.replace(' ', '').trim()

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        return res.end(pdfBuffer);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error del controlador' })
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

const getMounth = (month) => {
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
        "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return meses[month];
}

const resumenCobranzasController = async (req, res) => {
    try {
        const id_vendedor = req.query.id
        const fecha = req.query.fecha
        // const fecha = '20250127'
        const mes = Number(fecha[4] + fecha[5]) - 1
        console.log({ mes })
        const fechaFormated = fecha[6] + fecha[7] + ' de ' + getMounth(mes) + ' de ' + fecha[0] + fecha[1] + fecha[2] + fecha[3]
        console.log({ fechaFormated })

        const response = await resumenCobranzaLayout(id_vendedor, fecha)
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }

        if (response.message) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Cierre Dia", `${response.message || 'Error en resumenCobranzaLayout'}`, `IFA_LAPP_VEN_CIERRE_DIA_LAYOUT`, "cobranza/resumen", process.env.PRD)
            return res.status(400).json({ mensaje: `${response.message || 'Error en resumenCobranzaLayout'}` })
        }

        console.log(Intl.NumberFormat('de-DE').format(79000.50))
        // return res.json({response})
        let cpclContent = ''
        let nombreVendedor = ''
        if (response.length != 0) {
            const Recibos = [];
            const Efectivo = [];
            const recibosEfec = [];
            const Transferencia = [];
            const recibosTrans = [];
            const Cheque = [];
            const recibosCheque = [];
            const cabezera = [];
            for (const line of response) {
                let { ClpCode, ClpName, Modality, TotalDay, Date, Time, ...result } = line
                Time = `${Time}`
                if (!cabezera.length) {
                    cabezera.push({ ClpCode, ClpName, Date, })
                }

                if (Modality == 'efectivo') {
                    if (!Efectivo.length) {
                        Efectivo.push({ Modality, TotalDay })
                    }
                    long = Time.length
                    if (long == 4) {
                        recibosEfec.push({ ...result, Time: `${Time[0]}${Time[1]}:${Time[2]}${Time[3]}` })
                    } else {
                        recibosEfec.push({ ...result, Time: `0${Time[0]}:${Time[1]}${Time[2]}` })
                    }
                } else if (Modality == 'transferencia') {
                    if (!Transferencia.length) {
                        Transferencia.push({ Modality, TotalDay })
                    }

                    long = Time.length
                    if (long == 4) {
                        recibosTrans.push({ ...result, Time: `${Time[0]}${Time[1]}:${Time[2]}${Time[3]}` })
                    } else {
                        recibosTrans.push({ ...result, Time: `0${Time[0]}:${Time[1]}${Time[2]}` })
                    }

                } else {
                    if (!Cheque.length) {
                        Cheque.push({ Modality, TotalDay })
                    }

                    long = Time.length
                    if (long == 4) {
                        recibosCheque.push({ ...result, Time: `${Time[0]}${Time[1]}:${Time[2]}${Time[3]}` })
                    } else {
                        recibosCheque.push({ ...result, Time: `0${Time[0]}:${Time[1]}${Time[2]}` })
                    }
                }
            }
            Efectivo[0] = {
                ...Efectivo[0],
                Recibos: recibosEfec
            }
            Transferencia[0] = {
                ...Transferencia[0],
                Recibos: recibosTrans
            }
            Cheque[0] = {
                ...Cheque[0],
                Recibos: recibosCheque
            }
            Recibos.push({ ...Efectivo[0] }); Recibos.push({ ...Transferencia[0] }); Recibos.push({ ...Cheque[0] });
            const comprobante = {
                ...cabezera[0],
                Recibos
            }
            // return res.json({ comprobante })
            console.log(comprobante.Date)
            nombreVendedor = comprobante.ClpName
            const fechaObj = new Date(comprobante.Date);

            // Usar Intl.DateTimeFormat para formatear la fecha en español
            const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
            const formatoFecha = new Intl.DateTimeFormat('es-ES', opciones).format(fechaObj);

            cpclContent = `
TEXT 4 0 30 30 LABORATORIOS IFA S.A.\r\n
TEXT 4 0 30 90 RESUMEN DE COBRANZA\r\n
LINE 30 170 570 170 2\r\n
TEXT 7 0 30 190 Fecha: ${formatoFecha}\r\n
TEXT 7 0 30 210 Vendedor: ${comprobante.ClpName || ''}\r\n
`;

            let yPosition = 230;

            for (let i = 0; i < comprobante.Recibos.length; i++) {
                if (comprobante.Recibos[i].Recibos.length != 0) {
                    if (i == 0) {
                        cpclContent += `LINE 30 ${yPosition} 570 ${yPosition} 1\r\n` + `TEXT 7 0 30 ${yPosition + 30} EFECTIVO\r\n`
                    } else if (i == 1) {
                        cpclContent += `LINE 30 ${yPosition} 570 ${yPosition} 1\r\n` + `TEXT 7 0 30 ${yPosition + 30} TRANSFERENCIA\r\n`
                    } else {
                        cpclContent += `LINE 30 ${yPosition} 570 ${yPosition} 1\r\n` + `TEXT 7 0 30 ${yPosition + 30} CHEQUE\r\n`
                    }

                    comprobante.Recibos[i].Recibos.forEach((recibo) => {
                        const { CardCode, CardName, DocTotal, NumAtCard, Time } = recibo;
                        cpclContent += `
TEXT 7 0 60 ${yPosition + 50} Cod: ${CardCode}                 ${Intl.NumberFormat('en-US').format(parseFloat(DocTotal).toFixed(2))} Bs.\r\n
TEXT 7 0 60 ${yPosition + 70} ${CardName}\r\n
TEXT 7 0 60 ${yPosition + 90} Hora: ${Time}\r\n
TEXT 7 0 60 ${yPosition + 110} Nros Fact: ${NumAtCard}\r\n
LINE 60 ${yPosition + 130} 570 ${yPosition + 130} 1\r\n`;
                        yPosition += 80
                    });
                    yPosition += 50
                    cpclContent += `
TEXT 7 0 60 ${yPosition} TOTAL:                  ${Intl.NumberFormat('en-US').format(parseFloat(comprobante.Recibos[i].TotalDay).toFixed(2))} Bs.\r\n
`;

                }
                yPosition += 20
            }
        } else {
            cpclContent = `
TEXT 4 0 30 30 LABORATORIOS IFA S.A.\r\n
TEXT 4 0 30 90 RESUMEN DE COBRANZA\r\n
TEXT 7 0 30 150 Fecha: ${fechaFormated}\r\n
TEXT 7 0 30 170 No hay Cobros de Hoy\r\n

`
        }

        cpclContent += `
FORM \r\n
PRINT\r\n
`
        const newDate = new Date()
        const fileName = `${id_vendedor}_cierre_${fecha}_${newDate.getMilliseconds()}.txt`;
        const filePath = path.join(__dirname, 'resumen', fileName);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, cpclContent);

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const ress = res.sendFile(filePath)
        res.on('finish', () => {
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            }
        });
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Cierre Dia", `Cierre hecho con exito`, `IFA_LAPP_VEN_CIERRE_DIA_LAYOUT`, "cobranza/resumen", process.env.PRD)
        return ress;
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const mensaje = `Error en el resumenCobranzasController: ${error.message || ''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Cierre Dia", mensaje, ``, "cobranza/resumen", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const cobrosRealizadosController = async (req, res) => {
    try {
        const id = req.query.idVendedor;
        console.log({ id })
        const cobros = await cobrosRealizados(id)
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        if (cobros.statusCode != 200) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Cobros Realizados", `${cobros.message || 'Error cobrosRealizados'}`, ``, "cobranza/cobros-realizados", process.env.PRD)
            return res.status(500).json({
                mensaje: `${cobros.message || 'Error cobrosRealizados'}`
            })
        }
        console.log({ cobros: cobros.data.length })
        let cobrosFinal = []
        let cobro
        let Detalle = []
        let currentDocNum = 0
        for (const factura of cobros.data) {
            const { DocNumInvoice, DocDateInvoice, NumAtCard, SumAppliedCob, DocNumPayments, ...rest } = factura;
            if (DocNumPayments != currentDocNum) {
                currentDocNum = DocNumPayments;
                Detalle = [{ DocNumInvoice, DocDateInvoice, NumAtCard, SumAppliedCob }]
                cobro = { DocNumPayments, ...rest, Detalle }
                cobrosFinal.push(cobro)
            } else {
                Detalle.push({ DocNumInvoice, DocDateInvoice, NumAtCard, SumAppliedCob })
                cobrosFinal.find((fila) => fila.DocNumPayments == DocNumPayments).Detalle = Detalle
            }
        }
        console.log({ cobrosfinal: cobrosFinal.length })

        return res.json({ cobros: cobrosFinal })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const mensaje = `Error en el controlador cobrosRealizadosController: ${error.message || ''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Cobros Realizados", mensaje, ``, "cobranza/cobros-realizados", process.env.PRD)
        return res.status(500).json({
            mensaje
        })
    }
}

const clientesPorSucursalController = async (req, res) => {
    try {
        const { idSucursales } = req.body;
        console.log({ idSucursales })
        const clientes = []
        for (const id_suc of idSucursales) {
            const clientessucursal = await clientesPorSucursal(id_suc)
            if (clientessucursal.statusCode != 200) {
                return res.status(clientessucursal.statusCode).json({ mensaje: clientessucursal.message || 'Error en clientesPorSucursal' })
            }
            clientes.push(...clientessucursal.data)
        }

        return res.json({ clientes: clientes })
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador clientesPorVendedorController'
        return res.status(500).json({
            mensaje
        })
    }
}

const clientesPorDespachadorController = async (req, res) => {
    try {
        const idSap = req.query.idSap;
        console.log({ idSap })
        const clientesDespachador = await clientesPorDespachador(idSap)
        console.log({ clientesDespachador })
        return res.json({ clientes: clientesDespachador.data })
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador clientesPorVendedorController'
        return res.status(500).json({
            mensaje
        })
    }
}

const detalleFacturaController = async (req, res) => {
    try {
        const docEntry = req.query.id
        console.log({ docEntry })
        const response = await detalleFactura(docEntry)
        console.log({ response })
        if (response.statusCode != 200) {
            res.status(400).json({ mensaje: `${response.message || 'Error en detalleFactura'}` })
        }
        // return res.json(response.data )
        let Detalle = []
        let cabecera = []
        response.data.forEach((item) => {
            const { ItemCode, Dscription, Quantity, PriceAfDi, ...rest } = item;
            if (cabecera.length == 0) {
                cabecera.push({
                    ...rest
                })
            }
            Detalle.push(
                {
                    ItemCode, Description: Dscription, Quantity, PriceAfDi
                }
            )

        })
        const factura = {
            ...cabecera[0],
            Detalle
        }
        return res.json({ ...factura })
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador detalleFacturaController: ${error.message} || ''`
        return res.status(500).json({
            mensaje
        })
    }
}

const cobranzaPorSucursalesYTiposController = async (req, res) => {
    try {
        const { sucCodes, tipos } = req.body
        console.log({ sucCodes, tipos })
        let listResponse = [];
        let totalCobranza = 0
        for (const sucCode of sucCodes) {
            const porTipo = []
            for (const tipo of tipos) {
                console.log({ sucCode, tipo })
                const cobranza = await cobranzaPorSucursalYTipo(sucCode, tipo)
                console.log({ cobranza })
                if (cobranza.status == 400) {
                    return res.status(400).json(`${cobranza.message || 'Error en cobranzaPorSucursalYTipo'}`)
                }
                const cobranzaName = []
                cobranza.data.forEach((dta) => {
                    cobranzaName.push({
                        Sucursal: dta.SucName,
                        Zonas: dta.ZoneName,
                        Tipo: dta.GroupName,
                        Cobranzas: dta.Collection
                    })
                    totalCobranza += Number(dta.Collection)
                })
                porTipo.push(...cobranzaName)
                // console.log({ porTipo })
            }
            listResponse.push(porTipo)
        }
        console.log(JSON.stringify(listResponse))
        return res.json({ listResponse, totalCobranza })
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador cobranzaPorSucursalesYTiposController: ${error.message || ''}`
        return res.status(500).json({
            mensaje
        })
    }
}

const cobranzaPorSucursalYTiposController = async (req, res) => {
    try {
        const { sucCode, tipos } = req.body
        let listResponse = [];
        let totalCobranza = 0
        for (const tipo of tipos) {
            const cobranza = await cobranzaPorSucursalYTipo(sucCode, tipo)
            console.log({ cobranza })
            if (cobranza.status == 400) {
                return res.status(400).json(`${cobranza.message || 'Error en cobranzaPorSucursalYTipo'}`)
            }
            const cobranzaName = []
            cobranza.data.forEach((dta) => {
                cobranzaName.push({
                    Sucursal: dta.SucName,
                    Zonas: dta.ZoneName,
                    Tipo: dta.GroupName,
                    Cobranzas: dta.Collection
                })
                totalCobranza += Number(dta.Collection)
            })
            listResponse.push(...cobranzaName)
        }
        console.log({ listResponse })
        return res.json({ listResponse, totalCobranza })
    } catch (error) {
        console.log({ error })
        const mensaje = `Error en el controlador cobranzaPorSucursalYTiposController: ${error.message || ''}`
        return res.status(500).json({
            mensaje
        })
    }
}

const getCobradoresController = async (req, res) => {
    try {

        let cobradores = await getVendedores()
        cobradores = cobradores.filter((element) => element.SlpCode != -1)
        return res.json(cobradores)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getCobradoresController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getVendedoresBySucursalesController = async (req, res) => {
    try {
        const { listSucName } = req.body
        let response = []
        let cobradores = await getCobradores()
        cobradores = cobradores.filter((element) => element.SlpCode != -1)

        cobradores.map((item) => {
            if (listSucName.includes(item.SucName)) {
                item.SlpCode = item.ClpCode
                item.SlpName = item.ClpName
                response.push(item)
            }
        })

        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getVendedoresBySucursalesController'
        return res.status(500).json({
            mensaje
        })
    }
}

const saldoDeudorIfavetController = async (req, res) => {
    try {
        const clientes = await saldoDeudorIfavet()
        return res.json({ clientes })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error al traer el saldo deudor de ifavet' })
    }
}

const getCobradoresBySucursalController = async (req, res) => {
    try {
        const { sucCode } = req.query
        let cobradores = await getVendedoresBySuc(sucCode)

        return res.json(cobradores)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getCobradoresBySucursalController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getCobradoresBySucursalesController = async (req, res) => {
    try {
        const { listSuc } = req.body;
        let cobradores = await getCobradoresBySucursales(listSuc);
        let clpCodes = new Set();
        let cobradoresUnicos = cobradores.filter(cobrador => {
            if (clpCodes.has(cobrador.ClpCode)) return false;
            clpCodes.add(cobrador.ClpCode);
            return true;
        });
        return res.json(cobradoresUnicos);
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getCobradoresBySucursalController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getAllSublinesController = async (req, res) => {
    try {

        let sublineas = await getAllSublines()
        return res.json(sublineas)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getAllSublinesController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getAllLinesController = async (req, res) => {
    try {

        let sublineas = await getAllLines()
        return res.json(sublineas)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getAllLinesController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getYearToDayController = async (req, res) => {
    try {
        const { sucCode, cobradorName, dim2, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2 } = req.body
        console.log({ body: req.body })
        let response
        if (sucCode)
            response = await getYearToDayBySuc(sucCode, dim2, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2)
        else
            response = await getYearToDayByCobrador(cobradorName, dim2, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getYearToDayController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getYtdCobradoresController = async (req, res) => {
    try {
        const { sucCode, mes, anio } = req.body
        console.log({ body: req.body })
        const response = await getYtdCobradores(sucCode, mes, anio)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getYtdCobradoresController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getPendientesBajaPorCobradorController = async (req, res) => {
    try {
        const { id } = req.query
        let cobranzas = await getPendientesBajaPorCobrador(id)
        cobranzas.map((item) => {
            item.TotalPending = +((+item.TotalPending).toFixed(2))
            item.DocTotal = +((+item.DocTotal).toFixed(2))
            item.AppliedToDate = +((+item.AppliedToDate).toFixed(2))
        })
        return res.json(cobranzas)
    } catch (error) {
        console.log({ error })
        const mensaje = `${error.message || 'Error en el controlador getPendientesBajaPorCobradorController'}`
        return res.status(500).json({
            mensaje
        })
    }
}

const getCuentasParaBajaController = async (req, res) => {
    try {
        const response = await cuentasParaBajaCobranza()

        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getCuentasParaBajaController'
        return res.status(500).json({
            mensaje
        })
    }
}


const getCuentasBancoParaBajaCobranzaController = async (req, res) => {
    try {
        const response = await cuentasBancoParaBajaCobranza()

        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador cuentasBancoParaBajaCobranza'
        return res.status(500).json({
            mensaje
        })
    }
}

const darDeBajaController = async (req, res) => {
    try {
        const { body } = req.body
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", body)
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const responsePostIncomming = await postIncommingPayments(body)
        if (responsePostIncomming.status == 400) {
            const mensaje = responsePostIncomming.errorMessage
            grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
                `${mensaje.value || mensaje || 'Error de postIncommingPayments.'}`,
                'postIncommingPayments', 'cobranza/baja', process.env.DBSAPPRD)
            return res.status(400).json({ mensaje: `${mensaje.value || mensaje || 'Error de postIncommingPayments'}`, body })
        }
        console.log({ responsePostIncomming })
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
            `Exito en la baja de cobranza`,
            'postIncommingPayments', 'cobranza/baja', process.env.DBSAPPRD)
        return res.json({ docEntry: responsePostIncomming.orderNumber })
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const mensaje = `Error en el controlador darDeBajaController: ${error.message || 'No definido'}`
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
            mensaje, 'catch controller', 'cobranza/baja', process.env.DBSAPPRD)
        return res.status(500).json({
            mensaje
        })
    }
}

const darVariasDeBajaController = async (req, res) => {
    let responses = []
    try {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const { body } = req.body
        for (const farmacia of body) {
            const { CardCode, CardName, CounterReference, ...rest } = farmacia
            const responsePostIncomming = await postIncommingPayments({ CounterReference, ...rest })
            console.log({ responsePostIncomming })
            if (responsePostIncomming.status == 400) {
                const mensaje = responsePostIncomming.errorMessage
                grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
                    `${mensaje.value || mensaje || 'Error de postIncommingPayments.'} Cliente del error: ${CardCode}- ${CardName}`,
                    'postIncommingPayments', 'cobranza/baja-varias', process.env.DBSAPPRD)
                return res.status(400).json(
                    {
                        mensaje: `${mensaje.value || mensaje || 'Error de postIncommingPayments.'} Cliente del error: ${CardCode}- ${CardName}`,
                        farmacia, responses
                    })
            }
            responses.push({ CardCode, CardName, DocNum: CounterReference, DocEntry: responsePostIncomming.orderNumber })
        }

        console.log({ responses })
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
            `Exito en las bajas`,
            'postIncommingPayments', 'cobranza/baja-varias', process.env.DBSAPPRD)
        return res.json({ responses })
    } catch (error) {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ error })
        const mensaje = `Error en el controlador darVariasDeBajaController: ${error.message || 'No definido'}`
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
            mensaje, 'catch del controller', 'cobranza/baja-varias', process.env.DBSAPPRD)
        return res.status(500).json({
            mensaje, responses
        })
    }
}

const comprobanteContableController = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    let browser;
    try {
        const { id } = req.query
        const baja = await getBaja(id)
        console.log({ baja })
        if (baja.length == 0) {
            grabarLog(user.USERCODE, user.USERNAME, `Cobranza Baja Comprobante`, `No se encontro una baja con DocEntry: ${id}`,
                `ifa_lapp_cob_bajas_por_id`, `cobranza/comprobante-contable`, process.env.PRD)
            return res.status(400).json({ mensaje: `No se encontro una baja con DocEntry: ${id}` })
        }
        const { TransId } = baja[0]
        const { ClpCode, ClpName } = baja[0]

        const layout = await getLayoutComprobanteContable(TransId)
        // return res.json({layout})
        if (layout.length == 0) {
            grabarLog(user.USERCODE, user.USERNAME, `Cobranza Baja Comprobante`,
                `No se encontro datos para TransId: ${TransId}, DocEntry: ${id} en el procedure ACB_INV_LayOutCoomprobanteContablePR`,
                `ACB_INV_LayOutCoomprobanteContablePR`, `cobranza/comprobante-contable`, process.env.PRD)
            return res.status(400).json({ mensaje: `No se encontro datos para TransId: ${TransId}, DocEntry: ${id} en el procedure ACB_INV_LayOutCoomprobanteContablePR` })
        }

        let cabecera = []
        let detalle = []
        let sumDebit = 0; let sumSYSDeb = 0; let sumCredit = 0; let sumSYSCred = 0

        layout.forEach((line) => {
            const { TransId,
                RefDate,
                DueDate,
                TaxDate,
                Ref1,
                Ref2,
                Ref3,
                Memo,
                RateUsd,
                RateEur,
                Debit,
                Credit,
                SYSDeb,
                SYSCred,
                DocNumFiscal,
                BaseRef,
                NumAtCard,
                U_NAME,
                Voucher,
                Ref3Line,
                CardCode, CardName,
                ...rest } = line
            const fechaTax = formattedDataInvoice(TaxDate)
            sumDebit += +Debit
            sumSYSDeb += +SYSDeb
            sumCredit += +Credit
            sumSYSCred += +SYSCred

            if (cabecera.length == 0) {
                cabecera.push({
                    ClpCode,
                    ClpName,
                    TransId,
                    RefDate,
                    DueDate,
                    TaxDate: fechaTax,
                    Ref1,
                    Ref2,
                    Ref3,
                    Memo,
                    RateUsd: (+RateUsd).toFixed(2),
                    RateEur: (+RateEur).toFixed(2),
                    DocNumFiscal,
                    BaseRef,
                    NumAtCard,
                    U_NAME,
                    Voucher,
                    Ref3Line,
                    CardCode, CardName
                })
            }
            detalle.push({
                Debit: (+Debit).toFixed(2),
                Credit: (+Credit).toFixed(2),
                SYSDeb: (+SYSDeb).toFixed(2),
                SYSCred: (+SYSCred).toFixed(2),
                ...rest
            })
        })
        cabecera[0].sumDebit = (+sumDebit).toFixed(2)
        cabecera[0].sumSYSDeb = (+sumSYSDeb).toFixed(2)
        cabecera[0].sumCredit = (+sumCredit).toFixed(2)
        cabecera[0].sumSYSCred = (+sumSYSCred).toFixed(2)

        let comprobante = {
            ...cabecera[0], detalle
        }


        // return res.json({comprobante, layout, baja})
        console.log(comprobante);

        const ejs = require('ejs');
        const htmlTemplate = path.join(__dirname, './pdf/template-contable.ejs');
        const htmlContent = await ejs.renderFile(htmlTemplate, {
            comprobante
        });


        browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();
        console.log('PDF Buffer Size:', pdfBuffer.length);

        const fileName = `${comprobante.TransId}_${new Date()}.pdf`.replace(' ', '').trim()

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileName}"`,
            'Content-Length': pdfBuffer.length
        });

        grabarLog(user.USERCODE, user.USERNAME, `Cobranza Baja Comprobante`, `Exito en crear el comprobante contable`,
            ``, `cobranza/comprobante-contable`, process.env.PRD)

        return res.end(pdfBuffer);
    } catch (error) {
        console.log({ error })
        const mensaje = `${error.message || 'Error en el controlador comprobanteContableController'}`
        grabarLog(user.USERCODE, user.USERNAME, `Cobranza Baja Comprobante`, `${mensaje || 'Error en comprobanteContableController'}`,
            `catch del controlador comprobanteContableController`, `cobranza/comprobante-contable`, process.env.PRD)
        return res.status(500).json({
            mensaje
        })
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


const getBajasByUserController = async (req, res) => {
    try {
        const { id_sap } = req.query
        const response = await getBajasByUser(id_sap)

        console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = `${error.message || 'Error en el controlador getBajasByUserController'}`
        return res.status(500).json({
            mensaje
        })
    }
}
const getComprobantesBajasController = async (req, res) => {
    try {
        const { id_sap } = req.query
        const response = await getComprobantesBajasByUser(id_sap)

        console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = `${error.message || 'Error en el controlador getComprobantesBajasController'}`
        return res.status(500).json({
            mensaje
        })
    }
}

const anularBajaController = async (req, res) => {
    try {
        const { id } = req.query
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response = await cancelIncommingPayments(id)
        if (response.status == 400) {
            grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
                `${response.errorMessage || 'Error de cancelIncommingPayments id: ' + id}`,
                'cancelIncommingPayments', 'cobranza/anular-baja', process.env.DBSAPPRD)
            return res.status(400).json({ mensaje: response.errorMessage || 'Error de cancelIncommingPayments.' })
        }
        console.log({ response })
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
            `Exito en la anulacion de baja: ${id}`,
            'cancelIncommingPayments', 'cobranza/anular-baja', process.env.DBSAPPRD)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const mensaje = `Error en el controlador anularBajaController: ${error.message || 'No definido'}`
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas',
            mensaje, 'catch controller', 'cobranza/anular-baja', process.env.DBSAPPRD)
        return res.status(500).json({
            mensaje
        })
    }
}

const reporteBajaCobranzasController = async (req, res) => {
    try {
        const { UserSign, month, year } = req.body
        const response = await reporteBajaCobranzas(UserSign, month, year)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador reporteBajaCobranzasController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getClienteByIdController = async (req, res) => {
    try {
        const { id } = req.query
        let response = await getClienteById(id)
        if (response.length > 0) {
            response = response[0]
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador reporteBajaCobranzasController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getClientesController = async (req, res) => {
    try {
        let response = await getClientes()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getClientesController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getEstadoCuentaClienteController = async (req, res) => {
    try {
        const { id } = req.query
        let response = await getEstadoCuentaCliente(id)
        const responseFormatted = formatData(response);
        return res.json(responseFormatted)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getEstadoCuentaClienteController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getEstadoCuentaClientePDFController = async (req, res) => {
    let browser;
    try {
        const { codCliente } = req.query;

        let response = await getEstadoCuentaCliente(codCliente);

        if (!response || response.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron datos" });
        }

        // console.log(response);

        const { CardCode, CardName, CardFName, Descr, LicTradNum, Phone1, Cellular, E_Mail, PymntGroup, Balance } = response[0];

        const detalles = response.map(item => {
            const {
                CardCode, CardName, CardFName, Descr, LicTradNum, Phone1, Cellular, E_Mail, PymntGroup, Balance,
                ...resto
            } = item;
            return resto;
        });
        console.log(detalles);

        // respuesta final como un objeto
        console.log(Balance);
        const resultadoFinal = {
            TotalSaldo: parseFloat(Balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            CardCode,
            CardName,
            CardFName,
            Descr,
            LicTradNum,
            Phone1,
            Cellular,
            E_Mail,
            PymntGroup,
            detalles
        };

        const ejs = require('ejs');
        const filePath = path.join(__dirname, './pdf/template-estado-cuenta.ejs');
        const html = await ejs.renderFile(filePath, { data: resultadoFinal, staticBaseUrl: process.env.STATIC_BASE_URL, });

        // 2. Usamos Puppeteer para convertir HTML a PDF
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: {
                bottom: '45px',
                top: '40px',
            },
            headerTemplate: `<div></div>`,
            footerTemplate: `
                <div style="width: 100%; margin-left: 60px; margin-right: 20px; font-size: 10px; color: #555;">
                    
                    <!-- Footer content -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="width: 50%; text-align: left;">
                            <p style="margin: 0;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></p>
                        </div>
                        <div style="width: 50%; text-align: right;">
                            <p>Impreso el <span class="date"></span></p>
                        </div>
                    </div>
                </div>`,
        });


        await browser.close();

        // 3. Respondemos con el PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="estado-cuenta.pdf"',
        });
        res.end(pdfBuffer);

    } catch (error) {
        console.log({ error });
        const mensaje = error.message || 'Error en el controlador getEstadoCuentaClientePDFController';
        return res.status(500).json({ mensaje });
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
const getSaldoDeudorClientePDF = async (req, res) => {
    let browser;
    try {
        const { codCliente } = req.query;

        // 1. Obtener los datos del saldo deudor (facturas pendientes)
        const dataFacturas = await cobranzaSaldoDeudor('', codCliente);

        console.log(dataFacturas)

        if (dataFacturas && dataFacturas.error) {
            console.error('Error al obtener datos de saldo deudor:', dataFacturas.error);
            return res.status(500).json({ mensaje: dataFacturas.error });
        }

        // CAMBIO AQUÍ: Asegura que facturasDeudor sea un array, incluso si dataFacturas.response es null/undefined
        const facturasDeudor = dataFacturas || [];

        if (!facturasDeudor || facturasDeudor.length === 0) { // Esta comprobación ahora es más robusta
            console.warn(`No se encontraron facturas pendientes para el cliente ${codCliente}.`);
        }

        // 2. Obtener los datos detallados del cliente
        const clienteDetalle = await getClienteById(codCliente);


        if (!clienteDetalle || clienteDetalle.error) {
            console.error('Error al obtener datos del cliente:', clienteDetalle ? clienteDetalle.error : 'Cliente no encontrado');
            return res.status(404).json({ mensaje: "No se encontraron datos del cliente." });
        }

        // Calcular el Saldo Acumulado (ahora facturasDeudor está garantizado como un array)
        const saldoAcumulado = facturasDeudor.reduce((sum, item) => {
            return sum + parseFloat(item.TotalDue || '0');
        }, 0);

        // ... el resto de tu código es el mismo ...
        const today = new Date();
        const formattedDate = `${today.getDate()} de ${today.toLocaleString('es', { month: 'long' }, { timeZone: 'America/La_Paz' })} del ${today.getFullYear()}`;
        const isoDateForComparison = today.toISOString(); // <-- AÑADE ESTA LÍNEA


        console.log(`[DEBUG] Resultado de getClienteById:`, JSON.stringify(clienteDetalle, null, 2)); // Esto imprime el array

        const clienteObj = (clienteDetalle && Array.isArray(clienteDetalle) && clienteDetalle.length > 0)
            ? clienteDetalle[0]
            : {};

        // Verificación adicional de que clienteObj se ha extraído correctamente
        console.log(`[DEBUG] Objeto cliente extraído (clienteObj):`, JSON.stringify(clienteObj, null, 2));

        // Comprobación de que el objeto cliente no esté vacío antes de continuar
        if (Object.keys(clienteObj).length === 0) {
            console.error('Error: Cliente no encontrado o datos vacíos para codCliente:', codCliente);
            return res.status(404).json({ mensaje: "No se encontraron datos del cliente." });
        }



        const resultadoFinal = {
            SaldoAcumulado: saldoAcumulado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),

            CardCode: clienteObj.CardCode || 'No disponible',
            CardName: clienteObj.CardName || 'No disponible',
            CardFName: clienteObj.CardFName || 'No disponible',
            LicTradNum: clienteObj.LicTradNum || 'No disponible',
            Phone1: clienteObj.Phone1 || 'No disponible',
            Cellular: clienteObj.Cellular || 'No disponible',
            E_Mail: clienteObj.E_Mail || 'No disponible',
            Address: clienteObj.Address || 'No disponible',
            PymntGroup: clienteObj.PymntGroup || 'No disponible',
            GroupName: clienteObj.GroupName || 'No disponible',
            SucName: clienteObj.SucName || 'No disponible',
            AreaName: clienteObj.AreaName || 'No disponible',
            ZoneName: clienteObj.ZoneName || 'No disponible',
            SlpNameCli: clienteObj.SlpNameCli || 'No disponible',

            // Los detalles de la tabla (facturas pendientes)
            detalles: facturasDeudor.map(item => ({
                DocNum: item.DocNum,
                DocDateReal: item.DocDateReal,
                DocDueDate: item.DocDueDate,
                JrnlMemo: item.JrnlMemo,
                Comments: item.Comments,
                DocCur: item.DocCur,
                NumAtCard: item.NumAtCard,
                DocTotal: parseFloat(item.DocTotal || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                PaidToDate: parseFloat(item.PaidToDate || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                TotalDue: parseFloat(item.TotalDue || '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                SlpNameCli: item.SlpNameCli,
                GroupName: item.GroupName,
            })),
            fechaReporte: formattedDate,
            fechaActualParaComparacion: isoDateForComparison
        };
        console.log(resultadoFinal);
        const ejs = require('ejs');
        const filePath = path.join(__dirname, './pdf/template-saldo-deudor.ejs');
        const html = await ejs.renderFile(filePath, { data: resultadoFinal, staticBaseUrl: process.env.STATIC_BASE_URL });

        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: {
                bottom: '45px',
                top: '40px',
            },
            headerTemplate: `<div></div>`,
            footerTemplate: `
                <div style="width: 100%; margin-left: 60px; margin-right: 20px; font-size: 10px; color: #555;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="width: 50%; text-align: left;">
                            <p style="margin: 0;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></p>
                        </div>
                        <div style="width: 50%; text-align: right;">
                            <p>Impreso el <span class="date"></span></p>
                        </div>
                    </div>
                </div>`,
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="saldo-deudor_${codCliente}.pdf"`,
        });
        res.end(pdfBuffer);

    } catch (error) {
        console.error('Error en getSaldoDeudorClientePDF:', error);
        const mensaje = error.message || 'Error al generar el PDF de Saldo Deudor.';
        return res.status(500).json({ mensaje });
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error("Error al cerrar el navegador en finally:", err.message);
            }
        }
    }
};




const auditoriaSaldoDeudorController = async (req, res) => {
    try {
        const date = req.query.date
        const cardCode = req.query.cardCode
        const response = await auditoriaSaldoDeudor(cardCode, date)
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en auditoriaSaldoDeudorController',
            error
        })
    }
}

const getBajasFacturasController = async (req, res) => {
    try {
        const { fechaIni, fechaFin, cardCode, factura } = req.body

        const response = await obtenerBajasFacturas(fechaIni, fechaFin, cardCode ?? '', factura ?? '')

        console.log({ response })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = `${error.message || 'Error en el controlador getBajasFacturasController'}`
        return res.status(500).json({
            mensaje
        })
    }
}

const findClienteController = async (req, res) => {
    try {
        const body = req.body
        console.log({ body })
        const buscar = body.buscar.toUpperCase()
        console.log({ buscar })
        const response = await findCliente(buscar)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador findClienteController: ${error.message || ''}` })
    }
}

const excelReporte = async (req, res) => {
    try {
        const { data, displayedColumns, cabecera } = req.body;
        const { fechaIni, fechaFin } = cabecera;

        //   console.log({data});
        //   console.log({displayedColumns})
        const fechaActual = new Date();
        const date = new Intl.DateTimeFormat('es-VE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(fechaActual);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte de Estado de Cuenta');

        worksheet.columns = [
            { header: 'Cliente', key: 'CardName', width: 30 },
            { header: 'Sucursal', key: 'SucName', width: 15 },
            { header: 'No. Factura', key: 'DocNumInv', width: 12 },
            { header: 'NumAtCard', key: 'NumAtCard', width: 14 },
            { header: 'Total Factura', key: 'DocTotalInv', width: 14 },
            { header: 'Forma de Pago', key: 'PymntGroup', width: 16 },
            { header: 'Fecha Cobro', key: 'DocDateCob', width: 14 },
            { header: 'No. Cobro', key: 'DocNumCob', width: 12 },
            { header: 'Total Cobro', key: 'DocTotalCob', width: 15 },
            { header: 'Pendiente Distribuir', key: 'DisPending', width: 20 },
            { header: 'Total Distribuido', key: 'DisTotal', width: 20 },
            { header: 'Fecha Distribución', key: 'DocDateDis', width: 20 },
            { header: 'No. Distribución', key: 'DocNumDis', width: 17 },
            { header: 'Tipo Transacción', key: 'TransType', width: 15 },
            { header: 'ID Línea', key: 'Line_ID', width: 9 },
            { header: 'Fecha Transferencia', key: 'TrsfrDate', width: 20 },
            { header: 'Ref. Transferencia', key: 'TrsfrRef', width: 20, style: { numFmt: '0' } },
            { header: 'Código Cuenta', key: 'AcctCodeDis', width: 15 },
            { header: 'Nombre Cuenta', key: 'AcctNameDis', width: 40 }
        ];

        // Insertar filas antes del encabezado
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        // Agregar contenido a las filas de cabecera
        worksheet.getCell('A1').value = `Reporte de estado de cuenta`;
        worksheet.getCell('A2').value = `Fechas: Desde ${fechaIni} Hasta ${fechaFin}`;
        worksheet.getCell('A3').value = `Fecha de Impresión: ${date}`;
        // Fusionar celdas para que el texto se centre sobre varias columnas
        worksheet.mergeCells('A1:Q1');
        worksheet.mergeCells('A2:S2');
        worksheet.mergeCells('A3:S3');

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
        };

        ['A2', 'A3'].forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.font = { bold: true, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'start' };
        });

        const rowRefs = data.map(row =>
            worksheet.addRow(
                displayedColumns.reduce((acc, column) => ({
                    ...acc,
                    [column]: row[column] ?
                        (column.includes('Date') ? new Date(row[column]) : (column.includes('Total') || column.includes('Pend') || column.includes('Num')) ? parseFloat(row[column]) : row[column])
                        : ''
                }), {})
            )
        );

        // Apply formatting per row
        rowRefs.forEach(row => {
            row.getCell('DocTotalInv').numFmt = '"Bs"#,##0.00';
            row.getCell('DocTotalCob').numFmt = '"Bs"#,##0.00';
            row.getCell('DisTotal').numFmt = '"Bs"#,##0.00';
            row.getCell('DisPending').numFmt = '"Bs"#,##0.00';

            row.eachCell(cell => {
                cell.border = {
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        function mergeSameValues(startRowIndex, columnKeys) {
            const ends = []
            let i = 0;
            while (i < data.length) {
                let j = i + 1;
                while (
                    j < data.length &&
                    columnKeys.every(key => data[i][key] === data[j][key])
                ) {
                    j++;
                }

                if (j - i > 1) {
                    const start = startRowIndex + i;
                    const end = startRowIndex + j - 1;
                    columnKeys.forEach(key => {
                        const col = worksheet.getColumn(key);
                        const cellIndex = col.number;
                        worksheet.mergeCells(start, cellIndex, end, cellIndex);
                        worksheet.getCell(start, cellIndex).alignment = {
                            vertical: 'middle',
                            horizontal: 'center'
                        };
                        // worksheet.getCell(end, cellIndex).border = 

                    });
                    ends.push(end);
                } else {
                    const end = startRowIndex + j - 1
                    ends.push(end);
                }
                i = j;
            }
            return ends;
        }
        const ends = mergeSameValues(6, ['CardName', 'SucName', 'DocNumInv', 'NumAtCard', 'DocTotalInv']);
        console.log({ ends })

        worksheet.getRow(5).eachCell(cell => {
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

        ends.forEach(end => {
            worksheet.getRow(end).eachCell(cell => {
                cell.border = {
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                }
            })
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_cuenta.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error({ error });
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(user.USERCODE, user.USERNAME, `Cobranzas Reporte de estado de cuenta`, `Error generando el Excel del reporte cuenta ${error}`,
            'catch de excelReporte', 'cobranza/excel-reporte', process.env.PRD
        );
        return res.status(500).json({ mensaje: `Error generando el Excel del reporte cuenta ${error}` });
    }
};

const cobranzasSupervisorController = async (req, res) => {
    try {
        // const user = req.usuarioAutorizado
        // const userIdSap = user.ID_VENDEDOR_SAP || 0
        // const { isMesAnterior } = req.body
        // const dateNow = new Date();
        // const dateMesAnterior = new Date(dateNow);
        // dateMesAnterior.setMonth(dateMesAnterior.getMonth() - 1);
        // let response = []
        // let response1
        // if (isMesAnterior == true || isMesAnterior == 'true') {
        //     console.log('is mes anterior')
        //     response1 = await cobranzaPorZonaSupervisor(dateMesAnterior.getFullYear(), dateMesAnterior.getMonth() + 1, userIdSap)
        // } else {
        //     console.log('is mes actual')
        //     response1 = await cobranzaPorZonaSupervisor(dateNow.getFullYear(), dateNow.getMonth() + 1, userIdSap)
        // }
        // response = [...response, ...response1]
        // response = response.map((item)=>{
        //     return {
        //         ...item,
        //         SlpCode:item.SalesPersonCode,
        //         SlpName:item.SalesPerson
        //     }
        // })
        // let SucCode = ''
        // let totalQuotaBySuc = {};
        // let totalCollectionBySuc = {};

        // const results = []
        // response.forEach((r, index) => {
        //     if (r.SucCode == SucCode) {
        //         const res1 = r
        //         res1.cumplimiento = +r.cumplimiento
        //         res1.hide = true
        //         results.push(res1)

        //         totalQuotaBySuc[r.SucCode] += +r.Quota;
        //         totalCollectionBySuc[r.SucCode] += +r.Collection;
        //         if ((response.length - 1) == index) {
        //             const res = {
        //                 SucName: `Total ${r.SucName}`,
        //                 Quota: +totalQuotaBySuc[r.SucCode],
        //                 Collection: +totalCollectionBySuc[r.SucCode],
        //                 cumplimiento: (+totalCollectionBySuc[r.SucCode] / +totalQuotaBySuc[r.SucCode]) * 100,
        //                 isSubtotal: true,
        //                 hide: false
        //             }
        //             results.push(res)
        //         }
        //     } else {
        //         SucCode = r.SucCode;
        //         totalQuotaBySuc[r.SucCode] = +r.Quota;
        //         totalCollectionBySuc[r.SucCode] = +r.Collection;

        //         if (index > 0) {
        //             const res = {
        //                 SucName: `Total ${response[index - 1].SucName}`,
        //                 Quota: +totalQuotaBySuc[response[index - 1].SucCode],
        //                 Collection: +totalCollectionBySuc[response[index - 1].SucCode],
        //                 cumplimiento: (+totalCollectionBySuc[response[index - 1].SucCode] / +totalQuotaBySuc[response[index - 1].SucCode]) * 100,
        //                 isSubtotal: true,
        //                 hide: false
        //             }
        //             results.push(res)
        //         }
        //         const res1 = r
        //         res1.cumplimiento = +r.cumplimiento
        //         res1.hide = false
        //         results.push(res1)

        //         if ((response.length - 1) == index) {
        //             const res = {
        //                 SucName: `Total ${r.SucName}`,
        //                 Quota: +totalQuotaBySuc[r.SucCode],
        //                 Collection: +totalCollectionBySuc[r.SucCode],
        //                 cumplimiento: (+totalCollectionBySuc[r.SucCode] / +totalQuotaBySuc[r.SucCode]) * 100,
        //                 isSubtotal: true,
        //                 hide: false
        //             }
        //             results.push(res)
        //         }
        //     }
        // });
        // return res.json(results)
        //?------------------------------
        const user = req.usuarioAutorizado;
        const userIdSap = user.ID_VENDEDOR_SAP || 0;
        const { isMesAnterior } = req.body;

        const date = new Date();
        if (isMesAnterior === true || isMesAnterior === 'true') {
            date.setMonth(date.getMonth() - 1);
        }

        const response = await cobranzaPorZonaSupervisor(date.getFullYear(), date.getMonth() + 1, userIdSap);

        const groupedBySucursal = response.reduce((acc, item) => {
            const sucCode = item.SucCode;
            if (!acc[sucCode]) {
                acc[sucCode] = [];
            }
            acc[sucCode].push(item);
            return acc;
        }, {});

        const finalResults = [];
        for (const sucCode in groupedBySucursal) {

            const recordsInSucursal = groupedBySucursal[sucCode];

            const groupedBySalesperson = recordsInSucursal.reduce((acc, record) => {
                const spCode = record.SalesPersonCode;
                if (!acc[spCode]) {
                    acc[spCode] = {
                        ...record,
                        Quota: 0,
                        Collection: 0,
                        SlpCode: record.SalesPersonCode,
                        SlpName: record.SalesPerson,
                        detail: []
                    };
                }
                acc[spCode].Quota += parseFloat(record.Quota);
                acc[spCode].Collection += parseFloat(record.Collection);
                acc[spCode].detail.push(record);
                return acc;
            }, {});

            const salespersonGroups = Object.values(groupedBySalesperson);
            newRowspan = salespersonGroups.length;

            const salespersonDetails = salespersonGroups.map((sp, index) => {
                return {
                    ...sp,
                    cumplimiento: sp.Quota > 0 ? (sp.Collection / sp.Quota) * 100 : 0,
                    hide: index !== 0,
                    rowspan: newRowspan
                };
            });

            finalResults.push(...salespersonDetails);

            const totalSucursalQuota = salespersonDetails.reduce((sum, sp) => sum + sp.Quota, 0);
            const totalSucursalCollection = salespersonDetails.reduce((sum, sp) => sum + sp.Collection, 0);

            finalResults.push({
                SucName: `Total ${recordsInSucursal[0].SucName}`,
                Quota: totalSucursalQuota,
                Collection: totalSucursalCollection,
                cumplimiento: totalSucursalQuota > 0 ? (totalSucursalCollection / totalSucursalQuota) * 100 : 0,
                isSubtotal: true,
                hide: false
            });
        }

        return res.json(finalResults);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador cobranzasSupervisorController: ${error.message || ''}` })
    }
}

const cobranzasPorZonasNoUserController = async (req = request, res = response) => {
    const { sucursal, isAnt } = req.body;
    try {
        const response = await cobranzaPorZonaNoUser(sucursal, isAnt);
        console.log({ response })

        return res.status(200).json({
            response,
            mensaje: "Todas las zonas del usuario"
        });
    } catch (err) {
        console.log('error en ventasInstitucionesController')
        console.log({ err })
        return res.status(500).json({ mensaje: `${err.message || 'Error en cobranzasPorZonasController'}` })
    }
}


const cobranzaDocNumPorDocEntryController = async (req = request, res = response) => {
    const { docEntry } = req.query;
    try {
        const response = await getCobranzaDocNumPorDocEntry(docEntry);
        console.log({ response })

        return res.status(200).json({
            DocNum: response[0].DocNum,
            mensaje: "Documento de cobranza por DocEntry"
        });
    } catch (err) {
        console.log('error en cobranzaDocNumPorDocEntryController')
        console.log({ err })
        return res.status(500).json({ mensaje: `${err.message || 'Error en cobranzaDocNumPorDocEntryController'}` })
    }
}

const saldoDeudorGeneralExcel = async (req = request, res = response) => {
    let sucursales = req.body;
    console.log("Longitud Sucursales del Usuario:", sucursales.length);

    const datosMaestros = await getSucursales();
    console.log("Longitud Sucursales del Sistema:", datosMaestros.data.length);

    if (datosMaestros.data.length === sucursales.length) {
        sucursales = null;
    }

    console.log(sucursales);

    try {
        return res.status(200).json({
            mensaje: "Datos recuperados con exito",
            data: sucursales
        })
    } catch (error) {
        console.log('error en saldoDeudorGeneralExcel')
        console.log({ err })
        return res.status(500).json({ mensaje: `${err.message || 'Error en saldoDeudorGeneralExcel'}` })
    }
}

module.exports = {
    cobranzaGeneralController,
    cobranzaPorSucursalController,
    cobranzaNormalesController,
    cobranzaCadenaController,
    cobranzaIfavetController,
    cobranzaPorSucursalMesAnteriorController,
    cobranzaNormalesMesAnteriorController,
    cobranzaCadenaMesAnteriorController,
    cobranzaIfavetMesAnteriorController,
    cobranzaMasivosController,
    cobranzaInstitucionesController,
    cobranzaMasivosMesAnteriorController,
    cobranzaInstitucionesMesAnteriorController,
    cobranzaPorSupervisorController,
    cobranzasPorZonasController,
    cobranzaHistoricoNacionalController,
    cobranzaHistoricoNormalesController,
    cobranzaHistoricoCadenasController,
    cobranzaHistoricoIfavetController,
    cobranzaHistoricoInstitucionesController,
    cobranzaHistoricoMasivosController,
    cobranzasPorZonasMesAntController,
    cobranzaClientePorVendedorController,
    cobranzaFacturaPorClienteController,
    clientesInstitucionesSaldoDeudorController,
    saldoDeudorInstitucionesController,
    realizarCobroController,
    comprobanteController,
    comprobantePDFController,
    resumenCobranzasController,
    cobrosRealizadosController,
    clientesPorSucursalController,
    cobranzaFacturaPorCliDespController,
    cobranzaClientePorVendedorIDController,
    clientesPorDespachadorController,
    cobranzaFacturaPorClienteDespachadorController,
    detalleFacturaController,
    cobranzaPorSucursalesYTiposController,
    cobranzaPorSucursalYTiposController,
    getCobradoresController,
    saldoDeudorIfavetController,
    getVendedoresBySucursalesController,
    getAllSublinesController,
    getAllLinesController,
    getCobradoresBySucursalController,
    getYearToDayController, getCuentasBancoParaBajaCobranzaController,
    getYtdCobradoresController, getPendientesBajaPorCobradorController,
    darDeBajaController, getCuentasParaBajaController, comprobanteContableController,
    darVariasDeBajaController,
    getBajasByUserController,
    anularBajaController, reporteBajaCobranzasController,
    getCobradoresBySucursalesController,
    getClienteByIdController,
    getComprobantesBajasController,
    getClientesController,
    getEstadoCuentaClienteController,
    getEstadoCuentaClientePDFController,
    auditoriaSaldoDeudorController,
    getBajasFacturasController, findClienteController,
    excelReporte, cobranzasSupervisorController, cobranzasPorZonasNoUserController,
    cobranzaDocNumPorDocEntryController,
    realizarCobroMultiController,
    saldoDeudorGeneralExcel,
    getSaldoDeudorClientePDF
}