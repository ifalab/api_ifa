const { 
    vendedoresPorSucCode, getVendedor, getClientesDelVendedor,
    getCicloVendedor, getDetalleCicloVendedor, insertarDetalleVisita, insertarCabeceraVisita,
    actualizarDetalleVisita, cambiarEstadoCiclo, cambiarEstadoVisitas, eliminarDetalleVisita,
    getVisitasParaHoy, marcarVisita, getCabeceraVisitasCreadas, aniadirDetalleVisita, getDetalleVisitasCreadas,
    getCabeceraVisitaCreada, getClienteByCode, actualizarVisita, getUltimaVisita, parapruebas, getPlanVendedor,
    findClientesBySupervisor,
    visitHistoryHana,
    visitBySlpcodeHana,
    pendingVisitsHana
} = require("./hana.controller")
const { grabarLog } = require("../../shared/controller/hana.controller");
const { generateVisitsExcel } = require('../utils/generateVisitsExcel');

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

const getPlanVendedorController = async (req, res) => {
    try {
        const { idVendedor, mes, año } = req.body
        let response = await getPlanVendedor(idVendedor, mes, año)
        let cabecera= null
        let detalle = []
        response.forEach( (res)=>{
            let {PlanID, Title,PlanVisitDate, PlanVisitTimeFrom, PlanVisitTimeTo, ...rest} = res
            if(!cabecera){
                cabecera= {PlanID, Title}
            }
            const PlanVisitDateNew = new Date(PlanVisitDate)
            PlanVisitTimeFrom = String(PlanVisitTimeFrom).length<4? `0${PlanVisitTimeFrom}`:PlanVisitTimeFrom
            PlanVisitTimeTo = String(PlanVisitTimeTo).length<4? `0${PlanVisitTimeTo}`:PlanVisitTimeTo
            detalle.push({PlanVisitDateNew, PlanVisitDate, PlanVisitTimeFrom,PlanVisitTimeTo, ...rest})
        })
        return res.json({cabecera, detalle})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getPlanVendedorController: ${error.message}` })
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

const insertarPlanController = async (req, res) => {
    try {
        const { descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin, details } = req.body
        let allResponses = []
        let responseCabecera = await insertarCabeceraVisita(descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin)
        console.log({ responseCabecera })
        allResponses.push(responseCabecera)
        // return res.json({responseCabecera})
        const cabecera_id = responseCabecera[0].PlanId
        for(const detail of details){
            const { cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, comentario } = detail
            let responseDetalle = await insertarDetalleVisita(cabecera_id, cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario)
            console.log({ responseDetalle }) 
            allResponses.push(responseDetalle) 
        }
        
        return res.json({allResponses, cabecera_id})
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador insertarPlanController: ${error.message}` })
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
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Aprobacion", 'Exito al cambiar estado de la visita', 
            `IFA_CRM_CHANGE_STATUS_VISITAS`, "planificacion/estado-visita", process.env.PRD)
        
        return res.json({response})
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Aprobacion", `${error.message || 'Error en el controlador cambiarEstadoVisitasController'}`, 
            `IFA_CRM_CHANGE_STATUS_VISITAS`, "planificacion/estado-visita", process.env.PRD)
        
        return res.status(500).json({ 
            mensaje: `Error en el controlador cambiarEstadoVisitasController: ${error.message}` 
        })
    }
}

const eliminarDetalleVisitaController = async (req, res) => {
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const {id } = req.query
        let response = await eliminarDetalleVisita(id)

        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Eliminar Visita", 'Exito al eliminar la visita', 
            `delete from ifa_crm_visit_plan_detail "PlanDetailID"=${id}`, "planificacion/eliminar-visita", process.env.PRD)
        
        return res.json({response})
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Eliminar Visita", `${error.message || 'Error en el controlador eliminarDetalleVisitaController'}`, 
            `delete from ifa_crm_visit_plan_detail "PlanDetailID"=${id}`, "planificacion/eliminar-visita", process.env.PRD)
        
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
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
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

        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Marcar Visita", `Exito al marcar la visita`, 
            `IFA_CRM_AGREGAR_VISIT_HEADER`, "planificacion/marcar-visita", process.env.PRD)
        
        return res.json(response)
    } catch (error) {
        console.log({ error })
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Marcar Visita", `${error.message || 'Error en el controlador marcarVisitaController'}`, 
            `IFA_CRM_AGREGAR_VISIT_HEADER`, "planificacion/marcar-visita", process.env.PRD)
        
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
    let user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const {VisitID, comentario} = req.body
        let response = await actualizarVisita(VisitID, comentario)
        console.log({response})
        if(response.length > 0){
            response = response[0]
        }
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Editar Visita", `Exito al actualizar comentario visita`, 
            `UPDATE IFA_CRM_VISIT_HEADER`, "planificacion/actualizar-visita-creada", process.env.PRD)
        
        return res.json(response)
    } catch (error) {
        console.log({ error })
        
        grabarLog(user.USERCODE, user.USERNAME, "Planificacion Editar Visita", `${error.message || 'Error en el controlador actualizarVisitaController'}`, 
            `UPDATE IFA_CRM_VISIT_HEADER`, "planificacion/actualizar-visita-creada", process.env.PRD)
        
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

const getClientesBySup = async (req, res) => {
  try {
    let { id_suc } = req.query;
    console.log(id_suc);

    if (!id_suc) {
      return res.status(400).json({
        status: false,
        mensaje: "Debe proporcionar al menos un código de sucursal",
        data: null,
      });
    }

    // Aceptamos tanto "100,200,300" como ["100","200","300"]
    if (typeof id_suc === "string") {
      id_suc = id_suc.split(",").map((code) => code.trim());
    }
    let mergedResults = [];

    // 🔹 Ejecutamos secuencialmente
     for (const code of id_suc) {
      try {
        const result = await findClientesBySupervisor(code);
        if (result && result.length > 0) {
          mergedResults = mergedResults.concat(result);
        }
      } catch (err) {
        console.error(`Error en sucursal ${code}:`, err.message);
        // opcional: podrías decidir si haces `throw` aquí o solo lo logueas y sigues con las demás
      }
    }

    return res.json({ clientes: mergedResults });
  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      status: false,
      mensaje: `Error en getClientesBySup: ${error.message}`,
    });
  }
};

const visitHistoryController = async (req, res) => {
  try {
    let { id_suc } = req.query;

    if (!id_suc) {
      return res.status(400).json({
        status: false,
        mensaje: "Debe proporcionar al menos un código de sucursal",
        data: null,
      });
    }

    // Aceptamos tanto "100,200,300" como ["100","200","300"]
    if (typeof id_suc === "string") {
      id_suc = id_suc.split(",").map((code) => code.trim());
    }

    let mergedResults = [];

    // 🔹 Ejecutamos secuencialmente cada s ucursal
    for (const code of id_suc) {
      try {
        const result = await visitHistoryHana(code);
        if (result && result.length > 0) {
          mergedResults = mergedResults.concat(result);
        }
      } catch (err) {
        console.error(`Error en sucursal ${code}:`, err.message);
        // opcional: seguir con las demás sucursales
      }
    }

    const grouped = Object.values(
        mergedResults.reduce((acc, curr) => {
            const key = curr.SucCode;
            if (!acc[key]) {
            acc[key] = {
                sucCode: curr.SucCode,
                sucName: curr.SucName,
                detalle: []
            };
            }
            acc[key].detalle.push(curr);
            return acc;
        }, {})
        );

    return res.json(grouped);
  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      status: false,
      mensaje: `Error en visitHistoryController: ${error.message}`,
    });
  }
};

const visitHistoryBySlpCodeController = async(req, res) => {
    try {
        const {slpcode, status} = req.query;

        if(!slpcode) return res.status(500).json({status: false,
            mensaje: `Error en visitHistoryBySlpCodeController: Se debe propocionar un codigo de vendedor.`,})

        const data = await visitBySlpcodeHana(slpcode, status);

        return res.status(200).json(data);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `Error en visitHistoryBySlpCodeController: ${error.message}`,
        });
    }
}

const pendingVisitsController = async(req, res) => {
    try {
        const {slpcode} = req.query;

        if(!slpcode) return res.status(500).json({status: false,
            mensaje: `Error en pendingVisitsController: Se debe propocionar un codigo de vendedor.`,})

        const data = await pendingVisitsHana(slpcode);

        return res.status(200).json(data);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `Error en pendingVisitsController: ${error.message}`,
        });
    }
}

const getVisitsExcelController = async (req, res) => {
  try {
    const { slpcode } = req.query;

    if (!slpcode)
      return res.status(400).json({ status: false, mensaje: 'Debe proporcionar un código de vendedor' });

    const dataVisit = await visitBySlpcodeHana(slpcode, 1);
    const dataNoVisit = await visitBySlpcodeHana(slpcode, 2);

    const dataPending = await pendingVisitsHana(slpcode);

    const slpName = dataVisit[0]?.SLPNAME || dataNoVisit[0]?.SLPNAME || 'Vendedor';

    const workbook = await generateVisitsExcel(dataVisit, dataNoVisit, dataPending, slpName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Visitas_${slpName}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
    // return res.json(dataPending);

  } catch (error) {
    console.error({ error });
    return res.status(500).json({
      status: false,
      mensaje: `Error en getVisitsExcelController: ${error.message}`,
    });
  }
};

module.exports = {
    vendedoresPorSucCodeController, getVendedorController, getClientesDelVendedorController,
    getCicloVendedorController, getDetalleCicloVendedorController,
    insertarPlanController, insertarDetalleVisitaController, insertarCabeceraVisitaController,
    actualizarDetalleVisitaController, cambiarEstadoCicloController, cambiarEstadoVisitasController,
    eliminarDetalleVisitaController, getVisitasParaHoyController, getCabeceraVisitasCreadasController,
    marcarVisitaController, aniadirDetalleVisitaController, getDetalleVisitasCreadasController,
    getCabeceraVisitaCreadaController, insertarDetallesFechasVisitaController, getClienteByCodeController,
    actualizarVisitaController, getUltimaVisitaController, getPlanVendedorController, getClientesBySup, visitHistoryController, visitHistoryBySlpCodeController, pendingVisitsController, getVisitsExcelController
}