const { request, response } = require("express")
const { cobranzaGeneral, cobranzaPorSucursal, cobranzaNormales, cobranzaCadenas, cobranzaIfavet, cobranzaPorSucursalMesAnterior, cobranzaNormalesMesAnterior, cobranzaCadenasMesAnterior, cobranzaIfavetMesAnterior, cobranzaMasivo, cobranzaInstituciones, cobranzaMasivoMesAnterior, cobranzaPorSupervisor, cobranzaPorZona, cobranzaHistoricoNacional, cobranzaHistoricoNormales, cobranzaHistoricoCadenas, cobranzaHistoricoIfaVet, cobranzaHistoricoInstituciones, cobranzaHistoricoMasivos, cobranzaPorZonaMesAnt, cobranzaSaldoDeudor, clientePorVendedor, clientesInstitucionesSaldoDeudor, saldoDeudorInstituciones } = require("./hana.controller")
const { postIncommingPayments } = require("./sld.controller")

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
            mensaje: 'problemas en cobranzaIfavetMesAnteriorController',
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
            mensaje: 'problemas en cobranzaIfavetMesAnteriorController',
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

        if (!PaymentInvoices) return res.status(400).json({ mensaje: 'el PaymentInvoices es obligatorio' })

        PaymentInvoices.map((item) => {
            const sum = item.SumApplied
            total += +sum
        })

        if (TransferAccount || TransferAccount != null) {
            if (TransferSum !== total) return res.status(400).json({ mensaje: 'el total es diferente al TransferSum' })
        }

        if (CashAccount || CashAccount != null) {
            if (CashSum !== total) return res.status(400).json({ mensaje: 'el total es diferente al CashSum' })
        }

        const responseSap = await postIncommingPayments(body)
        if (responseSap.status !== 200) {
            if(responseSap.errorMessage && responseSap.errorMessage.value){
                return res.status(400).json({ mensaje: `Error del SAP: ${responseSap.errorMessage.value}`, })
            }else{
                return res.status(400).json({ mensaje: `Error del SAP`, })  
            } 
        }
        return res.json({ responseSap })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const comprobanteController =async(req,res)=>{
    try {
        
    } catch (error) {
        console.log({error})
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
}