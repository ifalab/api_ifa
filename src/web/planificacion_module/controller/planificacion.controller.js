const { 
    vendedoresPorSucCode, getVendedor, getClientesDelVendedor,
    getCicloVendedor, getDetalleCicloVendedor, insertarDetalleVisita, insertarCabeceraVisita
} = require("./hana.controller")

const vendedoresPorSucCodeController = async (req, res) => {
    try {
        const { sucCode } = req.query
        let response = await vendedoresPorSucCode(sucCode)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador vendedoresPorSucCodeController: ${error.message}` })
    }
}
const getVendedorController = async (req, res) => {
    try {
        const { id } = req.query
        let response = await getVendedor(id)
        if(response.length==0){
            return res.status(400).json({
                mensaje:`No se encontro el usuario con ese id`
            })
        }
        if(response.length==1){
            return res.json(response[0])
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getVendedorController: ${error.message}` })
    }
}
const getClientesDelVendedorController = async (req, res) => {
    try {
        const { id } = req.query
        let response = await getClientesDelVendedor(id)
        
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getClientesDelVendedorController: ${error.message}` })
    }
}

const getCicloVendedorController = async (req, res) => {
    try {
        const { idVendedor, mes, año } = req.body
        let response = await getCicloVendedor(idVendedor, mes, año)
        if(response.length==1){
            return res.json(response[0])
        }
        return res.json(null)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getCicloVendedorController: ${error.message}` })
    }
}

const getDetalleCicloVendedorController = async (req, res) => {
    try {
        const { id } = req.query
        let response = await getDetalleCicloVendedor(id)
        response.map((item)=>{
            item.PlanVisitDateNew = new Date(item.PlanVisitDate)
        })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getDetalleCicloVendedorController: ${error.message}` })
    }
}

const insertarVisitaController = async (req, res) => {
    try {
        const { descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin, details } = req.body
        let allResponses = []
        let responseCabecera = await insertarCabeceraVisita(descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin)
        console.log({ responseCabecera })
        allResponses.push(responseCabecera)
        return res.json({responseCabecera})
        const cabecera_id = responseCabecera.id
        for(const detail of details){
            const { cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, comentario } = detail
            let responseDetalle = await insertarDetalleVisita(cabecera_id, cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario)
            console.log({ responseDetalle })
            allResponses.push(responseDetalle)  
        }
        
        return res.json({allResponses})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador insertarVisitaController: ${error.message}` })
    }
}

const insertarCabeceraVisitaController = async (req, res) => {
    try {
        const { descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin} = req.body
        let response = await insertarCabeceraVisita(descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin)
        return res.json({response})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador insertarCabeceraVisitaController: ${error.message}` })
    }
}

const insertarDetalleVisitaController = async (req, res) => {
    try {
        const {cabecera_id, cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario } = req.body
        let response = await insertarDetalleVisita(cabecera_id, cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario)

        return res.json({response})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador insertarDetalleVisitaController: ${error.message}` })
    }
}

module.exports = {
    vendedoresPorSucCodeController, getVendedorController, getClientesDelVendedorController,
    getCicloVendedorController, getDetalleCicloVendedorController,
    insertarVisitaController, insertarDetalleVisitaController, insertarCabeceraVisitaController,
}