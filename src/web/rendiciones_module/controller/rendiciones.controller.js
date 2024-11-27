const { findAllAperturaCaja, findCajasEmpleado, rendicionDetallada, rendicionByTransac, crearRendicion, crearGasto, actualizarGastos } = require("./hana.controller")

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
                ...rest
            } = item
            const data = {
                ...rest,
                GASTO: +GASTO,
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
            listaGastos
        } = req.body
        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const response = await crearRendicion(transacId, codEmp, 1, month, year)
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
            const responseHana = await crearGasto(
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
            listaGastos
        } = req.body

        const date = new Date()
        const year = date.getFullYear()
        const month = date.getMonth() + 1

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
        // return res.json({ gastos })
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
            if (id_gasto == 0) {
                const responseHana = await crearGasto(
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
                )
                result.push(responseHana[0] || responseHana)
            }
            

        }))

        const hasError = result.some((item) => item.error); // Busca si algún objeto contiene la propiedad "error"

        if (hasError) {
            return res.status(400).json({ result }); // Responde con status 400 y el resultado
        }

        return res.json({ result })
    } catch (error) {
        console.log({ error })
    }
}
module.exports = {
    findAllAperturaController,
    findAllCajasEmpleadoController,
    rendicionDetalladaController,
    rendicionByTransacController,
    crearRendicionController,
    crearActualizarGastoController
}