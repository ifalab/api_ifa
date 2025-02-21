const { request, response } = require("express")
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
    obtenerOfertasPorSucursal
} = require("./hana.controller")
const { facturacionPedido } = require("../service/api_nest.service")
const { grabarLog } = require("../../shared/controller/hana.controller");
const { postInventoryTransferRequests } = require("./sld.controller");



const ventasPorSucursalController = async (req, res) => {
    try {
        const response = await ventaPorSucursal()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasNormales()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasCadena()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasInstitucion()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasIfaVet()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasMasivo()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        const response = await ventasUsuario(
            userCode,
            dim1,
            dim2,
            dim3,
            groupBy,
        )
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
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud' })
    }
}

const ventasPorSucursalControllerMesAnterior = async (req, res) => {
    try {
        const response = await ventaPorSucursalMesAnterior()
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasNormalesMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasCadenaMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasInstitucionMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasIfaVetMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        let totalPresupuesto = 0, totalDocTotal = 0, totalCump = 0
        const response = await ventasMasivoMesAnterior()
        response.map((item) => {
            totalPresupuesto += +item.Ppto
            totalDocTotal += +item.DocTotal
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
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud', error })
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
        const response = await ventasPorZonasVendedorMesAnt(username, line, groupBy);

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
        const usuario = req.usuarioAutorizado
        const asistencias = await getAsistenciasVendedor(id_vendedor_sap)
        console.log(asistencias.response)
        if (asistencias.response.lang) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta get asistencias vendedor", `${asistencias.response.value || 'Error en getAsistenciasVendedor'}`, asistencias.query, "venta/asistencias-vendedor", process.env.PRD)
            return res.status(400).json({ mensaje: asistencias.response.value })
        }
        // console.log(asistencias.query)
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta get asistencias vendedor", "Datos obtenidos con exito", asistencias.query, "venta/asistencias-vendedor", process.env.PRD)

        return res.json({ asistencias: asistencias.response })
    } catch (error) {
        console.log({ error })
        const usuario = req.usuarioAutorizado
        let mensaje = error.message || 'error en el controlador:getAsistenciasVendedorController'
        const query = error.query || "No disponible"
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Venta get asistencias vendedor", mensaje, query, "venta/asistencias-vendedor", process.env.PRD)
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
        return res.status(500).json({ mensaje: 'error en descripcionArticuloController' })
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

const unidadMedidaController = async (req, res) => {
    try {
        const itemCode = req.query.itemCode
        const response = await unidadMedida(itemCode)
        console.log({ response })
        if (response.length == 0) return res.status(404).json({ mensaje: 'La unidad de medida no fue encontrado' })
        return res.json({ SalUnitMsr: response[0].SalUnitMsr })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en descripcionArticuloController' })
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
        const clientes = await clientesInstituciones()
        return res.json(clientes)
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
    try{
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
    try{
        const {sucCode} = req.query
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
    try{
        const {baseEntry} = req.body
        console.log({body: req.body})
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
    obtenerOfertasPorSucursalController
};
