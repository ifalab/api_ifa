const { findAllAperturaCaja, findCajasEmpleado, rendicionDetallada, rendicionByTransac } = require("./hana.controller")

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
        return res.json({...dataFinal })
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

module.exports = {
    findAllAperturaController,
    findAllCajasEmpleadoController,
    rendicionDetalladaController,
    rendicionByTransacController
}