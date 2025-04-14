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
                select * from LAB_IFA_PRD.IFA_CRM_VISIT_PLAN_HEADER
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
            select * from LAB_IFA_PRD.ifa_crm_visit_plan_detail where "PlanID"='${planId}'
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
        ///${process.env.PRD}
        const query = `
        CALL LAB_IFA_PRD."IFA_CRM_AGREGAR_VISIT_PLAN_HEADER"(
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
        ///${process.env.PRD}
        const query = `
        CALL LAB_IFA_PRD."IFA_CRM_AGREGAR_VISIT_PLAN_DETAIL"(
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
        ///${process.env.PRD}
        const query = `
        CALL LAB_IFA_PRD."IFA_CRM_ACTUALIZAR_VISIT_PLAN_DETAIL"(
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

module.exports = {
    vendedoresPorSucCode, getVendedor, getClientesDelVendedor,
    getCicloVendedor, getDetalleCicloVendedor, insertarCabeceraVisita, insertarDetalleVisita,
    actualizarDetalleVisita
}