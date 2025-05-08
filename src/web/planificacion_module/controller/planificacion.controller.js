const { 
    vendedoresPorSucCode, getVendedor, getClientesDelVendedor,
    getCicloVendedor, getDetalleCicloVendedor, insertarDetalleVisita, insertarCabeceraVisita,
    actualizarDetalleVisita, cambiarEstadoCiclo, cambiarEstadoVisitas, eliminarDetalleVisita,
    getVisitasParaHoy, marcarVisita, getCabeceraVisitasCreadas, aniadirDetalleVisita, getDetalleVisitasCreadas,
    getCabeceraVisitaCreada, getClienteByCode, actualizarVisita, getUltimaVisita
} = require("./hana.controller")
const { grabarLog } = require("../../shared/controller/hana.controller");

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
const getClienteByCodeController = async (req, res) => {
    try {
        const { id } = req.query
        let response = await getClienteByCode(id)
        if(response.length>0){
            response = response[0]
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getClienteByCodeController: ${error.message}` })
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
            item.PlanVisitTimeFrom = String(item.PlanVisitTimeFrom).length<4? `0${item.PlanVisitTimeFrom}`:item.PlanVisitTimeFrom
            item.PlanVisitTimeTo = String(item.PlanVisitTimeTo).length<4? `0${item.PlanVisitTimeTo}`:item.PlanVisitTimeTo
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
        // return res.json({responseCabecera})
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
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin} = req.body
        let response = await insertarCabeceraVisita(descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin)
        
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Planificar", 'Exito al crear cabecera plan visita', 
            `IFA_CRM_AGREGAR_VISIT_PLAN_HEADER`, "planificacion/cabecera-visita", process.env.PRD)
        return res.json({response})
    } catch (error) {
        console.log({ error })

        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Planificar", error.message, 
            `IFA_CRM_AGREGAR_VISIT_PLAN_HEADER`, "planificacion/cabecera-visita", process.env.PRD)

        return res.status(500).json({ mensaje: `Error en el controlador insertarCabeceraVisitaController: ${error.message}` })
    }
}

const insertarDetalleVisitaController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const {cabecera_id, cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario } = req.body
        let response = await insertarDetalleVisita(cabecera_id, cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario)

        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Planificar", 'Exito al crear detalle plan visita', 
            `IFA_CRM_AGREGAR_VISIT_PLAN_DETAIL`, "planificacion/detalle-visita", process.env.PRD)
        return res.json({response})
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Planificar", error.message, 
            `IFA_CRM_AGREGAR_VISIT_PLAN_DETAIL`, "planificacion/detalle-visita", process.env.PRD)
        
        return res.status(500).json({ mensaje: `Error en el controlador insertarDetalleVisitaController: ${error.message}` })
    }
}

const insertarDetallesFechasVisitaController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const {cabecera_id, cod_cliente, nom_cliente, fechas, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario } = req.body
        let responses = []
        for(const fecha of fechas){
            let response = await insertarDetalleVisita(cabecera_id, cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario)
            responses.push(response)
        }
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Planificar", 'Exito al crear detalle plan visita', 
            `IFA_CRM_AGREGAR_VISIT_PLAN_DETAIL`, "planificacion/detalle-fechas-visita", process.env.PRD)
        
        return res.json({responses})
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Planificar", error.message, 
            `IFA_CRM_AGREGAR_VISIT_PLAN_DETAIL`, "planificacion/detalle-fechas-visita", process.env.PRD)
        
        return res.status(500).json({ mensaje: `Error en el controlador insertarDetallesFechasVisitaController: ${error.message}` })
    }
}


const actualizarDetalleVisitaController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const {id, fecha, hora_ini, hora_fin, usuario } = req.body
        let response = await actualizarDetalleVisita(id, fecha, hora_ini, hora_fin, usuario )

        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Planificar", 'Exito al actualizar detalle plan visita', 
            `IFA_CRM_ACTUALIZAR_VISIT_PLAN_DETAIL`, "planificacion/actualizar-visita", process.env.PRD)
        
        return res.json({response})
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Planificar", `Error en actualizarDetalleVisitaController: ${error.message}`, 
            `IFA_CRM_ACTUALIZAR_VISIT_PLAN_DETAIL`, "planificacion/actualizar-visita", process.env.PRD)
        
        return res.status(500).json({ 
            mensaje: `Error en el controlador actualizarDetalleVisitaController: ${error.message}` 
        })
    }
}

const cambiarEstadoCicloController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const {plan_id, status, usuario } = req.body
        let response = await cambiarEstadoCiclo(plan_id, status, usuario )

        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Aprobacion", 'Exito al cambiar estado del ciclo', 
            `IFA_CRM_CHANGE_STATUS_CICLO`, "planificacion/estado-ciclo", process.env.PRD)
        
        return res.json({response})
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Aprobacion", `Error en cambiarEstadoCicloController: ${error.message}`, 
            `IFA_CRM_CHANGE_STATUS_CICLO`, "planificacion/estado-ciclo", process.env.PRD)
        
        return res.status(500).json({ 
            mensaje: `Error en el controlador cambiarEstadoCicloController: ${error.message}` 
        })
    }
}

const cambiarEstadoVisitasController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const {id_detalle, id_plan, cliente, fechaIni, fechaFin, status, usuario} = req.body
        let response = await cambiarEstadoVisitas(id_detalle??-1, id_plan??-1,
            cliente??'', fechaIni??'', fechaFin??'', status, usuario )

        return res.json({response})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ 
            mensaje: `Error en el controlador cambiarEstadoVisitasController: ${error.message}` 
        })
    }
}

const eliminarDetalleVisitaController = async (req, res) => {
    try {
        const {id } = req.query
        let response = await eliminarDetalleVisita(id)

        return res.json({response})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ 
            mensaje: `Error en el controlador eliminarDetalleVisitaController: ${error.message}` 
        })
    }
}

const getVisitasParaHoyController = async (req, res) => {
    try {
        const {codVendedor, fecha} = req.body
        let response = await getVisitasParaHoy(codVendedor, fecha)
        response.map(item => {
            item.PlanVisitTimeFrom = String(item.PlanVisitTimeFrom).length === 3 ? 
            `0${String(item.PlanVisitTimeFrom).slice(0,1)}:${String(item.PlanVisitTimeFrom).slice(1,3)}`:
            `${String(item.PlanVisitTimeFrom).slice(0,2)}:${String(item.PlanVisitTimeFrom).slice(2,4)}`
            item.PlanVisitTimeTo = String(item.PlanVisitTimeTo).length === 3 ? 
            `0${String(item.PlanVisitTimeTo).slice(0,1)}:${String(item.PlanVisitTimeTo).slice(1,3)}`:
            `${String(item.PlanVisitTimeTo).slice(0,2)}:${String(item.PlanVisitTimeTo).slice(2,4)}`
        })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ 
            mensaje: `Error en el controlador getVisitasParaHoyController: ${error.message}` 
        })
    }
}

const marcarVisitaController = async (req, res) => {
    try {
        const {SlpCode, SlpName, ClientCode, ClientName, IdPlan, IdPlanDetail, VisitDate,
            VisitStatus, Comments, Longitude, Latitude, ReasonNotVisit, usuario} = req.body

        let Hora= new Date().toLocaleTimeString('es-PE', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        })
        Hora = Hora.replace(':', '')
        let response = await marcarVisita(SlpCode, SlpName, ClientCode, ClientName, 
            IdPlan, IdPlanDetail, VisitDate, Hora,
            VisitStatus, Comments, Longitude, Latitude, ReasonNotVisit, usuario)
        console.log({response})
        if(response.length > 0){
            response = response[0]
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en el controlador marcarVisitaController: ${error.message}`
        })
    }
}

const getCabeceraVisitasCreadasController = async (req, res) => {
    try {
        const {id_vendedor} = req.query
        let response = await getCabeceraVisitasCreadas(id_vendedor)
        response.map(item => {
            item.VISITTIME = String(item.VISITTIME).length === 3 ?
            `0${String(item.VISITTIME).slice(0,1)}:${String(item.VISITTIME).slice(1,3)}`:
            `${String(item.VISITTIME).slice(0,2)}:${String(item.VISITTIME).slice(2,4)}`
        })
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en el controlador getCabeceraVisitasCreadasController: ${error.message}`
        })
    }
}

const getCabeceraVisitaCreadaController = async (req, res) => {
    try {
        const {} = req.body
        let response = await getCabeceraVisitaCreada()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en el controlador getCabeceraVisitaCreadaController: ${error.message}`
        })
    }
}

const getDetalleVisitasCreadasController = async (req, res) => {
    try {
        const {id} = req.query
        let response = await getDetalleVisitasCreadas(id)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en el controlador getDetalleVisitasCreadasController: ${error.message}`
        })
    }
}

const aniadirDetalleVisitaController = async (req, res) => {
    try {
        const {VisitID, ClientCode, ClientName, EventType, Comments, SaleAmount, CollectionAmount, usuario} = req.body
        let response = await aniadirDetalleVisita(VisitID, ClientCode, ClientName, EventType, Comments, SaleAmount, CollectionAmount, usuario)
        console.log({response})
        if(response.length > 0){
            response = response[0]
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en el controlador aniadirDetalleVisitaController: ${error.message}`
        })
    }
}

const actualizarVisitaController = async (req, res) => {
    try {
        const {VisitID, comentario} = req.body
        let response = await actualizarVisita(VisitID, comentario)
        console.log({response})
        if(response.length > 0){
            response = response[0]
        }
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `Error en el controlador actualizarVisitaController: ${error.message}`
        })
    }
}

const getUltimaVisitaController = async (req, res) => {
    try {
        const {id_vendedor} = req.query
        let response = await getUltimaVisita(id_vendedor)
        console.log({response})
        if(response.length>0){
            return res.json(response[0])
        }else{
            return res.status(400).json({mensaje:`No tiene ninguna visita`})
        }
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: `${error.message || 'Error en el controlador getUltimaVisitaController'}`
        })
    }
}

module.exports = {
    vendedoresPorSucCodeController, getVendedorController, getClientesDelVendedorController,
    getCicloVendedorController, getDetalleCicloVendedorController,
    insertarVisitaController, insertarDetalleVisitaController, insertarCabeceraVisitaController,
    actualizarDetalleVisitaController, cambiarEstadoCicloController, cambiarEstadoVisitasController,
    eliminarDetalleVisitaController, getVisitasParaHoyController, getCabeceraVisitasCreadasController,
    marcarVisitaController, aniadirDetalleVisitaController, getDetalleVisitasCreadasController,
    getCabeceraVisitaCreadaController, insertarDetallesFechasVisitaController, getClienteByCodeController,
    actualizarVisitaController, getUltimaVisitaController
}