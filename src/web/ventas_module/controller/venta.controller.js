const { ventaPorSucursal, ventasNormales, ventasCadena, ventasInstitucion, ventasUsuario, ventasIfaVet, ventasMasivo, ventaPorSucursalMesAnterior, ventasNormalesMesAnterior, ventasCadenaMesAnterior, ventasInstitucionMesAnterior, ventasIfaVetMesAnterior, ventasMasivoMesAnterior } = require("./hana.controller")

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
}