const { cobranzaGeneral, cobranzaPorSucursal, cobranzaNormales, cobranzaCadenas, cobranzaIfavet, cobranzaPorSucursalMesAnterior, cobranzaNormalesMesAnterior, cobranzaCadenasMesAnterior, cobranzaIfavetMesAnterior, cobranzaMasivo, cobranzaInstituciones, cobranzaMasivoMesAnterior, cobranzaPorSupervisor } = require("./hana.controller")

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
    cobranzaPorSupervisorController
}