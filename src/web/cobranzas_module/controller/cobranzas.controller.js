const { cobranzaGeneral, cobranzaPorSucursal } = require("./hana.controller")

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
        const response = await cobranzaPorSucursal()
        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            mensaje: 'problemas en cobranzaPorSucursalController',
            error
        })
    }
}

module.exports = {
    cobranzaGeneralController,
    cobranzaPorSucursalController
}