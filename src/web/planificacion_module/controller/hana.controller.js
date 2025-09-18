const hana = require('@sap/hana-client');

// Configura la conexión a la base de datos HANA
const connOptions = {
    serverNode: `${process.env.HANASERVER}:${process.env.HANAPORT}`,
    uid: process.env.HANAUSER,
    pwd: process.env.HANAPASS
};

// Variable para almacenar la conexión a la base de datos
let connection = null;

// Función para conectar a la base de datos HANA
const connectHANA = () => {
    return new Promise((resolve, reject) => {
        connection = hana.createConnection();
        connection.connect(connOptions, (err) => {
            if (err) {
                console.error('Error de conexión a HANA:', err.message);
                reject(err);
            } else {
                console.log('Conectado a la base de datos HANA');
                resolve(connection);
            }
        });
    });
};


const executeQuery = async (query) => {
    console.log(query)
    return new Promise((resolve, reject) => {
        connection.exec(query, (err, result) => {
            if (err) {
                // console.log('error en la consulta:', err.message)
                reject(new Error(`error en la consulta: ${err.message}`))
            } else {
                console.log('Datos obtenidos con exito');
                resolve(result);
            }
        })
    })
}

const vendedoresPorSucCode = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
        select a.*, c.ID_ROL from ${process.env.PRD}.ifa_dm_vendedores a
        join LAB_IFA_LAPP.LAPP_USUARIO b on b."ID_VENDEDOR_SAP" = a."SlpCode"
        join LAB_IFA_LAPP.LAPP_USUARIO_ROL c on c.ID_USUARIO = b.ID
        where a."SucCode" = ${sucCode} and a."Active"='Y' and c.ID_ROL='12'`//12= Vendedor_Zona
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en vendedoresPorSucCode: ${error.message || ''}`
        }
    }
}

const getVendedor = async (code) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_vendedores 
        where "SlpCode"=${code}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getVendedor: ${error.message || ''}`
        }
    }
}

const getClientesDelVendedor = async (code) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select "CardCode", "CardName", "CardFName",
        "SlpCodeCli", "SlpNameCli", "GroupNum", "LicTradNum", "GroupCode",
        "DftWhsCode", "NoDiscount", "GroupName", "PymntGroup" from ${process.env.PRD}.ifa_dm_clientes
        where "SlpCodeCli"=${code}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getClientesDelVendedor: ${error.message || ''}`
        }
    }
}

const getClienteByCode = async (code) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select "CardCode", "CardName", "CardFName",
        "SlpCodeCli", "SlpNameCli", "GroupNum", "LicTradNum", "GroupCode",
        "DftWhsCode", "NoDiscount", "GroupName", "PymntGroup" from ${process.env.PRD}.ifa_dm_clientes
        where "CardCode"='${code}'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getClienteByCode: ${error.message || ''}`
        }
    }
}

const getCicloVendedor = async (idVendedor, mes, año) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
                select * from ${process.env.PRD}.IFA_CRM_VISIT_PLAN_HEADER
                where "SlpCode"=${idVendedor}
                and EXTRACT(MONTH FROM "ValidFrom") =${mes}
  	            AND EXTRACT(YEAR FROM "ValidFrom") =${año}
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getCicloVendedor: ${error.message || ''}`
        }
    }
}
const getPlanVendedor = async (idVendedor, mes, año) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
                select 
                a."PlanID", a."Title",
                b."PlanDetailID",
                b."ClientCode",
                b."ClientName",
                b."PlanVisitDate",
                b."PlanVisitTimeFrom",
                b."PlanVisitTimeTo",
                b."Comments",
                b."CreatedBy",b."CreateDate", b."CreateTime",
                b."STATUS",
                (
                    case when c."PLANDETAILID" is null 
                        then false 
                        else true 
                    end
                ) as "VISITADO"
                from ${process.env.PRD}.IFA_CRM_VISIT_PLAN_HEADER a
                join ${process.env.PRD}.ifa_crm_visit_plan_detail b on b."PlanID" = a."PlanID"
                left join (
                    select "PLANDETAILID" from ${process.env.PRD}.IFA_CRM_VISIT_HEADER
                ) c on c."PLANDETAILID" = b."PlanDetailID"
                where a."SlpCode"=${idVendedor}
                and EXTRACT(MONTH FROM a."ValidFrom") =${mes}
  	            AND EXTRACT(YEAR FROM a."ValidFrom") =${año}
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getPlanVendedor: ${error.message || ''}`
        }
    }
}

const getDetalleCicloVendedor = async (planId) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
            select 
                b."PlanDetailID",
                b."PlanID",
                b."ClientCode",
                b."ClientName",
                b."PlanVisitDate",
                b."PlanVisitTimeFrom",
                b."PlanVisitTimeTo",
                b."Comments",
                b."CreatedBy",b."CreateDate", b."CreateTime",
                b."STATUS",
                (
                    case when c."PLANDETAILID" is null 
                        then false 
                        else true 
                    end
                ) as "VISITADO"
            from ${process.env.PRD}.ifa_crm_visit_plan_detail b
            left join (
                select "PLANID", "PLANDETAILID" from ${process.env.PRD}.IFA_CRM_VISIT_HEADER
                where "PLANID"=${planId}
            ) c on c."PLANDETAILID" = b."PlanDetailID"
            where b."PlanID"='${planId}'
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getDetalleCicloVendedor: ${error.message || ''}`
        }
    }
}

const insertarCabeceraVisita = async (descripcion, cod_vendedor, nom_vendedor, usuario, fechaIni, fechaFin) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
        CALL  ${process.env.PRD}."IFA_CRM_AGREGAR_VISIT_PLAN_HEADER"(
            '${descripcion}', ${cod_vendedor}, '${nom_vendedor}', ${usuario}, '${fechaIni}', '${fechaFin}'
        );
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en insertarCabeceraVisita: ${error.message || ''}`
        }
    }
}

const insertarDetalleVisita = async (cabecera_id, cod_cliente, nom_cliente, fecha, hora_ini, hora_fin, cod_vendedor, nom_vendedor, comentario, usuario) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
        CALL  ${process.env.PRD}."IFA_CRM_AGREGAR_VISIT_PLAN_DETAIL"(
            ${cabecera_id}, '${cod_cliente}', '${nom_cliente}', '${fecha}', ${hora_ini}, ${hora_fin}, 
            ${cod_vendedor}, '${nom_vendedor}', '${comentario}', ${usuario}
        );
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en insertarDetalleVisita: ${error.message || ''}`
        }
    }
}

const actualizarDetalleVisita = async (id, fecha, hora_ini, hora_fin, usuario) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
        CALL ${process.env.PRD}."IFA_CRM_ACTUALIZAR_VISIT_PLAN_DETAIL"(
            ${id}, '${fecha}', ${hora_ini}, ${hora_fin}
        );
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en actualizarDetalleVisita: ${error.message || ''}`
        }
    }
}

const cambiarEstadoCiclo = async (plan_id, status, usuario) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
        CALL  ${process.env.PRD}."IFA_CRM_CHANGE_STATUS_CICLO"(
            ${plan_id}, ${status}, ${usuario}
        );
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en cambiarEstadoCiclo: ${error.message || ''}`
        }
    }
}

// ALTER PROCEDURE IFA_CRM_CHANGE_STATUS_VISITAS (
// 	IN id_detalle int,
// 	in cliente int,
// 	in fechaIni date, 2025-04-08'
// 	in fechaFin date,
// 	in status int,
// 	in usuario int
// )
// create PROCEDURE IFA_CRM_CHANGE_STATUS_CICLO (
// 	IN id_plan int,
// 	in status int,
// 	in usuario int
// )
const cambiarEstadoVisitas = async (id_detalle, id_plan, cliente, fechaIni, fechaFin, status, usuario) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
        CALL ${process.env.PRD}."IFA_CRM_CHANGE_STATUS_VISITAS"(
            ${id_detalle}, ${id_plan}, '${cliente}', '${fechaIni}', '${fechaFin}', ${status}, ${usuario}
        );
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en cambiarEstadoVisitas: ${error.message || ''}`
        }
    }
}

const eliminarDetalleVisita = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
            delete from  ${process.env.PRD}.ifa_crm_visit_plan_detail where "PlanDetailID"=${id}
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en eliminarDetalleVisita: ${error.message || ''}`
        }
    }
}

const getVisitasParaHoy = async (codVendedor, fecha) => { // 2023-04-08
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
            select 
                b."PlanDetailID",
                b."PlanID",
                b."ClientCode",
                b."ClientName",
                b."PlanVisitDate",
                b."PlanVisitTimeFrom",
                b."PlanVisitTimeTo",
                b."Comments",
                b."STATUS",
                (
                    case when c."PLANDETAILID" is null then 'NO VISITADO' else 'VISITADO' end
                ) as "VISITADO"
            from ${process.env.PRD}.ifa_crm_visit_plan_detail b
            join (select "PlanID"
                from ${process.env.PRD}.ifa_crm_visit_plan_header 
                where "SlpCode"=${codVendedor} 
                and '${fecha}' between "ValidFrom" and "ValidTo"
            ) a on a."PlanID" = b."PlanID"
            left join (
                select "PLANID", "PLANDETAILID" from ${process.env.PRD}.IFA_CRM_VISIT_HEADER
            ) c on c."PLANID" = b."PlanID" and c."PLANDETAILID" = b."PlanDetailID"
            where b."PlanVisitDate"='${fecha}' and c."PLANDETAILID" is null
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getVisitasParaHoy: ${error.message || ''}`
        }
    }
}

const getCabeceraVisitasCreadas = async (id_vendedor) => {
    try {
        if(!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.IFA_CRM_VISIT_HEADER where "SLPCODE"=${id_vendedor} 
        order by "VISITDATE" desc, "VISITTIME" desc limit 50`

        return await executeQuery(query)
    } catch (error) {
        throw {
            message: `Error en getAllVisitasCreadas: ${error.message || ''}`
        }
    }
}
/*
    VisitID
    SlpCode
    SlpName
    PlanID
    PlanVisitDate
    VisitStatus
    Comments
    Longitude
    Latitude
    CreatedBy
    CreateDate
    CreateTime
*/
const getCabeceraVisitaCreada = async () => {
    try {
        if(!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.IFA_CRM_VISIT_HEADER `

        return await executeQuery(query)
    } catch (error) {
        throw {
            message: `Error en getCabeceraVisitaCreada: ${error.message || ''}`
        }
    }
}

/*
    VisitID
    EventId
    ClientCode
    ClientName
    EventType
    VisitStatus
    VisitDate
    SaleAmount
    CollectionAmount
    ReasonNotVisit
    Comments
*/
const getDetalleVisitasCreadas = async (id_visita) => {
    try {
        if(!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.IFA_CRM_VISIT_DETAIL where "VISITID"=${id_visita}`

        return await executeQuery(query)
    } catch (error) {
        throw {
            message: `Error en getDetalleVisitasCreadas: ${error.message || ''}`
        }
    }
}

const marcarVisita = async (SlpCode, SlpName, ClientCode, ClientName, IdPlan, IdPlanDetail, VisitDate, VisitTime,
    VisitStatus, Comments, Longitude, Latitude, ReasonNotVisit, CreatedBy) => {
    try {
        if(!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_CRM_AGREGAR_VISIT_HEADER(
            ${SlpCode}, '${SlpName}', '${ClientCode}', '${ClientName}',
            ${IdPlan}, ${IdPlanDetail}, '${VisitDate}', ${VisitTime}, ${VisitStatus},
            '${Comments}', '${Longitude}', '${Latitude}', '${ReasonNotVisit}', ${CreatedBy}
        )`
        console.log({ query })
        return await executeQuery(query) // returns VISITID
    } catch (error) {
        throw {
            message: `Error en marcarVisita: ${error.message || ''}`
        }
    }
}

const aniadirDetalleVisita = async (VisitID, ClientCode, ClientName, EventType, Comments, SaleAmount, CollectionAmount, CreatedBy) => { 
    try {
        if(!connection) {
            await connectHANA()
        }
        const query = `CALL ${process.env.PRD}."IFA_CRM_AGREGAR_VISIT_DETAIL"(
                ${VisitID}, '${ClientCode}', '${ClientName}', '${EventType}', '${Comments}',
                ${SaleAmount}, ${CollectionAmount}, ${CreatedBy}
            );`
        console.log({ query })
        return await executeQuery(query)//  returns {EVENTID}
    } catch (error) {
        return {
            message: `Error en aniadirDetalleVisita: ${error.message || ''}`
        }
    }
}

const actualizarVisita = async (VisitID, comentario) => { 
    try {
        if(!connection) {
            await connectHANA()
        }
        const query = `
            UPDATE ${process.env.PRD}.IFA_CRM_VISIT_HEADER
            SET "COMMENTS" = '${comentario}'
            WHERE "VISITID" = ${VisitID};`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        throw {
            message: `Error en actualizarVisita: ${error.message || ''}`
        }
    }
}

const getUltimaVisita= async (idVendedor) => {
    try {
        if(!connection) {
            await connectHANA()
        }
        // const query = `select * from ${process.env.PRD}.IFA_CRM_VISIT_HEADER`
        const query = `select VISITID "VisitID", CLIENTCODE "ClientCode", 
        PLANDETAILID "IdPlanDetail", SLPCODE "SlpCode"
        from ${process.env.PRD}.IFA_CRM_VISIT_HEADER where SLPCODE=${idVendedor} 
        order by VISITID desc limit 1`
        return await executeQuery(query)
    } catch (error) {
        throw {
            message: `Error en getUltimaVisita: ${error.message || ''}`
        }
    }
}

const parapruebas = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
            delete from ${process.env.PRD}.ifa_crm_visit_plan_header where "PlanID"=${id}
        `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en parapruebas: ${error.message || ''}`
        }
    }
}


const findClientesBySupervisor = async(id_suc)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_PRD.IFA_LAPP_CLIENTES_POR_SURCURSAL(${id_suc})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: clientes by vendedor');
    }
}

const visitHistoryHana = async(id_suc) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_PLA_VISITS_BY_SELLER WHERE "SucCode" = ${id_suc}`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: clientes by vendedor');
    }
}

const visitBySlpcodeHana = async(splcode, status) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = ` SELECT 
                VH.*,
                CASE 
                    WHEN VH."PLANDETAILID" IS NOT NULL AND VH."PLANDETAILID" <> 0 
                        THEN 'PLANIFICADO' 
                    ELSE 'NO PLANIFICADO' 
                END AS "PlanificadoStatus"
            FROM ${process.env.PRD}.IFA_CRM_VISIT_HEADER VH
            WHERE VH.SlpCode = ${splcode} 
            AND VH."VISITSTATUS" = ${status};
        `
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: visitas por vendedor');
    }
}

const pendingVisitsHana = async(splcode) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `
            SELECT pd.*
            FROM ${process.env.PRD}.IFA_CRM_VISIT_PLAN_DETAIL pd
                LEFT JOIN ${process.env.PRD}.IFA_CRM_VISIT_HEADER vh
                ON pd."PlanDetailID" = vh.PlanDetailId
                AND vh.SlpCode = 14
                AND vh.PlanDetailID <> 0
            WHERE pd."SlpCode" = ${splcode}
                AND MONTH(pd."PlanVisitDate") = MONTH(CURRENT_DATE)
                AND vh.PlanDetailId IS NULL
            ORDER BY pd."PlanVisitDate";
        `

        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al obtener las visitas pendientes por vendedor.');
    }
}

module.exports = {
    vendedoresPorSucCode, getVendedor, getClientesDelVendedor,
    getCicloVendedor, getDetalleCicloVendedor, insertarCabeceraVisita, insertarDetalleVisita,
    actualizarDetalleVisita, cambiarEstadoCiclo, cambiarEstadoVisitas, eliminarDetalleVisita,
    getVisitasParaHoy, marcarVisita, getCabeceraVisitasCreadas, aniadirDetalleVisita,
    getDetalleVisitasCreadas, getCabeceraVisitaCreada, getClienteByCode, actualizarVisita,
    getUltimaVisita, parapruebas, getPlanVendedor, findClientesBySupervisor, visitHistoryHana, visitBySlpcodeHana, pendingVisitsHana
}