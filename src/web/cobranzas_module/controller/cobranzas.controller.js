const { cobranzaGeneral, cobranzaPorSucursal, cobranzaNormales, cobranzaCadenas, cobranzaIfavet } = require("./hana.controller")

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
            mensaje: 'problemas en cobranzaCadenaController',
            error
        })
    }
}

module.exports = {
    cobranzaGeneralController,
    cobranzaPorSucursalController,
    cobranzaNormalesController,
    cobranzaCadenaController,
    cobranzaIfavetController
}