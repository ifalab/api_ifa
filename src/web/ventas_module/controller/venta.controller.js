const { request,response } = require("express")
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
    ventasPorZonasVendedor
} = require("./hana.controller")



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

const ventasVendedorPorZona= async(req= request, res= response) =>{
    const {username} = req.query;
    try {
        if(!username && typeof username != "string")
            return res.status(400).json({
                mensaje: 'Ingrese un username valido'
            })
        const response = await ventasPorZonasVendedor(username);
        if(response.length == 0) {
            return res.status(400).json({mensaje: 'Ingrese un usuario valido'})
        }
        const data =  response.map( r => ({
            ...r,
            cumplimiento: r.Quota == 0? 0 : r.Sales/r.Quota
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
    ventasVendedorPorZona
};
