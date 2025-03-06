const { tipoDeCambio, tipoDeCambioByFecha } = require("../../contabilidad_module/controllers/hana.controller")
const sapService = require("../services/sap.service")
const { findAllAperturaCaja, findCajasEmpleado, rendicionDetallada, rendicionByTransac, crearRendicion, crearGasto, actualizarGastos, cambiarEstadoRendicion, verRendicionesEnRevision, employedByCardCode, actualizarEstadoComentario, actualizarEstadoRendicion, eliminarGastoID, costoComercialAreas, costoComercialTipoCliente, costoComercialLineas, costoComercialEspecialidades, costoComercialClasificaciones, costoComercialConceptos, costoComercialCuenta, filtroCC, actualizarGlosaRendicion, actualizarfechaContRendicion,
    getProveedor, searchBeneficiarios,
    findAllCajasEmpleados,
    concepComercialById,
    actualizarCCRendicion,
    actualizarGlosaPRDGastos,
    busquedaProd
} = require("./hana.controller")

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

const findAllCajasController = async (req, res) => {
    try {

        const listCajas = await findAllCajasEmpleados()
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
        console.log('================================  RESPONSE RENDICION DETALLE')
        // return res.json(response)
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
                COMENTARIO,
                ID_CUENTA,
                GLOSA_REND,
                FECHACONTABILIZACION,
                BENEFICIARIO,
                COD_BENEFICIARIO,
                DETALLE_CUENTA,
                CUENTA_CC,
                GLOSA_PRD,
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
                ID_CUENTA: +ID_CUENTA,
                COMENTARIO: COMENTARIO,
                BENEFICIARIO,
                COD_BENEFICIARIO,
                DETALLE_CUENTA,
                CUENTA_PRODUCTIVA: CUENTA_CC,
                GLOSA_PRD
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
            GLOSA_REND,
            FECHACONTABILIZACION,
        } = response[0]
        const dataFinal = {
            ID,
            TRANSACTIONID,
            CODEMP,
            ESTADO,
            YEAR_RENDICION,
            MONTH_RENDICION,
            GLOSA_REND,
            FECHACONTABILIZACION,
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
            glosaRend,
            listaGastos
        } = req.body
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        console.log('======================================                 DATA TO CREATE REND')
        const response = await crearRendicion(transacId, codEmp, estado, month, year, glosaRend)
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
                new_id_cuenta,
                new_beneficiario,
                new_cod_beneficiario,
                new_detalle_cuenta,
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
                '',
                new_id_cuenta,
                new_beneficiario,
                new_cod_beneficiario,
                new_detalle_cuenta
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
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
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
                new_id_cuenta,
                new_beneficiario,
                new_cod_beneficiario,
                new_detalle_cuenta
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
                    '',
                    new_id_cuenta,
                    new_beneficiario,
                    new_cod_beneficiario,
                    new_detalle_cuenta
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
                    '',
                    new_id_cuenta,
                    new_beneficiario,
                    new_cod_beneficiario,
                    new_detalle_cuenta
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
                new_id_cuenta,
                new_detalle_cuenta,
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
                    new_id_cuenta,
                    new_detalle_cuenta
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
                    '',
                    new_id_cuenta,
                    new_detalle_cuenta
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
        glosaRend,
        fechaContabilizado,
        listaGastos,
    } = req.body

    try {
        let listRecibos = []
        let listFacturas = []
        let listFacturasND = []
        let listResHana = []
        let errores = []

        // console.log(JSON.stringify({
        //     codEmp,
        //     estado,
        //     idRendicion,
        //     transacId,
        //     glosaRend,
        //     fechaContabilizado,
        //     listaGastos,
        // }, null, 2))
        // return res.json({
        //     codEmp,
        //     estado,
        //     idRendicion,
        //     transacId,
        //     glosaRend,
        //     fechaContabilizado,
        //     listaGastos,
        // })
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
                } else if (new_tipo == 'FND') {
                    listFacturasND.push(item)
                } else {
                    listRecibos.push(item)
                }
            }

        })
        const fecha = fechaContabilizado.split('T')
        const tipoCambio = await tipoDeCambioByFecha(fecha[0])
        const usdRate = tipoCambio[0]
        const usd = +usdRate.Rate
        console.log({
            usd,
            codEmp,
            estado,
            idRendicion,
            transacId,
            glosaRend,
            fechaContabilizado,
            listFacturas,
            listRecibos,
            listFacturasND
         })
        // return res.json(usd)

        const { statusCode, data } = await sapService.sendRendiciones({
            usd,
            codEmp,
            estado,
            idRendicion,
            transacId,
            glosaRend,
            fechaContabilizado,
            listFacturas,
            listRecibos,
            listFacturasND,
        });

        console.log({ data, statusCode })
        console.log(JSON.stringify({
            usd,
            codEmp,
            estado,
            idRendicion,
            transacId,
            glosaRend,
            fechaContabilizado,
            listFacturas,
            listRecibos,
            listFacturasND,
        }, null, 2))
        console.log('DATOS de REND-----------------------------------------------------------')
        console.log({ statusCode, data })
        // return res.json({ statusCode, data })
        if (data.status >= 400) {
            await Promise.all(listFacturas.map(async (item) => {
                const { id_gasto } = item
                const responseSap = await actualizarEstadoComentario(id_gasto, 2, `No se pudo contabilizar, error del SAP. ${data.message || ''}`)
                listResHana.push(responseSap)
            }))
            await Promise.all(listRecibos.map(async (item) => {
                const { id_gasto } = item
                const responseSap = await actualizarEstadoComentario(id_gasto, 2, `No se pudo contabilizar, error del SAP. ${data.message || ''}`)
                listResHana.push(responseSap)
            }))
            return res.status(400).json({ mensaje: `No se pudo crear la rendicion. ${data.message}`, listResHana });

        }

        await Promise.all(listFacturas.map(async (item) => {
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
                new_id_cuenta,
                new_beneficiario,
                new_cod_beneficiario,
                new_detalle_cuenta
            } = item
            const responseSap = await actualizarEstadoComentario(id_gasto, 3, 'Contabilizado con exito')
            listResHana.push(responseSap)
            const fecha = new_fecha.split('/')
            const fechaFormateada = `${fecha[2]}-${fecha[1]}-${fecha[0]}`
            console.log({ fechaFormateada, fecha, new_fecha })
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
                '3',
                idRendicion,
                '',
                new_id_cuenta,
                new_beneficiario,
                new_cod_beneficiario,
                new_detalle_cuenta
            )
            listResHana.push(responseHana)
        }))
        await Promise.all(listRecibos.map(async (item) => {
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
                new_id_cuenta,
                new_beneficiario,
                new_cod_beneficiario,
                new_detalle_cuenta
            } = item

            const responseSap = await actualizarEstadoComentario(id_gasto, 3, 'Contabilizado con exito')
            listResHana.push(responseSap)
            const fecha = new_fecha.split('/')
            const fechaFormateada = `${fecha[2]}-${fecha[1]}-${fecha[0]}`
            console.log({ fechaFormateada, fecha, new_fecha })
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
                '3',
                idRendicion,
                '',
                new_id_cuenta,
                new_beneficiario,
                new_cod_beneficiario,
                new_detalle_cuenta
            )
            listResHana.push(responseHana)

        }))

        const estadoRend = await actualizarEstadoRendicion(idRendicion, '3')
        console.log({ estadoRend })
        return res.status(statusCode).json({ mensaje: `Se registro la rendicion en el SAP con exito.`, data, listResHana });
    } catch (error) {
        console.log('Error: --------------------------------------------')
        console.error({ error });
        console.error({ errorMessage: error.message });

        // Maneja errores y responde al cliente
        const statusCode = error.statusCode || 500;
        const data = `${error.message || 'Error desconocido en el controlador'}`;
        let listResSap = []
        let listErrores = []
        let estadoRend
        estadoRend = await actualizarEstadoRendicion(idRendicion, '2')
        console.log({ data })
        if (error.message.error?.message) {
            return res.status(statusCode).json({ mensaje: `No se pudo crear la rendicion. ${error.message.error?.message || ''}`, estadoRend });
        }
        if (error.response) {
            if (error.response.length > 0) {
                error.response.map((item) => {
                    listErrores.push(`${item.message} - code: ${item.code || ' Undefined '} - id: ${item.id || ' Undefined '}`)
                })
            }
        }

        if (statusCode >= 400 && error.response) {
            if (error.response.length > 0) {
                await Promise.all(error.response.map(async (item) => {
                    const { id, code, message } = item
                    console.log({ id, code, message })
                    const cleanMessage = message.replace(/['".,:;]/g, "");
                    console.log({ id, code, cleanMessage })
                    const responseSap = await actualizarEstadoComentario(id, code, cleanMessage)
                    listResSap.push(responseSap)
                }))

            }

        }
        console.log({ data, listResSap, estadoRend })
        return res.status(statusCode).json({ mensaje: `No se pudo crear la rendicion`, data, listResSap, estadoRend, listErrores });
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

const costoComercialAreasController = async (req, res) => {
    try {

        const response = await costoComercialAreas()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}

const costoComercialTipoClienteController = async (req, res) => {
    try {

        const response = await costoComercialTipoCliente()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}

const costoComercialLineasController = async (req, res) => {
    try {

        const response = await costoComercialLineas()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}

const costoComercialEspecialidadesController = async (req, res) => {
    try {

        const response = await costoComercialEspecialidades()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}

const costoComercialClasificacionesController = async (req, res) => {
    try {

        const response = await costoComercialClasificaciones()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}

const costoComercialConceptosController = async (req, res) => {
    try {

        const response = await costoComercialConceptos()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}

const costoComercialCuentaController = async (req, res) => {
    try {

        const response = await costoComercialCuenta()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}

const filtroCCController = async (req, res) => {
    try {
        const { areaCode, tipoCode, lineaCode, especialidadCode, clasificacionCode, conceptoCode, cuentaCode, id } = req.body
        console.log({
            areaCode,
            tipoCode,
            lineaCode,
            especialidadCode,
            clasificacionCode,
            conceptoCode,
            cuentaCode,
            id,
        })
        const response = await filtroCC(areaCode, tipoCode, lineaCode, especialidadCode, clasificacionCode, conceptoCode, cuentaCode)
        const newTipo = []
        const newLinea = []
        const newEspecial = []
        const newClasificacion = []
        const newConcepto = []
        const newAccount = []

        if (!response) {
            return res.status(400).json({ mensaje: 'No se pudieron traer los datos de costo comercial' })
        }

        response.map((item) => {
            if (!newTipo.some(datatipo => datatipo.TypeCode === item.TypeCode)) {
                newTipo.push({ TypeCode: item.TypeCode, Type: item.Type })
            }

            if (!newLinea.some(datatipo => datatipo.LineCode === item.LineCode)) {
                newLinea.push({ LineCode: item.LineCode, Line: item.Line })
            }

            if (!newEspecial.some(datatipo => datatipo.SpecialtyCode === item.SpecialtyCode)) {
                newEspecial.push({ SpecialtyCode: item.SpecialtyCode, Specialty: item.Specialty })
            }

            if (!newClasificacion.some(datatipo => datatipo.ClassificationCode === item.ClassificationCode)) {
                newClasificacion.push({ ClassificationCode: item.ClassificationCode, Classification: item.Classification })
            }

            if (!newConcepto.some(datatipo => datatipo.ComlConceptCode === item.ComlConceptCode)) {
                newConcepto.push({ ComlConceptCode: item.ComlConceptCode, ComlConcept: item.ComlConcept })
            }

            if (!newAccount.some(datatipo => datatipo.Account === item.Account)) {
                newAccount.push({
                    Account: item.Account,
                    AcctName: item.AcctName,
                    Id: item.Id,
                })
            }
        })

        return res.json({ result: response, newTipo, newLinea, newEspecial, newClasificacion, newConcepto, newAccount, })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'problemas en el controlador' })
    }
}

const actualizarGlosaRendController = async (req, res) => {
    try {
        const { idRend, new_glosa } = req.body
        if (!idRend) {
            return res.status(400).json({ mensaje: 'Debe existir un Id de la Rendicion' })
        }
        if (!new_glosa) {
            return res.json({ mensaje: 'No existe la glosa' })
            //return res.status(400).json({ mensaje: 'Debe existir una glosa' })
        }
        const responseHana = await actualizarGlosaRendicion(idRend, new_glosa)
        const { response } = responseHana[0]
        console.log({ response })
        if (response != 200) {
            return res.status(400).json({ mensaje: 'No se pudo actualizar la glosa' })
        }
        return res.json({ response, responseHana })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message}` })
    }
}

const actualizarFechaContRendController = async (req, res) => {
    try {
        const { idRend, new_date } = req.body
        if (!idRend) {
            return res.status(400).json({ mensaje: 'debe existir un Id de la Rendicion' })
        }
        if (!new_date) {
            return res.status(400).json({ mensaje: 'debe existir una fecha valida' })
        }
        const responseHana = await actualizarfechaContRendicion(idRend, new_date)
        const { response } = responseHana[0]
        console.log({ response })
        if (response != 200) {
            return res.status(400).json({ mensaje: 'no se pudo actualizar la fecha de contabilizacion' })
        }
        return res.json({ response, responseHana })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const actualizarGlosaPRDGastoController = async (req, res) => {
    try {
        const { idRend, new_glosa_prd } = req.body
        if (!idRend) {
            return res.status(400).json({ mensaje: 'debe existir un Id de la Rendicion' })
        }
        if (!new_glosa_prd) {
            return res.status(400).json({ mensaje: 'debe existir una glosa valida' })
        }
        const responseHana = await actualizarGlosaPRDGastos(idRend, new_glosa_prd)
        const { response } = responseHana[0]
        console.log({ response })
        if (response != 200) {
            return res.status(400).json({ mensaje: 'no se pudo actualizar la Glosa PRD' })
        }
        return res.json({ response, responseHana })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}

const getProveedorController = async (req, res) => {
    try {
        const id = req.query.id
        const proveedor = await getProveedor(id)
        if (proveedor.length == 0) {
            return res.json({
                LicTradNum: `${id}`,
                CardFName: "",
                CardCode: ""
            })
        }
        return res.json(...proveedor)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en getProveedorController: ${error.message || ''}` })
    }
}

const searchBeneficiariosController = async (req, res) => {
    try {
        const { cadena } = req.body
        const upperCadena = cadena.toUpperCase()
        console.log({ cadena }, { upperCadena })
        const clientes = await searchBeneficiarios(upperCadena)
        return res.json(clientes)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en searchBeneficiariosController: ${error.message || ''}` })
    }
}

const conceptoComercialByIdController = async (req, res) => {
    try {
        const id = req.params.id
        console.log({ id })
        const result = await concepComercialById(id)
        if (result.length == 0) return res.status(404).json({ mensjae: 'no se encontro el CC' })
        const data = result[0]
        return res.json(data)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
    }
}

const buscarCuentaProdController= async (req, res) => {
    try {
        let parametro = req.query.parametro
        const response = await busquedaProd(parametro.toUpperCase())
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
    }
}

const actualizarCCRendController = async (req, res) => {
    try {
        const { id, idRend, new_cuenta_cc } = req.body
        if (!id) {
            return res.status(400).json({ mensaje: 'debe existir un Id del Gasto' })
        }
        if (!idRend) {
            return res.status(400).json({ mensaje: 'debe existir un Id de la Rendicion' })
        }
        if (!new_cuenta_cc) {
            return res.status(400).json({ mensaje: 'debe venir una cuenta CC' })
        }
        const responseHana = await actualizarCCRendicion(id, idRend, new_cuenta_cc)
        const { response } = responseHana[0]
        console.log({ response })
        if (response != 200) {
            return res.status(400).json({ mensaje: 'no se pudo actualizar la fecha de contabilizacion' })
        }
        return res.json({ response, responseHana })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
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
    eliminarGastoController,
    costoComercialAreasController,
    costoComercialTipoClienteController,
    costoComercialLineasController,
    costoComercialEspecialidadesController,
    costoComercialClasificacionesController,
    costoComercialConceptosController,
    costoComercialCuentaController,
    filtroCCController,
    actualizarGlosaRendController,
    actualizarFechaContRendController,
    getProveedorController,
    searchBeneficiariosController,
    findAllCajasController,
    conceptoComercialByIdController,
    actualizarCCRendController,
    actualizarGlosaPRDGastoController,
    buscarCuentaProdController,
}