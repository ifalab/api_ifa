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
        const query = `select * from ${process.env.PRD}.ifa_dm_vendedores 
        where "SucCode" = ${sucCode} and "Active"='Y'`
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
        const query = `select "CardCode", "CardName", "SlpCodeCli", "SlpNameCli" from ${process.env.PRD}.ifa_dm_clientes
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

const getDetalleCicloVendedor = async (planId) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `
            select 
                "PlanDetailID",
                "PlanID",
                "ClientCode",
                "ClientName",
                "PlanVisitDate",
                "PlanVisitTimeFrom",
                "PlanVisitTimeTo",
                "Comments",
                "CreatedBy","CreateDate", "CreateTime",
                "STATUS"
            from ${process.env.PRD}.ifa_crm_visit_plan_detail 
            where "PlanID"='${planId}'
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
        const query = `select * from ${process.env.PRD}.IFA_CRM_VISIT_HEADER where "SLPCODE"=${id_vendedor} `   

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
/*
procedure USP_CREATE_VISIT_HEADER (
	in	p_SlpCode integer, in p_SlpName nvarchar(200), 
	in p_ClientCode nvarchar(20), in p_ClientName nvarchar(200),
	in p_PlanID integer, in p_PlanDetailID integer,
	in p_VisitDate date, in p_VisitTime integer, in p_VisitStatus integer,
	in p_Comments nvarchar(250), in p_Longitude nvarchar(200), in p_Latitude nvarchar(200),
	in p_ReasonNotVisit nvarchar(250), in p_CreatedBy integer
)
*/

const marcarVisita = async (SlpCode, SlpName, ClientCode, ClientName, IdPlan, IdPlanDetail, VisitDate, VisitTime,
    VisitStatus, Comments, Longitude, Latitude, ReasonNotVisit, CreatedBy) => {
    try {
        if(!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.USP_CREATE_VISIT_HEADER(
            ${SlpCode}, '${SlpName}', '${ClientCode}', '${ClientName}',
            ${IdPlan}, ${IdPlanDetail}, '${VisitDate}', ${VisitTime}, ${VisitStatus},
            '${Comments}', '${Longitude}', '${Latitude}', '${ReasonNotVisit}', ${CreatedBy}
        )`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        throw {
            message: `Error en marcarVisita: ${error.message || ''}`
        }
    }
}

/*
CREATE PROCEDURE "USP_ADD_VISIT_DETAIL"
(
    IN p_VisitID             INTEGER,
    IN p_ClientCode         NVARCHAR(20),
    IN p_ClientName         NVARCHAR(100),
    IN p_EventType      NVARCHAR(50),
    IN p_Comments           NVARCHAR(250),
    IN p_SaleAmount      DECIMAL(15,2), //DocTotal
    IN p_CollectionAmount     DECIMAL(15,2),     
    IN p_CreatedBy          INTEGER //U_UserCode
)
*/

const aniadirDetalleVisita = async (VisitID, ClientCode, ClientName, EventType, Comments, SaleAmount, CollectionAmount, CreatedBy) => { 
    try {
        if(!connection) {
            await connectHANA()
        }
        const query = `CALL ${process.env.PRD}."USP_ADD_VISIT_DETAIL"(
                ${VisitID}, '${ClientCode}', '${ClientName}', '${EventType}', '${Comments}',
                ${SaleAmount}, ${CollectionAmount}, ${CreatedBy}
            );`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        return {
            message: `Error en aniadirDetalleVisita: ${error.message || ''}`
        }
    }
}

module.exports = {
    vendedoresPorSucCode, getVendedor, getClientesDelVendedor,
    getCicloVendedor, getDetalleCicloVendedor, insertarCabeceraVisita, insertarDetalleVisita,
    actualizarDetalleVisita, cambiarEstadoCiclo, cambiarEstadoVisitas, eliminarDetalleVisita,
    getVisitasParaHoy, marcarVisita, getCabeceraVisitasCreadas, aniadirDetalleVisita,
    getDetalleVisitasCreadas, getCabeceraVisitaCreada
}