const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const { request, response } = require("express")
const { cobranzaGeneral, cobranzaPorSucursal, cobranzaNormales, cobranzaCadenas, cobranzaIfavet, cobranzaPorSucursalMesAnterior, cobranzaNormalesMesAnterior, cobranzaCadenasMesAnterior, cobranzaIfavetMesAnterior, cobranzaMasivo, cobranzaInstituciones, cobranzaMasivoMesAnterior, cobranzaPorSupervisor, cobranzaPorZona, cobranzaHistoricoNacional, cobranzaHistoricoNormales, cobranzaHistoricoCadenas, cobranzaHistoricoIfaVet, cobranzaHistoricoInstituciones, cobranzaHistoricoMasivos, cobranzaPorZonaMesAnt, cobranzaSaldoDeudor, clientePorVendedor, clientesInstitucionesSaldoDeudor, saldoDeudorInstituciones, cobroLayout, resumenCobranzaLayout, cobrosRealizados, clientesPorVendedor, clientesPorSucursal, clientePorVendedorId, cobranzaSaldoDeudorDespachador } = require("./hana.controller")
const { postIncommingPayments } = require("./sld.controller");
const { syncBuiltinESMExports } = require('module');
const { grabarLog } = require("../../shared/controller/hana.controller");

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
        if (!username && typeof username != "string")
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        const response = await cobranzaPorZona(username);
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
        // const response = await cobranzaPorSucursal()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaPorSucursal()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        // const response = await cobranzaNormales()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaNormales()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        // const response = await cobranzaNormales()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaCadenas()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        // const response = await cobranzaNormales()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaIfavet()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        // const response = await cobranzaPorSucursal()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaPorSucursalMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        // const response = await cobranzaNormales()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaNormalesMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        // const response = await cobranzaNormales()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaCadenasMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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

        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaIfavetMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaMasivo()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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

        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaInstituciones()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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

        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaMasivoMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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

        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await cobranzaMasivoMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        // console.log({nombre})
        if (!id) return res.status(400).json({ mensaje: 'no hay el id del vendedor' })
        // return res.json({nombre})
        const response = await clientePorVendedorId(id)
        return res.json({ response })

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

const cobranzaFacturaPorCliDespController = async (req, res) => {
    try {
        const codigo = req.query.codigo
        if (!codigo) return res.status(400).json({ mensaje: 'no hay el codigo del cliente' })
        const usuario= req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        const response = await cobranzaSaldoDeudorDespachador(codigo)

        if(response.statusCode !=200){
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Despachador Facturas del cliente", `${response.message||'Error en cobranzaSaldoDeudorDespachador'}`, `IFA_LAPP_COB_SALDO_DEUDOR_POR_CLIENTE`, "cobranza/facturas-cliente-desp", process.env.PRD)
            return res.status(400).json({ mensaje: `${response.message||'Error en cobranzaSaldoDeudorDespachador'}` })
        }
        return res.json({ response: response.data })

    } catch (error) {
        console.log({ error })
        const usuario= req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Despachador Facturas del cliente", `Error en controller cobranzaFacturaPorCliDespController${error.message||''}`, `IFA_LAPP_COB_SALDO_DEUDOR_POR_CLIENTE`, "cobranza/facturas-cliente-desp", process.env.PRD)

        return res.status(500).json({ mensaje: `Error en controller cobranzaFacturaPorCliDespController${error.message||''}` })
    }
}

const clientesInstitucionesSaldoDeudorController = async (req, res) => {
    try {
        const response = await clientesInstitucionesSaldoDeudor()
        return res.json({ response })
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
        const CashSum = body.CashSum
        const CashAccount = body.CashAccount
        const TransferSum = body.TransferSum
        const TransferAccount = body.TransferAccount
        const PaymentInvoices = body.PaymentInvoices
        let total = 0
        const usuario= req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({usuario})
        if (!PaymentInvoices) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", 'Error: el PaymentInvoices es obligatorio', `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)
            return res.status(400).json({ mensaje: 'el PaymentInvoices es obligatorio' })
        }

        PaymentInvoices.map((item) => {
            const sum = item.SumApplied
            total += +sum
        })

        if (TransferAccount || TransferAccount != null) {
            if (TransferSum !== total) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", 'Error: el total es diferente al TransferSum', `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)

                return res.status(400).json({ mensaje: 'el total es diferente al TransferSum' })
            }
        }

        if (CashAccount || CashAccount != null) {
            if (CashSum !== total) {
                grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", "Error: el total es diferente al CashSum", `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)

                return res.status(400).json({ mensaje: 'el total es diferente al CashSum' })
            }
        }

        const responseSap = await postIncommingPayments(body)
        if (responseSap.status !== 200) {
            let mensaje= `Error del SAP`
            if (responseSap.errorMessage && responseSap.errorMessage.value) {
                mensaje= `Error del SAP ${responseSap.errorMessage.value || ''}`
            }
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", mensaje, `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)
            return res.status(400).json({ mensaje })
        }

        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", "Cobranza realizada con exito", `https://172.16.11.25:50000/b1s/v1/IncomingPayments`, "cobranza/realizar-cobro", process.env.PRD)
        return res.json({ ...responseSap })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({usuario})
        let mensaje = `Error en el controlador realizarCobroController ${error.message||''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Saldo deudor", mensaje, ``, "cobranza/realizar-cobro", process.env.PRD)

        return res.status(500).json({ mensaje })
    }
}

const comprobanteController = async (req, res) => {
    try {
        const id = req.query.id
        const response = await cobroLayout(id)        
        console.log({response})
        // return res.json({response})
        const Facturas = [];
        const cabezera = [];
        for (const line of response) {
            const { DocNumInvoice, DocDateInvoice, NumAtCard, PymntGroup, SumAppliedCob, ...result } = line
            if (!cabezera.length) {
                cabezera.push({ ...result })
            }
            Facturas.push({
                DocNumInvoice, DocDateInvoice, NumAtCard, PymntGroup, SumAppliedCob
            })
        }
        const comprobante = {
            ...cabezera[0],
            Facturas
        }
        
        //TODO TXT
        const formattedDate = formatDate(comprobante.DocDatePayments);
        const cardName = comprobante.CardName.replace(/["\s]+/g, '');// Eliminar espacios del nombre y la doble comilla
        const fileName = `${cardName}_${formattedDate}.txt`;
        const finalDate = formattedDate.split(' ')

        let cpclContent = `LABORATORIOS IFA S.A.
-----------------------------------------
Comprobante: #${comprobante.DocNumPayments}
Fecha: ${finalDate[0]}
Hora: ${comprobante.DocTime[0]}${comprobante.DocTime[1]}:${comprobante.DocTime[2]}${comprobante.DocTime[3]}
Codigo Cliente: ${comprobante.CardCode}
Cliente: ${comprobante.CardName}
            
Modalidad de Pago: ${comprobante.Modality.charAt(0).toUpperCase()+comprobante.Modality.slice(1)}
-----------------------------------------
Fecha        Numero           Total
-----------------------------------------
  
`;

        // Añadir las facturas
        let yPosition = 360;
        comprobante.Facturas.forEach((factura) => {
            const { DocNumInvoice, DocDateInvoice, NumAtCard, SumAppliedCob } = factura;
            const formattedInvoiceDate = formattedDataInvoice(DocDateInvoice); // Asegúrate de que la función formatee bien las fechas
            cpclContent += `${formattedInvoiceDate}   ${NumAtCard.padEnd(6)}   ---->   bs ${parseFloat(SumAppliedCob).toFixed(2)}\n`;
            yPosition += 30;
        });

        // Línea divisoria y total
        cpclContent += `
-----------------------------------------
TOTAL:                      bs ${parseFloat(comprobante.DocTotal).toFixed(2)}
Glosa: ${comprobante.JrnlMemo||''}
-----------------------------------------
                        
                                
     Firma                 Sello
                            
---------------       ---------------
                                
                    
`; //ClpName

        const filePath = path.join(__dirname, 'comprobantes', fileName);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, cpclContent);

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const ress= res.sendFile(filePath)
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
    const data = invoiceData.split(' ')
    return data[0]
}

const comprobantePDFController = async (req, res) => {
    try {
        const id = req.query.id
        const response = await cobroLayout(id)
        console.log({response})
        // return res.json({response})
        const Facturas = [];
        const cabezera = [];
        for (const line of response) {
            const { DocNumInvoice, DocDateInvoice, NumAtCard, PymntGroup, SumAppliedCob, Modality, TotalDue, Balance, ...result } = line
            if (!cabezera.length) {
                cabezera.push({ ...result, Modality: Modality.charAt(0).toUpperCase()+Modality.slice(1), Balance: parseFloat(Balance).toFixed(2) })
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

        // Generar el PDF con Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(htmlContent, { waitUntil: 'load' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });
        // fs.writeFileSync('debug.pdf', pdfBuffer);
        await browser.close();

        // Guardar para depuración
        // const fs = require('fs');
        console.log('PDF Buffer Size:', pdfBuffer.length);
        // fs.writeFileSync('debug.pdf', pdfBuffer); // Original
        // fs.writeFileSync('sent_to_client.pdf', pdfBuffer); // Enviado

        // Configurar encabezados y enviar
        const fileName = `${comprobante.CardName}_${new Date()}.pdf`.replace(' ','').trim()
        // return res.json({fileName})
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
        const mes = Number(fecha[4]+fecha[5])-1
        console.log({mes})
        const fechaFormated = fecha[6]+fecha[7]+' de '+getMounth(mes)+' de '+fecha[0]+fecha[1]+fecha[2]+fecha[3]
        console.log({fechaFormated})
        
        const response = await resumenCobranzaLayout(id_vendedor, fecha)       
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
 
        if(response.message){
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Cierre Dia", `${response.message||'Error en resumenCobranzaLayout'}`, `IFA_LAPP_VEN_CIERRE_DIA_LAYOUT`, "cobranza/resumen", process.env.PRD)
            return res.status(400).json({mensaje: `${response.message||'Error en resumenCobranzaLayout'}`})
        }
        
        console.log(Intl.NumberFormat('de-DE').format(79000.50))
        // return res.json({response})
        let cpclContent=''
        if(response.length!=0){
        const Recibos = [];
        const Efectivo = [];
        const recibosEfec= [];
        const Transferencia = [];
        const recibosTrans= [];
        const Cheque = [];
        const recibosCheque =[];
        const cabezera = [];
        for (const line of response) {
            const { ClpCode, ClpName, Modality, TotalDay, Date, ...result } = line
            if (!cabezera.length) {
                cabezera.push({ ClpCode, ClpName, Date })
            }
            if(Modality=='efectivo'){
                if(!Efectivo.length){
                    Efectivo.push({Modality, TotalDay})
                }
                recibosEfec.push({...result})
            }else if(Modality=='transferencia'){
                if(!Transferencia.length){
                    Transferencia.push({Modality, TotalDay})
                }
                recibosTrans.push({...result})
            }else{
                if(!Cheque.length){
                    Cheque.push({Modality, TotalDay})
                }
                recibosCheque.push({...result})
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
        Recibos.push({...Efectivo[0]}); Recibos.push({...Transferencia[0]}); Recibos.push({...Cheque[0]}); 
        const comprobante = {
            ...cabezera[0],
            Recibos
        }
        // return res.json({comprobante})
        console.log(comprobante.Date)
        
        const fechaObj = new Date(comprobante.Date);

        // Usar Intl.DateTimeFormat para formatear la fecha en español
        const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
        const formatoFecha = new Intl.DateTimeFormat('es-ES', opciones).format(fechaObj);

        cpclContent = `
              LABORATORIOS IFA S.A.
                RESUMEN COBRANZAS
Fecha: ${formatoFecha}
`;

for(let i=0; i<comprobante.Recibos.length; i++){
    if(comprobante.Recibos[i].Recibos.length!=0){
    if(i==0){
        cpclContent += `------------------------------------------------
EFECTIVO`
    }else if(i==1){
        cpclContent += `------------------------------------------------
TRANSFERENCIAS`
    }else {
    cpclContent += `------------------------------------------------
CHEQUES`
    }

    comprobante.Recibos[i].Recibos.forEach((recibo) => {
        const { CardCode, CardName, DocTotal, NumAtCard } = recibo;
        cpclContent += `
    Cod: ${CardCode}                   ${Intl.NumberFormat('en-US').format(parseFloat(DocTotal).toFixed(2))} Bs.
    ${CardName}
    Nro: ${NumAtCard}
    --------------------------------------------`;
    });

cpclContent += `
                        TOTAL:     ${Intl.NumberFormat('en-US').format(parseFloat(comprobante.Recibos[i].TotalDay).toFixed(2))} Bs.
`;
    }
}
        }else{
            cpclContent = `
            LABORATORIOS IFA S.A.
              RESUMEN COBRANZAS
Fecha: ${fechaFormated}
No hay Cobros de Hoy
`
        }

        const fileName = `${id_vendedor}_cierre_${fecha}.txt`;
        const filePath = path.join(__dirname, 'resumen', fileName);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, cpclContent);

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const ress= res.sendFile(filePath)
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
        const mensaje= `Error en el resumenCobranzasController: ${error.message || ''}`
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Cierre Dia", mensaje , ``, "cobranza/resumen", process.env.PRD)
        return res.status(500).json({ mensaje })
    }
}

const cobrosRealizadosController = async (req, res) => {
    try {
        const id = req.query.idVendedor;
        console.log({id})
        const cobros = await cobrosRealizados(id)
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        if(cobros.statusCode!=200){
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cobranzas Cobros Realizados", `${cobros.message||'Error cobrosRealizados'}`, ``, "cobranza/cobros-realizados", process.env.PRD)
            return res.status(500).json({
                mensaje: `${cobros.message||'Error cobrosRealizados'}`
            })
        }
        console.log({cobros: cobros.data.length})
        let cobrosFinal = []
        let cobro
        let Detalle = []
        let currentDocNum = 0
        for(const factura of cobros.data){
            const {DocNumInvoice, DocDateInvoice,NumAtCard,SumAppliedCob, DocNumPayments, ...rest} = factura;
            if(DocNumPayments != currentDocNum){
                currentDocNum = DocNumPayments;
                Detalle = [{DocNumInvoice, DocDateInvoice,NumAtCard,SumAppliedCob}]
                cobro = {DocNumPayments, ...rest, Detalle }
                cobrosFinal.push(cobro)
            }else{
                Detalle.push({DocNumInvoice, DocDateInvoice,NumAtCard,SumAppliedCob})
                cobrosFinal.find((fila) => fila.DocNumPayments == DocNumPayments).Detalle = Detalle
            }
        }
        console.log({cobrosfinal: cobrosFinal.length})

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
        const {idSucursales} = req.body;
        console.log({idSucursales})
        const clientes =[]
        for(const id_suc of idSucursales){
            const clientessucursal = await clientesPorSucursal(id_suc)
            console.log({ clientessucursal })
            if(clientessucursal.statusCode != 200){
                return res.status(clientessucursal.statusCode).json({ mensaje: clientessucursal.message || 'Error en clientesPorSucursal' })
            }
            clientes.push(...clientessucursal.data)
        }
        
        return res.json({ response: clientes})
    } catch (error) {
        console.log({ error })
        const mensaje = error.message ||'Error en el controlador clientesPorVendedorController'
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
    cobranzaClientePorVendedorIDController
}