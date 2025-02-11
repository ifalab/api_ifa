const sapService = require("../services/sap.service")
const { findAllAperturaCaja, findCajasEmpleado, rendicionDetallada, rendicionByTransac, crearRendicion, crearGasto, actualizarGastos, cambiarEstadoRendicion, verRendicionesEnRevision, employedByCardCode, actualizarEstadoComentario, actualizarEstadoRendicion, eliminarGastoID } = require("./hana.controller")

const findAllAperturaController = async (req, res) => {
    try {
        const listApertura = await findAllAperturaCaja()
        return res.status(200).json({ listApertura })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador que trae las aperturas de caja' })
    }
}

const findAllCajasEmpleadoController = async (req, res) => {
    try {
        const codEmp = req.params.codEmp
        const listCajas = await findCajasEmpleado(codEmp)
        return res.status(200).json({ listCajas })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador que trae las aperturas de caja' })
    }
}

const rendicionDetalladaController = async (req, res) => {
    try {
        const id = req.params.id
        const listaDetalles = []
        const response = await rendicionDetallada(id)
        if (response.length == 0) return res.status(400).json({ mensaje: 'no hay detalle de la rendicion' })


        response.map((item) => {
            const {
                ID,
                TRANSACTIONID,
                CODEMP,
                ESTADO,
                YEAR_RENDICION,
                MONTH_RENDICION,
                GASTO,
                IMPORTETOTAL,
                ICE,
                IEHD,
                IPJ,
                TASAS,
                OTRONOSUJETOCF,
                EXENTOS,
                TASACERO,
                DESCUENTO,
                GIFCARD,
                // COMENTARIO,
                ...rest
            } = item
            const data = {
                ...rest,
                GASTO: GASTO,
                IMPORTETOTAL: +IMPORTETOTAL,
                ICE: +ICE,
                IEHD: +IEHD,
                IPJ: +IPJ,
                TASAS: +TASAS,
                OTRONOSUJETOCF: +OTRONOSUJETOCF,
                EXENTOS: +EXENTOS,
                TASACERO: +TASACERO,
                DESCUENTO: +DESCUENTO,
                GIFCARD: +GIFCARD,
                // COMENTARIO:COMENTARIO
            }
            listaDetalles.push(data)
        })

        const {
            ID,
            TRANSACTIONID,
            CODEMP,
            ESTADO,
            YEAR_RENDICION,
            MONTH_RENDICION,
        } = response[0]
        const dataFinal = {
            ID,
            TRANSACTIONID,
            CODEMP,
            ESTADO,
            YEAR_RENDICION,
            MONTH_RENDICION,
            listaDetalles
        }
        return res.json({ ...dataFinal })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const rendicionByTransacController = async (req, res) => {
    try {
        const transacId = req.params.transacId
        const listaRendiciones = await rendicionByTransac(transacId)
        if (listaRendiciones.length == 0) return res.status(400).json({ mensaje: 'no hay rendiciones' })
        return res.json({ listaRendiciones })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

const crearRendicionController = async (req, res) => {
    try {
        const {
            codEmp,
            transacId,
            estado,
            listaGastos
        } = req.body
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const response = await crearRendicion(transacId, codEmp, estado, month, year)
        if (!response[0].ID) return res.status(404).json({ mensaje: 'error al crear la rendicion' })
        const idRendicion = response[0].ID

        let gastos = []
        let result = []
        listaGastos.map((item) => {
            const newData = {
                ...item,
                idRendicion,
                month,
                year
            }
            gastos.push(newData)
        })

        await Promise.all(gastos.map(async (item) => {
            const {
                new_nit,
                new_tipo,
                new_gasto,
                new_nroFactura,
                new_codAut,
                new_fecha,
                new_nombreRazon,
                new_glosa,
                new_importeTotal,
                new_ice,
                new_iehd,
                new_ipj,
                new_tasas,
                new_otroNoSujeto,
                new_exento,
                new_tasaCero,
                new_descuento,
                new_codControl,
                new_gifCard,
                idRendicion,
                month,
                year,
            } = item

            const fecha = new_fecha.split('/')
            const fechaFormateada = `${fecha[2]}-${fecha[1]}-${fecha[0]}`
            console.log({ fechaFormateada, fecha, new_fecha })

            const responseHana = await crearGasto(
                new_nit,
                new_tipo,
                new_gasto,
                new_nroFactura,
                new_codAut,
                fechaFormateada,
                new_nombreRazon,
                new_glosa,
                new_importeTotal,
                new_ice,
                new_iehd,
                new_ipj,
                new_tasas,
                new_otroNoSujeto,
                new_exento,
                new_tasaCero,
                new_descuento,
                new_codControl,
                new_gifCard,
                idRendicion,
                month,
                year,
            )
            result.push(responseHana[0] || responseHana)

        }))

        const hasError = result.some((item) => item.error); // Busca si algún objeto contiene la propiedad "error"

        if (hasError) {
            return res.status(400).json({ result }); // Responde con status 400 y el resultado
        }

        return res.json({ result })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const crearActualizarGastoController = async (req, res) => {
    try {
        const {
            codEmp,
            transacId,
            idRendicion,
            estado,
            listaGastos
        } = req.body
        const response = await cambiarEstadoRendicion(idRendicion, estado)
        const status = response[0]
        if (response.error) return res.status(404).json({ mensaje: 'error al cambiar el estado de la rendicion' })
        if (status.reponse != 200) return res.status(404).json({ mensaje: 'no se encontro la rendicion' })

        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        let errores = []
        listaGastos.map((item) => {
            const { new_fecha } = item
            if (!new_fecha) {
                errores.push(`Falta la fecha en el gasto con nit ${item.new_nit || 'No definido'} y glosa ${item.new_glosa || 'No definido'}`)
            }
        })
        if (errores.length > 0) return res.json({ errores })
        let gastos = []
        let result = []
        listaGastos.map((item) => {
            const newData = {
                ...item,
                idRendicion,
                month,
                year
            }
            gastos.push(newData)
        })

        await Promise.all(gastos.map(async (item) => {
            const {
                id_gasto,
                new_nit,
                new_tipo,
                new_gasto,
                new_estado,
                new_nroFactura,
                new_codAut,
                new_fecha,
                new_nombreRazon,
                new_glosa,
                new_importeTotal,
                new_ice,
                new_iehd,
                new_ipj,
                new_tasas,
                new_otroNoSujeto,
                new_exento,
                new_tasaCero,
                new_descuento,
                new_codControl,
                new_gifCard,
                idRendicion,
                month,
                year,
            } = item

            const fecha = new_fecha.split('/')
            const fechaFormateada = `${fecha[2]}-${fecha[1]}-${fecha[0]}`
            console.log({ fechaFormateada, fecha, new_fecha })
            if (id_gasto == 0) {
                const responseHana = await crearGasto(
                    new_nit,
                    new_tipo,
                    new_gasto,
                    new_nroFactura,
                    new_codAut,
                    fechaFormateada,
                    new_nombreRazon,
                    new_glosa,
                    new_importeTotal,
                    new_ice,
                    new_iehd,
                    new_ipj,
                    new_tasas,
                    new_otroNoSujeto,
                    new_exento,
                    new_tasaCero,
                    new_descuento,
                    new_codControl,
                    new_gifCard,
                    idRendicion,
                    month,
                    year,
                )
                result.push(responseHana[0] || responseHana)
            } else {
                const responseHana = await actualizarGastos(
                    id_gasto,
                    new_nit,
                    new_tipo,
                    new_gasto,
                    new_nroFactura,
                    new_codAut,
                    fechaFormateada,
                    new_nombreRazon,
                    new_glosa,
                    new_importeTotal,
                    new_ice,
                    new_iehd,
                    new_ipj,
                    new_tasas,
                    new_otroNoSujeto,
                    new_exento,
                    new_tasaCero,
                    new_descuento,
                    new_codControl,
                    new_gifCard,
                    new_estado,
                    idRendicion,
                )
                result.push(responseHana[0] || responseHana)
            }


        }))

        const hasError = result.some((item) => item.error);
        if (hasError) {
            return res.status(400).json({ result });
        }

        return res.json({ result })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const gastosEnRevisionController = async (req, res) => {
    try {
        const {
            codEmp,
            transacId,
            idRendicion,
            estado,
            listaGastos
        } = req.body
        const response = await cambiarEstadoRendicion(idRendicion, estado)
        const status = response[0]
        if (response.error) return res.status(404).json({ mensaje: 'error al cambiar el estado de la rendicion' })
        if (status.reponse != 200) return res.status(404).json({ mensaje: 'no se encontro la rendicion' })

        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        let errores = []
        listaGastos.map((item) => {
            const { new_fecha } = item
            if (!new_fecha) {
                errores.push(`Falta la fecha en el gasto con nit ${item.new_nit || 'No definido'} y glosa ${item.new_glosa || 'No definido'}`)
            }
        })
        if (errores.length > 0) return res.json({ errores })
        let gastos = []
        let result = []
        listaGastos.map((item) => {
            const newData = {
                ...item,
                idRendicion,
                month,
                year
            }
            gastos.push(newData)
        })

        await Promise.all(gastos.map(async (item) => {
            const {
                id_gasto,
                new_nit,
                new_tipo,
                new_gasto,
                new_nroFactura,
                new_codAut,
                new_fecha,
                new_nombreRazon,
                new_glosa,
                new_importeTotal,
                new_ice,
                new_iehd,
                new_ipj,
                new_tasas,
                new_otroNoSujeto,
                new_exento,
                new_tasaCero,
                new_descuento,
                new_codControl,
                new_gifCard,
                idRendicion,
                month,
                year,
            } = item

            const fecha = new_fecha.split('/')
            const fechaFormateada = `${fecha[2]}-${fecha[1]}-${fecha[0]}`
            console.log({ fechaFormateada, fecha, new_fecha })
            if (id_gasto == 0) {
                const responseHana = await crearGasto(
                    new_nit,
                    new_tipo,
                    new_gasto,
                    new_nroFactura,
                    new_codAut,
                    fechaFormateada,
                    new_nombreRazon,
                    new_glosa,
                    new_importeTotal,
                    new_ice,
                    new_iehd,
                    new_ipj,
                    new_tasas,
                    new_otroNoSujeto,
                    new_exento,
                    new_tasaCero,
                    new_descuento,
                    new_codControl,
                    new_gifCard,
                    idRendicion,
                    month,
                    year,
                )
                result.push(responseHana[0] || responseHana)
            } else {
                const responseHana = await actualizarGastos(
                    id_gasto,
                    new_nit,
                    new_tipo,
                    new_gasto,
                    new_nroFactura,
                    new_codAut,
                    fechaFormateada,
                    new_nombreRazon,
                    new_glosa,
                    new_importeTotal,
                    new_ice,
                    new_iehd,
                    new_ipj,
                    new_tasas,
                    new_otroNoSujeto,
                    new_exento,
                    new_tasaCero,
                    new_descuento,
                    new_codControl,
                    new_gifCard,
                    '2',
                    idRendicion,
                )
                result.push(responseHana[0] || responseHana)
            }


        }))

        const hasError = result.some((item) => item.error);
        if (hasError) {
            return res.status(400).json({ result });
        }

        return res.json({ result })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const cambiarEstadoRendicionController = async (req, res) => {
    try {

        const { id, estado } = req.body
        if (!id) return res.status(400).json({ mensaje: 'faltan datos: id' })
        if (!estado) return res.status(400).json({ mensaje: 'faltan datos: estado' })
        const response = await cambiarEstadoRendicion(id, estado)
        const status = response[0]
        if (response.error) return res.status(404).json({ mensaje: 'error al cambiar el estado' })
        if (status.reponse != 200) return res.status(404).json({ mensaje: 'no se encontro la rendicion' })
        return res.json({ mensaje: 'la rendicion se cambio de estado con exito', })

    } catch (error) {

        console.log({ error })
        return res.status(500).json({ mensaje: "Error en el controlador" })

    }
}

const verRendicionesEnRevisionController = async (req, res) => {
    try {
        const response = await verRendicionesEnRevision()
        const listaRendiciones = []

        await Promise.all(response.map(async (item) => {
            const { CODEMP, ...rest } = item
            Empleado = await employedByCardCode(CODEMP)
            if (Empleado && Empleado[0]) {
                listaRendiciones.push({
                    ...rest,
                    Empleado: Empleado[0]
                })
            } else {
                listaRendiciones.push({
                    ...rest,
                    Empleado: null
                })
            }

        }))

        return res.json({ listaRendiciones })
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const sendToSapController = async (req, res) => {
    const {
        codEmp,
        estado,
        idRendicion,
        transacId,
        listaGastos
    } = req.body

    try {
        let listRecibos = []
        let listFacturas = []
        let errores = []

        for (const iterator of listaGastos) {
            if (iterator.new_estado !== '2') {
                return res.status(400).json({ mensaje: 'Todas las filas deben estar EN REVISION' });
                break
            }
        }

        listaGastos.map((item) => {
            const { new_tipo, new_nit, new_glosa } = item
            if (!new_tipo) {
                errores.push(`el tipo no existe en el item con nit: ${new_nit || 'no definido'} y glosa : ${new_glosa}`)
            } else {
                if (new_tipo == 'F') {
                    listFacturas.push(item)
                } else {
                    listRecibos.push(item)
                }
            }

        })

        console.log({
            codEmp,
            estado,
            idRendicion,
            transacId,
            listFacturas,
            listRecibos,
        })
        const { statusCode, data } = await sapService.sendRendiciones({
            codEmp,
            estado,
            idRendicion,
            transacId,
            listFacturas,
            listRecibos,
        });

        console.log({ data, statusCode })
        if (data.status >= 400) {
            return res.status(400).json({ mensaje: `No se pudo crear la rendicion. ${data.message}` });
        }
        let listResSap = []
        await Promise.all(data.map(async (item) => {
            const { id, code, message } = item
            const responseSap = await actualizarEstadoComentario(id, code, message)
            listResSap.push(responseSap)
        }))
        const estadoRend = await actualizarEstadoRendicion(idRendicion, '3')
        console.log({ listResSap, estadoRend })
        return res.status(statusCode).json({ listResSap, estadoRend });
    } catch (error) {
        console.error({ error });

        // Maneja errores y responde al cliente
        const statusCode = error.statusCode || 500;
        const data = error.message || 'Error desconocido en el controlador';
        let listResSap = []
        let listErrores = []
        let estadoRend
        console.log({ data })
        if(data.length>0){
            data.map((item)=>{
                listErrores.push(`${item.message} - code: ${item.code||' Undefined '} - id: ${item.id||' Undefined '}`)
            })
        }
        if (statusCode == 400 && data.length > 0) {
            await Promise.all(data.map(async (item) => {
                const { id, code, message } = item
                console.log({ id, code, message })
                const cleanMessage = message.replace(/['".,:;]/g, "");
                console.log({ id, code, cleanMessage })
                const responseSap = await actualizarEstadoComentario(id, code, cleanMessage)
                listResSap.push(responseSap)
            }))
            estadoRend = await actualizarEstadoRendicion(idRendicion, '2')
        }
        console.log({ data, listResSap, estadoRend })
        return res.status(statusCode).json({mensaje: `No se pudo crear la rendicion`, data, listResSap, estadoRend,listErrores });
    }
}

const eliminarGastoController = async (req, res) => {
    try {
        const id = req.params.id
        const response = await eliminarGastoID(id)
        const status = response[0].reponse
        console.log({ status })
        if (status != 200) return res.status(409).json({ mensaje: 'no se pudo eliminar el gasto' })
        return res.json({ mensaje: 'el gasto fue eliminado' })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}
module.exports = {
    findAllAperturaController,
    findAllCajasEmpleadoController,
    rendicionDetalladaController,
    rendicionByTransacController,
    crearRendicionController,
    crearActualizarGastoController,
    gastosEnRevisionController,
    cambiarEstadoRendicionController,
    verRendicionesEnRevisionController,
    sendToSapController,
    eliminarGastoController
}