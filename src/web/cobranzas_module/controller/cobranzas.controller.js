const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const { request, response } = require("express")
const { cobranzaGeneral, cobranzaPorSucursal, cobranzaNormales, cobranzaCadenas, cobranzaIfavet, cobranzaPorSucursalMesAnterior, cobranzaNormalesMesAnterior, cobranzaCadenasMesAnterior, cobranzaIfavetMesAnterior, cobranzaMasivo, cobranzaInstituciones, cobranzaMasivoMesAnterior, cobranzaPorSupervisor, cobranzaPorZona, cobranzaHistoricoNacional, cobranzaHistoricoNormales, cobranzaHistoricoCadenas, cobranzaHistoricoIfaVet, cobranzaHistoricoInstituciones, cobranzaHistoricoMasivos, cobranzaPorZonaMesAnt, cobranzaSaldoDeudor, clientePorVendedor, clientesInstitucionesSaldoDeudor, saldoDeudorInstituciones, cobroLayout, resumenCobranzaLayout, cobrosRealizados, clientesPorVendedor, clientesPorSucursal, clientePorVendedorId, cobranzaSaldoDeudorDespachador, clientesPorDespachador, cobranzaSaldoAlContadoDeudor,
    detalleFactura, cobranzaNormalesPorSucursal, cobranzaPorSucursalYTipo, getVendedores,
    getCobradores, getCobradoresBySucursales,
    saldoDeudorIfavet,
    getAllSublines,
    getAllLines,
    getVendedoresBySuc,
    getYearToDayBySuc, getYearToDayByCobrador, getYTDCobrador, getPendientesBajaPorCobrador,
    cuentasParaBajaCobranza,cuentasBancoParaBajaCobranza, getBaja, getLayoutComprobanteContable,
    getBajasByUser, reporteBajaCobranzas,
    getClienteById
} = require("./hana.controller")
const { postIncommingPayments, cancelIncommingPayments } = require("./sld.controller");
const { syncBuiltinESMExports } = require('module');
const { grabarLog } = require("../../shared/controller/hana.controller");
const { aniadirDetalleVisita } = require('../../planificacion_module/controller/hana.controller');

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
        console.log({username})
        if (!username && typeof username != "string"){
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
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
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
        if (!username && typeof username != "string")
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        const response = await cobranzaPorZonaMesAnt(username);
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
        const body = req.body
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
            console.log({ sum })
            total += +sum
        })
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
FORM\r\n
PRINT\r\n
`;

        const filePath = path.join(__dirname, 'comprobantes', fileName);

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


        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();
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
                const { ClpCode, ClpName, Modality, TotalDay, Date, ...result } = line
                if (!cabezera.length) {
                    cabezera.push({ ClpCode, ClpName, Date })
                }
                if (Modality == 'efectivo') {
                    if (!Efectivo.length) {
                        Efectivo.push({ Modality, TotalDay })
                    }
                    recibosEfec.push({ ...result })
                } else if (Modality == 'transferencia') {
                    if (!Transferencia.length) {
                        Transferencia.push({ Modality, TotalDay })
                    }
                    recibosTrans.push({ ...result })
                } else {
                    if (!Cheque.length) {
                        Cheque.push({ Modality, TotalDay })
                    }
                    recibosCheque.push({ ...result })
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
            // return res.json({comprobante})
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
                        const { CardCode, CardName, DocTotal, NumAtCard } = recibo;
                        cpclContent += `
TEXT 7 0 60 ${yPosition + 50} Cod: ${CardCode}                 ${Intl.NumberFormat('en-US').format(parseFloat(DocTotal).toFixed(2))} Bs.\r\n
TEXT 7 0 60 ${yPosition + 70} ${CardName}\r\n
TEXT 7 0 60 ${yPosition + 90} Nros Fact: ${NumAtCard}\r\n
LINE 60 ${yPosition + 110} 570 ${yPosition + 110} 1\r\n`;
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
        const idSap = req.query.idSap
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
        console.log({ sucCodes })
        let listResponse = [];
        let totalCobranza = 0
        for (const sucCode of sucCodes) {
            const porTipo = []
            for (const tipo of tipos) {
                const cobranza = await cobranzaPorSucursalYTipo(sucCode, tipo)
                // console.log({ cobranza })
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
        console.log({ listResponse })
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
        const {sucCode, cobradorName, dim2, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2} = req.body
        console.log({body: req.body})
        let response
        if(sucCode)
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

const getYTDCobradorController = async (req, res) => {
    try {
        const {sucCode,fechaInicio1, fechaFin1} = req.body
        console.log({body: req.body})
        const response = await getYTDCobrador(sucCode,fechaInicio1, fechaFin1)

        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje = error.message || 'Error en el controlador getYTDCobradorController'
        return res.status(500).json({
            mensaje
        })
    }
}

const getPendientesBajaPorCobradorController = async (req, res) => {
    try {
        const {id} = req.query
        let cobranzas = await getPendientesBajaPorCobrador(id)
        cobranzas.map((item)=>{
            item.TotalPending = +((+item.TotalPending).toFixed(2))
            item.DocTotal = +((+item.DocTotal).toFixed(2))
            item.AppliedToDate = +((+item.AppliedToDate).toFixed(2))
        })
        return res.json(cobranzas)
    } catch (error) {
        console.log({ error })
        const mensaje =  `${error.message||'Error en el controlador getPendientesBajaPorCobradorController'}`
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
        const {body} = req.body
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const responsePostIncomming =await postIncommingPayments(body)
        if(responsePostIncomming.status==400){
            const mensaje=responsePostIncomming.errorMessage
            grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
                `${mensaje.value||mensaje||'Error de postIncommingPayments.'}`,
                'postIncommingPayments','cobranza/baja', process.env.DBSAPPRD)
            return res.status(400).json({mensaje: `${mensaje.value||mensaje||'Error de postIncommingPayments'}`, body})
        }
        console.log({responsePostIncomming})
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
            `Exito en la baja de cobranza`,
            'postIncommingPayments','cobranza/baja', process.env.DBSAPPRD)
        return res.json({docEntry: responsePostIncomming.orderNumber})
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const mensaje =  `Error en el controlador darDeBajaController: ${error.message||'No definido'}`
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
            mensaje, 'catch controller','cobranza/baja', process.env.DBSAPPRD)
        return res.status(500).json({
            mensaje
        })
    }
}

const darVariasDeBajaController = async (req, res) => {
    let responses=[]
    try {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const {body} = req.body
        for(const farmacia of body){
            const {CardCode, CardName, CounterReference, ...rest}=farmacia
            const responsePostIncomming =await postIncommingPayments({CounterReference, ...rest})
            console.log({responsePostIncomming})
            if(responsePostIncomming.status==400){
                const mensaje=responsePostIncomming.errorMessage
                grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
                    `${mensaje.value||mensaje||'Error de postIncommingPayments.'} Cliente del error: ${CardCode}- ${CardName}`,
                    'postIncommingPayments','cobranza/baja-varias', process.env.DBSAPPRD)
                return res.status(400).json(
                    {mensaje: `${mensaje.value||mensaje||'Error de postIncommingPayments.'} Cliente del error: ${CardCode}- ${CardName}`, 
                    farmacia, responses})
            }
            responses.push({CardCode, CardName, DocNum: CounterReference, DocEntry: responsePostIncomming.orderNumber})
        }
        
        console.log({responses})
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
            `Exito en las bajas`,
            'postIncommingPayments','cobranza/baja-varias', process.env.DBSAPPRD)
        return res.json({responses})
    } catch (error) {
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ error })
        const mensaje =  `Error en el controlador darVariasDeBajaController: ${error.message||'No definido'}`
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
            mensaje, 'catch del controller','cobranza/baja-varias', process.env.DBSAPPRD)
        return res.status(500).json({
            mensaje, responses
        })
    }
}

const comprobanteContableController = async (req, res) => {
    try {
        const {id} = req.query
        const baja =await getBaja(id)
        console.log({baja})
        if(baja.length==0){
            return res.status(400).json({mensaje: `No se encontro una baja con DocEntry: ${id}`})
        }
        const {TransId} = baja[0]
        const {ClpCode, ClpName} = baja[0]

        const layout = await getLayoutComprobanteContable(TransId)
        // return res.json({layout})
        if(layout.length==0){
            return res.status(400).json({mensaje: `No se encontro datos para TransId: ${TransId}, DocEntry: ${id} en el procedure ACB_INV_LayOutCoomprobanteContablePR`})
        }

        let cabecera = []
        let detalle=[]
        let sumDebit=0; let sumSYSDeb=0; let sumCredit=0; let sumSYSCred=0
        // console.log(layout);
        layout.forEach((line)=>{
            const {TransId,
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
                    ...rest} = line
            const fechaTax= formattedDataInvoice(TaxDate)
            sumDebit += +Debit
            sumSYSDeb += +SYSDeb
            sumCredit += +Credit
            sumSYSCred += +SYSCred

            if(cabecera.length==0){
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
                    Ref3Line
                })
            }
            detalle.push({
                Debit: (+Debit).toFixed(2),
                Credit: (+Credit).toFixed(2),
                SYSDeb: (+SYSDeb).toFixed(2),
                SYSCred: (+SYSCred).toFixed(2),
                ...rest})
        })
        cabecera[0].sumDebit= (+sumDebit).toFixed(2)
        cabecera[0].sumSYSDeb=(+sumSYSDeb).toFixed(2)
        cabecera[0].sumCredit=(+sumCredit).toFixed(2)
        cabecera[0].sumSYSCred=(+sumSYSCred).toFixed(2)

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


        const browser = await puppeteer.launch();
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

        return res.end(pdfBuffer);

    } catch (error) {
        console.log({ error })
        const mensaje =  `${error.message||'Error en el controlador comprobanteContableController'}`
        return res.status(500).json({
            mensaje
        })
    }
}


const getBajasByUserController = async (req, res) => {
    try {
        const {id_sap} = req.query
        const response =await getBajasByUser(id_sap)

        console.log({response})
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const mensaje =  `${error.message||'Error en el controlador getBajasByUserController'}`
        return res.status(500).json({
            mensaje
        })
    }
}

const anularBajaController = async (req, res) => {
    try {
        const {id} = req.query
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response =await cancelIncommingPayments(id)
        if(response.status==400){
            grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
                `${response.errorMessage || 'Error de cancelIncommingPayments id: '+id}`,
                'cancelIncommingPayments','cobranza/anular-baja', process.env.DBSAPPRD)
            return res.status(400).json({mensaje: response.errorMessage || 'Error de cancelIncommingPayments.'})
        }
        console.log({response})
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
            `Exito en la anulacion de baja: ${id}`,
            'cancelIncommingPayments','cobranza/anular-baja', process.env.DBSAPPRD)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const mensaje =  `Error en el controlador anularBajaController: ${error.message||'No definido'}`
        grabarLog(user.USERCODE, user.USERNAME, 'Cobranzas Bajas', 
            mensaje, 'catch controller','cobranza/anular-baja', process.env.DBSAPPRD)
        return res.status(500).json({
            mensaje
        })
    }
}

const reporteBajaCobranzasController = async (req, res) => {
    try {
        const {UserSign, month, year} = req.body
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
        const {id} = req.query
        let response = await getClienteById(id)
        if(response.length>0){
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
    getYearToDayController,getCuentasBancoParaBajaCobranzaController,
    getYTDCobradorController, getPendientesBajaPorCobradorController,
    darDeBajaController, getCuentasParaBajaController, comprobanteContableController,
    darVariasDeBajaController,
    getBajasByUserController,
    anularBajaController, reporteBajaCobranzasController,
    getCobradoresBySucursalesController,
    getClienteByIdController
}