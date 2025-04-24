const { tipoDeCambio, tipoDeCambioByFecha } = require("../../contabilidad_module/controllers/hana.controller")
const sapService = require("../services/sap.service")
const { findAllAperturaCaja, findCajasEmpleado, rendicionDetallada, rendicionByTransac, crearRendicion, crearGasto, actualizarGastos, cambiarEstadoRendicion, verRendicionesEnRevision, employedByCardCode, actualizarEstadoComentario, actualizarEstadoRendicion, eliminarGastoID, costoComercialAreas, costoComercialTipoCliente, costoComercialLineas, costoComercialEspecialidades, costoComercialClasificaciones, costoComercialConceptos, costoComercialCuenta, filtroCC, actualizarGlosaRendicion, actualizarfechaContRendicion,
    getProveedor, searchBeneficiarios,
    findAllCajasEmpleados,
    concepComercialById,
    actualizarCCRendicion,
    actualizarGlosaPRDGastos,
    busquedaProd,
    busquedaProveedor,
    lineaDetalleCC,
    idJournalPreliminar,
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
                CODPROVEEDOR,
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
                GLOSA_PRD,
                CODPROVEEDOR
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
        console.log(JSON.stringify({
            codEmp,
            transacId,
            estado,
            glosaRend,
            listaGastos
        }, null, 2))
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
                new_cod_proveedor
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
                new_detalle_cuenta,
                new_cod_proveedor
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
                new_detalle_cuenta,
                new_cod_proveedor
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
                    new_detalle_cuenta,
                    new_cod_proveedor
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
                    new_detalle_cuenta,
                    new_cod_proveedor,
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
                new_cod_proveedor
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
                    new_detalle_cuenta,
                    new_cod_proveedor
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

        console.log(JSON.stringify({
            codEmp,
            estado,
            idRendicion,
            transacId,
            glosaRend,
            fechaContabilizado,
            listaGastos,
        }, null, 2))
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

        //!------------------------------------------- PRUEBA
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
        // console.log(JSON.stringify({
        //     usd,
        //     codEmp,
        //     estado,
        //     idRendicion,
        //     transacId,
        //     glosaRend,
        //     fechaContabilizado,
        //     listFacturas,
        //     listRecibos,
        //     listFacturasND,
        // }, null, 2))
        // console.log('DATOS de REND-----------------------------------------------------------')
        // console.log({ statusCode, data })
        // // return res.json({ statusCode, data })
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
        //!------------------------------------------- PRUEBA
        //! enviar centro de costo:

        let journalLines = []
        // listFacturas,
        // listRecibos,
        // listFacturasND
        listFacturas.map((factura) => {
            const totalDolar = (factura.new_importeTotal / usd).toFixed(2)
            const listData = [
                {
                    Line_ID: 1,
                    AccountCode: '2110401',
                    ShortName: codEmp,
                    ContraAccount: factura.new_cuenta_productiva,
                    Debit: 0,
                    Credit: factura.new_importeTotal,
                    DebitSys: 0,
                    CreditSys: Number(totalDolar),
                    ProjectCode: '',
                    AdditionalReference: factura.id_gasto,
                    Reference1: transacId,
                    Reference2: idRendicion,
                    CostingCode: null,
                    CostingCode2: null,
                    CostingCode3: null,
                    CostingCode4: null,
                    CostingCode5: null,
                    LineMemo: factura.new_glosa_prod,
                    U_ComercialComments: factura.new_glosa,
                    U_TIPODOC: '10',
                    U_NIT: null,
                    U_RSocial: null,
                    U_NumAuto: null,
                    U_B_cuf: null,
                    U_NumDoc: null,
                    U_FECHAFAC: formatFecha(factura.new_fecha),
                    U_IMPORTE: null,
                    U_ICE: null,
                    U_IEHD: null,
                    U_IPJ: null,
                    U_TASAS: null,
                    U_OP_EXENTO: null,
                    U_EXENTO: null,
                    U_TASACERO: null,
                    U_DESCTOBR: null,
                    U_GIFTCARD: null,
                    U_ESTADOFC: 'V',
                    U_TIPOCOM: 1,
                    U_CODALFA: '',
                    U_BenefCode: factura.new_cod_beneficiario,
                },
                {
                    Line_ID: 0,
                    AccountCode: factura.new_cuenta_productiva,
                    ShortName: factura.new_cuenta_productiva,
                    ContraAccount: codEmp,
                    Debit: factura.new_importeTotal,
                    Credit: 0,
                    DebitSys: +totalDolar,
                    CreditSys: 0,
                    ProjectCode: '',
                    AdditionalReference: factura.id_gasto,
                    Reference1: transacId,
                    Reference2: idRendicion,
                    CostingCode: null,
                    CostingCode2: null,
                    CostingCode3: null,
                    CostingCode4: null,
                    CostingCode5: null,
                    LineMemo: factura.new_glosa_prod,
                    U_ComercialComments: factura.new_glosa,
                    U_TIPODOC: factura.new_tipo === 'F' ? '1' : '10',
                    U_NIT: factura.new_nit,
                    U_RSocial: factura.new_nombreRazon,
                    U_NumAuto: factura.new_codAut.length > 20 ? null : factura.new_codAut,
                    U_B_cuf: factura.new_codAut.length > 20 ? factura.new_codAut : null,
                    U_NumDoc: factura.new_nroFactura,
                    U_FECHAFAC: formatFecha(factura.new_fecha),
                    U_IMPORTE: factura.new_importeTotal,
                    U_ICE: factura.new_ice,
                    U_IEHD: factura.new_iehd,
                    U_IPJ: factura.new_ipj,
                    U_TASAS: factura.new_tasas,
                    U_OP_EXENTO: factura.new_otroNoSujeto,
                    U_EXENTO: factura.new_exento,
                    U_TASACERO: factura.new_tasaCero,
                    U_DESCTOBR: factura.new_descuento,
                    U_GIFTCARD: factura.new_gifCard,
                    U_ESTADOFC: 'V',
                    U_TIPOCOM: 1,
                    U_CODALFA: factura.new_codControl,
                    U_BenefCode: factura.new_cod_beneficiario,
                    U_CardCode: factura.new_cod_proveedor,
                },
            ]
            journalLines = [...journalLines, ...listData]
        })

        listRecibos.map((recibos) => {
            const totalDolar = (recibos.new_importeTotal / usd).toFixed(2)
            const listData = [
                {
                    Line_ID: 1,
                    AccountCode: '2110401',
                    ShortName: codEmp,
                    ContraAccount: recibos.new_cuenta_productiva,
                    Debit: 0,
                    Credit: recibos.new_importeTotal,
                    DebitSys: 0,
                    CreditSys: Number(totalDolar),
                    ProjectCode: '',
                    AdditionalReference: recibos.id_gasto,
                    Reference1: transacId,
                    Reference2: idRendicion,
                    CostingCode: null,
                    CostingCode2: null,
                    CostingCode3: null,
                    CostingCode4: null,
                    CostingCode5: null,
                    LineMemo: recibos.new_glosa_prod,
                    U_ComercialComments: recibos.new_glosa,
                    U_TIPODOC: '10',
                    U_NIT: null,
                    U_RSocial: null,
                    U_NumAuto: null,
                    U_B_cuf: null,
                    U_NumDoc: null,
                    U_FECHAFAC: formatFecha(recibos.new_fecha),
                    U_IMPORTE: null,
                    U_ICE: null,
                    U_IEHD: null,
                    U_IPJ: null,
                    U_TASAS: null,
                    U_OP_EXENTO: null,
                    U_EXENTO: null,
                    U_TASACERO: null,
                    U_DESCTOBR: null,
                    U_GIFTCARD: null,
                    U_ESTADOFC: 'V',
                    U_TIPOCOM: 1,
                    U_CODALFA: '',
                    U_BenefCode: recibos.new_cod_beneficiario,
                },
                {
                    Line_ID: 0,
                    AccountCode: recibos.new_cuenta_productiva,
                    ShortName: recibos.new_cuenta_productiva,
                    ContraAccount: codEmp,
                    Debit: recibos.new_importeTotal,
                    Credit: 0,
                    DebitSys: +totalDolar,
                    CreditSys: 0,
                    ProjectCode: '',
                    AdditionalReference: recibos.id_gasto,
                    Reference1: transacId,
                    Reference2: idRendicion,
                    CostingCode: null,
                    CostingCode2: null,
                    CostingCode3: null,
                    CostingCode4: null,
                    CostingCode5: null,
                    LineMemo: recibos.new_glosa_prod,
                    U_ComercialComments: recibos.new_glosa,
                    U_TIPODOC: recibos.new_tipo === 'F' ? '1' : '10',
                    U_NIT: recibos.new_nit,
                    U_RSocial: recibos.new_nombreRazon,
                    U_NumAuto: recibos.new_codAut.length > 20 ? null : recibos.new_codAut,
                    U_B_cuf: recibos.new_codAut.length > 20 ? recibos.new_codAut : null,
                    U_NumDoc: recibos.new_nrorecibos,
                    U_FECHAFAC: formatFecha(recibos.new_fecha),
                    U_IMPORTE: recibos.new_importeTotal,
                    U_ICE: recibos.new_ice,
                    U_IEHD: recibos.new_iehd,
                    U_IPJ: recibos.new_ipj,
                    U_TASAS: recibos.new_tasas,
                    U_OP_EXENTO: recibos.new_otroNoSujeto,
                    U_EXENTO: recibos.new_exento,
                    U_TASACERO: recibos.new_tasaCero,
                    U_DESCTOBR: recibos.new_descuento,
                    U_GIFTCARD: recibos.new_gifCard,
                    U_ESTADOFC: 'V',
                    U_TIPOCOM: 1,
                    U_CODALFA: recibos.new_codControl,
                    U_BenefCode: recibos.new_cod_beneficiario,
                    U_CardCode: recibos.new_cod_proveedor,
                },
            ]

            journalLines = [...journalLines, ...listData]
        })

        listFacturasND.map((fnd) => {
            const totalDolar = (fnd.new_importeTotal / usd).toFixed(2)
            const listData = [
                {
                    Line_ID: 1,
                    AccountCode: '2110401',
                    ShortName: codEmp,
                    ContraAccount: fnd.new_cuenta_productiva,
                    Debit: 0,
                    Credit: fnd.new_importeTotal,
                    DebitSys: 0,
                    CreditSys: Number(totalDolar),
                    ProjectCode: '',
                    AdditionalReference: fnd.id_gasto,
                    Reference1: transacId,
                    Reference2: idRendicion,
                    CostingCode: null,
                    CostingCode2: null,
                    CostingCode3: null,
                    CostingCode4: null,
                    CostingCode5: null,
                    LineMemo: fnd.new_glosa_prod,
                    U_ComercialComments: fnd.new_glosa,
                    U_TIPODOC: '10',
                    U_NIT: null,
                    U_RSocial: null,
                    U_NumAuto: null,
                    U_B_cuf: null,
                    U_NumDoc: null,
                    U_FECHAFAC: formatFecha(fnd.new_fecha),
                    U_IMPORTE: null,
                    U_ICE: null,
                    U_IEHD: null,
                    U_IPJ: null,
                    U_TASAS: null,
                    U_OP_EXENTO: null,
                    U_EXENTO: null,
                    U_TASACERO: null,
                    U_DESCTOBR: null,
                    U_GIFTCARD: null,
                    U_ESTADOFC: 'V',
                    U_TIPOCOM: 1,
                    U_CODALFA: '',
                    U_BenefCode: fnd.new_cod_beneficiario,
                },
                {
                    Line_ID: 0,
                    AccountCode: fnd.new_cuenta_productiva,
                    ShortName: fnd.new_cuenta_productiva,
                    ContraAccount: codEmp,
                    Debit: fnd.new_importeTotal,
                    Credit: 0,
                    DebitSys: +totalDolar,
                    CreditSys: 0,
                    ProjectCode: '',
                    AdditionalReference: fnd.id_gasto,
                    Reference1: transacId,
                    Reference2: idRendicion,
                    CostingCode: null,
                    CostingCode2: null,
                    CostingCode3: null,
                    CostingCode4: null,
                    CostingCode5: null,
                    LineMemo: fnd.new_glosa_prod,
                    U_ComercialComments: fnd.new_glosa,
                    U_TIPODOC: fnd.new_tipo === 'F' ? '1' : '10',
                    U_NIT: fnd.new_nit,
                    U_RSocial: fnd.new_nombreRazon,
                    U_NumAuto: fnd.new_codAut.length > 20 ? null : fnd.new_codAut,
                    U_B_cuf: fnd.new_codAut.length > 20 ? fnd.new_codAut : null,
                    U_NumDoc: fnd.new_nrofnd,
                    U_FECHAFAC: formatFecha(fnd.new_fecha),
                    U_IMPORTE: fnd.new_importeTotal,
                    U_ICE: fnd.new_ice,
                    U_IEHD: fnd.new_iehd,
                    U_IPJ: fnd.new_ipj,
                    U_TASAS: fnd.new_tasas,
                    U_OP_EXENTO: fnd.new_otroNoSujeto,
                    U_EXENTO: fnd.new_exento,
                    U_TASACERO: fnd.new_tasaCero,
                    U_DESCTOBR: fnd.new_descuento,
                    U_GIFTCARD: fnd.new_gifCard,
                    U_ESTADOFC: 'V',
                    U_TIPOCOM: 1,
                    U_CODALFA: fnd.new_codControl,
                    U_BenefCode: fnd.new_cod_beneficiario,
                    U_CardCode: fnd.new_cod_proveedor,
                },
            ]

            journalLines = [...journalLines, ...listData]
        })
        //***
        let idx = 0
        const idJournalCom = await idJournalPreliminar()
        if (idJournalCom.length == 0) {
            return res.status(400).json({mensaje:'No hay datos al buscar el ID en IFA COM'})
        }
        const idCom = idJournalCom[0].TransId
        
        for (const item of journalLines) {
            item.Line_ID = idx
            const response = await lineaDetalleCC(
                idCom,
                item.Line_ID,
                item.AccountCode,
                item.ShortName,
                item.ContraAccount,
                item.Debit,
                item.Credit,
                item.DebitSys,
                item.CreditSys,
                item.ProjectCode,
                item.AdditionalReference,
                item.Reference1,
                item.Reference2,
                item.CostingCode,
                item.CostingCode2,
                item.CostingCode3,
                item.CostingCode4,
                item.CostingCode5,
                item.LineMemo,
                item.U_ComercialComments,
                item.U_TIPODOC,
                item.U_NIT,
                item.U_RSocial,
                item.U_NumAuto,
                item.U_B_cuf,
                item.U_NumDoc,
                item.U_FECHAFAC,
                item.U_IMPORTE,
                item.U_ICE,
                item.U_IEHD,
                item.U_IPJ,
                item.U_TASAS,
                item.U_OP_EXENTO,
                item.U_EXENTO,
                item.U_TASACERO,
                item.U_DESCTOBR,
                item.U_GIFTCARD,
                item.U_ESTADOFC,
                item.U_TIPOCOM,
                item.U_CODALFA,
                item.U_BenefCode,
                item.U_CardCode
            )
            if(response.error){
                return res.status(400).json({response})
            }
            idx++
        }
        // return res.json({
        //     usd,
        //     codEmp,
        //     estado,
        //     idRendicion,
        //     transacId,
        //     glosaRend,
        //     fechaContabilizado,
        //     listFacturas,
        //     listRecibos,
        //     listFacturasND,
        //     journalLines,
        //     totalJournalLines: journalLines.length,
        //     idJournalCom
        // })
        //! FIN enviar centro de costo:

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
                new_detalle_cuenta,
                new_cod_proveedor
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
                new_detalle_cuenta,
                new_cod_proveedor
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
                new_detalle_cuenta,
                new_cod_proveedor
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
                new_detalle_cuenta,
                new_cod_proveedor
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

const formatFecha = (fecha) => {
    const [day, month, year] = fecha.split('/');
    return `${year}${month}${day}`;
};
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

const buscarCuentaProdController = async (req, res) => {
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
        console.log({ id, idRend, new_cuenta_cc })
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

const proveedoresController = async (req, res) => {
    try {
        let parametro = req.query.parametro
        const response = await busquedaProveedor(parametro.toUpperCase())
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador: ${error.message || ''}` })
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
    proveedoresController,
}